import csvOpti from "csv-string-optimization";
import { dsvFormat } from "d3-dsv";

import { NowRequest, NowResponse } from "@vercel/node";
import { requestHandler } from "./_lib/request-handler";
import { RouteHandler } from "./_lib/commmon/types";
const routeHandler: RouteHandler = async (request, response) => {
  const body = JSON.parse(request.body)

  //csv, column, delimiter, ngram_size, limit, method, finger_type, finger_lang, finger_stemming

  if(body.csv && body.column && body.delimiter){
    const parser = dsvFormat(body.delimiter)

    //remove empty lines at start/end
    body.csv = body.csv.replace(/^\s+|\s+$/g, '');

    try {
      const column_name = body.column,
            column = csvOpti.extractColumn(parser.parse(body.csv), column_name)

      let template = null

      if(body.method == 'knn'){
        const reduced_column = csvOpti.knn.reduce(column),
              clusters = csvOpti.knn.prepare(reduced_column, (body.ngram_size || 6))

        template = csvOpti.createTemplate(
            csvOpti.knn.readableCluster(
              csvOpti.knn.cluster(
                csvOpti.knn.analyse(
                  clusters, reduced_column, (parseFloat(body.limit)/100 || 0.1)
                )
              ),
              reduced_column, column
            )
          )

      }else{

        let finger_stemming: boolean = true;
        if(body.finger_stemming === 'false') finger_stemming = false

        template = csvOpti.createTemplate(
            csvOpti.fingerprint.readableCluster(
              csvOpti.fingerprint.cluster(
                csvOpti.fingerprint.analyse(
                  column, (body.finger_type || 'normal'), {
                    'lang': (body.finger_lang || 'german'), 
                    'stemming': (finger_stemming || false)
                  }
                )
              )
            )
          )

      }

      response.status(200).json({ data: JSON.parse(template) })

    }catch(err){
      response.status(400).json({ mesage: 'Something was malformatted' })
    }

  }else{
    response.status(400).json({ mesage: 'form fields csv, column and delimiter are required' })
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
