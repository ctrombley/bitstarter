var express = require('express');
    fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(req, res) {


    var readStream = fs.createReadStream('index.html');
    readStream.on('open', function () {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        readStream.pipe(res);
    });

    readStream.on('error', function () {
        res.writeHead(500);
        res.end(err);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
