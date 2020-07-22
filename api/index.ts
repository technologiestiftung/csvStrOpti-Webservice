import { NowRequest, NowResponse } from "@vercel/node";
import { getPackage } from "./_lib/util/package";
const pkg = getPackage();

export default async function (
  request: NowRequest,
  response: NowResponse
): Promise<void> {
  let statusCode = 200;
  try {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, POST");
    response.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Origin, Authorization, Accept, Content-Type");

    if (request.method === "OPTIONS") {
      response.status(statusCode).send(null);
    }

    // const data = await json(request);
    response.status(statusCode).send("Hello World");
    return;
  } catch (error) {
    statusCode = 400;
    if (process.env.NODE_ENV === "development") {
      console.log(error);
    }
    response.status(400).send(null);
    return;
  }
}
