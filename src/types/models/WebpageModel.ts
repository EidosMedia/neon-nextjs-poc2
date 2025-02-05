
import { BaseModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

interface Link {
    targetId: string;
  }
  
  interface PageLink {
    [key: string]: Link[];
  }
  
  interface Links {
    pagelink: PageLink;
  };
  
  export type WebpageModel = {
    attributes: Record<string, unknown>;
    links: Links;
    resourceUrl: string;
    dataType: string;
  } & BaseModel;