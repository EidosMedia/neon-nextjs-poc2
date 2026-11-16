import type { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { normalizeViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { decideBlockRender, getModuleKeys, type BlockArea } from '../lib/blocks';
import ZoneRenderer from '../zones/ZoneRenderer';
import { fetchBlocks } from './fetchBlocks';

type Props = { data: PageData<BaseModel>; area: BlockArea };

/** Renders the content blocks linked to a page area; nothing (no wrapper) when there are none. */
export default async function BlockSlot({ data, area }: Props) {
  const blocks = await fetchBlocks(data, area);
  if (blocks.length === 0) return null;
  const viewStatus = normalizeViewStatus(data.siteData?.viewStatus);
  const moduleKeys = getModuleKeys(getActiveTheme(data));

  const rendered = blocks.map(({ link, data: block }) => {
    // A failed fetch has no baseType, so it falls to placeholder (PREVIEW) or none (LIVE).
    const decision = decideBlockRender(link.blockType, block?.model?.data?.sys?.baseType, moduleKeys, viewStatus);
    switch (decision.kind) {
      case 'webpage':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <ZoneRenderer key={link.id} data={block as PageData<any>} zone="main" />;
      case 'placeholder':
        return (
          <div key={link.id} className="v2-block v2-block--placeholder">
            {`Block: ${link.blockType ?? 'unknown'} (${link.id})`}
          </div>
        );
      default:
        // 'module' rendering arrives with Task 16 (brand.modules); until then nothing is drawn.
        return null;
    }
  });
  if (rendered.every((r) => r === null)) return null;
  return <div className={`v2-blocks v2-blocks--${area}`}>{rendered}</div>;
}
