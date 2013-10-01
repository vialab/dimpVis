/** This file is a test run of a barchart experiment trial
 * */
var taskCounter = 0;
var techniqueCounter = 0;
var timeCounter = 0;
var timerVar;
var totalObjectiveTasks = 4; //For each interaction technique
var totalWarmUpTasks = 1;
var techniqueOrder = []; //Counterbalanced order of interaction technique
var taskOrder = []; //Randomized order of tasks
var maxTaskTime = 100;
var firstTouchDown = null;
var lastTouchUp = null;

//To disable the drag function
var doNothing = d3.behavior.drag().on("dragstart", null)
    .on("drag", null).on("dragend",null);

//////////////////////Code for creating a barchart visualization//////////////////////
var barchart   = new Barchart(700, 90, 10, 10 , "#bargraph",40);
//Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
barchart.clickSVG = function (){
    barchart.clearHintPath();
};
barchart.init();
setHintPathType(barchart,1); //Make sure set to partial hint path initially
//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    barchart.animateBars(barchart.draggedBar,barchart.currentView,i);
    changeView(barchart,i);
    slider.updateSlider(i);
};
//Define the function to respond to the dragging behaviour of the bars
barchart.dragEvent = d3.behavior.drag()
    .origin(function(d){ //Set the starting point of the drag interaction
        return {x:d.xPos,y:d.nodes[barchart.currentView][0]};
    })
    .on("dragstart", function(d){
        d3.event.sourceEvent.preventDefault();
        barchart.clearHintPath();
        barchart.draggedBar = d.id;
        barchart.selectBar(d.id, d.nodes, d.xPos);

        //Log the interaction
        d3.xhr("http://localhost:8080/log?task="+taskCounter+"&interaction="+techniqueOrder[techniqueCounter]+"&content=dragStart"+ d.id, function(d) { });

        if (firstTouchDown ==null){ //Log this as the beginning of a task
            firstTouchDown = timeCounter;
            console.log("first touch down"+ firstTouchDown);
        }
    })
    .on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
        barchart.updateDraggedBar(d.id,d3.event.x,d3.event.y,d.xPos,d.nodes);
    })
    .on("dragend",function (d){
        d3.event.sourceEvent.preventDefault();
        barchart.snapToView(d.id,d.nodes);
        slider.updateSlider(barchart.currentView);

        //Log the interaction
        d3.xhr("http://localhost:8080/log?task="+taskCounter+"&interaction="+techniqueOrder[techniqueCounter]+"&content=dragEnd"+ d.id, function(d) { });
        lastTouchUp = timeCounter;
    });

//////////////////////Code for creating the slider widget//////////////////////
var slider   = new Slider(50, 800, "#time",labels, "","#636363",80);
slider.init();
//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){ barchart.clearHintPath();})
    .on("drag", function(){
        slider.updateDraggedSlider(d3.event.x);
        barchart.interpolateBars(-1,slider.interpValue,slider.currentTick,slider.nextTick);
    })
    .on("dragend",function (){
        slider.snapToTick();
        changeView(barchart,slider.currentTick);
        barchart.redrawView(slider.currentTick,-1);
    });

//////////////////////Code for creating the small multiples display//////////////////////
/**var multiples = new Multiples("#multiples",10,100,2,2);
multiples.clickImageFunction = function (d){
    multiples.clickedImage = d.id;
    //TODO: add data logging of the answer
    console.log("clicked "+ d.name+" "+ d.id);
}*/
//////////////////////Declare functions required to run the experiment here//////////////////////
//TODO:might want a re-set visualization button in case it freezes or fails (can't jsut refresh the page or the order will get messed up)

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

function startTimer(){
    timerVar = setInterval(timerFunc,1000);
}
function stopTimer(){
    clearInterval(timerVar);
    timeCounter = 0;
    d3.select("#timer").node().innerHTML="";
}


//Moves to the next task
function nextTask (){
   //Get the solution
   var solution = (techniqueOrder[techniqueCounter]==2)?0:slider.currentTick;//If in the small multiples condition, submit the view the user clicked on, otherwise submit the view on the slider
  //Issue a confirmation
   var result = confirm("You will submit this view of the barchart as your solution.  Proceed to the next task?");

    if (result ==true){
        switchTask(solution);
    }
   //TODO:Clear the screen

}
//Switches the task, and checks if max tasks has been reached
//If max tasks reached, switches interaction technique, otherwise:
//Updates the html page when a new task begins and saves the solution entered in the text box
//Logs the solution
function switchTask (solution){
    //Log the solution
    d3.xhr("http://localhost:8080/log?task="+taskCounter+"&interaction="+techniqueOrder[techniqueCounter]+"&content="+solution, function(d) { });

    //Log the last touch down event recorded, then calculate the task completion time
    //TODO: for important information (e.g., the task solutions), log this information twice (once in txt file and then again either in server console or browser console)
    console.log("Last touch up "+lastTouchUp);
    console.log("Total time in seconds"+(Math.abs(lastTouchUp - firstTouchDown)));

    //Re-set the touch event trackers
    firstTouchDown = null;
    lastTouchUp = null;

    taskCounter++;

    if (taskCounter>=totalObjectiveTasks){
        taskCounter = 0;
        switchInteractionTechnique();
    }
    //TODO: display feedback message + blank screen as confirmation
    updateTaskDisplay(objectiveTasks[techniqueOrder[techniqueCounter]][taskOrder[taskCounter]]);

    stopTimer();
    startTimer();
}
/**Update the display according to the current task
 * taskInfo: one entry from the tasks array */
function updateTaskDisplay (taskInfo){
    //TODO: the only updating for the multiples case would just be re-setting the scrolling (if any)
    //Update the visualization for the next task (e.g., highlight bars)
    if (taskInfo[3].length==1){ //One data object to highlight
       // highlightDataObject(taskInfo[3],-1,"displayBars","#1B9E77","#D95F02");
        highlightDataObject(taskInfo[3][0],-1,"displayBars","#BDBDBD","#D95F02");

    }else if (taskInfo[3].length==2){ //Two data objects to highlight
       // highlightDataObject(taskInfo[3][0],taskInfo[3][1],"displayBars","#1B9E77","#D95F02");
        highlightDataObject(taskInfo[3][0],taskInfo[3][1],"displayBars","#BDBDBD","#D95F02","#1B9E77");
    }

    //Update the task panel display
    d3.select("#counter").node().innerHTML = "Task #"+taskCounter;
    d3.select("#taskDescription").node().innerHTML = taskInfo[0];

    //Re-set the visualization to the first view
    changeView(barchart,0);
    barchart.redrawView(0,-1);
    slider.updateSlider(0);
}
//Sets the current interaction technique, and disables the other (dimp vs. slider)
function switchInteractionTechnique(){ //TODO: change the data set(?)
   techniqueCounter++;
   if (techniqueCounter > 3){ //Finished all tasks, enter exploratory period
       startExploratory();
   }else{
       updateInteractionTechnique(techniqueOrder[techniqueCounter]);
   }
}
//Updates the view to enable and disable the appropriate interaction technique
//Technique ID's: Dimp=0, Time slider=1, Small multiples=2 (not implemented yet)
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
//Move to the next phase (after all tasks for both techniques), changes the visualization
//Goes to a new html page returned from the server in "response"
function changePhase (){
    //Confirmation window
    var result = confirm("Is the questionnaire complete?");

    if (result ==true){
        d3.json("http://localhost:8080/nextPhase?", function(error,response) {
            window.location = response;
        });
    }
}
//When all tasks are done, start the exploratory period:
//Add full hint path and fast forwarding feature, use real dataset and clear the task panel
function startExploratory(){

    stopTimer();
    //Tell the server that exploratory period is starting
    d3.xhr("http://localhost:8080/startExploratory?", function(d) { });

   //Update the visualization
   setHintPathType(barchart,0);
    showSliderInfo(slider);
   barchart.render(dataset2,labels2,"CO2 Emissions of the G8+5 Countries","g8+5 countries","CO2 emissions per person (metric tons)");
   barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);  //TODO: should time slider be active? Since slider is a competitor technique, maybe it should be removed entirely

   //Update the task panel
   // d3.select("#solutionEntry").remove();
    d3.select("#taskDescription").remove();
    d3.select("#counter").node().innerHTML = "Exploratory Period..";
    d3.select("#nextButton").node().innerHTML = "Next Phase";
   // slider.widget.remove();//TODO: maybe not remove it, but disable it's dragging

    d3.select("#nextButton").on("click", changePhase);
   //TODO: add a timer to this
}
/**Begins the warm up tasks and tutorial period */
function startWarmup(){

    //When starting the objective tasks
    /**updateInteractionTechnique(techniqueOrder[techniqueCounter]);
    updateTaskDisplay();
    startTimer();*/
}
//Move to the next task, with confirmation.  Collect the solution (if any) provided for the task
d3.select("#submitButton").on("click", nextTask);


//////////////////////Code for the intermediate screen //////////////////////
/**Displays a screen when the submit button is pressed, to confirm the submission
 * */
function showIntermediateScreen (){

}
/**Hides the intermediate screen when the background (outside of the button) is pressed
 * */
function hideIntermediateScreen (){

}
