/**Runs the experiment for each visualization type by fetching required data from the server and
 * using functions from visualization-specific files
 * */
var taskCounter = 0;
 var techniqueCounter = 0;
 var timeCounter = 0;
 var timerVar;
 var totalObjectiveTasks = 12; //For each interaction technique
 var totalWarmUpTasks = 1;
 var techniqueOrder = []; //Counterbalanced order of interaction technique
 var taskOrder = []; //Randomized order of tasks
 var maxTaskTime = 100;
 var firstTouchDown = null;
 var lastTouchUp = null;
 var firstTouchDownId = null;;
 var lastTouchUpId = null;
 var screenX = 1650;
 var screenY = 1000;

 //To disable the drag function
 var doNothing = d3.behavior.drag().on("dragstart", null)
 .on("drag", null).on("dragend",null);
 //Attach click events to the buttons
 d3.select("#submitButton").on("click", showIntermediateScreen);

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
         console.log(response);
         techniqueOrder = response[0];
         taskOrder = response[1];
         updateInteractionTechnique(techniqueOrder[techniqueCounter]);
         updateTaskDisplay(objectiveTasks[techniqueOrder[techniqueCounter]][taskOrder[taskCounter]]);
         startTimer();
         hideSliderInfo(slider);
    });
 }
/** Switches the task, and checks if max tasks has been reached
 * If max tasks reached, switches interaction technique, otherwise:
 * Updates the html page when a new task begins and saves the solution entered in the text box
 * Logs the solution
 * */
function nextTask (){

     //Clear the feedback screen
     d3.select("#mainSvg").attr("width", 1200);
     d3.selectAll(".submitScreen").remove();
     d3.select("#taskPanel").style("display","block");

     //TODO: for important information (e.g., the task solutions), log this information twice (once in txt file and then again either in server console or browser console)
     logTaskCompletionTime();

     //Re-set the touch event trackers
     firstTouchDown = null;
     firstTouchDownId = null;
     lastTouchUp = null;
     lastTouchUpId = null;

     taskCounter++;

     if (taskCounter>=totalObjectiveTasks){
         taskCounter = 0;
         switchInteractionTechnique();
     }

     updateTaskDisplay(objectiveTasks[techniqueOrder[techniqueCounter]][taskOrder[taskCounter]]);

     stopTimer();
     startTimer();
 }
/**Cancel submitting the task solution by tapping the background of the intermediate screen
 * This will take the user back to the task */
function cancelSubmitTask(){
     d3.select("#mainSvg").attr("width", 1200);
     d3.selectAll(".submitScreen").remove();
     d3.select("#taskPanel").style("display","block");
 }

/**Compares the solution entered by the participant with the correct solution and gives feedback
    * accordingly
    * */
//TODO: Could actually calculate the accuracy here since we are already comparing the submitted solution against the correct one
function showFeedbackScreen (){

     //Clear the intermediate screen
     d3.select("#nextButton").style("display","none");
     d3.select("#nextButtonText").style("display","none");

     //Make the elements for the feedback screen visible
     d3.select("#submitScreenBackground").on("click",function(){console.log("cancelling the svg click")});
     d3.select("#continueButton").style("display","block");
     d3.select("#continueButtonText").style("display","block");
     d3.select("#feedbackMessage").style("display","block");
 }

/**Displays a screen when the submit button is pressed, to confirm the submission
 * */
function showIntermediateScreen (){

    /**d3.select("#taskPanel").style("display","none");
     var svg =  d3.select("#mainSvg");
     svg.attr("width", screenX);

     svg.append("rect").attr("x",0).attr("y",0).attr("id","submitScreenBackground").attr("class","submitScreen").attr("width",screenX).attr("height",screenY)
     .style("fill", "#BDBDBD").on("click",cancelSubmitTask);

     svg.append("rect").attr("x",screenX/2-150).attr("y",screenY/3).attr("id","nextButton").attr("width",300).attr("height",100)
     .style("display","block").attr("rx",6).attr("ry",6).attr("class","submitScreen").on("click",showFeedbackScreen);

     svg.append("text").attr("x",screenX/2-75).attr("y",screenY/3+60).attr("id","nextButtonText").attr("class","submitScreen")
     .text("Next Task");*/

    //Get the feedback based on the solution
    var solution = (techniqueOrder[techniqueCounter]==2)?0:slider.currentTick;//If in the small multiples condition, submit the view the user clicked on, otherwise submit the view on the slider
    var correctSolution = objectiveTasks[techniqueOrder[techniqueCounter]][taskOrder[taskCounter]][4];
    var message = (solution != correctSolution)?" incorrect :(":" correct! :)";

    console.log(solution+" "+correctSolution);
    logTaskSolution(solution,correctSolution);
    nextTask();
    //Append the elements for the feedback screen
    /** svg.append("text").attr("x",screenX/2-150).attr("y",screenY/3).attr("id","feedbackMessage").attr("class","submitScreen")
     .text("You're answer was "+message).style("display","none").style("anchor","middle");
     svg.append("rect").attr("x",screenX/2-150).attr("y",screenY/3+150).attr("id","continueButton").attr("width",300).attr("height",100)
     .attr("rx",6).attr("ry",6).attr("class","submitScreen").style("display","none").on("click",nextTask);
     svg.append("text").attr("x",100).attr("y",100).attr("id","continueButtonText").attr("class","submitScreen")
     .style("display","none").text("Continue");*/
}
/**Update the display according to the current task
 * taskInfo: one entry from the tasks array */
function updateTaskDisplay (taskInfo){

    if (techniqueOrder[techniqueCounter] != 2){ //If not the small multiples display
        //Update the visualization for the next task (e.g., highlight bars)
        if (taskInfo[3].length==1){ //One data object to highlight
            highlightDataObject(taskInfo[3][0],-1,"displayBars","#969696","#D95F02");
        }else if (taskInfo[3].length==2){ //Two data objects to highlight
            highlightDataObject(taskInfo[3][0],taskInfo[3][1],"displayBars","#969696","#D95F02","#1B9E77");
        }
    }

     //Update the task panel display
     d3.select("#counter").node().innerHTML = "Task #"+taskCounter;
     d3.select("#taskDescription").node().innerHTML = taskInfo[0];

     //Re-set the visualization to the first view
     changeView(barchart,0);
     barchart.redrawView(0,-1);
     slider.updateSlider(0);
 }

/**Sets the current interaction technique, and disables the others
 * */
function switchInteractionTechnique(){
     techniqueCounter++;
     if (techniqueCounter > 3){ //Finished all tasks, enter exploratory period
        startExploratory();
     }else{
        updateInteractionTechnique(techniqueOrder[techniqueCounter]);
     }
 }
/**Updates the view to enable and disable the appropriate interaction technique
   * Technique ID's: Dimp=0, Time slider=1, Small multiples=2
 */
function updateInteractionTechnique(techniqueID){
     if (techniqueID == 0) {  //Enable dimp technique, disable time slider dragging
         //multiples.remove();
         clearVis(".gDisplayBars");
         clearVis(".slider");
         barchart.render(dataset,labels,"","","");
         slider.render();
         hideSliderInfo(slider);
         slider.widget.select("#slidingTick").call(doNothing);
         barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);
     }else if (techniqueID ==1){ //Enable time slider, disable dimp interaction
         //multiples.remove();
         clearVis(".gDisplayBars");
         clearVis(".slider");
         barchart.render(dataset,labels,"","","");
         slider.render();
         hideSliderInfo(slider);
         slider.widget.select("#slidingTick").call(slider.dragEvent);
         barchart.svg.selectAll(".displayBars").call(doNothing);
     }else if (techniqueID==2){ //Enable the small multiples interface
         clearVis(".gDisplayBars");
         clearVis(".slider");
         //TODO: render the small multiples
     }
 }
/**Move to the next phase (after all tasks for both techniques), changes the visualization
  * Goes to a new html page returned from the server in "response"
 */
function changePhase (){
     //Confirmation window
     var result = confirm("Is the questionnaire complete?");

     if (result ==true){
         d3.json("http://localhost:8080/nextPhase?", function(error,response) {
         window.location = response;
     });
     }
 }

/**When all tasks are done, start the exploratory period:
   * Add full hint path and fast forwarding feature, use real dataset and clear the task panel
 * */
function startExploratory(){

     stopTimer();
     //Tell the server that exploratory period is starting
     d3.xhr("http://localhost:8080/startExploratory?", function(d) { });

     //Update the visualization
     setHintPathType(barchart,0);
     showSliderInfo(slider);
     barchart.render(dataset2,labels2,"CO2 Emissions of the G8+5 Countries","g8+5 countries","CO2 emissions per person (metric tons)");
     barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);
     //TODO: should time slider be active? Since slider is a competitor technique, maybe it should be removed entirely or disabled dragging

     //Update the task panel
     // d3.select("#solutionEntry").remove();
     d3.select("#taskDescription").remove();
     d3.select("#counter").node().innerHTML = "Exploratory Period..";
     d3.select("#nextButton").node().innerHTML = "Next Phase";
     // slider.widget.remove();

     d3.select("#nextButton").on("click", changePhase);
     //TODO: add a timer to this
 }

/**Begins the warm up tasks and tutorial period
 * */
function startWarmup(){
    //When starting the objective tasks
    /**updateInteractionTechnique(techniqueOrder[techniqueCounter]);
     updateTaskDisplay();
     startTimer();*/
}

///////////////////////Data logging functions \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/** Logs the touch down interactions
 *  id: of the dragged bar
 * */
function logTouchDown (id){
    //Log the interaction
    d3.xhr("http://localhost:8080/log?task="+taskCounter+"&interaction="+techniqueOrder[techniqueCounter]+"&content=dragStart"+ id, function(d) { });

    if (firstTouchDown ==null){ //Log this as the beginning of a task
        firstTouchDown = timeCounter;
        firstTouchDownId = id;
        console.log("first touch down"+ firstTouchDown);
    }
}
/** Logs the touch up interactions
 *  id: of the dragged bar
 * */
function logTouchUp (id){
    //Log the interaction
    d3.xhr("http://localhost:8080/log?task="+taskCounter+"&interaction="+techniqueOrder[techniqueCounter]+"&content=dragEnd"+ id, function(d) { });
    lastTouchUp = timeCounter;
    lastTouchUpId = id;
}
/**Logs the participant's solution and the correct solution
 * */
function logTaskSolution(solution,correctSolution){
    //Log the solution
    d3.xhr("http://localhost:8080/log?task="+taskCounter+"&interaction="+techniqueOrder[techniqueCounter]+"&content="+solution, function(d) { });
}
function logTaskCompletionTime (){
    console.log("Last touch up "+lastTouchUp);
    console.log("Total time in seconds"+(Math.abs(lastTouchUp - firstTouchDown)));
    console.log("id's first touch down: "+firstTouchDownId+" last touch up: "+lastTouchUpId);
}
//TODO: all log functions needed

////////////////functions need to be fixed\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
/**Reloads the previous task display (called when intermediate screen was pressed)
 * and visualization display
 */
//TODO: eventually extend this to reload when the page is refreshed (will need to save info in url)
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