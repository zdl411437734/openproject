import {
  ApplicationRef, ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ElementRef, EventEmitter,
  Inject, InjectionToken,
  Injector,
  OnDestroy,
  OnInit, Optional,
  ViewChild
} from '@angular/core';
import {OpModalLocalsMap} from 'core-components/op-modals/op-modal.types';
import {ConfigurationService} from 'core-app/modules/common/config/configuration.service';
import {WorkPackageTableColumnsService} from 'core-components/wp-fast-table/state/wp-table-columns.service';
import {OpModalComponent} from 'core-components/op-modals/op-modal.component';
import {WpTableConfigurationService} from 'core-components/wp-table/configuration-modal/wp-table-configuration.service';
import {
  ActiveTabInterface,
  TabComponent, TabInterface,
  TabPortalOutlet
} from 'core-components/wp-table/configuration-modal/tab-portal-outlet';
import {QueryFormDmService} from 'core-app/modules/hal/dm-services/query-form-dm.service';
import {WorkPackageStatesInitializationService} from 'core-components/wp-list/wp-states-initialization.service';
import {TableState} from 'core-components/wp-table/table-state/table-state';
import {QueryFormResource} from 'core-app/modules/hal/resources/query-form-resource';
import {LoadingIndicatorService} from 'core-app/modules/common/loading-indicator/loading-indicator.service';
import {WorkPackageNotificationService} from "core-components/wp-edit/wp-notification.service";
import {I18nService} from "core-app/modules/common/i18n/i18n.service";
import {OpModalLocalsToken} from "core-components/op-modals/op-modal.service";
import {ComponentType} from "@angular/cdk/portal";

@Component({
  template: '<span>foobar!</span>',
})
export class TestComponent {

}
