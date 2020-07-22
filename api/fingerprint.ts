import csvOpti from "csv-string-optimization";

import { NowRequest, NowResponse } from "@vercel/node";
import { requestHandler } from "./_lib/request-handler";
import { RouteHandler } from "./_lib/commmon/types";
const routeHandler: RouteHandler = async (request, response) => {
  const body = JSON.parse(request.body)
  if(body.method !== 'normal' && body.method !== 'phonetic') {
    body.method = 'normal';
  }
  response.status(200).send({fingerprint: csvOpti.fingerprint.key(body.string, body.method)})
};

/**
 * Route num. Takes an street id (not the name) optained from thhe street root and returns all house numbers wiith id
 *
 */
export default async function (
  request: NowRequest,
  response: NowResponse
): Promise<void> {
  await requestHandler(request, response, routeHandler);
}
