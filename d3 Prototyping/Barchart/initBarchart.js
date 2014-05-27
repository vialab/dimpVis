/** This file creates and coordinates a barchart and a slider according to the provided dataset
 * */

//Add a main svg which all visualization elements will be appended to
d3.select("#bargraph").append("svg").attr("id","mainSvg").on("click",function(){
    barchart.clearHintPath();
 });
var screenWidth = window.innerWidth-50;
var screenHeight = window.innerHeight-50;
//Create new barchart visualization
var barchart   = new Barchart(screenHeight*0.6, screenWidth*0.6, 50);

window.onload = function (){
    barchart.useMobile = checkDevice();
    d3.select("#mainSvg").attr("width",screenWidth).attr("height",screenHeight);
    d3.select("#hintPathFormDiv").style("margin-left",(screenWidth*0.6+90)+"px");
}
d3.select("#hintPathForm").selectAll("input").on("change", function change() {
    barchart.hintPathType = this.value;
});
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

//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
   d3.event.stopPropagation();
  //  d3.event.preventDefault();
    barchart.animateBars(barchart.draggedBar,barchart.currentView,i);
    changeView(barchart,i);
    slider.updateSlider(i);

};
barchart.render(dataset,labels,"Student Enrollment Over The Years At UOIT","","Total Enrollment (Bachelors Degree, Full Time)");

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
var sliderSpacing = barchart.width/(labels.length);
var slider   = new Slider(50, screenHeight*0.8, labels, "","#666",sliderSpacing);
slider.init();
slider.render();

//Define the function to respond to the dragging behaviour of the slider tick
 slider.dragEvent = d3.behavior.drag()  
					  .on("dragstart", function(){
                          d3.event.sourceEvent.preventDefault();
                          barchart.clearHintPath();
                      })
                      .on("drag", function(){
                          //d3.event.sourceEvent.preventDefault();
                         // var userX = getUserCoords(this);
						  // slider.updateDraggedSlider(userX[0]);
                         slider.updateDraggedSlider(d3.event.x);
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
//hideSliderInfo(slider);






				   
