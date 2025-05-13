export async function GET(request: Request) {
  try {
    const health = await connection.getBackendInfo();

    const packageJson = require('../../../../package.json');
    const version = packageJson.version;

    return Response.json({ ...health, pocVersion: version });
  } catch (error) {
    console.log(error);
    throw error;
  }
}
