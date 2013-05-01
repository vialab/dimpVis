/** Constructor for a barchart visualization
 * x: the left margin
 * y: the right margin
 * w: width of the svg container
 * h: height of the svg container
 * id: id of the div tag to append the svg container
 * p: a padding value, to format the axes
 * xLabel: label for the x-axis
 * yLabel: label for the y-axis
 * title: of the graph
 */
 function Barchart(width,height,x,y,id,p,xLabel,yLabel,title){
   // Position and size attributes for drawing the svg
   this.width = width;
   this.height = height;
   this.leftMargin = x;
   this.topMargin = y;
   this.id = id;
   this.padding = p;
   this.xLabel = xLabel;
   this.yLabel = yLabel;
   this.graphTitle = title;
   this.hintLabels = []; //To store the labels for the hint path
   this.xLabels = []; //To store the labels along the x-axis

   //Set up some display properties
   this.svg = null; //Reference to svg container
   this.displayData = null; //To store the data set to be visualized
   this.barWidth = 50; 
   this.strokeWidth=5;
   this.hintPathSpacing = 30; //Amount of horizontal distance between labels on hint path
   this.base = height-5; //Starting y-position of the bars (the base)

   //Default graph colours, can be changed by called the setColours() function
   this.hintColour = "#aec7e8";
   this.axisColour = "#c7c7c7";
   this.barColour = "#74c476";

   //View index tracker variables
   this.currentView = 0; //Starting view of the bars (first year)  
   this.nextView = 1; //Next view of the barchart
   this.lastView = -1;
   this.interpValue=0;
   this.mouseY = -1;
   this.numBars = 0;

   //Set up some event functions, all declared in main.js
   this.placeholder = function() {};
   this.clickHintLabelFunction = this.placeholder;   
   this.dragEvent = null;
   this.draggedBar = -1;

    //Line function for drawing the hint path
   this.lineGenerator = d3.svg.line()
					.x(function(d,i) { return this.findHintX(d[0],i,this.currentView); })
					.y(function(d) { return d[1]; })
					.interpolate("linear");
 }
/**Customize the display colours of the barchart, to change the default
 * barCol: The colour of the points
 * hintCol: The colour of the hint path
 * axisCol: The colour of the axes
 * */
Barchart.prototype.setColours = function(barCol, hintCol, axisCol){
    this.hintColour = hintCol;
    this.barColour = barCol;
    this.axisColour = axisCol;
}
/** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
 Barchart.prototype.init = function(){
    //Draw the main svg
   this.svg = d3.select(this.id).append("svg")
       .attr("width", this.width+(this.padding*2))
      .attr("height", this.height+(this.padding*2))  
      .style("position", "absolute")
      .style("left", this.leftMargin + "px")
      .style("top", this.topMargin + "px")  
      .append("g")
	  .attr("transform", "translate(" + this.padding + "," + this.padding + ")");
     //Add the blur filter to the SVG so other elements can call it
    this.svg.append("svg:defs")
         .append("svg:filter")
         .attr("id", "blur")
         .append("svg:feGaussianBlur")
         .attr("stdDeviation", 5);

 }
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * start: The starting view of the visualization, as an index into the labels array
 * hLabels: A list of labels for the hint path, indicating all the different views of the visualization
 *
 * Data MUST be provided in the following array format:
 * n is the number of views (or number of labels on the hint path)
 * Object{"heights":{h1,h2...hn},
 *        "label":"name of data bar" (to appear on the x-axis)
 *       }
 *       ..... number of bars
 * */
 Barchart.prototype.render = function(data,start,hLabels){
      var ref = this;
     //Save some values
	  this.displayData = data; 
	  this.hintLabels = hLabels;
      this.numBars = hLabels.length;
      this.currentView = start;
      this.lastView = hLabels.length-1;

     //Resolve the index value for the next view (e.g., if currentView is 0, then nextView should be set to 1)
     if (this.currentView ==0){
         this.nextView = this.currentView+1;
     }else if (this.currentView == this.lastView){
         this.nextView = this.currentView;
         this.currentView = this.currentView -1;
     }else {
         this.nextView = this.currentView + 1;
     }
     //Find the max and min values of the heights, used to scale the axes and the dataset
     var max_h = d3.max(data.map(function (d){return d3.max(d.heights);}));
     var min_h = d3.min(data.map(function (d){return d3.min(d.heights);}));

    //Create the scales
	 var xScale = d3.scale.linear().domain([0,ref.numBars]).range([0,ref.width]);   
     var yScale =  d3.scale.linear().domain([min_h, max_h]).range([ref.height,0]);

//Assign data values to a set of rectangles representing the bars of the chart
this.svg.selectAll("rect")
    .data(this.displayData.map(function (d,i) {
            //Need to adjust the dataset to contain y-positions and heights
            //Array format is: data[viewIndex] = [y of top of bar, height of bar]
            var data = [];
            for (var j=0;j< d.heights.length;j++){
                data[j] = [ref.base - yScale(d.heights[j]),yScale(d.heights[j])];
            }
	        return {nodes:data,id:i,label:d.label,xPos:xScale(i)+ref.padding+ref.strokeWidth};
	  }))
     .enter().append("g").attr("class","gDisplayBars")
	 .attr("id", function (d){return "gDisplayBars"+d.id;});

   //Save the labels for the x-axis
   this.xLabels = this.svg.selectAll(".gDisplayBars").data().map(function (d){return d.label});
   //Draw the axes
   this.drawAxes(xScale,yScale);

  //Draw the bars
   this.svg.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.xPos;})
     .attr("y", function(d){ return d.nodes[ref.currentView][0];})
     .attr("width", this.barWidth)
     .attr("height", function(d) { return d.nodes[ref.currentView][1]; })
	 .attr("fill", this.barColour)
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})
     .style("cursor", "pointer");

	//Add a blank g element to each bar, to contain its hint path
	this.svg.selectAll(".gDisplayBars").append("g")
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");
 }
/** Draws the axes  and the graph title on the SVG
 *  xScale: a function defining the scale of the x-axis
 *  yScale: a function defining the scale of the y-axis
 * */
Barchart.prototype.drawAxes = function (xScale,yScale){
    var ref = this;
    //Define the axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    // Add the x-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", this.width+this.padding)
        .attr("y", this.height+this.padding-10)
        .style("fill",this.axisColour)
        .text(this.xLabel);

    // Add the y-axis label
    this.svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", 6)
        .attr("transform", "rotate(-90)")
        .style("fill",this.axisColour)
        .text(this.yLabel);

    // Add the y-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+ this.padding+ ",0)")
        .call(yAxis);

    //Add the x-axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate("+this.padding+"," + this.height + ")")
        .call(xAxis)
        .selectAll("text")
        .text(function (d) {return ref.xLabels[d];})
        .style("text-anchor", "end")
        .attr("transform", "rotate(-65)");

    //Colour the axes and labels
    this.svg.selectAll(".axis path").style("stroke",this.axisColour);
    this.svg.selectAll(".axis line").style("stroke",this.axisColour);
    this.svg.selectAll(".axis text").style("fill",this.axisColour);
}
/** Re-draws the dragged bar by altering it's height according to the dragging amount
 *  As the bar is dragged, the view variables are updated and the rest
 *  of the bars are animated
 *  id: The id of the dragged bar, for selecting by id
 *  mouseY: The y-coordinate of the mouse, received from the drag event
 *
 *  Recall: the base of every bar is at this.base, therefore top of the bar is this.base-barHeight
 * */
 //TODO: Get rid of this repeated code
Barchart.prototype.updateDraggedBar = function (id,mouseY){
     var ref = this;
    //Save the mouse coordinate
    this.mouseY = mouseY;

	 var currentHeight = -1;
	 console.log(ref.currentView+" "+ref.nextView);
     this.svg.select("#displayBars"+id)
	            .attr("height", function (d){
                    var current =  d.nodes[ref.currentView][1];
					var next = d.nodes[ref.nextView][1];
                    var bounds = ref.checkBounds(current,next,mouseY);					
                   if (ref.currentView ==0 && bounds == current){ //At lowest bar and out of bounds
					    return d.nodes[ref.currentView][2];
                    } else if (ref.nextView == ref.numViews && bounds==next){ //At the highest bar and out of bounds
					    return d.nodes[ref.nextView][2];
					}else { //Somewhere in the middle
				     if (bounds == current){ //Passed current					    
					    return d.nodes[ref.currentView][2];
					 }else if (bounds == next){ //Passed next			    
					    return d.nodes[ref.nextView][2];
					 }
				 }				
				    //Somewhere in the middle                       					
                    var yDiff = Math.abs(mouseY - ref.base);
					var barHeight = d.nodes[ref.currentView][2];								
					if (mouseY > current)
					   yDirection = -1;
					else 
					    yDirection = 1; 
                    
					currentHeight = (barHeight + yDirection*Math.abs(yDiff - barHeight));						
				    return currentHeight; 
				})
				.attr("y", function(d){ 
				    var current =  d.nodes[ref.currentView][1];
					var next = d.nodes[ref.nextView][1];
                    var bounds = ref.checkBounds(current,next,mouseY);					
                    if (ref.currentView ==0){ //At lowest bar
					    if (bounds == current){ //Passed lowest bar, out of bounds
						   console.log("out of bounds");
						    return current;
						}else if (bounds == next){ //Passed the next bar height, update tracker variables
						    //ref.animateBars(mouseY,current,next,currentHeight,id);
						    ref.currentView = ref.nextView;
							ref.nextView++;						   
							return next;                          						
						}
						//Otherwise, mouse is within bounds						
						ref.animateBars(mouseY,current,next,currentHeight,id);
						return mouseY;
						
                    } else if (ref.nextView == ref.numViews){ //At the highest bar
					    if (bounds == next){ //Passed highest, out of bounds
						   return next;
						}else if (bounds == current){ //Passed current, update tracker variables
						    //ref.animateBars(mouseY,current,next,currentHeight,id);
						   ref.nextView = ref.currentView;
						   ref.currentView--;						   
						   return current;                          				   
						}
						//Otherwise, mouse is in bounds
						 ref.animateBars(mouseY,current,next,currentHeight,id);
						 return mouseY;
					}else { //At a bar somewhere in  the middle
					   if (bounds == current){ //Passed current
					        //ref.animateBars(mouseY,current,next,currentHeight,id);	
					        ref.nextView = ref.currentView;
							ref.currentView--;                            
							return current;						
					   }else if (bounds ==next){ //Passed next
					       //ref.animateBars(mouseY,current,next,currentHeight,id);					   
					       ref.currentView = ref.nextView;
						   ref.nextView++;                          
                           return next;				   
					   }						
					   //Within bounds
					   ref.animateBars(mouseY,current,next,currentHeight,id);
					   return mouseY;
                   }	                    
				});	
}
//Checks if a mouse position is within bounds of a defined path
//Returns a point if the mouse position is equal to it or has crossed it
//Returns 'ok' if the mouse is within bounds
Barchart.prototype.checkBounds = function(pt1,pt2,mouse){ 
    var start,end;
	if (pt1>pt2){
	 end = pt1;
	 start = pt2;
	}else{
	  start = pt1;
	  end = pt2;
	}
	console.log("my "+mouse+"start "+start+" end "+end);
	//Check if mouse is between path defined by (start,end)
	if (mouse <= start){
	   return start;
	}else if (mouse >=end){
	   return end;
	}
	return "ok";	
}
//Animates the rest of the bars while one is being dragged
//TODO: Refactor this function, lots of repetition, consider using "each"
Barchart.prototype.animateBars = function (mouseY,current,next,height,id){
    var ref = this;   
    //Determine the percentage dragged vertically between current and next
	  var distanceTravelled = Math.abs(mouseY-current);
	  var totalDistance = Math.abs(next - current);
	  var distanceRatio = distanceTravelled/totalDistance;      
	  ref.interpValue = distanceRatio;
	 this.svg.selectAll(".displayBars")
		          .attr("height", function (d){	
                          if (d.id != id){
						      var current =  d.nodes[ref.currentView][1];
					          var next = d.nodes[ref.nextView][1];
							  var addedHeight = Math.abs(next - current)*distanceRatio;
						      return d.nodes[ref.currentView][2] + addedHeight;
						  }	
                          return height;						  
		           })
				  .attr("y", function (d){				         
				         if (d.id != id){
						   var current =  d.nodes[ref.currentView][1];
					       var next = d.nodes[ref.nextView][1];
						   var addedHeight = Math.abs(next - current)*distanceRatio;						     
						   return current - addedHeight;
						 }	  
                         return mouseY;						 
				   });
    //Update the hint path	
    var animateLineGenerator = d3.svg.line()
								.x(function(d,i) { 
									  var currentX = ref.findHintX(d[0],i,ref.currentView);
									  var nextX = ref.findHintX(d[0],i,ref.nextView);
									  var addedDistance = Math.abs(nextX - currentX)*distanceRatio;								
									return currentX - addedDistance;											       
								  })
								.y(function(d) { return d[1]; })
								.interpolate("linear"); 
    this.svg.select("#p"+id).attr("d", function(d,i){
								         return animateLineGenerator(d.nodes);
								  });											
	//Update the hint labels
   this.svg.selectAll(".hintLabels")
									.attr("transform",function (d,i) {
									    var currentX = ref.findHintX(d[0],i,ref.currentView);
										var nextX = ref.findHintX(d[0],i,ref.nextView);
										var addedDistance = Math.abs(nextX - currentX)*distanceRatio;												       
										return "translate("+(currentX - addedDistance-10)+","+d[1]+")";								    
									});			   
	 
}
//A function meant only to interface with other visualizations or the slider
//Given an interpolation value, move all bars accordingly between the view 'current' and 'next'
Barchart.prototype.updateBars = function(interpValue,currentI,nextI){  
   this.svg.selectAll(".displayBars")
		          .attr("height", function (d){	                       
						      var current =  d.nodes[currentI][1];
					          var next = d.nodes[nextI][1];
							  var addedHeight = Math.abs(next - current)*interpValue;
						      return d.nodes[currentI][2] + addedHeight;					  
                          						  
		           })
				  .attr("y", function (d){			         
						   var current =  d.nodes[currentI][1];
					       var next = d.nodes[nextI][1];
						   var addedHeight = Math.abs(next - current)*interpValue;						     
						   return current - addedHeight;
						 					 
				   });		
 
}
 //Redraws the barchart view 
 //This function does not update any tracker variables
Barchart.prototype.redrawView = function (view,id){   
       var ref = this;   
       var displayView = this.currentView;
       if (view!=-1){
	     displayView = view;
	    }	   
       this.svg.selectAll(".displayBars")
		          //.transition().duration(400)
		          .attr("height", function (d){				          
		                  return d.nodes[displayView][2];
		           })
				   .attr("y", function (d){
				         return d.nodes[displayView][1];
				   });	
	//Update the hint path							    
    this.svg.select("#p"+id)/**.transition().duration(500).ease("linear")*/.attr("d", function(d,i){
								         return ref.lineGenerator(d.nodes); 
								  });											
	//Update the hint labels
   this.svg.select("#gInner"+id).selectAll("text")
                                   /** .transition().duration(500).ease("linear")*/
								   .attr("transform",function (d,i) {
												       if (i==ref.currentView){ //Don't want to rotate the label resting on top of the bar
													       return "translate("+ref.findHintX(d[0],i,displayView)+","+d[1]+")";
													   }else{
															return "translate("+(ref.findHintX(d[0],i,displayView)-10)+","+d[1]+")";
													   }
												});
									
																						
											 
}
//Updates the tracker variables according to the new view
//Then calls the redraw function to update the display
Barchart.prototype.changeView = function (newView){    
     this.currentView = newView;  
     this.redrawView(-1,-1); 
}
//Animates the barchart sequentially by year based on a clicked year
//Doesn't work! How to do chained transitions?
/**Barchart.prototype.animateAlongPath = function (newView){    
     this.currentView = newView;  
	 for (var j=0;j<=this.currentView;j++){
		 this.svg.selectAll(".displayBars")
					  .transition().duration(400)					  
					  .attr("height", function (d){	                             						  
							  return d.nodes[j][2];
					   })
					   .attr("y", function (d){
							 return d.nodes[j][1];
					   });  
	 }
	 
}*/
//Calculates the x-values for the moving hint path x-coordinates
Barchart.prototype.findHintX = function (oldX,index,view){
    return (oldX+this.barWidth/2+(index*this.hintPathSpacing))-view*this.hintPathSpacing;
}
//Snaps to the nearest view (in terms of mouse location distance and the bar being dragged)
Barchart.prototype.snapToView = function (id, mouseY,nodes){
       var ref = this;    
	   var current =  nodes[ref.currentView][1];
	   var next = 	nodes[ref.nextView][1];
	   var currentDist = Math.abs(current - mouseY);
	   var nextDist = Math.abs(next - mouseY);
	   if (currentDist > nextDist && ref.nextView != ref.numViews){ //Passed next, advance the variables forward
			//Make sure the nextView wasn't the last one to avoid index out of bounds
			ref.currentView = ref.nextView;
			ref.nextView++;	          				                    				
		}
      if (ref.nextView == ref.numViews){
	      ref.redrawView((ref.currentView+1),id);		
       }else{
	      ref.redrawView(-1,id);		
       }	   
      		
}
//Displays hint info
Barchart.prototype.showHintPath = function (id,d){    
        var ref = this;      
		this.svg.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill-opacity", function (d){
		                                           if (id != d.id)
												      return 0.4;
	                                        });				
    	
	//Render the hint path line									    
    this.svg.select("#gInner"+id).append("svg:path")
                                  .attr("d", function(d){                                         							  
								         return ref.lineGenerator(d.nodes); 
								  })
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", "steelblue")
								  .style("fill","none")								
								    .attr("filter", "url(#blur)");		
												
	//Render the hint labels
   this.svg.select("#gInner"+id).selectAll("text").data(d).enter()
								            .append("svg:text")
                                            .text(function(d,i) { return ref.hintLabels[i]; })
												.attr("transform",function (d,i) {
												       if (i==ref.currentView){ //Don't want to rotate the label resting on top of the bar
													       return "translate("+ref.findHintX(d[0],i,ref.currentView)+","+d[1]+")";
													   }else{
															return "translate("+(ref.findHintX(d[0],i,ref.currentView)-10)+","+d[1]+")";
													   }
												})												
											   .attr("fill", "#666")
											   .on("click",this.clickHintLabelFunction)
											   .style("cursor", "pointer")
											   .attr("class","hintLabels"); 
											   
}

//Clears hint info
 Barchart.prototype.clearHintPath = function (id){
        var ref = this;
        this.svg.select("#gInner"+id).selectAll("text").remove();
        this.svg.select("#p"+id).remove();
		this.svg.selectAll(".displayBars").style("fill-opacity", 1);
 }

