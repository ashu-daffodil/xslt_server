/**
 * Created by ashu on 8/9/15.
 */

var express = require('express');
var app = express();
var bodyparser = require("body-parser");
var argv = process.argv;
var PORT = argv[2];

app.use(bodyparser.urlencoded({ extended: false, limit: 1024 * 1024 * 10 }));
app.use(bodyparser.json({limit: 1024 * 1024 * 10}));

app.all('/rest/runningStatus', function (req, res) {
    res.writeHead(200);
    res.write("Server Running on port : "+PORT);
    res.end();
});

app.all("/rest/xslt", function (req, res) {
    try {
        var xslt = require('node_xslt');
        var template = req.param("template");
        var queryResult = req.param("result");
        if (queryResult) {
            queryResult = JSON.parse(queryResult)
        }
        var xml = require("js2xmlparser")("root", queryResult);
        var document = xslt.readXmlString(xml);
        var stylesheet = xslt.readXsltString(template);   // template = xslt
        var resolvedTemplate = xslt.transform(stylesheet, document, []);
        writeJSONResponse(req, res, resolvedTemplate)
    } catch (e) {
        writeJSONResponse(req, res, e)
    }
});

app.listen(PORT, function () {
    console.log("server running on port : " + PORT);
});


function writeJSONResponse(req, res, result) {
    var jsonResponseType = {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS"};
    var responseToWrite = undefined;
    if (result instanceof Error) {
        responseToWrite = {response: result.message, status: "error", code: result.code, message: result.message};
        res.writeHead(417, jsonResponseType);
        res.write(JSON.stringify(responseToWrite));
        res.end();
    } else {
        responseToWrite = JSON.stringify({response: result, status: "ok", code: 200});
        res.writeHead(200, jsonResponseType);
        res.write(responseToWrite);
        res.end();
    }
}