import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

export interface LoggedUserBarProps {
  data: PageData<BaseModel> & { editUrl: string };
}
