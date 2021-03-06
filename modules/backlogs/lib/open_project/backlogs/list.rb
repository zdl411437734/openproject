#-- copyright
# OpenProject Backlogs Plugin
#
# Copyright (C)2013-2014 the OpenProject Foundation (OPF)
# Copyright (C)2011 Stephan Eckardt, Tim Felgentreff, Marnen Laibow-Koser, Sandro Munda
# Copyright (C)2010-2011 friflaj
# Copyright (C)2010 Maxime Guilbot, Andrew Vit, Joakim Kolsjö, ibussieres, Daniel Passos, Jason Vasquez, jpic, Emiliano Heyns
# Copyright (C)2009-2010 Mark Maglana
# Copyright (C)2009 Joe Heck, Nate Lowrie
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License version 3.
#
# OpenProject Backlogs is a derivative work based on ChiliProject Backlogs.
# The copyright follows:
# Copyright (C) 2010-2011 - Emiliano Heyns, Mark Maglana, friflaj
# Copyright (C) 2011 - Jens Ulferts, Gregor Schmidt - Finn GmbH - Berlin, Germany
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

module OpenProject::Backlogs::List
  def self.included(base)
    base.class_eval do
      acts_as_silent_list

      # Reorder list, if work_package is removed from sprint
      before_update :fix_other_work_package_positions
      before_update :fix_own_work_package_position

      # Used by acts_as_silent_list to limit the list to a certain subset within
      # the table.
      #
      # Also sanitize_sql seems to be unavailable in a sensible way. Therefore
      # we're using send to circumvent visibility work_packages.
      def scope_condition
        self.class.send(:sanitize_sql, ['project_id = ? AND fixed_version_id = ? AND type_id IN (?)',
                                        project_id, fixed_version_id, types])
      end

      include InstanceMethods
    end
  end

  module InstanceMethods
    def move_after(prev_id)
      # Remove so the potential 'prev' has a correct position
      remove_from_list
      reload

      prev = self.class.find_by_id(prev_id.to_i)

      # If it should be the first story, move it to the 1st position
      if prev.blank?
        insert_at
        move_to_top

      # If its predecessor has no position, create an order on position
      # silently. This can happen when sorting inside a version for the first
      # time after backlogs was activated and there have already been items
      # inside the version at the time of backlogs activation
      elsif !prev.in_list?
        prev_pos = set_default_prev_positions_silently(prev)
        insert_at(prev_pos += 1)

      # There's a valid predecessor
      else
        insert_at(prev.position + 1)
      end
    end

    protected

    def fix_other_work_package_positions
      if changes.slice('project_id', 'type_id', 'fixed_version_id').present?
        if changes.slice('project_id', 'fixed_version_id').blank? and
           Story.types.include?(type_id.to_i) and
           Story.types.include?(type_id_was.to_i)
          return
        end

        if fixed_version_id_changed?
          restore_version_id = true
          new_version_id = fixed_version_id
          self.fixed_version_id = fixed_version_id_was
        end

        if type_id_changed?
          restore_type_id = true
          new_type_id = type_id
          self.type_id = type_id_was
        end

        if project_id_changed?
          restore_project_id = true
          # I've got no idea, why there's a difference between setting the
          # project via project= or via project_id=, but there is.
          new_project = project
          self.project = Project.find(project_id_was)
        end

        remove_from_list if is_story?

        if restore_project_id
          self.project = new_project
        end

        if restore_type_id
          self.type_id = new_type_id
        end

        if restore_version_id
          self.fixed_version_id = new_version_id
        end
      end
    end

    def fix_own_work_package_position
      if changes.slice('project_id', 'type_id', 'fixed_version_id').present?
        if changes.slice('project_id', 'fixed_version_id').blank? and
           Story.types.include?(type_id.to_i) and
           Story.types.include?(type_id_was.to_i)
          return
        end

        if is_story? and fixed_version.present?
          insert_at_bottom
        else
          assume_not_in_list
        end
      end
    end

    def set_default_prev_positions_silently(prev)
      prev.fixed_version.rebuild_positions(prev.project)
      prev.reload.position
    end
  end
end
