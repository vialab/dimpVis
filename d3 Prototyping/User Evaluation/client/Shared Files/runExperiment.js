/**Runs the experiment for each visualization type by fetching required data from the server and
 * using functions from visualization-specific files
 * */
//Order of the experiment (get from the server when page is loaded)
var techniqueOrder = []; //Counterbalanced order of interaction technique
var taskOrder = []; //Randomized order of tasks
var currentDataset = []; //Dataset currently being used during a task
var currentTaskOrder = []; //Set of tasks for the current interaction technique

//Counters for determining the current trial
var taskCounter = 0;
var techniqueCounter = 0;
var timeCounter = 0;
var timerVar;
var isExploratory = false;

//Stoppers for the counters
//var maxTaskTime = 100; Not used yet
var totalObjectiveTasks = 30; //For each interaction technique
//var totalObjectiveTasks = 1; //For each interaction technique
//Tracking touch events to mark task completion time
 var firstTouchDown = null;
 var lastTouchUp = null;
 var firstTouchDownId = null;
 var lastTouchUpId = null;
 var taskStartTime = null;

 //Display properties
 var screenX = 1680;
 var screenY = 1050;
 var backgroundColour ="#2C2D2D";
 var instructions = "";

//Customized display properties for the tutorial screens
 var tutorialInstructions = [
     "Drag the bars to find a view of the barchart that answers the question",
     "Drag along the slider to find a view of the barchart that answers the question",
     "Select the image of the barchart that answers the question",
     "Drag the bars to explore the visualization over time"
 ];
 var tutorialGifs = ["Images/dimpVis.gif", "Images/slider.gif", "Images/multiples.png","Images/exploratory.gif"];

 //To disable the drag function
 var doNothing = d3.behavior.drag().on("dragstart", null)
 .on("drag", null).on("dragend",null);

//Attach click events to the buttons
d3.select("#doneTutorialButton").on("click", startTasks);
d3.select("#doneQuestionnaireButton").on("click", confirmDoneQuestionnaire);
d3.select("#submitButton").on("click", showIntermediateScreen);
d3.select("#showVisButton").on("click", updateVisualizationDisplay);
d3.select("#skipButton").on("click",skipTask);

//////////////////////Declare functions required to run the experiment here//////////////////////
//Function that will be executed every second to check the time
var timerFunc = function (){
     timeCounter++;
    /** if (timeCounter > maxTaskTime){ //Exceeded maximum time provided for a task
         alert("Maximum time to complete the task has been reached.  You will now begin the next task.");
         //Grab the solution (if any), submit the most recent solution?
         var solution = d3.select("#taskSolution").node().value;
         var result;
         if (solution.length >0){
            result = confirm("You have entered: "+solution+".  Would you like to submit this answer?");
         }

         if (result ==true){
            switchTask(solution);
         }else{
            switchTask("");
         }
     }else if (timeCounter > 20){ //Display the timer counts for debugging
        d3.select("#timer").node().innerHTML="Time Remaining: "+(maxTaskTime-timeCounter);
     }*/
 };
function startTimer(){
    timerVar = setInterval(timerFunc,1000);
}
function stopTimer(){
    clearInterval(timerVar);
    timeCounter = 0;
    d3.select("#timer").node().innerHTML="";
}

//Called when the html page is loaded
window.onload = function (){
         d3.json("http://localhost:8080/getOrders?", function(error,response) {
         //console.log(response);
         techniqueOrder = response[0];
         taskOrder = response[1];
         currentTaskOrder = taskOrder[techniqueOrder[techniqueCounter]];
         showTutorial(techniqueOrder[techniqueCounter]);
         d3.selectAll(".tutorial").style("font-size",0.05*screenY+"px");
         d3.selectAll(".questionnaire").style("font-size",0.05*screenY+"px");
    });
 }
/** Allows the participant to skip a task (after they confirm)
 *  Nulls the solution in the log file
 * */
function skipTask(){
    var result = confirm("Are you sure you would like skip this question?");
    if (result){

       //Move to the next task, do directly to next task screen
        logTaskSolution("null","null");
        logTaskCompletionTime();

        //Re-set the touch event trackers
        firstTouchDown = null;
        firstTouchDownId = null;
        lastTouchUp = null;
        lastTouchUpId = null;
        taskStartTime = null;

        taskCounter++;
        var numTasks = totalObjectiveTasks;
        if (techniqueOrder[techniqueCounter]==0){ //Extra tasks for dimp
            numTasks = totalObjectiveTasks + 4;
        }

        if (taskCounter>=numTasks){
            taskCounter = 0;
            switchInteractionTechnique();
        }
        updateTaskDisplay(tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]]);

        stopTimer();
        startTimer();
    }
}
/** Switches the task, and checks if max tasks has been reached
 * If max tasks reached, switches interaction technique, otherwise:
 * Updates the html page when a new task begins and saves the solution entered in the text box
 * Logs the solution
 * */
function nextTask (){
    //Get the feedback based on the solution
    var solution = (techniqueOrder[techniqueCounter]==2)?multiples.clickedImage:slider.currentTick;//If in the small multiples condition, submit the view the user clicked on, otherwise submit the view on the slider
    var correctSolution = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][8];

     //Clear the feedback screen
     d3.select("#mainSvg").attr("width", svgWidth);
     d3.selectAll(".submitScreen").remove();
     d3.select("#taskPanel").style("display","block");

     logTaskSolution(solution,correctSolution);
     logTaskCompletionTime();

     //Re-set the touch event trackers
     firstTouchDown = null;
     firstTouchDownId = null;
     lastTouchUp = null;
     lastTouchUpId = null;
     taskStartTime = null;

    taskCounter++;
    var numTasks = totalObjectiveTasks;
    if (techniqueOrder[techniqueCounter]==0){ //Extra tasks for dimp
        numTasks = totalObjectiveTasks + 4;
    }

    if (taskCounter>=numTasks){
        taskCounter = 0;
        switchInteractionTechnique();
    }
    updateTaskDisplay(tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]]);

     stopTimer();
     startTimer();
 }
/**Cancel submitting the task solution by tapping the background of the intermediate screen
 * This will take the user back to the task */
function cancelSubmitTask(){
     d3.select("#mainSvg").attr("width", svgWidth);
     d3.selectAll(".submitScreen").remove();
     d3.select("#taskPanel").style("display","block");
 }
/**Update the display according to the current task
 * taskInfo: one entry from the tasks array */
function updateTaskDisplay (taskInfo){
    clearVisualizations(0);
     //Update the task panel display
    //d3.select("#counter").node().innerHTML = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][2]+" "+instructions;

    var numTasks = totalObjectiveTasks;
    if (techniqueOrder[techniqueCounter]==0){ //Extra tasks for dimp
        numTasks = totalObjectiveTasks + 4;
    }

    d3.select("#counter").node().innerHTML = (taskCounter+1)+"/"+numTasks+" "+instructions+" "+tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][2];
    d3.select("#taskDescription").node().innerHTML = taskInfo[4];
    d3.select("#submitButton").style("display", "none");
    d3.select("#showVisButton").style("display", "block");
    d3.select("#skipButton").style("display", "none");
}
/**Draws the visualization on the screen for each task
 * (After the participant has read the task description)
 * taskInfo: one entry from the tasks array
 * */
function updateVisualizationDisplay(){

    d3.select("#submitButton").style("display", "block");
    d3.select("#showVisButton").style("display", "none");
    d3.select("#skipButton").style("display", "block");

    var taskInfo = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]];

    //Re-draw the visualization for the specified dataset
    currentDataset = datasets[taskInfo[0]];

    setInteractionTechnique(techniqueOrder[techniqueCounter]);

    if (techniqueOrder[techniqueCounter] != 2){ //If not the small multiples display
        //Update the visualization for the next task (e.g., highlight bars)
        if (taskInfo[5]==0){ //One data object to highlight
            highlightDataObject(taskInfo[7][0],-1,className,"#969696","#D95F02");
        }else if (taskInfo[5]==1){ //Two data objects to highlight
            highlightDataObject(taskInfo[7][0],taskInfo[7][1],className,"#969696","#D95F02","#1B9E77");
        }
    }
    taskStartTime = new Date().getMilliseconds();
}
/**Sets the current interaction technique, and disables the others
 * */
function switchInteractionTechnique(){
     techniqueCounter++;
     currentTaskOrder = taskOrder[techniqueOrder[techniqueCounter]];
     if (techniqueCounter > 2){ //Finished all tasks, time for participant to fill out the post-task questionnaire
        showQuestionnaireScreen();
     }else{
        showTutorial(techniqueOrder[techniqueCounter]);
     }
 }
/**Clears the visualization, slider and multiples view
 * clearPanel: if 0, don't clear the task panel, if 1, hide it
 * */
function clearVisualizations(clearPanel){
    multiples.remove();
    clearVis(gClassName);
    clearVis(".slider");
    if (clearPanel==1){
        d3.select("#taskPanel").style("display","none");
    }
}
/**Draws the visualization and adds interactivity to its objects, draws
 * a slider which cannot be dragged
 * */
function useDimpTechnique(){
    visRef.render(currentDataset,labels,"","","");
    slider.render(labels);
    hideSliderInfo(slider);
    slider.widget.select("#slidingTick").call(doNothing);
    visRef.svg.selectAll(className).call(visRef.dragEvent);
    instructions = "      Drag the bar";

    //Re-set the visualization to the first view
    changeView(barchart,0);
    barchart.redrawView(0,-1);
    slider.updateSlider(0);
}
 /** Draws the visualization with non-interactive objects and a draggable slider
 * */
function useSliderTechnique(){
     visRef.render(currentDataset,labels,"","","");
     slider.render(labels);
     hideSliderInfo(slider);
     slider.widget.select("#slidingTick").call(slider.dragEvent);
     visRef.svg.selectAll(className).call(doNothing);
     instructions = "      Drag the slider";

     //Re-set the visualization to the first view
     changeView(barchart,0);
     barchart.redrawView(0,-1);
     slider.updateSlider(0);
 }
/** Draws the small multiple view with clickable images
 * */
function useSmallMultipleTechnique(){
    var taskInfo = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]];

    if (taskInfo[5]==0){ //One data object to highlight
        multiples.render(currentDataset,[taskInfo[7][0],-1]);
    }else if (taskInfo[5]==1){ //Two data objects to highlight
        multiples.render(currentDataset,taskInfo[7]);
    }
    instructions = "      Select an image";
}
/**Updates the view to enable and disable the appropriate interaction technique
   * Technique ID's: Dimp=0, Time slider=1, Small multiples=2
 */
function setInteractionTechnique(techniqueID){
     if (techniqueID == 0) {  //Enable dimp technique, disable time slider dragging
         useDimpTechnique();
     }else if (techniqueID ==1){ //Enable time slider, disable dimp interaction
         useSliderTechnique();
     }else if (techniqueID==2){ //Enable the small multiples interface
         useSmallMultipleTechnique();
     }
 }
/**Move to the next phase (after all tasks for both techniques), changes the visualization
  * Goes to a new html page returned from the server in "response"
 */
function changePhase (){
    //TODO: might have a blank confirmation screen in case participant wants to take a break

    //Re-direct to a new html page for the next phase
    d3.json("http://localhost:8080/nextPhase?", function(error,response) {
         console.log(response);
         window.location = response;
     });
 }

/**When all tasks are done, start the exploratory period:
   * Add full hint path and fast forwarding feature, use real dataset and clear the task panel
 * */
//TODO: show another tutorial before entering the exploratory period
 function startExploratory(){
    hideTutorial();
    d3.select("#taskPanel").style("display","none");
    //TODO: time this event as well
     //Tell the server that exploratory period is starting
     d3.xhr("http://localhost:8080/startExploratory?", function(d) { });

     //Update the visualization
     slider.render(realLabels);
     setHintPathType(visRef,0);
     showSliderInfo(slider);
     visRef.displayColour = "#74c476"; //Green bars
     visRef.showZeroValues = 1;
     visRef.render(realDataset,realLabels,realDataTitle,realDataXLabel,realDataYLabel);
     visRef.svg.selectAll(".displayBars").call(visRef.dragEvent);
     visRef.addXLabels();

     d3.select("#gSlider").attr("transform","translate(200,1050)");
     d3.select(gIdName).attr("transform","translate(65,65)");
     d3.select("#changePhaseButton").style("display","block").style("width","200px").style("margin-top",screenY+"px")
         .style("float","right").style("margin-right","20px")
         .on("click",changePhase);

     isExploratory = true;
 }
/**Initiates the objective tasks for an interaction technique
 * */
function startTasks(){
    hideTutorial();
    setInteractionTechnique(techniqueOrder[techniqueCounter]);
    updateTaskDisplay(tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]]);
    startTimer();
    hideSliderInfo(slider);
}

///////////////////////Functions to display other screens \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/**Before using a new interaction technique, shows a short tutorial on how to use it
 * */
function showTutorial(techniqueId){
    clearVisualizations(1);
    d3.selectAll(".tutorial").style("display","block");
    d3.select("#taskPanel").style("display","none");
    d3.select("#vis").style("display","none");
    d3.select("#readyMsg").style("margin-left",screenX+"px").style("margin-top",(0.85*screenY)+"px");
    d3.select("#doneTutorialButton").style("margin-left",screenX+"px").style("height",0.10*screenY+"px")
        .style("width",0.18*screenX+"px").style("font-size",0.04*screenY+"px");

    /**tutorialBarchart.render(set1,[],"","","");
    tutorialBarchart.svg.selectAll(className).call(tutorialBarchart.dragEvent);*/

    //Customize the display depending on the current interaction technique
    d3.select("#tutorialInstructions").node().innerHTML = tutorialInstructions[techniqueId];
    d3.select("#visGif").node().src = tutorialGifs[techniqueId];

    //Adjust the size of gif image
    if (techniqueId ==2){
        d3.select("#visGif").attr("width",screenX*0.5).attr("height",screenY*0.65);
        d3.select("#ambiguousTutorial").style("display","none");
        d3.select("#tutorialImages").style("border","none");
        d3.select("#hintPathExplanation").node().src = "";
    }else if (techniqueId==0){
        d3.select("#visGif").attr("width",screenX*0.20).attr("height",screenY*0.60);
        d3.select("#hintPathExplanation").attr("width",screenX*0.20).attr("height",screenY*0.35).node().src = "Images/partialHintPath.png";
        d3.select("#ambiguousExplanation").attr("height",0.30*screenY).attr("width",0.35*screenX).node().src = "Images/ambiguousExplanation.png";
        d3.select("#ambiguousGif").attr("height",0.20*screenY).attr("width",0.125*screenX).node().src = "Images/ambiguous.gif";
        d3.select("#ambiguousTutorial").style("display","block").style("margin-top",screenY*0.4+"px");
        d3.select("#tutorialImages").style("border","20px solid #1C1C1C");
    }else if (techniqueId==1){
        d3.select("#visGif").attr("width",screenX*0.2).attr("height",screenY*0.60);
        d3.select("#ambiguousTutorial").style("display","none");
        d3.select("#tutorialImages").style("border","none");
        d3.select("#hintPathExplanation").node().src = "";
    }else if (techniqueId ==3){ //Exploratory period
        d3.select("#visGif").attr("width",screenX*0.2).attr("height",screenY*0.40);
        d3.select("#tutorialImages").style("border","20px solid #1C1C1C");
        d3.select("#hintPathExplanation").node().src = "Images/fastForwarding.png";
        d3.select("#ambiguousTutorial").style("display","none");
        d3.select("#tutorialImages").style("border","none");
        d3.select("#doneTutorialButton").on("click", startExploratory);
    }
}
/**Hides all elements of the tutorial screen and restores the elements which were hidden in showTutorial()
 * */
function hideTutorial(){
    d3.selectAll(".tutorial").style("display","none");
    d3.select("#taskPanel").style("display","block");
    d3.select("#vis").style("display","block");
    d3.select("#tutorialSvg").remove();
}
/**Compares the solution entered by the participant with the correct solution and gives feedback
 * accordingly
 * */
function showFeedbackScreen (){
    //Get the feedback based on the solution
    var solution = (techniqueOrder[techniqueCounter]==2)?multiples.clickedImage:slider.currentTick;//If in the small multiples condition, submit the view the user clicked on, otherwise submit the view on the slider
    var correctSolution = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][8];

    //Clear the intermediate screen
    d3.select("#nextButton").on("click",nextTask);
    d3.select("#cancelMessage").style("display","none");
    d3.select("#nextButtonText").text("Continue");
    d3.select("#submitScreenBackground").on("click",function(){console.log("cancelling the svg click")}); //Turn off click listener

    var message = (solution != correctSolution)?" incorrect :(":" correct! :)";
    d3.select("#feedbackMessage").style("display","block").text("Your answer was "+message);
}

/**Displays a screen when the submit button is pressed, to confirm the submission
 * */
function showIntermediateScreen (){

    if (techniqueOrder[techniqueCounter]==2 && multiples.clickedImage==-1){ //Trying to submit no answer for multiples
        var result = confirm("You must select an image as your answer");
    }else{
        d3.select("#taskPanel").style("display","none");
        var svg =  d3.select("#mainSvg");
        svg.attr("width", screenX);

        svg.append("rect").attr("x",0).attr("y",0).attr("id","submitScreenBackground").attr("class","submitScreen").attr("width",screenX).attr("height",screenY)
            .style("fill", backgroundColour).on("click",cancelSubmitTask);

        svg.append("text").attr("id","cancelMessage").attr("x",screenX/2-170).attr("y",screenY/3+150).attr("class","submitScreen").text("[ Touch the background to cancel ]")
            .style("display","block");

        svg.append("rect").attr("x",screenX/2-150).attr("y",screenY/3).attr("id","nextButton").attr("width",300).attr("height",100)
            .style("display","block").attr("rx",6).attr("ry",6).attr("class","submitScreen").on("click",showFeedbackScreen);

        svg.append("text").attr("x",screenX/2-100).attr("y",screenY/3+65).attr("id","nextButtonText").attr("class","submitScreen")
            .text("Next Task");

        svg.append("text").attr("x",screenX/2-150).attr("y",screenY/3-10).attr("id","feedbackMessage").attr("class","submitScreen")
            .style("display","none").style("anchor","middle");
    }
}
/**A blank screen to indicate all techniques have been used and the post-technique questionnaire should be completed
 * */
function showQuestionnaireScreen(){
    clearVisualizations(1);
    d3.select("#taskPanel").style("display","none");
    d3.select("#vis").style("display","none");
    d3.selectAll(".questionnaire").style("display","block");
}
/**Hides all the elements of the questionnaire screen and makes the elements hidden in showQuestionnaireScreen() visible again
 * */
function hideQuestionnaireScreen(){
    d3.select("#vis").style("display","block");
    d3.selectAll(".questionnaire").style("display","none");
}
/** Confirms that the post-task questionnaire is finished (in case start exploring button was accidentally touched)
 * */
function confirmDoneQuestionnaire(){
    var result = confirm("Are you sure you would like to start exploring?");
    if (result){
       hideQuestionnaireScreen();
       showTutorial(3);
    }
}
 ///////////////////////Data logging functions \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Logs the touch down interactions
 *  id: of the dragged bar
 *  touchX,y: touch point
 *  viewIndex: the current view
 * */
function logTouchDown (id,touchX,touchY){
    var view = (techniqueOrder[techniqueCounter]==2)?multiples.clickedImage:slider.currentTick;
    var taskId = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][2];
    var taskType = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][3];
    var interaction = techniqueOrder[techniqueCounter];

    //Log the interaction
    d3.xhr("http://localhost:8080/log?taskType="+taskType+"&task="+taskId+"&interaction="+interaction+"&eventId=2"+
        "&objectId="+id+"&viewIndex="+view+"&touchX="+touchX.toFixed(2)+"&touchY="+touchY.toFixed(2)+"&time="+timeCounter, function(d) { });

    if (firstTouchDown ==null){ //Log this as the beginning of a task
        firstTouchDown = new Date().getMilliseconds();
        firstTouchDownId = id;
        console.log("first touch down"+ firstTouchDown);
    }
}
/** Logs the touch up interactions
 *  id: of the dragged bar
 * */
function logTouchUp (id,touchX,touchY){
    var header = getHeaderInfo();

    d3.xhr("http://localhost:8080/log?taskType="+header+"&eventId=3"+
        "&objectId="+id+"&touchX="+touchX.toFixed(2)+"&touchY="+touchY.toFixed(2)+"&time="+timeCounter, function(d) { });

    lastTouchUp = new Date().getMilliseconds();
    lastTouchUpId = id;
}
/**Logs the participant's solution and the correct solution
 * */
function logTaskSolution(solution,correctSolution){
    var header = getHeaderInfo();

    if (firstTouchDown==null){
        solution = -1;
    }
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=0"+
        "&solution="+solution+"&correctSolution="+correctSolution, function(d) { });
}
/**Logs the participant's time to complete the task which is measured by the first touch down and last touch up for slider
 * and dimpVis.
 * */
function logTaskCompletionTime (){
    var header = getHeaderInfo();

    /**d3.xhr("http://localhost:8080/log?taskType="+taskType+"&task="+taskId+"&interaction="+techniqueOrder[techniqueCounter]+"&eventId=1"+
        "&touchDown="+firstTouchDown+"&touchUp="+lastTouchUp+"&touchTime="+(Math.abs(lastTouchUp - firstTouchDown))+
        "&objectUp="+firstTouchDownId+"&objectDown="+lastTouchUpId, function(d) { });*/

   //Try logging task completion time as the entire duration viewing the task screen (after reading the task description)
    var taskEndTime = new Date().getMilliseconds();
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=1"+
        "&touchDown="+taskStartTime+"&touchUp="+taskEndTime+"&touchTime="+(Math.abs(taskStartTime- taskEndTime))+
        "&objectUp="+firstTouchDownId+"&objectDown="+lastTouchUpId, function(d) { });

    /**console.log("Last touch up "+lastTouchUp);
    console.log("Total time in seconds"+(Math.abs(lastTouchUp - firstTouchDown)));
    console.log("id's first touch down: "+firstTouchDownId+" last touch up: "+lastTouchUpId);*/
}
/** Logs a switch in dragging (e.g., dragging up then down), for some cases (slider, scatterplot), this is the same as the time direction
 * */
function logDragDirectionSwitch(id,viewIndex,oldDirection,newDirection){
    var header = getHeaderInfo();
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=4"+
        "&objectId="+id+"&viewIndex="+viewIndex+"&oldDirection="+oldDirection+"&newDirection="+newDirection, function(d) { });
}
/** Logs a switch in time direction (forward or backward)
 * */
function logTimeDirectionSwitch(id,viewIndex,oldDirection,newDirection){
    var header = getHeaderInfo();
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=5"+
        "&objectId="+id+"&viewIndex="+viewIndex+"&oldDirection="+oldDirection+"&newDirection="+newDirection, function(d) { });
}
/** Logs the pixel distance from the participant's touch point to the data object being dragged
 * */
 function logPixelDistance(id,viewIndex,distance,touchX,touchY,objectX,objectY){
    var header = getHeaderInfo();
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=6"+
        "&objectId="+id+"&viewIndex="+viewIndex+"&distance="+distance.toFixed(2)+"&touchX="+touchX.toFixed(2)+"&touchY="+touchY.toFixed(2)+
    "&objectX="+objectX.toFixed(2)+"&objectY="+objectY.toFixed(2), function(d) { });
}
/** Logs the event when the finger is pressed down on any point on the visualization background
 * */
function logBackgroundTouchDown(touchX,touchY){
    var header = getHeaderInfo();
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=7"
        +"&touchX="+touchX.toFixed(2)+"&touchY="+touchY.toFixed(2)+"&time="+timeCounter, function(d) { });
}
/** Logs the event when the finger is released from any point on the visualization background
 * */
function logBackgroundTouchUp(touchX,touchY){
    var header = getHeaderInfo();
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=8&touchX="+touchX.toFixed(2)+"&touchY="+
        touchY.toFixed(2)+"&time="+timeCounter, function(d) { });
}
/**Finds and returns header information for each logged event
 * */
function getHeaderInfo(){
    var view,taskId,taskType,interaction;
    if (isExploratory){
        view = slider.currentTick;
        taskId = 'e';
        taskType = 'e';
        interaction = 'e';
    }else{
        view = (techniqueOrder[techniqueCounter]==2)?multiples.clickedImage:slider.currentTick;
        taskId = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][2];
        taskType = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][3];
        interaction = techniqueOrder[techniqueCounter];
    }
    return "taskType="+taskType+"&task="+taskId+"&interaction="+interaction+"&viewIndex="+view;
}

 ////////////////functions that need to be fixed\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
/**Reloads the previous task display (called when intermediate screen was pressed)
 * and visualization display
 */
//TODO: eventually extend this to reload when the page is refreshed (will need to save info in url), or just use full screen mode when running the experiment
//TODO: just need to make sure the application doesn't crash
/**function reloadTaskDisplay(){
 var taskInfo = objectiveTasks[techniqueOrder[techniqueCounter]][taskOrder[taskCounter]];
 //Update the visualization for the next task (e.g., highlight bars)
 if (taskInfo[3].length==1){ //One data object to highlight
 highlightDataObject(taskInfo[3][0],-1,"displayBars","#BDBDBD","#D95F02");

 }else if (taskInfo[3].length==2){ //Two data objects to highlight
 highlightDataObject(taskInfo[3][0],taskInfo[3][1],"displayBars","#BDBDBD","#D95F02","#1B9E77");
 }
 //Make the task panel visible
 d3.select("#intermediateScreen").style("display","none");
 d3.select("#taskPanel").style("display","block");

 //Render the visualizations

 //Set the visualization to the proper view

 }*/
