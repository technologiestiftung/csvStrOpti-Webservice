import csvOpti from "csv-string-optimization";
import { dsvFormat } from "d3-dsv";

import { NowRequest, NowResponse } from "@vercel/node";
import { requestHandler } from "./_lib/request-handler";
import { RouteHandler } from "./_lib/commmon/types";

const routeHandler: RouteHandler = async (request, response) => {
  const body = JSON.parse(request.body)
  if(body.csv && body.column && body.delimiter && body.template){

    const parser = dsvFormat(body.delimiter)

    body.csv = body.csv.replace(/^\s+|\s+$/g, '');
    body.template = body.template.replace(/^\s+|\s+$/g, '');

    response.status(200).send({ data: csvOpti.cleanFile(parser.parse(body.csv), JSON.parse(body.template), body.column) })

  }else{
    response.status(400).send({ mesage: 'form fields csv, column, delimiter and template are required' })
  }
    
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
