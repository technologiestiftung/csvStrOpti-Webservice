const formidable = require('formidable'),
      express = require('express'),
      d3_dsv = require('d3-dsv'),
      csvOpti = require('csv-string-optimization')

const port = 2307

let app = express()

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.post('/analyse', (req, res, next) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
      
      //csv, column, delimiter, ngram_size, limit, method, finger_type, finger_lang, finger_stemming

      if(fields.csv && fields.column && fields.delimiter){
        const parser = d3_dsv.dsvFormat(fields.delimiter)     

        //remove empty lines at start/end
        fields.csv = fields.csv.replace(/^\s+|\s+$/g, '');

        try {
          const column_name = fields.column,
                column = csvOpti.extractColumn(parser.parse(fields.csv), column_name)


          let   template = null

          if(fields.method == 'knn'){
            const reduced_column = csvOpti.knn.reduce(column),
                  clusters = csvOpti.knn.prepare(reduced_column, (fields.ngram_size || 6))

            template = csvOpti.createTemplate(
                csvOpti.knn.readableCluster(
                  csvOpti.knn.cluster(
                    csvOpti.knn.analyse(
                      clusters, reduced_column, (parseFloat(fields.limit)/100 || 0.1)
                    )
                  ),
                  reduced_column, column
                )
              )

          }else{

            if(fields.finger_stemming === 'false') fields.finger_stemming = false

            template = csvOpti.createTemplate(
                csvOpti.fingerprint.readableCluster(
                  csvOpti.fingerprint.cluster(
                    csvOpti.fingerprint.analyse(
                      column, (fields.finger_type || 'normal'), {
                        'lang': (fields.finger_lang || 'german'), 
                        'stemming': (fields.finger_stemming || false)
                      }
                    )
                  )
                )
              )

          }

          return res.status(200).json({ data: JSON.parse(template) })

        }catch(err){
          return res.status(400).json({ mesage: 'Something was malformatted' })
        }

      }else{
        return res.status(400).json({ mesage: 'form fields csv, column and delimiter are required' })
      }

    })
})

app.get('/fingerprint', (req, res, next) => {
  if(req.query.method !== 'normal' && req.query.method !== 'phonetic') { req.query.method = 'normal'; }
  return res.status(200).json({fingerprint: csvOpti.fingerprint.key(req.query.string, req.query.method)})
})

app.post('/clean', (req, res, next) => {
    var form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
      
      if(fields.csv && fields.column && fields.delimiter && fields.template){

        const parser = d3_dsv.dsvFormat(fields.delimiter)

        fields.csv = fields.csv.replace(/^\s+|\s+$/g, '');
        fields.template = fields.template.replace(/^\s+|\s+$/g, '');

        return res.status(200).json({ data: csvOpti.cleanFile(parser.parse(fields.csv), JSON.parse(fields.template), fields.column) })

      }else{
        return res.status(400).json({ mesage: 'form fields csv, column, delimiter and template are required' })
      }
      
    })
})

app.listen(port, function() {
 console.log("Listening on " + port);
});