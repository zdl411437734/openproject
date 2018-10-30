// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {WorkPackageQueryStateService} from './wp-table-base.service';
import {Injectable} from '@angular/core';
import {QueryResource} from 'core-app/modules/hal/resources/query-resource';
import {QuerySchemaResource} from 'core-app/modules/hal/resources/query-schema-resource';
import {QueryFilterInstanceResource} from 'core-app/modules/hal/resources/query-filter-instance-resource';
import {CollectionResource} from 'core-app/modules/hal/resources/collection-resource';
import {WorkPackageTableFilters} from '../wp-table-filters';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {InputState} from 'reactivestates';
import {cloneHalResourceCollection} from 'core-app/modules/hal/helpers/hal-resource-builder';
import {QueryFilterResource} from "core-app/modules/hal/resources/query-filter-resource";
import {QueryFilterInstanceSchemaResource} from "core-app/modules/hal/resources/query-filter-instance-schema-resource";
import {States} from "core-components/states.service";
import {HalResource} from 'core-app/modules/hal/resources/hal-resource';

@Injectable()
export class WorkPackageTableFiltersService extends WorkPackageQueryStateService<QueryFilterInstanceResource[]> {

  constructor(protected readonly states:States,
              protected readonly tableState:TableState) {
    super(tableState);
  }

  public get state():InputState<QueryFilterInstanceResource[]> {
    return this.tableState.filters;
  }

  public get availableState():InputState<QueryFilterInstanceSchemaResource[]> {
    return this.states.query.available.filters;
  }

  protected get availableSchemas():QueryFilterInstanceSchemaResource[] {
    return this.availableState.getValueOr([]);
  }

  /**
   * Add a filter instantiation from the set of available filter schemas
   *
   * @param filter
   */
  public add(filter:QueryFilterResource) {
    let schema = _.find(this.availableSchemas, schema => (schema.filter.allowedValues as HalResource)[0].href === filter.href)!;
    let newFilter = schema.getFilter();

    this.state.doModify(filters => filters.concat([newFilter]);

    return newFilter;
  }

  public remove(filter:QueryFilterInstanceResource) {
    let index = this.current.indexOf(filter);
    this.state.doModify(filters => filters.splice(index, 1));
  }

  public initializeFilters(query:QueryResource, schema:QuerySchemaResource) {
    let filters = _.map(query.filters, filter => filter.$copy<QueryFilterInstanceResource>());

    this.loadCurrentFiltersSchemas(filters).then(() => {
      let newState = new WorkPackageTableFilters(filters, schema.filtersSchemas.elements);

      this.state.putValue(newState);
    });
  }

  public hasChanged(query:QueryResource) {
    const comparer = (filter:QueryFilterInstanceResource[]) => filter.map(el => el.$source);

    return !_.isEqual(
      comparer(query.filters),
      comparer(this.current)
    );
  }

  public valueFromQuery(query:QueryResource) {
    return undefined;
  }

  public applyToQuery(query:QueryResource) {
    query.filters = this.current;
    return true;
  }

  public get currentState():WorkPackageTableFilters {
    return this.state.value as WorkPackageTableFilters;
  }

  public get current():QueryFilterInstanceResource[]{
    if (this.currentState) {
      return cloneHalResourceCollection<QueryFilterInstanceResource>(this.currentState.current);
    } else {
      return [];
    }
  }

  public replace(newState:WorkPackageTableFilters) {
    this.state.putValue(newState);
  }

  public replaceIfComplete(newState:WorkPackageTableFilters) {
    if (newState.isComplete()) {
      this.state.putValue(newState);
    }
  }

  public remove(removedFilter:QueryFilterInstanceResource) {
    this.currentState.remove(removedFilter);

    this.state.putValue(this.currentState);
  }

  private loadCurrentFiltersSchemas(filters:QueryFilterInstanceResource[]):Promise<{}> {
    return Promise.all(_.map(filters,
                       (filter:QueryFilterInstanceResource) => this.loadFilterSchema(filter)));
  }

  private loadFilterSchema(filter:QueryFilterInstanceResource):Promise<{}> {
    return new Promise((resolve, reject) => {
      filter.schema.$load()
        .catch(reject)
        .then(() => {
        if (_.has(filter, ['values.length', 'currentSchema.values.allowedValues.$load'])) {
          (filter.currentSchema!.values!.allowedValues as CollectionResource).$load()
            .then((options:CollectionResource) => {
              this.setLoadedValues(filter, options);

              resolve();
            });
        } else {
          resolve();
        }
      });
    });
  }

  private setLoadedValues(filter:QueryFilterInstanceResource, options:CollectionResource) {
    _.each(filter.values, (value:any, index:any) => {
      let loadedHalResource = _.find(options.elements,
                                     option => option.$href === value.$href);

      if (loadedHalResource) {
        filter.values[index] = loadedHalResource;
      } else {
        throw "HalResource not in list of allowed values.";
      }
    });
  }
}
