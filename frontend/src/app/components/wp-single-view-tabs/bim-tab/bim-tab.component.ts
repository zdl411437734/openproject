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

import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Transition} from '@uirouter/core';
import {WorkPackageResource} from 'core-app/modules/hal/resources/work-package-resource';
import {LoadingIndicatorService} from 'core-app/modules/common/loading-indicator/loading-indicator.service';
import {WorkPackageCacheService} from 'core-components/work-packages/work-package-cache.service';
import {componentDestroyed} from 'ng2-rx-componentdestroyed';
import {takeUntil} from 'rxjs/operators';
import {I18nService} from 'core-app/modules/common/i18n/i18n.service';

declare global {
  interface Window {
    xeogl:any;
  }
}

@Component({
  templateUrl: './bim-tab.html',
  selector: 'bim-tab',
})
export class BimTabComponent implements OnInit, OnDestroy {
  public workPackageId:string;
  public workPackage:WorkPackageResource;

  // Whether xeogl was loaded
  public initialized:Promise<any>;

  // Publiclize scene element
  public scene:any;
  public model:any;

  public modelToLoad:string;

  public text = {};

  @ViewChild('viewerFrame') public viewerFrame:ElementRef<HTMLCanvasElement>;

  public constructor(readonly I18n:I18nService,
                     readonly elementRef:ElementRef,
                     readonly $transition:Transition,
                     readonly loadingIndicator:LoadingIndicatorService,
                     readonly wpCacheService:WorkPackageCacheService) {
  }

  public ngOnInit() {
    this.workPackageId = this.$transition.params('to').workPackageId;
    this.initialized = this.loadXeoglAndViewer();

    this.wpCacheService
      .observe(this.workPackageId)
      .pipe(
        takeUntil(componentDestroyed(this))
      )
      .subscribe((wp:WorkPackageResource) => {
        this.workPackage = wp;

        if (this.workPackage.customField16 && this.modelToLoad !== this.workPackage.customField16) {
          this.modelToLoad = this.workPackage.customField16.name;
          this.setup();
        }

        this.highlight(this.workPackage.customField14);
      });

  }

  setup() {
    this.initialized
      .then((imported:any[]) => {
        const xeogl = window.xeogl;

        // let scene = x/**/eogl.getDefaultScene();
        let scene = this.scene = new xeogl.Scene({
          canvas: 'bim-canvas' // this.viewerFrame.nativeElement
        });

        xeogl.scene = scene;

        // Destroy the previous model
        if (this.model) {
          this.model.destroy();
        }

        let model = this.model = new xeogl.GLTFModel(scene, {
          id: "test",
          src: "/" + this.modelToLoad,
          edges: true,
          backfaces: true,
          edgeThreshold: 20
        });

        let camera = scene.camera;
        let cameraFlight = new xeogl.CameraFlightAnimation(scene);

        model.on('loaded', () => {
          cameraFlight.flyTo(model);
        });

        new xeogl.CameraControl(scene);
      });
  }

  highlight(attribute?:string) {
    if (!(attribute && this.model)) {
      return;
    }

    const mesh = this.model.meshes[`_${attribute}`];
    if (mesh) {
      mesh.highlighted = true;
    }
  }

  loadXeoglAndViewer() {
    return import('@vendor/xeogl/xeogl.js')
      .then((imported:any) => {
        // Must export xeogl globally :/
        window.xeogl = imported;

        return import('@vendor/xeogl/gltf-model.js');
      });
  }

  ngOnDestroy() {
    // Nothing to do
  }
}
