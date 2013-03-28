 function Piechart(width,height,x,y, radius,id,l){
   //Widget initializaton variables
   this.width = width;
   this.height = height;
   this.xPos = x;
   this.yPos = y;
   this.cx = width/3; //Center of the piechart
   this.cy = height/3;
   this.id = id;
   this.radius = radius;
   this.labelOffset = radius+10;
   this.widget = null; //Reference to svg container
   //Display variables
   this.displayData = null;    
   this.hintLabelColour = "#7f7f7f";
   this.hintColour = "steelblue";
   this.colourScale = d3.scale.category20c();
   //View index tracker variables
   this.currentView = 0; //Starting view of the piechart (first year)
   this.nextView = 1;    
   this.startAngle = [];//Used for initializing angles for the first time
   this.endAngle = [];
   this.nextAngles = []; //An array for each segment which stores the previous angle (used for interpolation in animateSegments()) 
   this.currentAngles = [];     
   this.dragStartAngle = 0;  //The starting angle for the pie segment being dragged
   this.interpValue=0;
   //View information variables
   this.labels = l;
   this.numArcs = -1; //Total number of arcs in the piechart
   this.numViews = l.length;
   //Constants for calculations involving PI
   this.pi = Math.PI;
   this.halfPi = Math.PI/2;
   this.twoPi = Math.PI*2;
   
   //Event functions, all declared in main.js  
   this.placeholder = function() {}; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder;  
   this.dragEvent = null; 
  //Function for drawing the arc segments   
   this.arcGenerator = d3.svg.arc()
                       .innerRadius(0)
	                   .outerRadius(this.radius)					   
					   .startAngle(function (d) {                          
							return d.startAngle;
					   })
					   .endAngle(function (d) { 				        													
							return d.endAngle; 
					   });	
}
 // Initialize the main svg container
 Piechart.prototype.init = function(){    
   this.widget = d3.select(this.id).append("svg")      
      .attr("width", this.width)
      .attr("height", this.height)
      .style("position", "absolute")
      .style("left", this.xPos + "px")
      .style("top", this.yPos + "px")  
     .append("g")   
     
   ;     
 }
 Piechart.prototype.render = function(data){
      var ref = this;
	  this.displayData = data;
	  this.numArcs = data.length-1;
	  //Initialize all angle tracker variables to 0, assuming the order of the piechart segments never changes (e.g., no sorting of angle values)
	  //TODO: might move this to init
	  for (var j=0;j<this.numViews;j++){
	      this.startAngle[j] = 0;
		  this.endAngle[j] = 0;
		  this.nextAngles[j] = [];
		  this.currentAngles[j] = [];		  
	  }
	//Add the blur filter to the SVG so other elements can call it
	this.widget.append("svg:defs")
				.append("svg:filter")
			    .attr("id", "blur")
				.append("svg:feGaussianBlur")
				.attr("stdDeviation", 3);
	 var currentAngleSum = nextAngleSum = 0;
	 //Here, each "d" node represents a view
	this.widget.selectAll("path")
                 .data(this.displayData.map(function (d,i) {                     					  
                      //An array of all start and end angles for each view
					  //Format: allAngles[] = {angle-value of actual angle} angles in rads
                      var allValues = [];
                      var aSorted = [];  
					  var hintArcValues = [];
                    var hintArcDirections = []; //Indicators of when to start changing the drawing direction of the hint path			  
					  var flag = 1;	//Tracks increasing or decreasing segments
                      var currentSegment = 0; //index to indicate which years are drawn on the same hint arc					  
					  for (var j=0;j< ref.numViews;j++){				   
						  ref.endAngle[j] += d.values[j] * ref.twoPi;					
						  allValues[j] =  ref.endAngle[j] - ref.startAngle[j];  //End-Start	                                  						  
						  ref.startAngle[j] += d.values[j] * ref.twoPi;                          
						 if (j>0){
						     if ((allValues[j] - allValues[j-1])>0){ //increasing
							    if (flag ==0){ //Was previously decreasing, direction changed
								   currentSegment++;
								   flag = 1;	
                                  hintArcDirections[j] = 1;						   
								}else{
								   hintArcDirections[j] = 0;
								}
								hintArcValues[j] = [allValues[j],currentSegment];				    
							 }else{ //decreasing
							    if (flag==1){	//Was previously increasing, direction changed							
								  flag=0;
								  currentSegment++;
								  hintArcDirections[j] = 1;
								}else{
								   hintArcDirections[j] = 0;
								}
                                hintArcValues[j] = [allValues[j],currentSegment];				    
							 }
						  }else{ //Add the first angle (special case)						      
							  hintArcValues[j] = [allValues[j],currentSegment];
							  hintArcDirections[j] = 0;
						  }
						  
					  } 
				  
                      //TODO:Don't need sorted array anymore, remove this 					  
                       //Sort the array of angles, ascending order, separate array for this because it's easier to look up by index					  
					  //ref.sortAngles(aSorted);
					  //Assign values to start and end angles corresponding to the current view
					   var sAngle = currentAngleSum;
					   var eAngle = sAngle + allValues[ref.currentView];
					   currentAngleSum += allValues[ref.currentView];   
                       //Save the previous angles and initialize the inner arrays
                       ref.currentAngles[i][0] = sAngle;
                       ref.currentAngles[i][1] = eAngle;
                       ref.nextAngles[i][0] = nextAngleSum;
					   ref.nextAngles[i][1] = nextAngleSum + allValues[ref.nextView];
					   nextAngleSum += allValues[ref.nextView]; 
	                  return {nodes:allValues,cluster:d.label,id:i,startAngle:sAngle,endAngle:eAngle,outerRadius:ref.radius,
					  colour:ref.colourScale(i),hArcs:hintArcValues,hDirections:hintArcDirections};
	              }))
				 .enter()
                 .append("g")				
                 .attr("class","gDisplayArcs");

 //Render the pie segments               				 
this.widget.selectAll(".gDisplayArcs").append("path")
				 .attr("fill",function (d){return d.colour;})
				 .style("fill-opacity", 1)
				 .style("stroke","white")
				 .style("stroke-width",2)
				 .attr("class","displayArcs")
				 .attr("transform", "translate(" + this.cx + "," + this.cy + ")")	 
				 .attr("id", function (d) {return "displayArcs"+d.id;})	                			 
				 .attr("class","DisplayArcs")
				 .attr("d", function (d) {return ref.arcGenerator(d);})
				/** .append("text")
				 .attr("transform", function (d,i){											        
						return "translate(" + arc.centroid(d) + ")"; 													
				})                                          												
				 .attr("fill", ref.hintLabelColour)				 
				 .text("Test")*/
				  ;
				 //.text(function(d){return d.label;});
//Add a g element to contain the hint info		
this.widget.selectAll(".gDisplayArcs").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");
//DEBUG: Trying to find the center point of the piegraph
//this.widget.selectAll(".gDisplayArcs").append("circle").attr("cx",-this.xPos).attr("cy",-this.yPos).attr("r",10);

 
 }

 //Updates the angle of a dragged pie segment
Piechart.prototype.updateDraggedSegment = function (id,mouseX, mouseY){
     var ref = this;
	 //console.log(ref.currentView+" "+ref.nextView);
     this.widget.select("#displayArcs"+id)
	            .attr("d", function (d) {
                    // console.log(ref.currentAngles+" "+ref.nextAngles);					
                    d.startAngle = ref.dragStartAngle;                  	                 		
					var adj = mouseX - ref.cx;
					var opp = ref.cy - mouseY;	                
                    var angle = Math.atan2(adj,opp);             					
                    if (angle < 0){		//Moved to the other side of the circle, make the angle positive			   
					   angle = (ref.pi - angle*(-1))+ref.pi;					    
					}
                     angle = angle - ref.dragStartAngle;					
				     d.endAngle = ref.dragStartAngle + angle;					
                    //TODO: Still doesn't work when angle wraps around 360, start and end angles drawn different ways					 
					 /**if (ref.dragStartAngle + d.angles[d.angles.length-1][0] > ref.twoPi){ //Detect if the angle will cross over 360 degrees
						 if (Math.atan2(adj,opp) > 0){ //when the angle becomes positive, moves to the other side of the circle and crosses over 360						     
							 d.endAngle = ref.twoPi  + Math.atan2(adj,opp);
							 endAngle = d.endAngle - ref.twoPi;							
							//console.log(d.endAngle*180/Math.PI+" "+(endAngle*180/Math.PI));
                         }						 
				     }*/
					 //console.log(ref.currentView+" "+ref.nextView);
                     var current = ref.dragStartAngle + d.nodes[ref.currentView];
                     var next = ref.dragStartAngle + d.nodes[ref.nextView];	
					 var bounds = ref.checkBounds(current,next,d.endAngle);
					//console.log(" view"+ref.currentView+"current "+ref.currentViewIndex+"next "+ref.nextViewIndex+" computed "+d.endAngle+" sorted angles: "+d.angles+"unsorted angles "+d.nodes);
                     if (ref.currentView == 0) {  //At the smallest angle closest to the start angle
					    if (bounds == current){ //Passed the smallest angle, out of bounds
						   d.endAngle = current;                                                  						   
						   return ref.arcGenerator(d);
						}else if (bounds == next){ //Passed the next angle, update the tracker variables
						    ref.currentView = ref.nextView;
							ref.nextView++;							
                            ref.updateAngles(ref.dragStartAngle,ref.currentView,ref.nextView);                            					
                            return ref.arcGenerator(d);							
						}				  
						//Otherwise, dragged angle is in bounds								
						 ref.animateSegments(d.id,d.endAngle,current,next);
						return ref.arcGenerator(d);
                     } else if (ref.nextView == ref.numArcs){ //At the largest end angle
					    if (bounds == next) { //Passed the largest end angle, out of bounds
						   d.endAngle = next;						  					   
						   return ref.arcGenerator(d);
						}else if (bounds == current){ //Passed the current angle, update the tracker variables
						  ref.nextView = ref.currentView;
						  ref.currentView--;					  
                          ref.updateAngles(ref.dragStartAngle,ref.currentView,ref.nextView);                      		  
                          return ref.arcGenerator(d);						  
						}
						//Otherwise, dragged angle is in bounds
						ref.animateSegments(d.id,d.endAngle,current,next);
						return ref.arcGenerator(d);
                     }	else { //At an angle somewhere in between the largest and smallest
					      if (bounds == current){ //Passed current
						      ref.nextView = ref.currentView;
							  ref.currentView--;						
                               ref.updateAngles(ref.dragStartAngle,ref.currentView,ref.nextView);                           						  
                              return ref.arcGenerator(d);									  
						  } else if (bounds ==next){ //Passed next
						     ref.currentView = ref.nextView;
							 ref.nextView++;							
							 ref.updateAngles(ref.dragStartAngle,ref.currentView,ref.nextView);	                            							 
                             return ref.arcGenerator(d);									 
						  }
						  //Otherwise, within bounds
						  ref.animateSegments(d.id,d.endAngle,current,next);
						  return ref.arcGenerator(d);
                     } 	
                  	 
                    //console.log("angle: "+(angle*180/Math.PI)+" endangle "+(d.endAngle*180/Math.PI));			
				    
				});	            
}

Piechart.prototype.checkBounds = function(angle1,angle2,endAngle){ 
    var start,end;
	if (angle1>angle2){
	 end = angle1;
	 start = angle2;
	}else{
	  start = angle1;
	  end = angle2;
	}
	//console.log("my "+mouse+"start "+start+" end "+end);
	//Check if mouse is between path defined by (start,end)
	if (endAngle <= start){
	   return start;
	}else if (endAngle >=end){
	   return end;
	}
	return "ok";	
}
//Updates the next and current arrays used for animating segments to make sure interpolation is always between two views
//TODO: shouldn't be saving these angles in an array..change to become actual attribute of the data
Piechart.prototype.updateAngles = function (start,current,next){
  var ref = this;
  var sumCurrent = sumNext = start;
   this.widget.selectAll(".DisplayArcs").each(function (d){
         //Update for the current view		 
          ref.currentAngles[d.id][0] = sumCurrent;		 
		  ref.currentAngles[d.id][1] = sumCurrent + d.nodes[current];         
		  sumCurrent += d.nodes[current];   
		 //Update for the next view
		  ref.nextAngles[d.id][0] = sumNext;
		  ref.nextAngles[d.id][1] = sumNext + d.nodes[next];         
		  sumNext += d.nodes[next]; 
   });
   
}
//Animates (or resizes) other segments while a segment is being dragged
Piechart.prototype.animateSegments = function (id,mouseAngle,current,next){
    var ref = this;	
   
	//ref.saveAngles();
	//Determine how much distance was travelled by the dragged segment and the total distance its endAngle can move
	var travelled = Math.abs(mouseAngle - current);
	var total = Math.abs(next - current);	    
    var ratio = travelled/total; 
    ref.interpValue = ratio;
	var angleSumStart = ref.dragStartAngle;
	var angleSumEnd = current;	
	//console.log(current+" "+travelled);	
	this.widget.selectAll(".DisplayArcs")	            
	            .attr("d", function (d) {                                				   
                    if (d.id != id){
      					var interpolator = d3.interpolate({startAngle:ref.currentAngles[d.id][0],endAngle:ref.currentAngles[d.id][1]},{startAngle:ref.nextAngles[d.id][0],endAngle:ref.nextAngles[d.id][1]});
					    var newAngle = interpolator(ratio);
						d.endAngle = newAngle.endAngle;
						d.startAngle = newAngle.startAngle;  
						 
                    }                  
                        return ref.arcGenerator(d);					   
				});
	
	
var savedRadii = []; //TODO: Shouldn't need to save by array
//Update the hint path
//TODO: Lots of repeated code here! outer and inner radius
//***Should only have to update inner and outer radius, since angles will stay the same	 
   var animateHintArcs = d3.svg.arc()
	                   .outerRadius(function (d,i) {
                            var current = ref.findHintRadius(i,ref.currentView);
							var next = ref.findHintRadius(i,ref.nextView);
							var addedRadius = Math.abs(next-current)*ratio;
							//console.log(current+" "+next+" "+addedRadius);
                            savedRadii[i] = current-addedRadius							
							return current-addedRadius;
					   })
					   .innerRadius(function (d,i) {
						    var current = ref.findHintRadius(i,ref.currentView);
							var next = ref.findHintRadius(i,ref.nextView);
							var addedRadius = Math.abs(next-current)*ratio;
							return current-addedRadius;
						}) 
					   .startAngle(function (d) {                            						
							return ref.dragStartAngle;
					   })
					   .endAngle(function (d) { 					       											
							return d + ref.dragStartAngle;			
		               });
    this.widget.selectAll(".hintArcs")
                .attr("d", function (d,i) {return animateHintArcs(d,i) });
   			
	//Update the hint labels	
  this.widget.selectAll(".hintLabels")
			  .attr("transform",function (d,i) {															
					var newAngle = ref.dragStartAngle + d;																									
					if (newAngle > ref.twoPi){ //Special case when angle wraps around
							newAngle = newAngle - ref.twoPi;
					}	
                    var r = savedRadii[i];										
					var x = ref.cx + r*Math.cos(newAngle - ref.halfPi);
				    var y = ref.cy+ r*Math.sin(newAngle - ref.halfPi);													
					return "translate("+x+","+y+")";																	    
				});	
}
//Snaps to the nearest view (in terms of mouse location and the segment being dragged)
//id: dragged segment id, mouseAngle: the last angle computed for the dragged segment before the drag event ended
// allAngles: the array of all angles for the dragged segment (shouldn't really need to pass this, seems inefficient)
Piechart.prototype.snapToView = function (id,mouseAngle,allAngles){
       var ref = this;    
	   var current =  ref.dragStartAngle + allAngles[ref.currentView];
	   var next = ref.dragStartAngle + allAngles[ref.nextView];
	  //console.log("BEFORE SNAP: next "+next+", "+ref.nextView+" current "+current+" ,"+ref.currentView+"mouse "+mouseAngle);	 	  
	   var currentDist = Math.abs(current - mouseAngle);
	   var nextDist = Math.abs(next - mouseAngle);
	  
	   if (currentDist>nextDist && ref.nextView != ref.numArcs){ //Passed next, advance the variables forward
			//Make sure the nextViewIndex wasn't the last one to avoid index out of bounds
			ref.currentView = ref.nextView;
			ref.nextView++;  
            ref.redrawView(-1,id);			
		}else if (ref.nextView == ref.numArcs){
	      ref.redrawView((ref.currentView+1),id);		
       }else{
	      ref.redrawView(-1,id);		
       }    		
}
//Responds to the snapping of the slider tick
//newView: is the view to draw
Piechart.prototype.changeView = function (newView){
  var ref = this;
   if (newView == ref.numArcs){
       this.currentView = newView-1;
	   this.nextView = newView;	   
   }else {
	   this.currentView = newView;
	   this.nextView = newView+1;	   
   }
    //Redraw the piechart
   /** this.widget.selectAll(".DisplayArcs")
	             //.transition().duration(400)
	            .attr("d", function (d) {                               				   
                    if (d.id != id){					 
					   if (d.id < id){ //segments rendered before the dragged segment
					      d.endAngle = angleSumStart;
						  d.startAngle = d.endAngle - d.nodes[displayView];
						  angleSumStart += d.nodes[displayView];											  
					   }else{ //segments rendered after the dragged one
					      d.startAngle = angleSumEnd;
						  d.endAngle = d.startAngle + d.nodes[displayView];
						  angleSumEnd += d.nodes[displayView];												  
					   }					    					
                    }              
                   //Redraw the segment				   
                   return ref.arcGenerator(d);					   
				});*/
   
}
//Redraws the Piechart, mainly used for snapToView and to update based on other widget changes
 Piechart.prototype.redrawView = function (view,id){ 
      var ref = this;
    //Resolve which view to draw	  
      var displayView = ref.currentView;
       if (view!=-1){
	     displayView = view;
	    }		   
	 //console.log("SNAP: current View "+displayView+" next view index "+ref.nextViewIndex+" current view index "+ref.currentViewIndex);
     
	 //Grab the end angle of the dragged segment	
	 //TODO: Refactor this, shouldn't have to select the dragged segment element each time
    var angleSumStart = ref.dragStartAngle;
	var angleSumEnd;
	this.widget.select("#displayArcs"+id)
	            .attr("d", function (d) { 
                    angleSumEnd = ref.dragStartAngle + d.nodes[displayView];
                    d.endAngle = angleSumEnd;					
				});						   
    //Update the angles of the rest of the stationary segments
    this.widget.selectAll(".DisplayArcs")
	             //.transition().duration(400)
	            .attr("d", function (d) {                               				   
                    if (d.id != id){					 
					   if (d.id < id){ //segments rendered before the dragged segment
					      d.endAngle = angleSumStart;
						  d.startAngle = d.endAngle - d.nodes[displayView];
						  angleSumStart += d.nodes[displayView];											  
					   }else{ //segments rendered after the dragged one
					      d.startAngle = angleSumEnd;
						  d.endAngle = d.startAngle + d.nodes[displayView];
						  angleSumEnd += d.nodes[displayView];												  
					   }					    					
                    }                
                   //Redraw the segment				   
                   return ref.arcGenerator(d);					   
				});
}


//Displays hint info
Piechart.prototype.showHintPath = function (id){    
        var ref = this; 		
		var changeDirections = []; //At which hint arc do we change the direction of drawing
		var start;	
        var end;
        //NOT USED ANYMORE		
		//Special arc generator for the hint arcs
		/**var hintArcs = d3.svg.arc()
	                   .outerRadius(function (d,i) {
							return ref.findHintRadius(d[1],ref.currentView);
						})
					   .innerRadius(function (d,i) {					        
							return ref.findHintRadius(d[1],ref.currentView);
					   }) 
					   .startAngle(function (d,i) {  
					        if (i==0){ //First hint arc, special case
							   start = ref.dragStartAngle + d[0];
							   return start;
							 }
                             end = d[0];							 
							return start;
					   })
					   .endAngle(function (d,i) { 	
                            if (i==0){ //First hint arc, special case
							    end = ref.dragStartAngle+d[0];
							   return end;
                            }						
					       	start = end;			   
							return end;			
		               });*/

        //Render the hint pie segments						   
        this.widget.select("#gInner"+id)/**.selectAll("path").data(function (d,i) {													  
													  changeDirections = d.hDirections;
		                                              ref.dragStartAngle = d.startAngle; //TODO:Don't be setting an important variable in an ambiguous location, which is hard to find!												  												   
		                                               return d.hArcs;
											}).enter()*/
											.append("path")
                                             .attr("d", function (d,i) { 											       
                                                   //Format: M startX startY A rX rY 0 0 0 endX endY
												   var dString = "";
												   var pathInfo = [];
												   var r,x,y,newAngle;
												  for (var j=0;j<d.hArcs.length;j++){
												    newAngle = ref.dragStartAngle + d.hArcs[j][0];                                                   											   
													if (newAngle > ref.twoPi){ //Special case when angle wraps around
													    newAngle = newAngle - ref.twoPi;
													}                                                    													
                                                   	r = ref.findHintRadius(d.hArcs[j][1],ref.currentView);	                                                 									
													x = ref.cx + r*Math.cos(newAngle - ref.halfPi);
													y = ref.cy+ r*Math.sin(newAngle - ref.halfPi);
													pathInfo[j] = [x,y,r,newAngle];				    
												   }
												   
												   for (j=0;j<pathInfo.length;j++){
												      if (j>0){
													    if (d.hDirections[j]==1){ //Want to change directions														     	
                                                             x = ref.cx + pathInfo[j][2]*Math.cos(pathInfo[j-1][3] - ref.halfPi);
															 y = ref.cy+ pathInfo[j][2]*Math.sin(pathInfo[j-1][3] - ref.halfPi);
                                                             dString +="M "+pathInfo[j-1][0]+" "+pathInfo[j-1][1]+" L "+x+" "+y; //Small connecting line which joins two different radii															 
														     dString +="M "+x+" "+y+" A "+pathInfo[j][2]+" "
														     +pathInfo[j][2]+" 0 0 0 "+pathInfo[j][0]+" "+pathInfo[j][1];
														 }else{
														    dString +="M "+pathInfo[j][0]+" "+pathInfo[j][1]+" A "+pathInfo[j][2]+" "
														          +pathInfo[j][2]+" 0 0 0 "+pathInfo[j-1][0]+" "+pathInfo[j-1][1];
														}
													    
                                                      } 
												   }												  											   
											       return dString;
											 })											 										                                       												
											.style("fill","none")
											.style("stroke",ref.hintColour)
											.style("stroke-width",1)
											.attr("class","hintArcs")
											// .attr("transform", "translate(" + this.cx + "," + this.cy + ")")	
                                              .attr("filter", "url(#blur)")											 
											;
		       		
	//Render the hint labels
	this.widget.select("#gInner"+id).selectAll("text").data(function (d){return d.hArcs;}).enter()	                                     						  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })	                                            										        
                                              .attr("transform", function (d,i){											        
													//Resolve the angle w.r.t to the top of the chart, x and y = 0													
													var newAngle = ref.dragStartAngle + d[0];																									
													if (newAngle > ref.twoPi){ //Special case when angle wraps around
													    newAngle = newAngle - ref.twoPi;
													}	
                                                   	var r = ref.findHintRadius(d[1],ref.currentView);	                                                 									
													var x = ref.cx + r*Math.cos(newAngle - ref.halfPi);
													var y = ref.cy+ r*Math.sin(newAngle - ref.halfPi);													
													return "translate("+x+","+y+")";
													
												})                                          												
											   .attr("fill", ref.hintLabelColour)
											   .style("font-size","10px")
										       .attr("class","hintLabels");		
	
    //Clear all other pie segments (for debugging) 
	this.widget.selectAll(".DisplayArcs").transition().duration(400).style("fill-opacity", function (d) {
		    if (d.id != id)
			   return 0.5;
		})	
		.style("stroke", function (d) {
		    if (d.id != id)
			   return "none";
		});
											   
}
//Clears hint info
 Piechart.prototype.clearHintPath = function (id){
        var ref = this;
		
        this.widget.select("#gInner"+id).selectAll("text").remove();  
        this.widget.select("#gInner"+id).selectAll("path").remove();	
        this.widget.selectAll(".DisplayArcs").style("fill-opacity", 1).style("stroke","white");								  
        								  
 }

 //Calculates the amount to translate the hint path (what the radius of the hint path should be)
 Piechart.prototype.findHintRadius = function (index,view){
 //console.log(index+" "+view+" "+(this.labelOffset+20*(index+view)));
    return this.labelOffset+20*(index-view);
}

//A function meant only to interface with other visualizations or the slider
//Given an interpolation value, update segments accordingly between the view 'current' and 'next'
Piechart.prototype.updateSegments = function(interpValue,currentI,nextI){  
var ref = this;
 		this.widget.selectAll(".DisplayArcs")	            
	            .attr("d", function (d) {				   
                    	var newEndAngle = d.nodes[nextI]+d.startAngle;			  
					    var interpolator = d3.interpolate({startAngle:d.startAngle,endAngle:d.endAngle},{startAngle:d.startAngle,endAngle:newEndAngle});
					    var newAngle = interpolator(interpValue);
						d.endAngle = newAngle.endAngle;
						d.startAngle = newAngle.startAngle;
						 //console.log(d.prevStart+" "+d.startAngle);                                     
                        return ref.arcGenerator(d);					   
				});
 
}