export async function GET(request: Request) {

  try {
    const health = await connection.getBackendInfo();
    return Response.json(health);
  } catch (error) {
    console.log(error);
    throw error;
  }
}