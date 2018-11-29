class ApplicationRecord < ::ActiveRecord::Base
  self.abstract_class = true

  ##
  # Refind this instance fresh from the database
  def refind!
    self.class.find(self.class.primary_key)
  end
end
