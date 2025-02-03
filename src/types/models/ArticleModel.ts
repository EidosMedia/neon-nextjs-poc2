import { BaseModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

export type ArticleModel = {
  title: string;
  links: {
    system: {
      mainPicture: any[];
    };
  };
} & BaseModel;
