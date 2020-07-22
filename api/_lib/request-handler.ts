import { NowRequest, NowResponse } from "@vercel/node";
export async function requestHandler(
  request: NowRequest,
  response: NowResponse,
  routeHandler: (request: NowRequest, response: NowResponse) => Promise<void>
): Promise<void> {
  let statusCode = 200;
  try {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, POST");
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Origin, Authorization, Accept, Content-Type");

    if (request.method === "OPTIONS") {
      response.status(statusCode).send(null);
    }

    await routeHandler(request, response);
    return;
  } catch (error) {
    statusCode = 400;
    if (process.env.NODE_ENV === "development") {
      console.log(error);
    }
    response.status(statusCode).send({ error: error.message });
    return;
  }
}
