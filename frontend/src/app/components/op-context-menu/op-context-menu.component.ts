import {Component, Inject} from "@angular/core";
import {
  OpContextMenuEntry,
  OpContextMenuLocalsMap, OpContextMenuLocalsToken, OPContextMenuLinkItem, OPContextMenuDividerItem, OPContextMenuInputItem
} from "core-components/op-context-menu/op-context-menu.types";
import {OPContextMenuService} from "core-components/op-context-menu/op-context-menu.service";

@Component({
  templateUrl: './op-context-menu.html'
})
export class OPContextMenuComponent {
  public items:OpContextMenuEntry[];
  public service:OPContextMenuService;

  constructor(@Inject(OpContextMenuLocalsToken) public locals:OpContextMenuLocalsMap) {
    this.items = this.locals.items;
    this.service = this.locals.service;
  }

  public handleKeypress(item:OPContextMenuLinkItem|OPContextMenuInputItem, $event:KeyboardEvent) {
    if (item.disabled || !item.onKeypress) {
      return true;
    }

    if (item.onKeypress($event)) {
      this.locals.service.close();
      $event.preventDefault();
      $event.stopPropagation();
      return false;
    }

    return true;
  }

  public handleClick(item:OPContextMenuLinkItem|OPContextMenuDividerItem, $event:JQueryEventObject) {
    if (item.disabled || item.type === 'divider') {
      return false;
    }

    if (item.onClick!($event)) {
      this.locals.service.close();
      $event.preventDefault();
      $event.stopPropagation();
      return false;
    }

    return true;
  }
}
