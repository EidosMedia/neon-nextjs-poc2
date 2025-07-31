import { BaseModel, PageData, Site } from '@eidosmedia/neon-frontoffice-ts-sdk';

export interface LoggedUserBarProps {
  data: (PageData<BaseModel> & { editUrl: string; previewHost: string; liveHost: string }) | { siteData: Site };
  siteName?: string;
}

export interface LoggedUserBarComponentProps {
  data: PageData<BaseModel> & { editUrl: string };
}
