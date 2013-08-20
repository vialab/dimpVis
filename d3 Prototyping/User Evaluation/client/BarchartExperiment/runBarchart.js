/** This file is a test run of a barchart experiment trial
 * */

//To disable the drag function
var doNothing = d3.behavior.drag().on("dragstart", null)
    .on("drag", null).on("dragend",null);

//////////////////////Code for creating a barchart visualization//////////////////////
var barchart   = new Barchart(400, 50, 30, 100 , "#bargraph",80);

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
    barchart.changeView(i);
    slider.updateSlider(i);
};

barchart.render(dataset,labels,"","","");

//Define the function to respond to the dragging behaviour of the bars
barchart.dragEvent = d3.behavior.drag()
    .origin(function(d){ //Set the starting point of the drag interaction
        return {x:d.xPos,y:d.nodes[barchart.currentView][0]};
    })
    .on("dragstart", function(d){
        barchart.clearHintPath();
        barchart.draggedBar = d.id;
        barchart.selectBar(d.id, d.nodes, d.xPos);

        //Log the interaction
        d3.xhr("http://localhost:8080/log?content=dragStart"+ d.id, function(d) { });
    })
    .on("drag", function(d){
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
        barchart.updateDraggedBar(d.id,d3.event.y,d3.event.x);
    })
    .on("dragend",function (d){
        barchart.snapToView(d.id,d.nodes);
        slider.updateSlider(barchart.currentView);

        //Log the interaction
        d3.xhr("http://localhost:8080/log?content=dragEnd"+ d.id, function(d) { });
    });

//Apply the dragging function to each bar
//barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);

//////////////////////Code for creating the slider widget//////////////////////
var slider   = new Slider(50, 700, "#time",labels, "Time","#666",40);
slider.init();
slider.render();

//Define the function to respond to the dragging behaviour of the slider tick
slider.dragEvent = d3.behavior.drag()
    .on("dragstart", function(){ barchart.clearHintPath();})
    .on("drag", function(){
        slider.updateDraggedSlider(d3.mouse(this)[0]);
        barchart.interpolateBars(-1,slider.interpValue,slider.currentTick,slider.nextTick);
    })
    .on("dragend",function (){
        slider.snapToTick();
        barchart.changeView(slider.currentTick);
        barchart.redrawView(slider.currentTick,-1);
    });
//Apply the dragging function to the movable tick
//slider.widget.select("#slidingTick").call(slider.dragEvent);

//////////////////////Declare additional functions required to run the experiment here//////////////////////
var taskCounter = 1;
var techniqueCounter = 0;
var timeCounter = 0;
var timerVar;
var totalTasks = 2; //For each interaction technique
var techniqueOrder = []; //Randomized order of interaction techniques

//Function that will be executed every 1 second to check the time
var timerFunc = function (){
    timeCounter++;
    if (timeCounter > 5){ //Exceeded maximum time provided for a task
       alert("Maximum time to complete the task has been exceeded.  You will now begin the next task.");
        //Grab the solution (if any), submit whatever solution is currently in the text box?
        /**var solution = d3.select("#taskSolution").node().value;
        var result;
        if (solution.length >0){
            result = confirm("You have entered: "+solution+".  Would you like to submit this answer?");
        }

        if (result ==true){
            updateView(solution);
        }else{
            updateView("");
        }*/
    }else{ //Display the timer counts for debugging
        d3.select("#timer").node().innerHTML=timeCounter;
    }
};

//Called when the html page is loaded
window.onload = function (){
   //startTimer();
    //Get the starting technique
    d3.json("http://localhost:8080/getInteractionTechniqueOrder?", function(error,response) {
        console.log(response);
        techniqueOrder = response;
        updateInteractionTechnique(techniqueOrder[techniqueCounter]);
    });
}

function startTimer(){
    timerVar = setInterval(timerFunc,1000);
}
function stopTimer(){
    clearInterval(timerVar);
}
//Move to the next task, with confirmation.  Collect the solution (if any) provided for the task
d3.select("#nextButton").on("click", nextTask);

//Moves to the next task
function nextTask (){
    //Grab the solution (if any)
    var solution = d3.select("#taskSolution").node().value;
    var result;
    if (solution.length >0){
        result = confirm("You have entered: "+solution+".  Proceed to the next task?");
    }else{
        result = confirm("You have not entered a solution.  Proceed to the next task?");
    }

    if (result ==true){
       switchTask(solution);
    }
}
//Switches the task, and checks if max tasks has been reached
//If max tasks reached, switches interaction technique, otherwise:
//Updates the html page when a new task begins and saves the solution entered in the text box
//Logs the solution
function switchTask (solution){
    //Log the solution
    d3.xhr("http://localhost:8080/log?content="+solution, function(d) { });

    taskCounter++;

    if (taskCounter>totalTasks){
        taskCounter = 1;
        switchInteractionTechnique();
    }

    //Clear the text box, update the task panel display
    d3.select("#taskSolution").node().value = "";
    d3.select("#counter").node().innerHTML = "Task #"+taskCounter;
    d3.select("#taskDescription").node().innerHTML = "Description #"+taskCounter;

    //stopTimer();
}
//Sets the current interaction technique, and disables the other (dimp vs. slider)
function switchInteractionTechnique(){
   //TODO:Log this event
   techniqueCounter++;
   if (techniqueCounter > 0){ //Finished all tasks, enter exploratory period
       startExploratory();
   }else{
       updateInteractionTechnique(techniqueOrder[techniqueCounter]);
   }
}
//Updates the view to enable and disable the appropriate interaction technique
//Technique ID's: Dimp=0, Time slider=1, Small multiples=2 (not implemented yet)
function updateInteractionTechnique(techniqueID){
    if (techniqueID == 0) {  //Enable dimp technique, disable time slider dragging
        slider.widget.select("#slidingTick").call(doNothing);
        barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);
    }else{ //Enable time slider, disable dimp interaction
        slider.widget.select("#slidingTick").call(slider.dragEvent);
        barchart.svg.selectAll(".displayBars").call(doNothing);
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
   //TODO: log this event
   //Update the visualization
   setHintPathType(barchart,0);
   barchart.render(dataset2,labels,"CO2 Emissions of the G8+5 Countries","g8+5 countries","CO2 emissions per person (metric tons)");
   barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);  //TODO: should time slider be active? Since slider is a competitor technique, maybe it should be removed entirely

   //Update the task panel
    d3.select("#solutionEntry").remove();
    d3.select("#taskDescription").remove();
    d3.select("#counter").node().innerHTML = "Exploratory Period..";
    d3.select("#nextButton").node().innerHTML = "Begin Next Phase?";
    slider.widget.remove();

    d3.select("#nextButton").on("click", changePhase);
   //TODO: add a timer to this

}




				   
