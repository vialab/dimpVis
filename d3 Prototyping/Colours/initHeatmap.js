            
var years = ["1955","1960","1965","1970","1975","1980"];
var heatmap = new Heatmap(0, 0, 1200, 800, "#vis",years);
heatmap.init();
//Define some mouse events for each day in the calendar
/**heatmap.mouseDownFunction = function (d){  	 
	   heatmap.selected = d.id;
	   console.log("mousedown");
	   heatmap.showHintPath(d.id,d.colours,d.x,d.y);
       heatmap.previousMouseY = d3.mouse(this)[1];	   
}
heatmap.mouseUpFunction = function (d){
   heatmap.snapToView();
   heatmap.clearHintPath(heatmap.selected);
   heatmap.selected = -1;  
   heatmap.previousMouseY = null;
}
heatmap.mouseMoveFunction = function (d){
   if (heatmap.selected != -1){
	    heatmap.updateDraggedCell(heatmap.selected,d3.mouse(this)[1]);	   
	   //console.log("move mouse");
	}   
}*/

//Render 4x6 matrix as the heatmap, across 6 different views
heatmap.render(data,4,6);

					  
heatmap.dragEvent = d3.behavior.drag()
                       .origin(function(d){ //Set the starting point of the drag interaction
							return {x:d.x,y:d.y};
	                   })
					   .on("dragstart", function(d){ 
                           heatmap.clearHintPath(heatmap.selected);					   
						   heatmap.selected = d.id;						  
						   heatmap.showHintPath(d.id,d.colours,d.x,d.y);
						   heatmap.previousMouseY = d3.event.y;	                           								   
							                                           						   
					  })  
					.on("drag", function(d){  
                          if (heatmap.selected != -1){
								heatmap.updateDraggedCell(heatmap.selected,d3.event.y);	   
							   //console.log("move mouse");
							} 						
					  })					  
					  .on("dragend",function (d){				    
					       heatmap.snapToView();						   
						   heatmap.selected = -1;  
						   heatmap.previousMouseY = null;  				 
					  });	


heatmap.widget.selectAll(".cell").call(heatmap.dragEvent);


	

