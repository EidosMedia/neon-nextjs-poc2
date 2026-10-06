import type { AccessorySet, AccessoryValues } from '@eidosmedia/neon-frontoffice-ts-sdk';

export type AccessoryLevel = 'page' | 'zone' | 'link';

export type AccessoryContext = {
  theme: string;
  type: string;
  baseType?: string;
  level: AccessoryLevel;
  zone?: string;
  linkedType?: string;
  linkedBaseType?: string;
};

type ToggleDefinition = {
  name: string;
  default: boolean;
};

type PropertyDefinition = {
  name: string;
  default: string;
  options: { name: string }[];
};

type AccessoryDefinition = {
  name: string;
  version: string;
  types: string[];
  zones?: string[];
  linkedTypes?: string[];
  toggles?: ToggleDefinition[];
  properties?: PropertyDefinition[];
};

export type AccessoryDefinitions = {
  version: string;
  theme: string;
  pageAccessories?: Record<string, AccessoryDefinition> | AccessoryDefinition[];
  zoneAccessories?: Record<string, AccessoryDefinition> | AccessoryDefinition[];
  linkAccessories?: Record<string, AccessoryDefinition> | AccessoryDefinition[];
};

export type ResolvedAccessoryValues = Record<string, Record<string, boolean | string>>;

export function resolveAccessoryValues(
  definitions: AccessoryDefinitions,
  stored: AccessorySet | null | undefined,
  context: AccessoryContext,
): ResolvedAccessoryValues | undefined {
  if (context.theme !== 'default' || definitions.theme !== context.theme) {
    return undefined;
  }

  const matchingDefinitions = selectDefinitions(definitions, context);
  const resolved: ResolvedAccessoryValues = {};
  const storedMatches = stored !== null && stored !== undefined && matchesContext(stored, context);

  for (const definition of matchingDefinitions) {
    const values = defaultValues(definition);
    const storedAccessory = storedMatches ? stored.items?.[definition.name] : undefined;
    if (storedAccessory?.version === definition.version) {
      applyStoredValues(values, storedAccessory, definition);
    }
    resolved[definition.name] = values;
  }

  return resolved;
}

function selectDefinitions(
  definitions: AccessoryDefinitions,
  context: AccessoryContext,
): AccessoryDefinition[] {
  const candidates = definitionsForLevel(definitions, context.level);
  const selected = new Map<string, { definition: AccessoryDefinition; score: number[] }>();

  for (const definition of candidates) {
    const typeScore = selectorScore(definition.types, context.type, context.baseType);
    if (typeScore < 0) {
      continue;
    }

    const zoneScore = context.level === 'page'
      ? 0
      : selectorScore(definition.zones ?? [], context.zone ?? '', undefined);
    if (zoneScore < 0) {
      continue;
    }

    const linkedTypeScore = context.level === 'link'
      ? selectorScore(definition.linkedTypes ?? [], context.linkedType ?? '', context.linkedBaseType)
      : 0;
    if (linkedTypeScore < 0) {
      continue;
    }

    const score = [typeScore, zoneScore, linkedTypeScore];
    const previous = selected.get(definition.name);
    if (!previous || isMoreSpecific(score, previous.score)) {
      selected.set(definition.name, { definition, score });
    }
  }

  return [...selected.values()].map(({ definition }) => definition);
}

function definitionsForLevel(
  definitions: AccessoryDefinitions,
  level: AccessoryLevel,
): AccessoryDefinition[] {
  const levelDefinitions = definitions[`${level}Accessories`];
  if (!levelDefinitions) {
    return [];
  }
  return Array.isArray(levelDefinitions) ? levelDefinitions : Object.values(levelDefinitions);
}

function selectorScore(selectors: string[], actual: string, baseType?: string): number {
  let bestScore = -1;
  for (const selector of selectors) {
    if (selector === '*') {
      bestScore = Math.max(bestScore, 0);
    } else if (selector === actual) {
      bestScore = Math.max(bestScore, 2);
    } else if (baseType && selector === baseType) {
      bestScore = Math.max(bestScore, 1);
    }
  }
  return bestScore;
}

function isMoreSpecific(candidate: number[], current: number[]): boolean {
  for (let index = 0; index < candidate.length; index++) {
    if (candidate[index] !== current[index]) {
      return candidate[index] > current[index];
    }
  }
  return false;
}

function matchesContext(stored: AccessorySet, context: AccessoryContext): boolean {
  const zoneMatches = context.level === 'page'
    ? stored.zone === undefined
    : stored.zone === context.zone;
  const linkedTypeMatches = context.level === 'link'
    ? stored.linkedType === context.linkedType
    : stored.linkedType === undefined;
  return stored.theme === context.theme && stored.type === context.type && zoneMatches && linkedTypeMatches;
}

function defaultValues(definition: AccessoryDefinition): Record<string, boolean | string> {
  const values: Record<string, boolean | string> = {};
  for (const toggle of definition.toggles ?? []) {
    if (typeof toggle.default === 'boolean') {
      values[toggle.name] = toggle.default;
    }
  }
  for (const property of definition.properties ?? []) {
    if (typeof property.default === 'string'
      && property.options.some((option) => option.name === property.default)) {
      values[property.name] = property.default;
    }
  }
  return values;
}

function applyStoredValues(
  resolved: Record<string, boolean | string>,
  stored: AccessoryValues,
  definition: AccessoryDefinition,
): void {
  const storedValues = stored.values;
  if (!storedValues) {
    return;
  }

  const toggleNames = new Set((definition.toggles ?? []).map((toggle) => toggle.name));
  const propertiesByName = new Map((definition.properties ?? []).map((property) => [property.name, property]));

  for (const [name, value] of Object.entries(storedValues)) {
    if (toggleNames.has(name) && typeof value === 'boolean') {
      resolved[name] = value;
      continue;
    }
    const property = propertiesByName.get(name);
    if (property && typeof value === 'string' && property.options.some((option) => option.name === value)) {
      resolved[name] = value;
    }
  }
}