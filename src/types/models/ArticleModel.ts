import { BaseModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

export type ArticleModel = {
  title: string;
  links: {
    system: {
      mainPicture: any[];
      teaserPicture?: any[];
    };
  };
  pubInfo: {
    publicationTime: string;
    publishedBy: {
      userName: string;
    };
    visible: boolean;
  };
} & BaseModel;
