/** This file creates and coordinates a barchart and a slider according to the provided dataset
 * */

//Create new barchart visualization
var barchart   = new Barchart(400, 50, 30, 100 , "#bargraph",80,"g8+5 countries","CO2 emissions per person (metric tons)","CO2 Emissions of the G8+5 Countries",labels);

//Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
barchart.clickSVG = function (){
    barchart.clearHintPath();
};

//Toggle the type of indicator displayed when dragging along the sine wave
d3.select("#indicatorForm").selectAll("input").on("change", function change() {
    barchart.indicatorType = this.value;
});

//Toggle the type of progress indicator displayed when dragging along the hint path
d3.select("#progressForm").selectAll("input").on("change", function change() {
    barchart.progressIndicator = this.value;
});

barchart.init();

//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    barchart.animateBars(barchart.draggedBar,barchart.currentView,i);
    barchart.changeView(i);
    slider.updateSlider(i);
};
barchart.render(dataset,0);

//Define the function to respond to the dragging behaviour of the bars
barchart.dragEvent = d3.behavior.drag()
    .origin(function(d){ //Set the starting point of the drag interaction
        return {x:d.xPos,y:d.nodes[barchart.currentView][0]};
    })
    .on("dragstart", function(d){
        barchart.clearHintPath();
        barchart.draggedBar = d.id;
        barchart.showHintPath(d.id, d.nodes, d.xPos);
    })
    .on("drag", function(d){
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
        //barchart.updateDraggedBar(d.id,d3.mouse(this)[1],d3.mouse(this)[0]); //Note: d3.mouse gets coordinates relative to svg container (d3.event does not account for transformations),
                                                                              // but does not work on touch screens
        barchart.updateDraggedBar(d.id,d3.event.y,d3.event.x);
    })
    .on("dragend",function (d){
        barchart.snapToView(d.id,d.nodes);
        slider.updateSlider(barchart.currentView);
    });
//Apply the dragging function to each bar
barchart.svg.selectAll(".displayBars").call(barchart.dragEvent);

//Create a slider widget
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
				   
				   

				   
