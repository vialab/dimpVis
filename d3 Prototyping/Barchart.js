 function Barchart(width,height,left,top,id,l,p){
   //Widget initializaton variables
   this.width = width;
   this.height = height;
   this.leftMargin = left;
   this.topMargin = top;
   this.id = id;
   this.padding = p; //Padding mainly for the axes
   this.widget = null; //Reference to svg container
   //Display variables
   this.displayData = null;
   this.barWidth = 50; 
   this.strokeWidth=5;   
   this.hintColour = "#aec7e8";
   this.fadeColour = "#c7c7c7";
   this.barColour = "steelblue";
   //View index tracker variables
   this.currentView = 0; //Starting view of the bars (first year)  
   this.nextView = 1; //Next view of the barchart
   this.numViews = l.length-1; //Last index in the heights sorted array
   //View information variables
   this.labels = l;
   this.numBars = 10; //Total number of bars (points along x-axis) in the dataset, hard code for debugging but change later!!!
   this.draggedBar = -1;  
   this.yPos = height-5;   
   this.hintPathSpacing = 20;
   //Event functions, all declared in main.js  
   this.placeholder = function() {}; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder; 
   this.clickHintLabelFunction = this.placeholder;   
   this.dragEvent = null;   
   this.lineGenerator = d3.svg.line()
					.x(function(d,i) { return this.findHintX(d[0],i,this.currentView); })
					.y(function(d) { return d[1]; })
					.interpolate("linear");
 }
 Barchart.prototype.init = function(){
    // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
       .attr("width", this.width+(this.padding*2))
      .attr("height", this.height+(this.padding*2))  
      .style("position", "absolute")
      .style("left", this.leftMargin + "px")
      .style("top", this.topMargin + "px")  
     .append("g")
	  .attr("transform", "translate(" + this.padding + "," + this.padding + ")");
      
 }
 Barchart.prototype.render = function(data){
      var ref = this;
	  this.displayData = data; 
	
	//Add the blur filter to the SVG so other elements can call it
	this.widget.append("svg:defs")
				.append("svg:filter")
			    .attr("id", "blur")
				.append("svg:feGaussianBlur")
				.attr("stdDeviation", 5); 
    //Create the scales 	  
	// var xScale = d3.scale.linear().domain([0,10]).range([0,ref.width]);   
     //var yScale =  d3.scale.linear().domain([10, 80]).range([ref.height,0]);	
	 var xScale = d3.scale.linear().domain([0,ref.numBars]).range([0,ref.width]);   
     var yScale =  d3.scale.linear().domain([0, 100000]).range([ref.height,0]);
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
		.attr("transform", "translate("+ref.padding+"," + ref.height + ")")
		.call(xAxis);

     // Add the y-axis
     this.widget.append("g")
			.attr("class", "axis")
			.attr("transform", "translate("+ ref.padding+ ",0)")
			.call(yAxis); 
	 
	 // Add an x-axis label
     this.widget.append("text")
		.attr("class", "axisLabel")			
		.attr("x", ref.width)
		.attr("y", ref.height+ref.padding)
		.text("country");

     // Add a y-axis label
	this.widget.append("text")
		.attr("class", "axisLabel")		       	
		.attr("x", 6)		
		.attr("transform", "rotate(-90)")
		.text("population");
 
this.widget.selectAll("rect")
    .data(this.displayData.map(function (d,i) {
             //Create a list of heights (y) for each country
			 //Dataset goes from 1955 to 2005 (11 increments)
			 //Try population:
			 var heights = [];		
             var data = [];			
			 //TODO: Change this later because 'x' is being repeated
            //Reason for doing this is for the hint path of heights		
            //Array format is: data[viewIndex] = [x of top of bar, y of top of bar, height of bar]	          		 
             data[0] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop1955/100000, d.Pop1955/100000];
			 data[1] = [xScale(i)+ref.padding+ref.strokeWidth,ref.yPos - d.Pop1960/100000, d.Pop1960/100000];
			 data[2] = [xScale(i)+ref.padding+ref.strokeWidth,ref.yPos - d.Pop1965/100000, d.Pop1965/100000];
			 data[3] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop1970/100000, d.Pop1970/100000];
			 data[4] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop1975/100000, d.Pop1975/100000];
			 data[5] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop1980/100000, d.Pop1980/100000];
			 data[6] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop1985/100000, d.Pop1985/100000];
			 data[7] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop1990/100000, d.Pop1990/100000];
			 data[8] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop1995/100000, d.Pop1995/100000];
			 data[9] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop2000/100000, d.Pop2000/100000];
			 data[10] = [xScale(i)+ref.padding+ref.strokeWidth, ref.yPos - d.Pop2005/100000, d.Pop2005/100000];
			 /**data[0] = [xScale(i), ref.yPos - yScale(d.Pop1955), yScale(d.Pop1955)];
			 data[1] = [xScale(i),ref.yPos - yScale(d.Pop1960), yScale(d.Pop1960)];
			 data[2] = [xScale(i),ref.yPos - yScale(d.Pop1965), yScale(d.Pop1965)];
			 data[3] = [xScale(i), ref.yPos - yScale(d.Pop1970), yScale(d.Pop1970)];
			 data[4] = [xScale(i), ref.yPos - yScale(d.Pop1975), yScale(d.Pop1975)];
			 data[5] = [xScale(i), ref.yPos - yScale(d.Pop1980), yScale(d.Pop1980)];
			 data[6] = [xScale(i), ref.yPos - yScale(d.Pop1985), yScale(d.Pop1985)];
			 data[7] = [xScale(i), ref.yPos - yScale(d.Pop1990), yScale(d.Pop1990)];
			 data[8] = [xScale(i), ref.yPos - yScale(d.Pop1995), yScale(d.Pop1995)];
			 data[9] = [xScale(i), ref.yPos - yScale(d.Pop2000), yScale(d.Pop2000)];
			 data[10] = [xScale(i), ref.yPos - yScale(d.Pop2005), yScale(d.Pop2005)];*/
          	
	        return {nodes:data,id:i,country:d.Country};
	  }))
     .enter()
	 .append("g")
	 .attr("class","gDisplayBars")
	  .attr("id", function (d){return "gDisplayBars"+d.id;});

	
	//Render the bars 
this.widget.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.nodes[ref.currentView][0];})
     .attr("y", function(d){ return d.nodes[ref.currentView][1];})
     .attr("width", ref.barWidth)
     .attr("height", function(d) { return d.nodes[ref.currentView][2]; })
	 .attr("fill", this.barColour)
	 .style("fill-opacity",1)	
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})
     .style("cursor", "ns-resize")	 
	.on("mouseover", ref.mouseoverFunction)
    .on("mouseout", ref.mouseoutFunction);

	
	this.widget.selectAll(".gDisplayBars").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner"); 
     
 }

 //Update height of dragged bar
 //Base of bar is ref.yPos, top of bar is ref.yPos - barHeight, as defined during data initialization
Barchart.prototype.updateDraggedBar = function (id,mouseY){
     var ref = this;
	 var currentHeight = -1;
	 console.log(ref.currentView+" "+ref.nextView);
     this.widget.select("#displayBars"+id)
	            .attr("height", function (d){
                    var current =  d.nodes[ref.currentView][1];
					var next = d.nodes[ref.nextView][1];
                    var bounds = ref.checkBounds(current,next,mouseY);					
                   if (ref.currentView ==0 && bounds == current){ //At lowest bar and out of bounds
					    return d.nodes[ref.currentView][2];
                    } else if (ref.nextView == ref.numViews && bounds==next){ //At the highest bar and out of bounds
					    return d.nodes[ref.nextView][2];
					}					
				    //Somewhere in the middle                       					
                    var yDiff = Math.abs(mouseY - ref.yPos); 
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
						    return current;
						}else if (bounds == next){ //Passed the next bar height, update tracker variables
						    ref.animateBars(mouseY,current,next,currentHeight,id);
						    ref.currentView = ref.nextView;
							ref.nextView++;						   
							return mouseY;                          						
						}
						//Otherwise, mouse is within bounds						
						ref.animateBars(mouseY,current,next,currentHeight,id);
						return mouseY;
						
                    } else if (ref.nextView == ref.numViews){ //At the highest bar
					    if (bounds == next){ //Passed highest, out of bounds
						   return next;
						}else if (bounds == current){ //Passed current, update tracker variables
						    ref.animateBars(mouseY,current,next,currentHeight,id);
						   ref.nextView = ref.currentView;
						   ref.currentView--;						   
						   return mouseY;                          				   
						}
						//Otherwise, mouse is in bounds
						 ref.animateBars(mouseY,current,next,currentHeight,id);
						 return mouseY;
					}else { //At a bar somewhere in  the middle
					   if (bounds == current){ //Passed current
					        ref.animateBars(mouseY,current,next,currentHeight,id);	
					        ref.nextView = ref.currentView;
							ref.currentView--;                            
							return mouseY;						
					   }else if (bounds ==next){ //Passed next
					       ref.animateBars(mouseY,current,next,currentHeight,id);					   
					       ref.currentView = ref.nextView;
						   ref.nextView++;                          
                           return mouseY;				   
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
	//Check if mouse is between path defined by (start,end)
	if (mouse < start){
	   return start;
	}else if (mouse >end){
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
	 this.widget.selectAll(".displayBars")	         
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
    this.widget.select("#p"+id).attr("d", function(d,i){										
								         return animateLineGenerator(d.nodes);
								  });											
	//Update the hint labels
   this.widget.select("#gInner"+id).selectAll("text")
									.attr("transform",function (d,i) {
									    var currentX = ref.findHintX(d[0],i,ref.currentView);
										var nextX = ref.findHintX(d[0],i,ref.nextView);
										var addedDistance = Math.abs(nextX - currentX)*distanceRatio;												       
										return "translate("+(currentX - addedDistance-10)+","+d[1]+")";								    
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
       this.widget.selectAll(".displayBars")
		          //.transition().duration(400)
		          .attr("height", function (d){				          
		                  return d.nodes[displayView][2];
		           })
				   .attr("y", function (d){
				         return d.nodes[displayView][1];
				   });	
	//Update the hint path							    
    this.widget.select("#p"+id)/**.transition().duration(500).ease("linear")*/.attr("d", function(d,i){ 
								         return ref.lineGenerator(d.nodes); 
								  });											
	//Update the hint labels
   this.widget.select("#gInner"+id).selectAll("text")
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
Barchart.prototype.animateAlongPath = function (newView){    
     this.currentView = newView;  
	 for (var j=0;j<=this.currentView;j++){
		 this.widget.selectAll(".displayBars")
					  .transition().duration(400)					  
					  .attr("height", function (d){	                             						  
							  return d.nodes[j][2];
					   })
					   .attr("y", function (d){
							 return d.nodes[j][1];
					   });  
	 }
	 
}
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
		this.widget.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill-opacity", function (d){
		                                           if (id != d.id)
												      return 0.4;
	                                        });				
    	
	//Render the hint path line									    
    this.widget.select("#gInner"+id).append("svg:path")
                                  .attr("d", function(d){                                         							  
								         return ref.lineGenerator(d.nodes); 
								  })
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", "steelblue")
								  .style("fill","none")								
								    .attr("filter", "url(#blur)");		
												
	//Render the hint labels
   this.widget.select("#gInner"+id).selectAll("text").data(d).enter()	                                     						  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })											 
												.attr("transform",function (d,i) {
												       if (i==ref.currentView){ //Don't want to rotate the label resting on top of the bar
													       return "translate("+ref.findHintX(d[0],i,ref.currentView)+","+d[1]+")";
													   }else{
															return "translate("+(ref.findHintX(d[0],i,ref.currentView)-10)+","+d[1]+")";
													   }
												})												
											   .attr("fill", "#666")
											   .on("click",this.clickHintLabelFunction)
											   .style("cursor", "pointer"); 
											   
}

//Clears hint info
 Barchart.prototype.clearHintPath = function (id){
        var ref = this;
        this.widget.select("#gInner"+id).selectAll("text").remove();  
        this.widget.select("#p"+id).remove();    		
		this.widget.selectAll(".displayBars").style("fill-opacity", 1);	       								  
 }

