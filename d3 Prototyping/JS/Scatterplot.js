////////////////////////////////////////////////////////////////////////////////
// Used to draw the scatterplot
////////////////////////////////////////////////////////////////////////////////
function Scatterplot(x, y, w, h, id,p) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id; 
   this.padding = p
   this.pointRadius = 5;
   //Colours
   this.hintColour = "steelblue";
   this.pointColour = "#666";   
   this.lightGrey = "#c7c7c7";
   // Reference to the main widget
   this.widget = null;  
   //Variables to track dragged point location within path ("view switches")
   this.currentView = -1;
   this.nextView = -1;
   this.totalViews = -1; //Last index of the points (nodes) array
   //The number of different instances across dimension (e.g., 4 different views for each year)
   this.numViews = 10;
   this.interpValue = 0; //Stores the current interpolation value when a point is dragged between two views
   this.direction = 1; //Forward along the data dimension (e.g., time)
   // Data used for display
   this.displayData = [];   
   this.labels = [];
   this.clickedPoint = -1;
   this.hoveredPoint = -1;
   this.draggedPoint = -1;
   this.dragging = 0;
   this.dragEvent = null;
   
   //Event functions, declared in main.js  
   this.placeholder = function() {}; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder;  
   this.clickFunction = this.placeholder;
   this.clickHintPointFunction = this.placeholder;
   this.clickHintLabelFunction = this.placeholder;
   this.hoverHintLabelFunction = this.placeholder;
}

////////////////////////////////////////////////////////////////////////////////
// Prototype functions
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Initializes the svg 
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.init = function() {
  
   // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
      .attr("width", this.width+(this.padding*2))
      .attr("height", this.height+(this.padding*2))  
     .append("g")
     .attr("transform", "translate(" + this.padding + "," + this.padding + ")")
   ; 
}
////////////////////////////////////////////////////////////////////////////////
// Render
// start = year or instance the view represents
// l =  labels for the hint path
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.render = function( vdata, start, l) {
  var myRef = this; 
	
   this.labels = l;
   this.displayData = vdata;   
   this.currentView = start;
   if (this.currentView ==0){//First point on path			        
			this.nextView = this.currentView+1;
	}else if (this.currentView == this.numViews){  //Last point of path				
		   this.nextView = this.currentView;
		   this.currentView = this.currentView -1;
	}else { //A point somewhere in the middle				     
		this.nextView = this.currentView + 1;
	}
  
   //Remove everything in the svg - only need this if calling render more than once after page is loaded
	//this.widget.selectAll("g").remove(); 
	
	//Add the blur filter to the SVG so other elements can call it
	this.widget.append("svg:defs")
				.append("svg:filter")
			    .attr("id", "blur")
				.append("svg:feGaussianBlur")
				.attr("stdDeviation", 5);
	//Create the scales 	  
	 var xScale = d3.scale.linear().domain([0,10]).range([0,myRef.width]);   
     var yScale =  d3.scale.linear().domain([10, 80]).range([myRef.height,0]);
	//Define the axes
	var xAxis = d3.svg.axis()
                     .scale(xScale)
					 .orient("bottom");
	var yAxis = d3.svg.axis()
                     .scale(yScale)
					 .orient("left");
	 // Add the x-axis
    this.widget.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+myRef.padding+"," + myRef.height + ")")
		.call(xAxis);

     // Add the y-axis
     this.widget.append("g")
			.attr("class", "axis")
			.attr("transform", "translate("+ myRef.padding+ ",0)")
			.call(yAxis); 
	 
	 // Add an x-axis label
     this.widget.append("text")
		.attr("class", "axisLabel")			
		.attr("x", myRef.width)
		.attr("y", myRef.height+myRef.padding-10)
		.text("fertility rate");

     // Add a y-axis label
	this.widget.append("text")
		.attr("class", "axisLabel")		       	
		.attr("x", 6)		
		.attr("transform", "rotate(-90)")
		.text("life expectancy");
		
   // Draw the data points
  this.widget.selectAll("circle")
     .data(this.displayData.map(function (d,i) {
             //Create a list of nodes (x,y) point pairs for each country
			 //Dataset goes from 1955 to 2005 (11 increments)
			 //Try fertility vs population:
			 var points = [];		
			 points[0] = [xScale(d.F1955), yScale(d.L1955)];
			 points[1] = [xScale(d.F1960), yScale(d.L1960)];
			 points[2] = [xScale(d.F1965), yScale(d.L1965)];
			 points[3] = [xScale(d.F1970), yScale(d.L1970)];
			 points[4] = [xScale(d.F1975), yScale(d.L1975)];
			 points[5] = [xScale(d.F1980), yScale(d.L1980)];
			 points[6] = [xScale(d.F1985), yScale(d.L1985)];
			 points[7] = [xScale(d.F1990), yScale(d.L1990)];
			 points[8] = [xScale(d.F1995), yScale(d.L1995)];
			 points[9] = [xScale(d.F2000), yScale(d.L2000)];
			 points[10] = [xScale(d.F2005), yScale(d.L2005)];	
			myRef.totalViews = points.length-1;			 
	        return {nodes:points,id:i,country:d.Country,group:d.Group,cluster:d.Cluster};
	  }))	
      .enter()
      .append("g")	  
	  .attr("class","gDisplayPoints"); 
   
 //Drawing paths between points
 var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear"); //Interpolate curve should pass through all points, however curved interpolations falsify the data
   
    this.widget.selectAll(".gDisplayPoints").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                   .attr("class","gInner");									  
	 //Render the hint points							   
	this.widget.selectAll(".gDisplayPoints").selectAll(".gInner").selectAll("circle")
                                             .data(function(d) {return d.nodes;})
											 .enter().append("svg:circle")
											 .attr("cx", function(d) { return d[0]; })
											.attr("cy", function(d) { return d[1]; })
											.attr("r",myRef.pointRadius)
											.attr("class","hintPoints")
											.style("fill","none")
											.style("cursor","pointer")
											.attr("filter", "url(#blur)");
											//.on("click", this.clickHintPointFunction);
	//Render the hint path labels
    this.widget.selectAll(".gDisplayPoints").selectAll(".gInner").selectAll("text")
	                                        .data(function(d) {return d.nodes;}).enter()								  
								            .append("svg:text")
                                            .text(function(d,i) { return myRef.labels[i]; })
												.attr("x", function(d) {return d[0] + myRef.pointRadius*2})
												.attr("y", function (d) {  return d[1] + myRef.pointRadius*2; })												
											   .attr("fill", "none")											  
											   .attr("class","hintLabels")
											   .style("cursor","pointer")											  
											   .on("click", this.clickHintLabelFunction);
	//Render the hint path line									    
    this.widget.selectAll("g").selectAll(".gInner").append("svg:path")
                                  .attr("d", function(d){ 
								         return line(d.nodes); 
								  })
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", "none")
								   .style("fill", "none")
								    .attr("filter", "url(#blur)");
     
	 //Render the actual data points last, so that they are displayed on top of the hint path
     this.widget.selectAll(".gDisplayPoints").append("svg:circle")
							  .attr("cx", function(d) {	     
								   return d.nodes[myRef.currentView][0];
							   })
							 .attr("cy", function(d) {        
								   return d.nodes[myRef.currentView][1];
							  })
							  .attr("r", myRef.pointRadius)
							  .attr("stroke", "none")
							  .attr("stroke-width", "2")
							  .attr("class", "displayPoints")
							  .attr("fill",myRef.pointColour)
							  .style("fill-opacity",1)
							   .attr("id", function (d){return "displayPoints"+d.id;})
							  .style("cursor", "pointer")  
							   .on("mouseover", myRef.mouseoverFunction)
							   .on("mouseout", myRef.mouseoutFunction)	
							   .on("click", myRef.clickFunction);  
}

//Updates the dragged point - for drag mouse event
//TODO: refactor this function, lots of repeated code
Scatterplot.prototype.updateDraggedPoint = function(id,mouseX,mouseY) {	 
       var ref = this;
	   
	  this.widget.select("#displayPoints"+id)     
        .attr("cx", function(d){		
                 //Get the two points which compose the current sub-path dragged along	               			 
		        var pt1 = d.nodes[ref.currentView][0];				
                var pt2 = d.nodes[ref.nextView][0];		
                var bounds = ref.checkBounds(pt1,pt2,mouseX);				
                if (ref.currentView ==0 && bounds == pt1){//First point on path, out of bounds	 				
					   return pt1;									
				  }else if (ref.nextView == ref.totalViews && bounds == pt2){  //Last point of path, out of bounds									  
					  return pt2;				
				  }	else { //A point somewhere in the middle
				     if (bounds == pt1){ //Passed current					    
					    return pt1;
					 }else if (bounds == pt2){ //Passed next			    
					    return pt2;
					 }
				 }
                  return mouseX;             		
		})
        .attr("cy", function(d){	
             //Get the two points which compose the current sub-path dragged along		
		        var pt1 = d.nodes[ref.currentView][0];
                var pt2 = d.nodes[ref.nextView][0];	
                var pt1_y = d.nodes[ref.currentView][1];
                var pt2_y = d.nodes[ref.nextView][1];					
                var bounds = ref.checkBounds(pt1,pt2,mouseX);
                var interpY;				
		     //Check to make sure mouse is in bounds
                if (ref.currentView ==0){//First point on path	 				
					if (bounds == pt1){  //Out of Bounds
					   return pt1_y;
					}else if (bounds == pt2){  //Beyond nextView
					//  interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					 // ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					  ref.currentView = ref.nextView;
					  ref.nextView = ref.currentView +1;
                      ref.redrawView(id,-1);					  
					  return pt2_y;
					}else{ //Within current sub-path
					   interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					   ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					   return interpY;
					}					
				  }else if (ref.nextView == ref.totalViews){  //Last point of path					
					if (bounds == pt1){  //Beyond 
                         //interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					    // ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);					
					    ref.nextView = ref.currentView;
						ref.currentView = ref.currentView - 1;	
                        ref.redrawView(id,-1);						
					    return pt1_y;
					}else if (bounds == pt2){  //Out of Bounds					  
					  return pt2_y;
					}else{ //Within current sub-path
					   interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y);
					   ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					   return interpY;
					}
				  }	else { //A point somewhere in the middle				 
				     if (bounds == pt1){ //Passed current                         					 
					    ref.nextView = ref.currentView;
						ref.currentView = ref.currentView-1;
						ref.redrawView(id,-1);
					    return pt1_y;
					 }else if (bounds == pt2){ //Passed next
					    ref.currentView = ref.nextView;
					    ref.nextView = ref.nextView +1;						
						ref.redrawView(id,-1);
					    return pt2_y;
					 }else{ //Within current sub-path
					    interpY = ref.findInterpY(mouseX,pt1,pt1_y,pt2,pt2_y,mouseY);
					    ref.animatePoints(mouseX,interpY, pt1, pt1_y,pt2,pt2_y,id);
					    return interpY;
					 }
				 }
               
		});				
  
}
//"Animates" the rest of points while a point is dragged
//TODO: refactor this function, lots of repeated code
Scatterplot.prototype.animatePoints = function(mouseX,interpY, pt1_x, pt1_y,pt2_x,pt2_y,id){
    var ref = this;
  //Determine the percentage travelled along the path between current and next
  var distanceTravelled = ref.calculateDistance(mouseX,interpY,pt1_x,pt1_y);
  var totalDistance = ref.calculateDistance(pt1_x,pt1_y,pt2_x,pt2_y);
  var distanceRatio = distanceTravelled/totalDistance;
  ref.interpValue = distanceRatio;
   this.widget.selectAll(".displayPoints")				 
				   .attr("cx",function (d){	
                          if (d.id != id){				   
							     var pt1 = d.nodes[ref.currentView][0];
								 var pt2 = d.nodes[ref.nextView][0];	
								 var pt1_y = d.nodes[ref.currentView][1];
								 var pt2_y = d.nodes[ref.nextView][1];
								 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
								 var newPoint = interpolator(distanceRatio);
								 return newPoint.x;
						   }
						   return mouseX;
						})
					 .attr("cy",function (d){	
					     if (d.id != id){
								 var pt1 = d.nodes[ref.currentView][0];
								 var pt2 = d.nodes[ref.nextView][0];	
								 var pt1_y = d.nodes[ref.currentView][1];
								 var pt2_y = d.nodes[ref.nextView][1];
                                 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
                                 var newPoint = interpolator(distanceRatio);
								 return newPoint.y;								 
															
						}		
                        return interpY;						
					 });			
 
}
//A function meant only to interface with other visualizations or the slider
//Given an interpolation value, move all points accordingly between the view 'current' and 'next'
Scatterplot.prototype.updatePoints = function(interpValue,current,next){  
   this.widget.selectAll(".displayPoints")				 
				   .attr("cx",function (d){	                         				   
							     var pt1 = d.nodes[current][0];
								 var pt2 = d.nodes[next][0];	
								 var pt1_y = d.nodes[current][1];
								 var pt2_y = d.nodes[next][1];
								 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
								 var newPoint = interpolator(interpValue);
								 return newPoint.x;						  
						})
					 .attr("cy",function (d){		    
								 var pt1 = d.nodes[current][0];
								 var pt2 = d.nodes[next][0];	
								 var pt1_y = d.nodes[current][1];
								 var pt2_y = d.nodes[next][1];
                                 var interpolator = d3.interpolate({x:pt1,y:pt1_y},{x:pt2,y:pt2_y});
                                 var newPoint = interpolator(interpValue);
								 return newPoint.y;													
											
					 });			
 
}
////////////////////////////////////////////////////////////////////////////////
// Snap the draggable point to the nearest view
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.snapToView = function( id, mouseX, mouseY,nodes) {
    var ref = this;    
	var distanceCurrent = ref.calculateDistance(mouseX,mouseY, nodes[ref.currentView][0], nodes[ref.currentView][1]);					
	var distanceNext = 	ref.calculateDistance(mouseX,mouseY, nodes[ref.nextView][0], nodes[ref.nextView][1]);	
    if (distanceCurrent > distanceNext && ref.nextView != ref.totalViews){ //Snap to next view					    
		ref.currentView = ref.nextView;
		ref.nextView = ref.nextView +1;	                        				
     }
    if (ref.nextView == ref.totalViews){ //If the nextView is the last view index, need to re draw the plot on that index (not currentView, which is nextView-1)
        ref.redrawView(id,ref.nextView);
	}else{
	   ref.redrawView(id,-1);
    }	
	           
    
}
////////////////////////////////////////////////////////////////////////////////
// Changes the view, newView is the index of the view
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.changeView = function( newView) {     
	 var ref = this;
	 //Update the view tracker variables
	 if (newView ==0){//First point on path
            ref.currentView = newView	 
			ref.nextView = newView+1;
	}else if (newView == ref.numViews){  //Last point of path				
		   ref.nextView = newView;
		   ref.currentView = newView -1;
	}else { //A point somewhere in the middle
        ref.currentView = newView;	
		ref.nextView = newView + 1;
	}
    //ref.redrawView("null",-1); //redraw the points for the currently selected view
}
////////////////////////////////////////////////////////////////////////////////
// Animates points along a path when fast forwarding is used
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.animateAlongPath = function( previousView, nextView) {     
	 var ref = this;
	 //Update the view tracker variables
	 if (nextView ==0){//First point on path
            ref.currentView = nextView	 
			ref.nextView = nextView+1;
	}else if (nextView == ref.numViews){  //Last point of path				
		   ref.nextView = nextView;
		   ref.currentView = nextView -1;
	}else { //A point somewhere in the middle
        ref.currentView = nextView;	
		ref.nextView = nextView + 1;
	}
	//Need to do multi-stage transitions
	//Transition chaining
   /** var first = this.widget.selectAll(".displayPoints")
	          .transition().duration(400)
			  .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[0][0],d.nodes[1][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[0][1],d.nodes[1][1]);
						  return function (t){
						  
						   return interp(t);
						  };			 
	             });
	var second = first.transition().duration(400)
	.ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[1][0],d.nodes[2][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[1][1],d.nodes[2][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             });*/
	//Using the end function
	/**this.widget.selectAll(".displayPoints")
	          .transition().duration(1200)
			  .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[0][0],d.nodes[0][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[1][1],d.nodes[1][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             })
				 .each("end",ref.transition(1,2));*/
	
	//ref.transition(0,1);
	/**for (var j=1;j<ref.currentView;j++){
	    this.widget.selectAll(".displayPoints")
	          .transition().duration(1200)
			  .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[j-1][0],d.nodes[j][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[j-1][1],d.nodes[j][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             });				    
	}*/
	
    //ref.redrawView("null",-1); //redraw the points for the currently selected view
}
Scatterplot.prototype.transition = function(previous, next) {  
   var ref = this;
  /** if (next == ref.totalViews){ //Stop the recursion
       return;
   }  */ 
   this.widget.selectAll(".displayPoints")
	          .transition().duration(1200)
			 // .ease("linear")			 
	          .attrTween("cx",function (d){	
			           var interp = d3.interpolate(d.nodes[previous][0],d.nodes[next][0]);
						  return function (t){
						   return interp(t);
						  };
			        })
				 .attrTween("cy",function (d){	
			       	    var interp = d3.interpolate(d.nodes[previous][1],d.nodes[next][1]);
						  return function (t){
						   return interp(t);
						  };			 
	             })	;
                // .each("end", ref.transition((previous+1),(next+1)));				 
				 
}
////////////////////////////////////////////////////////////////////////////////
// Redraws the points on the scatterplot
// Note: 'id' is optional, only if a point should be highlighted (during drag)
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.redrawView = function(id,view) {     
     var displayView = this.currentView;
     if (view!=-1){
	    displayView = view;
	 } 
	 
    this.widget.selectAll(".displayPoints")
	          .transition().duration(400)
	           .attr("cx",function (d){	
			           return d.nodes[displayView][0];
			        })
				 .attr("cy",function (d){	
			        return d.nodes[displayView][1];					 
	             })
				 ; 
}

//Finds the interpolated value of the unknown y-coordinate
Scatterplot.prototype.findInterpY = function(x,x0,y0,x1,y1,mouseY){   
    if ((x1 - x0) == 0){
	   var interpY = mouseY; //TODO: change this because mouse could go out of bounds!
    }else {
	  var interpY = y0 + (y1 - y0)*((x - x0)/(x1 - x0));
	}	
	return interpY;
    
}
//Calculates the distance between two points
Scatterplot.prototype.calculateDistance = function(x1,y1,x2,y2){ 
    var term1 = x1 - x2;
    var term2 = y1 - y2;	
	var distance = Math.sqrt((term1*term1)+(term2*term2));
	return distance;    
}
//Checks if a mouse position is within bounds of a defined path
//Returns a point if the mouse position is equal to it or has crossed it
//Returns 'ok' if the mouse is within bounds
Scatterplot.prototype.checkBounds = function(pt1,pt2,mouse){ 
    var start,end;
	if (pt1>pt2){
	 end = pt1;
	 start = pt2;
	}else{
	  start = pt1;
	  end = pt2;
	}
	//Check if mouse is between path defined by (start,end)
	if (mouse < start){
	   return start;
	}else if (mouse >end){
	   return end;
	}
	return "ok";	
}
Scatterplot.prototype.showHintPath = function (id){      
	
	   this.widget.select("#p"+id)                                  
					.style("stroke", this.hintColour);     	
       this.widget.select("#gInner"+id).selectAll(".hintLabels")                                  
								  .style("fill", this.pointColour); 
        this.widget.selectAll(".displayPoints")
	           .transition().duration(400)
	           .style("fill-opacity", function (d){
			       if (d.id != id){
				      return 0.3;
				   }
			   }); 	      							  
}
Scatterplot.prototype.clearHintPath = function (id) {
    
      this.widget.select("#p"+id)                                  
				.style("stroke", "none");	 
     this.widget.select("#gInner"+id).selectAll(".hintLabels")                                  
				.style("fill", "none");	
     this.widget.selectAll(".displayPoints")	           
	           .style("fill-opacity", 1);				
}


