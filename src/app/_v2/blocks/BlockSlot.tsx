import type { BaseModel, PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { normalizeViewStatus, ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { decideBlockRender, getModuleKeys, type BlockArea } from '../lib/blocks';
import BlockBoundary from './BlockBoundary';
import ZoneRenderer from '../zones/ZoneRenderer';
import { fetchBlocks } from './fetchBlocks';
import { getBrand } from '../brands/registry';
import { getBrandModules } from '../brands/moduleRegistry';

function BlockPlaceholder({ link }: { link: { id: string; blockType?: string } }) {
  return <div className="v2-block v2-block--placeholder">{`Block: ${link.blockType ?? 'unknown'} (${link.id})`}</div>;
}

type Props = { data: PageData<BaseModel>; area: BlockArea };

/** Renders the content blocks linked to a page area; nothing (no wrapper) when there are none. */
export default async function BlockSlot({ data, area }: Props) {
  const blocks = await fetchBlocks(data, area);
  if (blocks.length === 0) return null;
  const viewStatus = normalizeViewStatus(data.siteData?.viewStatus);
  const theme = getActiveTheme(data);
  const moduleKeys = getModuleKeys(theme);
  const modules = getBrandModules(getBrand(theme).key);

  const rendered = blocks.map(({ link, data: block }, index) => {
    const key = `${area}-${link.id}-${index}`;
    const placeholder = <BlockPlaceholder link={link} />;
    // A failed fetch has no baseType, so it falls to placeholder (PREVIEW) or none (LIVE).
    const decision = decideBlockRender(link.blockType, block?.model?.data?.sys?.baseType, moduleKeys, viewStatus);
    switch (decision.kind) {
      case 'webpage':
        return (
          <BlockBoundary key={key} fallback={viewStatus === ViewStatus.PREVIEW ? placeholder : null}>
            <ZoneRenderer data={block as PageData<WebpageModel>} zone="main" />
          </BlockBoundary>
        );
      case 'placeholder':
        return <BlockPlaceholder key={key} link={link} />;
      case 'module': {
        const Module = modules[decision.key];
        if (!Module || !block) return null;
        return (
          <BlockBoundary key={key} fallback={viewStatus === ViewStatus.PREVIEW ? placeholder : null}>
            <Module block={block} />
          </BlockBoundary>
        );
      }
      default:
        return null;
    }
  });
  if (rendered.every((r) => r === null)) return null;
  return <div className={`v2-blocks v2-blocks--${area}`}>{rendered}</div>;
}
