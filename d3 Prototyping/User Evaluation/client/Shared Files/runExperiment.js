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

//Tracking touch events to mark task completion time
 var firstTouchDown = null;
 var lastTouchUp = null;
 var firstTouchDownId = null;
 var lastTouchUpId = null;
 var taskStartTime = null;
 var taskEndTime = null;

 //Display properties
 var screenX = 1500;
 var screenY = 1000;
 var backgroundColour ="#2C2D2D";
 var instructions = "";

 //To disable the drag function
 var doNothing = d3.behavior.drag().on("dragstart", null)
 .on("drag", null).on("dragend",null);

//Attach click events to the buttons
d3.select("#doneTutorialButton").on("click", startTasks);
d3.select("#submitButton").on("click", showIntermediateScreen);

d3.select("#showVisButton").on("click", updateVisualizationDisplay);
d3.select("#skipButton").on("click",skipTask);
d3.select("#doneQuestionnaireButton1").on("click", confirmDoneQuestionnaire_postTasks);
d3.select("#doneQuestionnaireButton2").on("click", confirmDoneQuestionnaire_postPhase);

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
   // d3.select("#timer").node().innerHTML="";
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
        taskEndTime = null;

        taskCounter++;
        var numTasks = findNumTasks();

        if (taskCounter>=numTasks){
            taskCounter = 0;
            switchInteractionTechnique();
        }
        updateTaskDisplay();

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
    //d3.select("#taskHelpImg").style("display","none").node().src = "";

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
     taskEndTime = null;

    taskCounter++;
    var numTasks = findNumTasks();

    if (taskCounter>=numTasks){
        taskCounter = 0;
        switchInteractionTechnique();
    }
    updateTaskDisplay();

     stopTimer();
     startTimer();
 }
/**Finds and returns the number of objective tasks for each phase*/
function findNumTasks(){
    var numTasks;
    if (phaseId==0){
        numTasks = 24;//24
    }else{
        numTasks = 30; //30
    }

    if (techniqueOrder[techniqueCounter]==0){ //Extra tasks for dimp
        return (numTasks + 4);
    }else{
        return numTasks;
    }
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
function updateTaskDisplay (){
    clearVisualizations(0);
     //Update the task panel display
    //d3.select("#counter").node().innerHTML = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]][2]+" "+instructions;
    var numTasks = findNumTasks();
    var taskInfo = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]];
    d3.select("#counter").node().innerHTML = (taskCounter+1)+"/"+numTasks+" "+instructions+" "+taskInfo[2];
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

    //Add a helper image for distribution tasks
    /**if (phaseId==0){
        if (taskInfo[3]==1 && taskInfo[5]==1 ){ //Distribution, multiple objects
            if (taskInfo[9]==0){ //orange inc-dec and green dec-inc
                d3.select("#taskHelpImg").style("display","block").node().src = "Images/DI_MO_0.png";
            }else if((taskInfo[9]==1)){ //orange dec-inc and green inc-dec
                d3.select("#taskHelpImg").style("display","block").node().src = "Images/DI_MO_1.png";
            }
        }
    }*/

    //Re-draw the visualization for the specified dataset
    currentDataset = datasets[taskInfo[0]];

    setInteractionTechnique(techniqueOrder[techniqueCounter]);

    taskStartTime = new Date().getTime();
}
/**Sets the current interaction technique, and disables the others
 * */
function switchInteractionTechnique(){
     techniqueCounter++;
     currentTaskOrder = taskOrder[techniqueOrder[techniqueCounter]];

     if (techniqueCounter > 2){ //Finished all tasks, time for participant to fill out the post-task questionnaire
        showQuestionnaireScreen(0);
     }else{
        showTutorial(techniqueOrder[techniqueCounter]);
     }
 }
/**Clears the visualization, slider and multiples view
 * clearPanel: if 0, don't clear the task panel, if 1, hide it
 * */
function clearVisualizations(clearPanel){
    multiples.remove();
    clearVis("mainSvg",gClassName);
    clearVis("mainSvg",".slider");
    if (clearPanel==1){
        d3.select("#taskPanel").style("display","none");
    }
}
/**Draws the visualization and adds interactivity to its objects, draws
 * a slider which cannot be dragged
 * */
function useDimpTechnique(){
    var taskInfo = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]];
    var toHighlight = [];
    if (taskInfo[5]==0){ //One data object to highlight
        toHighlight = [taskInfo[7][0],-1];
    }else if (taskInfo[5]==1){ //Two data objects to highlight
        toHighlight = taskInfo[7];
    }

    if (phaseId==1){
        visRef.render(currentDataset,labels,xLabel,yLabel,"",taskInfo[2],toHighlight);
    }else{
        visRef.render(currentDataset,labels,xLabel,yLabel,"",toHighlight);
    }

    slider.render(labels);
    slider.hideTriangle();
    //hideSliderInfo(slider);
    slider.widget.select("#slidingTick").call(doNothing);
    visRef.svg.selectAll(className).call(visRef.dragEvent);
    instructions = techniqueInstructions[0];

    //Re-set the visualization to the first view
    changeView(visRef,0);
    visRef.redrawView(0,-1);
    slider.updateSlider(0);
}
 /** Draws the visualization with non-interactive objects and a draggable slider
 * */
function useSliderTechnique(){
     var taskInfo = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]];
     var toHighlight = [];
     if (taskInfo[5]==0){ //One data object to highlight
         toHighlight = [taskInfo[7][0],-1];
     }else if (taskInfo[5]==1){ //Two data objects to highlight
         toHighlight = taskInfo[7];
     }

     if (phaseId==1){
         visRef.render(currentDataset,labels,xLabel,yLabel,"",-1,toHighlight);
     }else{
         visRef.render(currentDataset,labels,xLabel,yLabel,"",toHighlight);
     }

     slider.render(labels);
     slider.widget.select("#slidingTick").call(slider.dragEvent);
     visRef.svg.selectAll(className).call(doNothing);
    // visRef.svg.selectAll(className).on("mouseenter",doNothing);
     instructions = techniqueInstructions[1];

     //Re-set the visualization to the first view
     changeView(visRef,0);
     visRef.redrawView(0,-1);
     slider.updateSlider(0);
 }
/** Draws the small multiple view with clickable images
 * */
function useSmallMultipleTechnique(){
    multiples.clickedImage = -1;
    var taskInfo = tasks[techniqueOrder[techniqueCounter]][currentTaskOrder[taskCounter]];

    if (taskInfo[5]==0){ //One data object to highlight
        multiples.render(currentDataset,[taskInfo[7][0],-1],phaseId,labels);
    }else if (taskInfo[5]==1){ //Two data objects to highlight
        multiples.render(currentDataset,taskInfo[7],phaseId,labels);
    }
    instructions = techniqueInstructions[2];
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
function nextPhase (){
    showQuestionnaireScreen(1);
 }

/**Re-direct to a new html page for the next phase
 * */
function changePhase(){
    d3.json("http://localhost:8080/nextPhase?", function(error,response) {
        window.location.href = "http://localhost:8080/"+response;
     });
}
/**When all tasks are done, start the exploratory period:
   * Add full hint path and fast forwarding feature, use real dataset and clear the task panel
 * */

 function startExploratory(){

    hideTutorial();
    d3.select("#taskPanel").style("display","none");
    d3.select("#vis").style("float","left");

    //TODO: time this event as well
     //Tell the server that exploratory period is starting
     d3.xhr("http://localhost:8080/startExploratory?", function(d) { });

     //Update the visualization
     slider.render(realLabels);
     setHintPathType(visRef,0);
     //showSliderInfo(slider);
     slider.hideTriangle();
     visRef.experimentMode =  0;

    if (phaseId==1){
         visRef.showLabels = true;
         visRef.width = 1300;
         visRef.height = 750;
        visRef.render(realDataset,realLabels,realDataXLabel,realDataYLabel,realDataTitle,-1,[-1,-1]);
         d3.select("#mainSvg").attr("width",1500).attr("height",1000);
         d3.select("#gSlider").attr("transform","translate(100,870)");
         d3.select("#gScatterplot").attr("transform","translate(1000,0)");
     }else{
	     d3.select("#mainSvg").attr("height",1000);
		 d3.select("#gSlider").attr("transform","translate(100,930)");
        visRef.render(realDataset,realLabels,realDataTitle,realDataXLabel,realDataYLabel,[-1,-1]);
     }

     visRef.svg.selectAll(className).call(visRef.dragEvent);

    if (phaseId==0){ //Display properties specific to the barchart
        visRef.addXLabels();
        visRef.displayColour = "#74c476";
        visRef.showZeroValues = 1;
    }else if (phaseId==1){//Display properties specific to the scatterplot
        d3.select("#mainSvg").on("click",function(){ //Need to be able to clear the labels
            visRef.clearHintPath();
        });
    }

    // d3.select("#gSlider").attr("transform","translate(200,1050)");
     d3.select(gIdName).attr("transform","translate(65,65)");
     d3.select("#changePhaseButton").style("display","block").style("width","200px").style("margin-top","20px")
         .style("float","right").style("margin-right","20px").on("click",nextPhase);

     isExploratory = true;
 }
/**Initiates the objective tasks for an interaction technique
 * */
function startTasks(){
    hideTutorial();
    setInteractionTechnique(techniqueOrder[techniqueCounter]);
    updateTaskDisplay();
    startTimer();
    hideSliderInfo(slider);
}

///////////////////////Functions to display other screens \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/**Before using a new interaction technique, shows a short tutorial on how to use it
 * */
function showTutorial(techniqueId){
    d3.selectAll(".tutorial").style("display","block");
    d3.select("#taskPanel").style("display","none");
    d3.select("#vis").style("display","none");

    //Add buttons and heading
     d3.select("#readyMsg").style("margin-left",screenX+"px");
    d3.select("#doneTutorialButton").style("height",0.10*screenY+"px")
        .style("width",0.18*screenX+"px").style("font-size",0.04*screenY+"px");

    //Customize the display depending on the current interaction technique
    d3.select("#tutorialInstructions").node().innerHTML = tutorialInstructions[techniqueId];
    d3.select("#visGif").node().src = tutorialGifs[techniqueId];

    //Set the display properties for each tutorial page
    if (techniqueId ==2){
        d3.select("#visGif").attr("width",screenX*0.6).attr("height",screenY*0.75);
        d3.select("#ambiguousTutorial").style("display","none");
        d3.select("#tutorialImages").style("border","none");
        d3.select("#hintPathExplanation").node().src = "";
    }else if (techniqueId==0){
        d3.select("#tutorialVis").style("display","block");
        d3.select("#tutorialSvg").style("display","block");

        if (phaseId==0){
            visRef_tutorial.render(toySet,toyLabels,"","","",[1,0]);
            d3.select("#visGif").attr("width",screenX*0.30).attr("height",screenY*0.30);
            d3.select("#ambiguousExplanation").attr("height",0.30*screenY).attr("width",0.35*screenX).node().src = "Images/ambiguousExplanation.png";
        }else if (phaseId==1){
            visRef_tutorial.render(toySet,toyLabels,"","","",-1,[1,0]);
            d3.select("#visGif").attr("width",screenX*0.35).attr("height",screenY*0.28);
            d3.select("#ambiguousExplanation").attr("height",0.31*screenY).attr("width",0.33*screenX).node().src = "Images/ambiguousExplanation.png";
        }

        visRef_tutorial.svg.selectAll(tutorial_className).call(visRef_tutorial.dragEvent);
        slider_tutorial.render(toyLabels);
        slider_tutorial.hideTriangle();
        slider_tutorial.widget.select("#slidingTick").call(doNothing);
        visRef_tutorial.redrawView(0,-1);
        slider_tutorial.updateSlider(0);

        //d3.select("#ambiguousGif").attr("height",0.20*screenY).attr("width",0.125*screenX).node().src = "Images/ambiguous.gif";
        //d3.select("#ambiguousTutorial").style("display","block").style("margin-top",screenY*0.4+"px");
        d3.select("#tutorialImages").style("border","20px solid #1C1C1C");
    }else if (techniqueId==1){
        d3.select("#visGif").attr("width",screenX*0.45).attr("height",screenY*0.2);

        d3.select("#tutorialVis").style("display","block");
        d3.select("#tutorialSvg").style("display","block");
        visRef_tutorial.render(toySet,toyLabels,"","","",-1,[-1,-1]);
        visRef_tutorial.svg.selectAll(className).call(doNothing);
        //visRef_tutorial.highlightDataObject(1,-1,className,"#969696","#969696");
        slider_tutorial.render(toyLabels);
        slider_tutorial.widget.select("#slidingTick").call(slider_tutorial.dragEvent);
        visRef_tutorial.redrawView(0,-1);
        slider_tutorial.updateSlider(0);

        d3.select("#ambiguousTutorial").style("display","none");
        d3.select("#tutorialImages").style("border","none");
        d3.select("#hintPathExplanation").node().src = "";
    }else if (techniqueId ==3){ //Exploratory period
        d3.select("#visGif").attr("width",screenX*0.3).attr("height",screenY*0.40);
        d3.select("#tutorialImages").style("border","20px solid #1C1C1C");
        //d3.select("#hintPathExplanation").node().src = "Images/fastForwarding.png";
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
    d3.select("#tutorialVis").style("display","none");
    clearVis("tutorialSvg",gClassName);
    clearVis("tutorialSvg",".slider");
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
        taskEndTime = new Date().getTime();
        console.log(taskEndTime);
        d3.select("#taskPanel").style("display","none");
        var svg =  d3.select("#mainSvg");
        svg.attr("width", screenX);

        svg.append("rect").attr("x",0).attr("y",0).attr("id","submitScreenBackground").attr("class","submitScreen").attr("width",screenX).attr("height",svgHeight)
            .style("fill", backgroundColour).on("click",cancelSubmitTask);

        svg.append("text").attr("id","cancelMessage").attr("x",screenX/2-170).attr("y",screenY/3+150).attr("class","submitScreen").text("[ Touch the background to cancel ]")
            .style("display","block");

        svg.append("rect").attr("x",screenX/2-150).attr("y",screenY/3).attr("id","nextButton").attr("width",330).attr("height",100)
            .style("display","block").attr("rx",6).attr("ry",6).attr("class","submitScreen").on("click",showFeedbackScreen);

        svg.append("text").attr("x",screenX/2-135).attr("y",screenY/3+65).attr("id","nextButtonText").attr("class","submitScreen")
            .text("Next Question");

        svg.append("text").attr("x",screenX/2-150).attr("y",screenY/3-10).attr("id","feedbackMessage").attr("class","submitScreen")
            .style("display","none").style("anchor","middle");
    }
}
/**A blank screen to indicate all techniques have been used and the post-technique questionnaire should be completed
 * type: 0 if post-tasks questionnaire
 *       1 if post-phase questionnaire
 * */
function showQuestionnaireScreen(type){
    clearVisualizations(1);
    d3.select("#taskPanel").style("display","none");
    d3.select("#vis").style("display","none");
    d3.selectAll(".questionnaire").style("display","block");
    //make the appropriate confirmation button visible
    if (type==0){
        d3.select("#doneQuestionnaireButton2").style("display","none");
        d3.select("#doneQuestionnaireButton1").style("display","block");
    }else if (type==1){
        d3.select("#changePhaseButton").style("display","none");
        d3.select("#doneQuestionnaireButton2").style("display","block");
        d3.select("#doneQuestionnaireButton1").style("display","none");
    }
}
/**Hides all the elements of the questionnaire screen and makes the elements hidden in showQuestionnaireScreen() visible again
 * */
function hideQuestionnaireScreen(){
    d3.select("#vis").style("display","block");
    d3.selectAll(".questionnaire").style("display","none");
}
/** Confirms that the post-task questionnaire is finished (in case start exploring button was accidentally touched)
 * */
function confirmDoneQuestionnaire_postTasks(){
    var result = confirm("Continue to the exploratory phase?");
    if (result){
       hideQuestionnaireScreen();
       showTutorial(3);
    }
}
/** Confirms that the post-phase questionnaire is finished
 * */
function confirmDoneQuestionnaire_postPhase(){
    var result = confirm("Continue to next phase?");
    if (result){
        hideQuestionnaireScreen();
        changePhase();
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

    d3.xhr("http://localhost:8080/log?"+header+"&eventId=3"+
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
    d3.xhr("http://localhost:8080/log?"+header+"&eventId=1"+
        "&touchDown="+taskStartTime+"&touchUp="+taskEndTime+"&touchTime="+(Math.abs(taskStartTime- taskEndTime)*0.001)+
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
    console.log("logging");
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

