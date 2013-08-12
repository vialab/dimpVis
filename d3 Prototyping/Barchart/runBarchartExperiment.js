/** This file is a test run of a barchart experiment trial
 * */

/* Code for creating a barchart visualization
* */
var barchart   = new Barchart(400, 50, 30, 100 , "#bargraph",80);

//Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
barchart.clickSVG = function (){
    barchart.clearHintPath();
};

barchart.init();

//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    barchart.animateBars(barchart.draggedBar,barchart.currentView,i);
    barchart.changeView(i);
    slider.updateSlider(i);
};

barchart.render(dataset,labels,"CO2 Emissions of the G8+5 Countries","g8+5 countries","CO2 emissions per person (metric tons)");

//Define the function to respond to the dragging behaviour of the bars
barchart.dragEvent = d3.behavior.drag()
    .origin(function(d){ //Set the starting point of the drag interaction
        return {x:d.xPos,y:d.nodes[barchart.currentView][0]};
    })
    .on("dragstart", function(d){
        barchart.clearHintPath();
        barchart.draggedBar = d.id;
        barchart.selectBar(d.id, d.nodes, d.xPos);
    })
    .on("drag", function(d){
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
        barchart.updateDraggedBar(d.id,d3.event.y,d3.event.x);
    })
    .on("dragend",function (d){
        barchart.snapToView(d.id,d.nodes);
        slider.updateSlider(barchart.currentView);
    });

//Apply the dragging function to each bar
barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);

/**Code for creating the slider widget
 * */
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
slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
/**Declare additional functions required to run the experiments here */

//Move to the next task, with confirmation.  Collect the solution (if any) provided for the task
d3.select("#nextButton").on("click", function () {
    var result = confirm("Proceed to the next task?");
    if (result ==true){
        barchart.render(dataset,labels,"CO2 Emissions of the G8+5 Countries","g8+5 countries","CO2 emissions per person (metric tons)");
        barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);
    }
});

				   
