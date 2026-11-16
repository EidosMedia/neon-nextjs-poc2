import { blockAttrs, blockTitle, parsePairs, type BrandModuleProps } from '../../moduleData';

/** Specs panel. Reads `title` and `attributes.specs` ("Label: Value|Label: Value" or `{label,value}[]`). */
export default function SpecsPanel({ block }: BrandModuleProps) {
  const specs = parsePairs(blockAttrs(block).specs);
  if (specs.length === 0) return null;
  const title = blockTitle(block) ?? 'Specs';
  return (
    <section className="v2-mod-specs" aria-label={title}>
      <h2 className="v2-mod-specs__title">{title}</h2>
      <dl className="v2-mod-specs__list">
        {specs.map((s, i) => (
          <div key={i} className="v2-mod-specs__row">
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
