/** This file creates and coordinates a barchart and a slider according to the provided dataset
 * */

//Create new barchart visualization
var barchart   = new Barchart(400, 50, 30, 0 , "#bargraph",80,"country","population","Populations of a subset of countries over time",labels);

//Define the function when the SVG (background of graph) is clicked, should clear the hint path displayed
barchart.clickSVG = function (d){
    barchart.clearHintPath(barchart.draggedBar);
};

barchart.init();

//Define click function for each hint path label
barchart.clickHintLabelFunction = function (d, i){
    d3.event.stopPropagation();
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
        barchart.clearHintPath(barchart.draggedBar);
        barchart.draggedBar = d.id;
        barchart.showHintPath(d.id, d.nodes, d.xPos);
    })
    .on("drag", function(d){
        barchart.updateDraggedBar(d.id,d3.event.y);
        slider.animateTick(barchart.interpValue,barchart.currentView,barchart.nextView);
    })
    .on("dragend",function (d){
        barchart.snapToView(d.id,d.nodes);
        slider.updateSlider(barchart.currentView);
    });
//Apply the dragging function to every bar
barchart.svg.selectAll(".displayBars")
    .call(barchart.dragEvent);

//Create a slider widget
var slider   = new Slider(50, 600, "#time",labels, "Years","#666",50);
slider.init();
slider.render();

//Define the function to respond to the dragging behaviour of the slider tick
 slider.dragEvent = d3.behavior.drag()  
						.on("dragstart", function(){                           
                            barchart.clearHintPath(barchart.draggedBar);							
					     }) 
                      .on("drag", function(){                               				  
							slider.updateDraggedSlider(d3.event.x);
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
				   
				   

				   
