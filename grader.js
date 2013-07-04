#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var URL_DEFAULT = "http://bitstarter-ctrombley.herokuapp.com";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksFile) {
    return JSON.parse(fs.readFileSync(checksFile));
};

var checkHtmlFile = function(htmlfile, checksFile) {
    var content = fs.readFileSync(htmlfile);
    return checkContent(content, checksFile);
};

var getUrl = function(url, callback) {
    rest.get(url).on('complete', function(res) {
        callback(res);
    });
}

var checkContent = function(content, checksFile) {
    $ = cheerio.load(content);
    var checks = loadChecks(checksFile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var printResults = function(checkJson) {
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

if(require.main == module) {
    program
        .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url ', 'URL of index.html', assertFileExists, URL_DEFAULT)
        .parse(process.argv);

    var checkJson;
    if (program.url) {
        getUrl(program.url, function(res) {
            checkJson = checkContent(res, program.checks)
            printResults(checkJson);
        })
    }
    else if (program.file) {
        checkJson = checkHtmlFile(program.file, program.checks)
        printResults(checkJson);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrl = checkUrl;
}
