/** This file creates and coordinates a barchart and a slider according to the provided dataset
 * */

//Create new barchart visualization
var barchart   = new Barchart(400, 50, 30, 100 , "#bargraph",80);

window.onload = function (){
    barchart.useMobile = checkDevice();
}

//Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
barchart.clickSVG = function (){
    barchart.clearHintPath();
};

//Toggle the type of indicator displayed when dragging along the sine wave
//Currently not being used..
/**d3.select("#indicatorForm").selectAll("input").on("change", function change() {
    barchart.indicatorType = this.value;
});

//Toggle the type of progress indicator displayed when dragging along the hint path
d3.select("#progressForm").selectAll("input").on("change", function change() {
    barchart.progressIndicator = this.value;
});*/

barchart.init();
setHintPathType(barchart,1);

//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
    d3.event.preventDefault();
    barchart.animateBars(barchart.draggedBar,barchart.currentView,i);
    changeView(barchart,i);
    slider.updateSlider(i);
};
barchart.render(dataset,labels,"CO2 Emissions of the G8+5 Countries","g8+5 countries","CO2 emissions per person (metric tons)");

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
    })
    .on("drag", function(d){
        d3.event.sourceEvent.preventDefault();
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
        var coords = getUserCoords(this);
        barchart.updateDraggedBar(d.id,coords[0],coords[1],d.xPos,d.nodes);
    })
    .on("dragend",function (d){
        d3.event.sourceEvent.preventDefault();
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
					  .on("dragstart", function(){
                          d3.event.sourceEvent.preventDefault();
                          barchart.clearHintPath();
                      })
                      .on("drag", function(){
                          d3.event.sourceEvent.preventDefault();
                          var userX;
                          if (d3.touches(this).length > 0){
                             userX = d3.touches(this)[0][0];
                          }else{
                             userX = d3.event.x;
                          }
						   slider.updateDraggedSlider(userX);
                           barchart.interpolateBars(-1,slider.interpValue,slider.currentTick,slider.nextTick);
					  })
					  .on("dragend",function (){
                          d3.event.sourceEvent.preventDefault();
					      slider.snapToTick();
                          changeView(barchart,slider.currentTick);
                          barchart.redrawView(slider.currentTick,-1);
                     });
//Apply the dragging function to the movable tick
slider.widget.select("#slidingTick").call(slider.dragEvent);
hideSliderInfo(slider);

//Testing the small multiples display
/**clearVis(".gDisplayBars");
if (slider.widget!=null) slider.widget.remove();
var multiples = new Multiples("#multiples",10,100,2,2);
multiples.clickImageFunction = function (d){
    console.log("clicked "+ d.name+" "+ d.id);
}
multiples.render(["1.png","2.png","3.png","4.png"]);*/




				   
