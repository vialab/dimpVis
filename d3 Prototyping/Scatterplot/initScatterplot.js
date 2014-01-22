/** This file creates and coordinates a scatterplot and a slider according to the provided dataset
 * */

//Add a main svg which all visualization elements will be appended to
d3.select("#scatter").append("svg").attr("id","mainSvg").on("click",function(){
    scatterplot.clearHintPath();
    scatterplot.clearPointLabels();
});
window.onload = function (){
    d3.select("#mainSvg").attr("width",window.innerWidth-50).attr("height",window.innerWidth-50);
}
//Create a new scatterplot visualization
var scatterplot   = new Scatterplot(1200, 700,50);

scatterplot.init();
//setHintPathType(scatterplot,1);

//Define the click interaction of the hint labels to invoke fast switching among views
scatterplot.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation(); //Prevents the event from propagating down to the SVG
    scatterplot.animatePoints(scatterplot.draggedPoint,scatterplot.currentView, i);
    changeView(scatterplot,i);
    slider.updateSlider(i);
};

scatterplot.render( dataset, labels,xLabel,yLabel,title); //Draw the scatterplot, dataset is an array created in a separate js file containing the json data,
                                        // and labels is an array representing the different views of the dataset

//Define the dragging interaction of the scatterplot points, which will continuously update the scatterplot
var dragPoint = d3.behavior.drag()
               .origin(function(d){ //Set the starting point of the drag interaction
                    return {x:d.nodes[scatterplot.currentView][0],y:d.nodes[scatterplot.currentView][1]};
               }).on("dragstart", function(d){
                    scatterplot.clearHintPath();
                    scatterplot.draggedPoint = d.id;
                    scatterplot.previousDragAngle = 0; //To be safe, re-set this
                    scatterplot.selectPoint(d);
              }).on("drag", function(d){
                   slider.animateTick(scatterplot.interpValue,scatterplot.currentView,scatterplot.nextView);
                   scatterplot.updateDraggedPoint(d.id,d3.event.x,d3.event.y, d.nodes);
              }).on("dragend",function (d){ //In this event, mouse coordinates are undefined, need to use the saved
                                          //coordinates of the scatterplot object
                    scatterplot.snapToView(d.id,d.nodes);
                    slider.updateSlider(scatterplot.currentView);
              });

//Apply the dragging function to all points of the scatterplot, making them all draggable
scatterplot.svg.selectAll(".displayPoints").call(dragPoint);

//Create a new slider widget as an alternative for switching views of the scatterplot visualization
var slider   = new Slider(35, 840, labels, "","#666",50);
slider.init();
slider.render();
				  
//Define the dragging interaction of the slider which will update the view of the scatterplot
 slider.dragEvent = d3.behavior.drag()  
						.on("dragstart", function(){                               
                            scatterplot.clearHintPath();
					     }) 
                      .on("drag", function(){                               					  
							slider.updateDraggedSlider(d3.event.x);                       
						    scatterplot.interpolatePoints(-1,slider.interpValue,slider.currentTick,slider.nextTick);
					  })
					  .on("dragend",function (){
					      slider.snapToTick();
                          changeView(scatterplot,slider.currentTick);
                          scatterplot.redrawView(slider.currentTick);
					  });	

//Apply the dragging event to the slider's movable tick
slider.widget.select("#slidingTick")				                 			  
                   .call(slider.dragEvent);	   
				   
