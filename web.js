var express = require('express');
    fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(req, res) {
    var readStream = fs.createReadStream('index.html');
    readStream.on('open', function () {
        readStream.pipe(res);
    });

    readStream.on('error', function () {
        res.end(err);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
