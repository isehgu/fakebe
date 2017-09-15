const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const _ = require('lodash');

const port = process.env.PORT || 1337;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, () => {
    console.log(`Webserver is listening on ${port}`);
});

app.use((req, res, next) => {
    setCORSHeaders(res);
    next();
})

app.get('/', (req, res) => {
    res.send('Looks good');
})

app.all('/metrics/find', (req, res) => {
    console.log('Got metric request')
    console.log(req);
    // For fake graphite
    // var response = [
    //     { leaf: 1, text: '1st metric'},
    //     { leaf: 2, text: '2nd metric'},
    //     { leaf: 3, text: '3rd metric'},
    // ]

    // For custom plugin
    var response = ['1st metric', '2nd metric', '3rd metric'];
    res.json(response);
})

app.post('/render', (req, res) => {
    console.log("Got render request");
    console.log(req.body);
    //
    var re = /-([0-9])[m]/i;
    var now = Math.floor(Date.now()/1000); // Now is in seconds
    // { target: 'group(1st metric, group(1st metric, #A, #B), #B)',
    //   from: '-1s',
    //   until: 'now',
    //   format: 'json',
    //   maxDataPoints: '1321' }

    // graphite
    // const from = now-(req.body.from.match(re)[1] * 60); // From is now - the specified min

    // Custom plugin
    const from = now - (req.body.rangeRaw.from.match(re)[1] * 60);
    console.log(from);
    const diff = now - from
    // const interval = Math.floor(diff/10000);
    console.log("diff ", diff);
    // console.log("interval ", interval);

    // Graphite
    // Generating data per second
    // var data = _.range(from, now).map((time) => {
    //     return [Math.floor(Math.random()*10), time*1000]; // Restoring time back to milliseconds
    // })
    // console.log(data);



    // res.json([{
    //     target: req.body.target,
    //     datapoints: data
    //     // datapoints: [[Math.floor(Math.random() * 100), now-1]]
    // }])

    // Custom plugin
    let resp = [],
        respObj = {};
    // TargetObj is -- targets: [ { target: '1st metric', refId: 'A', type: 'timeserie' } ],
    // resp is [ targetObj, targetObj, targetObj...]
    console.log(Array.isArray(req.body.targets))
    resp = req.body.targets.map(function(targetObj, idx){
        respObj = {},
        respObj.target = targetObj.target;
        respObj.datapoints = _.range(from, now).map((time) => {

            // idx+1 is really for the first element, where index is actually 0, which renders all datapoints 0.
            return [Math.floor(Math.random()*10*(idx+1)), time*1000]; // Restoring time back to milliseconds
        })
        return respObj;
    })

    res.json(resp);
})


function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}
