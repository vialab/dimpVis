var static = require('node-static'),
    express = require('express'),
    request = require('request'),
    fs = require("fs"),
    exec = require("child_process").exec,
    phaseURLs = ["BarchartExperiment/Barchart.html","ScatterplotExperiment/Scatterplot.html","PiechartExperiment/Piechart.html"];

//Some variables specific to each participant
//TODO: might want to log these or record them somewhere (since the order is random)
var phaseOrder = [0,1,2,3]; //This should be randomized eventually (list of indices pointing to the phaseURL arrays
var phaseNumber = 0; //The current phase (will eventually reach 3, the end of the phaseOrder array), this always starts at 0 (regardless of order)
var techniqueOrder = [0,1,2]; //This should be randomized as well , the interaction technique order within phases

/**
* Create a node-static server instance to serve the './client' folder, will automatically load index.html
*/
var file = new(static.Server)('./client/'),
    app  = express();

/** Called at the first (start) page, indicates a new experiment has started
 * */
app.get('/startExperiment', function(req, res){
    console.log('Received request to start experiment');
    res.end();

});
/** Log an event occurring on the client side (See word document for logging format and codes)
 * */
app.get("/log", function(req, res) {
    var content = req.query["content"];
    var log = fs.createWriteStream("log.txt", {"flags" : "a"});
    var now = new Date();

    log.write( new Date().toString() + "|" + content + "\n");

    console.log("Event logged");

    log.end();
    res.end();

});
/** Change phases (move to the next prototype)
 * */
app.get("/nextPhase", function(req, res) {

    techniqueOrder = [2,1,0];
    phaseNumber++;

    var nextPhase = phaseOrder[phaseNumber];
    var jsonStr = JSON.stringify(phaseURLs[nextPhase]);

    console.log("Changing to phase "+nextPhase+" to url "+jsonStr);

    res.set('Content-Type', 'application/json');
    res.send( jsonStr );
    res.end();

});
/** Sends the interaction technique to begin the phase with
 * */
app.get("/getInteractionTechniqueOrder", function(req, res) {

    var jsonStr = JSON.stringify(techniqueOrder);

    console.log("Sending the interaction technique order");

    res.set('Content-Type', 'application/json');
    res.send( jsonStr );
    res.end();

});





 ////////////////////////////////////////////////////////////////////////////////
// this request will still be handled by the static file server,
// but nothing is gonna happen, cause dict is not the name of a file
////////////////////////////////////////////////////////////////////////////////
app.get('/dict', function(req, res){
    var word = req.query['word'],
        url  = 'http://www.dictionaryapi.com/api/v1/references/learners/xml/'
               + word.toLowerCase() + '?key=2706fe54-fc4e-4ccd-9109-515178da172a'

    console.log('Received request for word: '+word);

    request(url, function(error, response, body){
         if (!error && response.statusCode == 200) {
             res.set('Content-Type', 'application/xml');
             res.send(body);
             console.log('Sent xml for word: '+word);
         }
    });

    console.log('Requested xml for word: '+word);
});



////////////////////////////////////////////////////////////////////////////////
// Get synonyms
////////////////////////////////////////////////////////////////////////////////
app.get("/syn", function(req, res) {
   var word = req.query["word"];
   var url = WEBSTER_URL + "thesaurus/xml/" + word 
           + "?key=fa968a41-c147-4c4f-8f39-7b6ec0c7dc7a";
   
   request(url, function(error, response, body){
      if (!error && response.statusCode == 200) {
          res.set('Content-Type', 'application/xml');
          res.send(body);
      }
   });

});






var WEBSTER_URL = "http://www.dictionaryapi.com/api/v1/references/";
////////////////////////////////////////////////////////////////////////////////
// Fetch closest ngrams
////////////////////////////////////////////////////////////////////////////////
app.get("/ngram", function(req, res) {
   var key = req.query["word"];

console.log("key : " + key);

   var result = ngramTable[ key ];
   var jsonStr;
   if (typeof result === "undefined") jsonStr = JSON.stringify( "" );
   else jsonStr = JSON.stringify( result );

   res.set('Content-Type', 'application/json');
   res.send( jsonStr );


});


////////////////////////////////////////////////////////////////////////////////
// Test calling child process on server system
////////////////////////////////////////////////////////////////////////////////
app.get("/testDir", function(req, res) {
   exec("dir", function(err, stdout, stderr) {
      res.set('Content-Type', 'application/json');
      res.send( JSON.stringify(stdout));
   });
});



////////////////////////////////////////////////////////////////////////////////
// This needs to go last
////////////////////////////////////////////////////////////////////////////////
app.get(/\w*/, function(req, res){
    file.serve(req, res);
});


var ngramTable = {};
function slurpNGram() {
   var giantArray = fs.readFileSync("./client/data/w2.txt").toString().split("\n");
   for (var i=0; i < giantArray.length; i++) {
      var line = giantArray[i];
      line = line.replace("\n", "");
      line = line.replace("\r", "");

      var tokens = line.split("\t");
      var freq = tokens[0];
      var w1 = tokens[1];
      var w2 = tokens[2];

      var hash = w1;
      if ( ngramTable.hasOwnProperty(hash) ) {
         ngramTable[ hash ].push( w2 );
      } else {
         var tmp = new Array();
         tmp.push( w2 );
         ngramTable[ hash ] = tmp;
      }
   } // end for
}

app.listen(8080);
console.log('Listening on port 8080. Cheers!...');
