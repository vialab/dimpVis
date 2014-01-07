/** This file creates and coordinates a barchart and a slider according to the provided dataset
 * */

//Add a main svg which all visualization elements will be appended to
d3.select("#bargraph").append("svg").attr("id","mainSvg").on("click",function(){
    barchart.clearHintPath();
 });

//Create new barchart visualization
var barchart   = new Barchart(300, 45, 50);

window.onload = function (){
    barchart.useMobile = checkDevice();
    d3.select("#mainSvg").attr("width",window.innerWidth-50).attr("height",window.innerHeight-50);
    //alert(window.innerHeight+" "+window.innerWidth);
}

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

//setHintPathType(barchart,1);

//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
   d3.event.stopPropagation();
  //  d3.event.preventDefault();
    barchart.animateBars(barchart.draggedBar,barchart.currentView,i);
    changeView(barchart,i);
    slider.updateSlider(i);

};
barchart.render(dataset,labels,"Student Enrollment Over The Years At UOIT","Program","Total Enrollment (Bachelors Degree, Full Time)");

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
var slider   = new Slider(30, 500, labels, "","#666",110);
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
                          var userX = getUserCoords(this);
						   slider.updateDraggedSlider(userX[0]);
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






				   
