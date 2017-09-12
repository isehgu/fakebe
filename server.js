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

app.all('/metrics/find', (req, res) => {
    console.log('Got metric request')
    var response = [
        { leaf: 1, text: '1st metric'},
        { leaf: 2, text: '2nd metric'},
        { leaf: 3, text: '3rd metric'},
    ]
    res.json(response);
})

app.post('/render', (req, res) => {
    console.log("Got render request");
    console.log(req.body);
    var re = /-([0-9])[m]/i;
    var now = Math.floor(Date.now()/1000);
    // { target: 'group(1st metric, group(1st metric, #A, #B), #B)',
    //   from: '-1s',
    //   until: 'now',
    //   format: 'json',
    //   maxDataPoints: '1321' }
    const from = now - (req.body.from.match(re)[1] * 60);
    console.log(from);
    const diff = now - from
    // const interval = Math.floor(diff/10000);
    console.log("diff ", diff);
    // console.log("interval ", interval);
    var data = _.range(from, now).map((time) => {
        return [Math.floor(Math.random()*10), time];
    })
    // console.log(data);
    res.json([{
        target: req.body.target,
        datapoints: data
        // datapoints: [[Math.floor(Math.random() * 100), now-1]]
    }])
})


function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // res.setHeader("Access-Control-Allow-Methods", "POST");
  // res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}
