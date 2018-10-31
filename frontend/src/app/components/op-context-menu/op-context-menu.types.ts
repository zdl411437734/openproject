import {InjectionToken} from "@angular/core";

export const OpContextMenuLocalsToken = new InjectionToken<any>('CONTEXT_MENU_LOCALS');

export interface OpContextMenuLocalsMap {
  items:OpContextMenuEntry[];
  contextMenuId?:string;
  [key:string]:any;
};

export type OpContextMenuEntry =
  OPContextMenuDividerItem | OPContextMenuLinkItem | OPContextMenuInputItem;

export interface OPContextMenuItem {
  disabled?:boolean;
  hidden?:boolean;
  liClass?:string;
  class?:string;
}

export interface OPContextMenuDividerItem extends OPContextMenuItem {
  type:'divider';
}

export interface OPContextMenuInputItem extends OPContextMenuItem {
  type:'input';
  ariaLabel?:string;
  placeholder:string;
  onChange:($event:Event) => void;
  onKeypress?:($event:KeyboardEvent) => boolean;
}

export interface OPContextMenuLinkItem extends OPContextMenuItem {
  type:'link';
  icon?:string;
  href?:string;
  ariaLabel?:string;
  linkText?:string;
  onClick?:($event:Event) => boolean;
  onKeypress?:($event:KeyboardEvent) => boolean;
}
