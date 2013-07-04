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

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    checkContent($, checksFile);
};

var checkUrl = function(url, checksFile) {
    rest.get(url).on('complete', function(res) {
        $ = cheerio.load(res);
        checkContent($, checksFile);
    });
}

var checkContent = function($, checksFile) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

if(require.main == module) {
    program
        .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url ', 'URL of index.html', assertFileExists, URL_DEFAULT)
        .parse(process.argv);

    var checkJson;
    if (program.url) {
        checkJson = checkUrl(program.url, program.checks)
    }
    else if (program.file) {
        checkJson = checkHtmlFile(program.file, program.checks)
    }

    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkUrl = checkUrl;
}
