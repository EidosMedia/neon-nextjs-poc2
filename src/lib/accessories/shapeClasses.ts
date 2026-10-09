import clsx from 'clsx';
import type { ZoneHeadContent } from './zoneHeadTypes';

// Client-safe: no definitions import, so client components can use it without bundling accessory.json.
export type AccessoryShape = { bold: boolean; border: boolean };

export type ZoneAccessoryShapes = {
  zone?: AccessoryShape;
  head?: ZoneHeadContent;
  links?: (AccessoryShape | undefined)[];
};

export function itemShape(zone?: AccessoryShape, link?: AccessoryShape): AccessoryShape | undefined {
  if (!zone && !link) {
    return undefined;
  }
  const bold = !!(zone?.bold || link?.bold);
  const border = !!link?.border && !zone?.border;
  return { bold, border };
}

export function titleAccessoryClass(shape?: AccessoryShape): string | undefined {
  if (!shape) {
    return undefined;
  }
  return clsx(shape.bold ? 'acc-title-bold' : 'acc-title-regular');
}

export function cardAccessoryClass(shape?: AccessoryShape): string | undefined {
  return clsx(shape?.border && 'acc-card-border') || undefined;
}

export function zoneAccessoryClass(shape?: AccessoryShape): string | undefined {
  return clsx(shape?.border && 'acc-zone-border') || undefined;
}
