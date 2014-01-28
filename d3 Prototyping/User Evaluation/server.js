////////////////////// Counter-balanced variables to set /////////////////////////////////////////////////////////
var phaseOrder = [0,1]; //This should be counterbalanced eventually (list of indices pointing to the phaseURL arrays
var techniqueOrder = [0,1,0]; //This should be counterbalanced as well , the interaction technique order within phases
var taskTypeOrder = [[0,1],[0,1],[0,1]]; //Retrieve value vs. distribution tasks counterbalanced
var participantID = "Brittany"; //Unique id assigned to the participant
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Other variables for storing participant info
var static = require('node-static'),
    express = require('express'),
    request = require('request'),
    fs = require("fs"),
    exec = require("child_process").exec,
    phaseURLs = ["BarchartExperiment/Barchart.html","ScatterplotExperiment/Scatterplot.html"],
    taskOrder = [],
    phaseNumber = 0;

//Log file names
var logFileName = participantID+"_log"+phaseOrder[phaseNumber]+".txt";
var solutionFileName = participantID+"_solutions.txt";
var timeFileName = participantID+"_time.txt";
var infoFileName = participantID+"_info.txt";

/**
* Create a node-static server instance to serve the './client' folder, will automatically load index.html
*/
var file = new(static.Server)('./client/'),
    app  = express();

/** Called at the first (start) page, indicates a new experiment has started,
 * decides which phase to initiate first based on the assigned order
 * */

 app.get('/startExperiment', function(req, res){
     var jsonStr = JSON.stringify(phaseURLs[phaseOrder[phaseNumber]]);

     console.log("Sending the first phase number");

     res.set('Content-Type', 'application/json');
     res.send( jsonStr );
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
    var taskType = req.query["taskType"];

    var logFilePrepend = eventId+"\t"+participantID+"\t"+new Date().toString()+"\t"+phaseId+"\t"+techniqueId+"\t"+taskType + "\t" +taskNumber;

    //Get information needed for a specific event
    var log = fs.createWriteStream(logFileName, {"flags" : "a"});
    var solutionLog = fs.createWriteStream(solutionFileName, {"flags" : "a"});
    var timeLog = fs.createWriteStream(timeFileName, {"flags" : "a"});

    if (eventId == 0){ //Task solution
        log.write(logFilePrepend + "\t" + req.query["solution"] + "\t" +req.query["correctSolution"]+"\n");
        solutionLog.write(logFilePrepend + "\t" + req.query["solution"] + "\t" +req.query["correctSolution"]+"\n");
    }else if (eventId ==1){ //Task completion time
        log.write(logFilePrepend + "\t" + req.query["touchDown"] + "\t" +req.query["touchUp"]
            + "\t" + req.query["touchTime"] + "\t" +req.query["objectUp"]+ "\t" +req.query["objectDown"]
            +"\n");
        timeLog.write(logFilePrepend + "\t" + req.query["touchDown"] + "\t" +req.query["touchUp"]
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
    solutionLog.end();
	timeLog.end();
    res.end();

});
/** Change phases (move to the next prototype)
 * */
app.get("/nextPhase", function(req, res) {

    //techniqueOrder = [2,1,0];
    phaseNumber++;

    var nextPhase = phaseOrder[phaseNumber];
    var jsonStr = JSON.stringify(phaseURLs[nextPhase]);

    console.log("Changing to phase "+nextPhase+" to url "+jsonStr);
    setFileNames();

    res.set('Content-Type', 'application/json');
    res.send( jsonStr );
    res.end();

});
/** Sends the interaction technique and task ordering
 * */
app.get("/getOrders", function(req, res) {
    randomizeTasks();
    //Log the assigned condition ordering
    var log = fs.createWriteStream(infoFileName, {"flags" : "a"});
    log.write(new Date().toString()+"\n");
    log.write("Participant ID: "+participantID+" \n");
    log.write("Phase: "+phaseOrder[phaseNumber]+" \n");
    log.write("Technique order: "+techniqueOrder+" \n");
    log.write("Task type order: \n");
    log.write("Dimp: "+taskTypeOrder[0]+"\tSlider: "+taskTypeOrder[1]+"\tMultiples: "+taskTypeOrder[2]+"\n");

    log.write("Randomized task order: \n");
    log.write("Dimp: "+taskOrder[0]+"\tSlider: "+taskOrder[1]+"\tMultiples: "+taskOrder[2]+"\n");
    log.end();

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
    logFileName = participantID+"_exploratory"+phaseOrder[phaseNumber]+".txt";
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

function setFileNames(){
    logFileName = participantID+"_log"+phaseOrder[phaseNumber]+".txt";
    //solutionFileName = participantID+"_solutions"+phaseOrder[phaseNumber]+".txt";
}
//Generates an array determining the task order, based on the taskTypeOrder for all three interaction techniques
//
//Randomization:
// indices: 0 - 9 (Retrieve value tasks)
// indices: 10 - 19 (Distribution tasks)
/**function randomizeTasks(){
  var retrieveTasks = [0,1,2,3,4,5,6,7,8,9];
  var distributionTasks = [10,11,12,13,14,15,16,17,18,19];
  var ambiguousRetrieveTasks = [20,21,22];
  var ambiguousDistributionTasks = [23,24,25];
  var practiceTasks = [26,27,28,29,30,31,32,33,34,35,36,37];
  var practiceAmbiguousTasks = [38,39,40,41];

 for (var i=0;i<3;i++){ //Do for each interaction technique
     var shuffledRetrieve = shuffle(retrieveTasks);
     var shuffledDistribution = shuffle(distributionTasks);
     var shuffledAmbiguousRetrieve = shuffle(ambiguousRetrieveTasks);
     var shuffledAmbiguousDistribution = shuffle(ambiguousDistributionTasks);
     var shuffledRetrieve = retrieveTasks;
     var shuffledDistribution = distributionTasks;
     var shuffledAmbiguousRetrieve = ambiguousRetrieveTasks;
     var shuffledAmbiguousDistribution = ambiguousDistributionTasks;
     var randomizedArray = [];

     if (taskTypeOrder[i][0]==0){ //Retrieve tasks come first
         randomizedArray = shuffledRetrieve.concat(shuffledDistribution).concat(shuffledAmbiguousRetrieve).concat(shuffledAmbiguousDistribution);
    }else{ //Distribution tasks come first
         randomizedArray = shuffledDistribution.concat(shuffledRetrieve).concat(shuffledAmbiguousDistribution).concat(shuffledAmbiguousRetrieve);
     }
     if (i==0){ //Extra practice tasks for ambiguous
         taskOrder[i] = practiceTasks.concat(practiceAmbiguousTasks).concat(randomizedArray);
     }else{
         taskOrder[i] = practiceTasks.concat(randomizedArray);
     }
 }
}*///Old version of the function when there were more tasks..

//Generates an array determining the task order, based on the taskTypeOrder for all three interaction techniques
//
//Randomization:
// indices: 0 - 5 (Retrieve value tasks)
// indices: 6 - 11 (Distribution tasks)
function randomizeTasks(){
     var retrieveTasks = [0,1,2,3,4,5];
     var distributionTasks = [6,7,8,9,10,11];
     var ambiguousRetrieveTasks = [12,13,14];
     var ambiguousDistributionTasks = [15,16,17];
     var practiceTasks = [18,19,20,21,22,23,24,25,26,27,28,29];
     var practiceAmbiguousTasks = [30,31,32,33];

     for (var i=0;i<3;i++){ //Do for each interaction technique
         //var shuffledRetrieve = shuffle(retrieveTasks);
         //var shuffledDistribution = shuffle(distributionTasks);
         //var shuffledAmbiguousRetrieve = shuffle(ambiguousRetrieveTasks);
         //var shuffledAmbiguousDistribution = shuffle(ambiguousDistributionTasks);
         var shuffledRetrieve = retrieveTasks;
         var shuffledDistribution = distributionTasks;
         var shuffledAmbiguousRetrieve = ambiguousRetrieveTasks;
         var shuffledAmbiguousDistribution = ambiguousDistributionTasks;
         var shuffledRetrieve = retrieveTasks;
         var shuffledDistribution = distributionTasks;
         var shuffledAmbiguousRetrieve = ambiguousRetrieveTasks;
         var shuffledAmbiguousDistribution = ambiguousDistributionTasks;
         var randomizedArray = [];

         if (taskTypeOrder[i][0]==0){ //Retrieve tasks come first
            randomizedArray = shuffledRetrieve.concat(shuffledDistribution).concat(shuffledAmbiguousRetrieve).concat(shuffledAmbiguousDistribution);
         }else{ //Distribution tasks come first
             randomizedArray = shuffledDistribution.concat(shuffledRetrieve).concat(shuffledAmbiguousDistribution).concat(shuffledAmbiguousRetrieve);
         }
         if (i==0){ //Extra practice tasks for ambiguous
            taskOrder[i] = practiceTasks.concat(practiceAmbiguousTasks).concat(randomizedArray);
         }else{
            taskOrder[i] = practiceTasks.concat(randomizedArray);
         }
        /** taskOrder[i] = retrieveTasks.concat(distributionTasks);
         if (i==0){ //Extra practice tasks for ambiguous
             taskOrder[i] = taskOrder[i].concat(ambiguousRetrieveTasks).concat(ambiguousDistributionTasks );
         }*/
     }
 }

//This was taken from stackoverflow..
function shuffle(array) {
    var currentIndex = array.length
        , temporaryValue
        , randomIndex
        ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}