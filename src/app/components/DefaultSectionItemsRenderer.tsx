import type { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import EmptySection from './EmptySection';
import SectionItemsClient from './SectionItemsClient';
import { sectionHasObjects } from '@/utilities/sectionRecirculation';

type DefaultSectionItemsRendererProps = {
  data: PageData<BaseModel>;
};

function DefaultSectionItemsRenderer({ data }: DefaultSectionItemsRendererProps) {
  if (data.model.data.sys?.baseType === 'section' && !sectionHasObjects(data)) {
    return <EmptySection data={data} />;
  }
  return <SectionItemsClient data={data} />;
}

export default DefaultSectionItemsRenderer;
