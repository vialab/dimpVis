//Some variables specific to each participant
//TODO: might want to log these or record them somewhere (since the order is random)
//TODO: change phaseOrder to only two phases (between subjects)
var phaseOrder = [0,1]; //This should be counterbalanced eventually (list of indices pointing to the phaseURL arrays
var phaseNumber = 0; //The current phase (will eventually reach 3, the end of the phaseOrder array), this always starts at 0 (regardless of order)
var techniqueOrder = [0,1,2]; //This should be counterbalanced as well , the interaction technique order within phases
var taskOrder = [1,0,2,3,4,5,6,7,8,9,10,11]; //This should be randomized, an index pointing to the task
var taskType = 1; //TODO: fix this later
var participantID = "test";
var logFileName = participantID+"_log.txt";

var static = require('node-static'),
    express = require('express'),
    request = require('request'),
    fs = require("fs"),
    exec = require("child_process").exec,
    phaseURLs = ["BarchartExperiment/Barchart.html","ScatterplotExperiment/Scatterplot.html","PiechartExperiment/Piechart.html","HeatmapExperiment/Heatmap.html"];

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
 *  Need to send the following appended parameters:
 *  content: specific to each logged event
 *  task number: the current task
 *  interaction technique id: 0 - dimpVis, 1 - slider, 2 - small multiples
 * */
app.get("/log", function(req, res) {
   //Get the information for the prepend
    var eventId = req.query["eventId"];
    var taskNumber = req.query["task"];
    var techniqueId = req.query["interaction"];
    var phaseId = phaseOrder[phaseNumber];

    var logFilePrepend = participantID+"\t"+new Date().toString()+"\t"+phaseId+"\t"+techniqueId+"\t"+taskType + "\t" +taskNumber + "\t"+eventId;

    //Get information needed for a specific event
    var log = fs.createWriteStream(logFileName, {"flags" : "a"});
    if (eventId == 0){ //Task solution
        log.write(logFilePrepend + "\t" + req.query["solution"] + "\t" +req.query["correctSolution"]+"\n");
    }else if (eventId ==1){ //Task completion time
        log.write(logFilePrepend + "\t" + req.query["touchDown"] + "\t" +req.query["touchUp"]
            + "\t" + req.query["touchTime"] + "\t" +req.query["objectUp"]+ "\t" +req.query["objectDown"]
            +"\n");
    }else if (eventId == 2 || eventId==3){ //Touch down or up on an object
        log.write(logFilePrepend + "\t" + req.query["objectId"] + "\t" +req.query["viewIndex"]
            + "\t" + req.query["touchX"]  + "\t" + req.query["touchY"] + "\t" + req.query["time"] +"\n");
    }else if (eventId == 4 || eventId ==5){ //Drag direction or time direction switch
        log.write(logFilePrepend + "\t" + req.query["objectId"] + "\t" +req.query["viewIndex"]
            + "\t" + req.query["oldDirection"]  + "\t" + req.query["newDirection"]+"\n");
    }else if (eventId ==6){ //Deviate from dragged object
        log.write(logFilePrepend + "\t" + req.query["objectId"] + "\t" +req.query["viewIndex"]
            + "\t" + req.query["distance"]  + "\t" + req.query["touchX"]
            + "\t" + req.query["touchY"]  + "\t" + req.query["objectX"] + "\t" + req.query["objectY"]+"\n");
    }else if (eventId ==7 ){ //Touch down not on interactive object
        log.write(logFilePrepend + "\t" +req.query["viewIndex"]  + "\t" + req.query["touchX"]
            + "\t" + req.query["touchY"] + "\t" + req.query["time"] +"\n");
    }else if (eventId ==8){ //Touch up not on interactive object
        log.write(logFilePrepend + "\t" +req.query["viewIndex"]  + "\t" + req.query["touchX"]
            + "\t" + req.query["touchY"]  + "\t" + req.query["time"]  +"\n");
    }

    console.log("Event #"+eventId+" logged");

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
/** Sends the interaction technique and task ordering
 * */
app.get("/getOrders", function(req, res) {

    var jsonStr = [techniqueOrder,taskOrder];

    console.log("Sending the interaction technique and task orders");

    res.set('Content-Type', 'application/json');
    res.send( jsonStr );
    res.end();

});
/** Called when the exploratory period has started (change the log file)
 * */
app.get('/startExploratory', function(req, res){
    console.log('Received request to start exploratory period');
    logFileName = "logExploratory";
    res.end();

});


////////////////////////////////////////////////////////////////////////////////
// This needs to go last
////////////////////////////////////////////////////////////////////////////////
app.get(/\w*/, function(req, res){
    file.serve(req, res);
});

app.listen(8080);
console.log('Listening on port 8080. Cheers!...');
