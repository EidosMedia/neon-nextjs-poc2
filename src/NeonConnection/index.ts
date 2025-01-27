import { NeonConnection } from './NeonConnection';

const createNeonConnection = (
  neonFoUrl: string,
  backOfficeAccessKey: string
) => {
  return new NeonConnection(neonFoUrl, backOfficeAccessKey);
};
