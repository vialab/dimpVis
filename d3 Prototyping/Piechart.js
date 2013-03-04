 function Piechart(width,height,x,y,id,l){
   //Widget initializaton variables
   this.width = width;
   this.height = height;
   this.xPos = x;
   this.yPos = y;
   this.cx = x/3; //Center of the piechart
   this.cy = y/3;
   this.id = id;
   this.radius = 120;
   this.labelOffset = 140;
   this.widget = null; //Reference to svg container
   //Display variables
   this.displayData = null;    
   this.hintColour = "#c7c7c7";  
   this.colourScale = d3.scale.category20c();
   //View index tracker variables
   this.currentView = 0; //Starting view of the piechart (first year)
   this.currentViewIndex = 0; //Current and next view, indices into the sorted angles array
   this.nextViewIndex = 1;   
   this.previousAngleStart = 0; //An accumulation of all previous angles when the piechart is drawn   
   this.previousAngleEnd = 0;  
   this.startAngle = [];
   this.endAngle = [];
   this.angleSum = 0;
   this.dragStartAngle = 0;  //The starting angle for the pie segment being dragged
   this.dragColour = null;
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
	  this.numArcs = data.length;
	  //Initialize all angle tracker variables to 0, assuming the order of the piechart segments never changes (e.g., no sorting of angle values)
	  //TODO: might move this to init
	  for (var j=0;j<this.numViews;j++){
	      this.startAngle[j] = 0;
		  this.endAngle[j] = 0;
	  }
	
	 //Here, each "d" node represents a view
	this.widget.selectAll("path")
                 .data(this.displayData.map(function (d,i) {                     					  
                      //An array of all start and end angles for each view
					  //Format: allAngles[] = {angle-value of actual angle} angles in rads
                      var allValues = [];
                      var aSorted = [];  
					  for (var j=0;j< ref.numViews;j++){				   
						  ref.endAngle[j] += d.values[j] * ref.twoPi;					
						  allValues[j] =  ref.endAngle[j] - ref.startAngle[j];  //End-Start					 
						  ref.startAngle[j] += d.values[j] * ref.twoPi;
                          aSorted[j] = [];
                          aSorted[j][0] = allValues[j];
						  aSorted[j][1] = j;
						  
					  }	                     			  
                       //Sort the array of angles, ascending order, separate array for this because it's easier to look up by index					  
					  ref.sortAngles(aSorted);
					  //Assign values to start and end angles corresponding to the current view
					   var sAngle = ref.angleSum;
					   var eAngle = sAngle + allValues[ref.currentView];
					   ref.angleSum += allValues[ref.currentView];		   
                   	   
	                  return {nodes:allValues,cluster:d.label,id:i,startAngle:sAngle,endAngle:eAngle,outerRadius:ref.radius,angles:aSorted,colour:ref.colourScale(i)};
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
				 .attr("title", function (d){ return d.cluster;});
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
     this.widget.select("#displayArcs"+id)
	            .attr("d", function (d) {  			 	
                    d.startAngle = ref.dragStartAngle;                  	                 		
					var adj = mouseX - ref.cx;
					var opp = ref.cy - mouseY;	                
                    var angle = Math.atan2(adj,opp);	
                				
                    //console.log("angle before: "+(angle*180/Math.PI));					
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
                     var current = ref.dragStartAngle + d.angles[ref.currentViewIndex][0];
                     var next = ref.dragStartAngle + d.angles[ref.nextViewIndex][0];	
					//console.log(" view"+ref.currentView+"current "+ref.currentViewIndex+"next "+ref.nextViewIndex+" computed "+d.endAngle+" sorted angles: "+d.angles+"unsorted angles "+d.nodes);
                     if (ref.currentViewIndex == 0) {  //At the smallest angle closest to the start angle
					    if (d.endAngle <= current){ //Passed the smallest angle, out of bounds
						   d.endAngle = current;
						   return ref.arcGenerator(d);
						}else if (d.endAngle >= next){ //Passed the next angle, update the tracker variables
						    ref.currentViewIndex = ref.nextViewIndex;
							ref.nextViewIndex++;
							ref.currentView = d.angles[ref.currentViewIndex][1];							
						}	                    					
					   ref.animateSegments(d.id,d.endAngle,d.nodes[ref.currentView],current,next);
						//Otherwise, dragged angle is in bounds
						return ref.arcGenerator(d);
                     } else if (ref.nextViewIndex == (d.angles.length-1)){ //At the largest end angle
					    if (d.endAngle >= next) { //Passed the largest end angle, out of bounds
						   d.endAngle = next;
						   return ref.arcGenerator(d);
						}else if (d.endAngle <= current){ //Passed the current angle, update the tracker variables
						  ref.nextViewIndex = ref.currentViewIndex;
						  ref.currentViewIndex--;						 
						  ref.currentView = d.angles[ref.currentViewIndex][1];						 
						}
						//Otherwise, dragged angle is in bounds
						ref.animateSegments(d.id,d.endAngle,d.nodes[ref.currentView],current,next);
						return ref.arcGenerator(d);
                     }	else { //At an angle somewhere in between the largest and smallest
					      if (d.endAngle <= current){ //Passed current
						      ref.nextViewIndex = ref.currentViewIndex;
							  ref.currentViewIndex--;							  
							  ref.currentView = d.angles[ref.currentViewIndex][1];							 
						  } else if (d.endAngle >=next){ //Passed next
						     ref.currentViewIndex = ref.nextViewIndex;
							 ref.nextViewIndex++;
							 ref.currentView = d.angles[ref.currentViewIndex][1];							
						  }
						  //Otherwise, within bounds
						  ref.animateSegments(d.id,d.endAngle,d.nodes[ref.currentView],current,next);
						  return ref.arcGenerator(d);
                     } 	
                  	 
                    //console.log("angle: "+(angle*180/Math.PI)+" endangle "+(d.endAngle*180/Math.PI));			
				    
				});	            
}
//Animates other segments while a segment is being dragged
Piechart.prototype.animateSegments = function (id,mouseAngle,angle,current,next){
      var ref = this;	    
	var angleSumStart = ref.dragStartAngle;
	var angleSumEnd = ref.dragAngleStart + angle;	
	var travelled = Math.abs(current - mouseAngle);
	var total = Math.abs(next - current);
	var ratio = travelled/total;
	console.log(ratio);
    /**this.widget.selectAll(".DisplayArcs")
	            .attr("d", function (d) {  			 	
                    if (d.id != id){
					   if (d.id < id){ //segments rendered before the dragged segment
					      d.endAngle = angleSumStart;
						  d.startAngle = d.endAngle - percentage*d.nodes[ref.currentView];
						  angleSumStart += percentage*d.nodes[ref.currentView];	
							//d.startAngle = d.endAngle - percentage*d.angles[ref.nextViewIndex][0];
						   // angleSumStart += percentage*d.angles[ref.nextViewIndex][0];						  
					   }else{ //segments rendered after the dragged one
					      d.startAngle = angleSumEnd;
						  d.endAngle = d.startAngle + percentage*d.nodes[ref.currentView];
						  angleSumEnd += percentage*d.nodes[ref.currentView];		
						 // d.endAngle = d.startAngle + percentage*d.angles[ref.nextViewIndex][0];
						//  angleSumEnd += percentage*d.angles[ref.nextViewIndex][0];							  
					   }
					   d.endAngle = d.endAngle*ratio;
					     
					   return ref.arcGenerator(d);
                    }	
                     return ref.arcGenerator(d);					
				});	*/
}
//Snaps to the nearest view (in terms of mouse location and the segment being dragged)
Piechart.prototype.snapToView = function (id,mouseAngle,allAngles){
       var ref = this;    
	   var current =  ref.dragStartAngle + allAngles[ref.currentViewIndex][0];
	   var next = ref.dragStartAngle + allAngles[ref.nextViewIndex][0];
	  //console.log("BEFORE SNAP: next "+next+" current "+current+" mouse "+mouseAngle+" current view index "+ref.currentViewIndex+" next view index "+ref.nextViewIndex);	 	  
	   var currentDist = Math.abs(current - mouseAngle);
	   var nextDist = Math.abs(next - mouseAngle);
	   var numAngles = allAngles.length -1;
	   if (currentDist>nextDist && ref.nextViewIndex != numAngles){ //Passed next, advance the variables forward
			//Make sure the nextViewIndex wasn't the last one to avoid index out of bounds
			ref.currentViewIndex = ref.nextViewIndex;
			ref.nextViewIndex++;			
            ref.currentView = allAngles[ref.currentViewIndex][1]; 
            ref.redrawView(-1,id);					
		}else if (ref.nextViewIndex == numAngles && nextDist < currentDist){
	     // console.log("BEFORE SNAP: current View "+(allAngles[ref.nextViewIndex][1])+" next view index "+ref.nextViewIndex+" current view index "+ref.currentViewIndex);
	      ref.redrawView(allAngles[ref.nextViewIndex][1] ,id);	        		  
       }else{
	     // console.log("BEFORE SNAP: current View "+ref.currentView+" next view index "+ref.nextViewIndex+" current view index "+ref.currentViewIndex);	 	  
	      ref.redrawView(-1,id);		  
       }    
      		
}
//Redraws the piechart
 Piechart.prototype.redrawView = function (view,id){ 
       var ref = this;	
      var displayView = ref.currentView;
       if (view!=-1){
	     displayView = view;
	    }		   
	  //console.log("SNAP: current View "+displayView+" next view index "+ref.nextViewIndex+" current view index "+ref.currentViewIndex);
     	
    var angleSumStart = ref.dragStartAngle;
	var angleSumEnd;
	this.widget.select("#displayArcs"+id)
	            .attr("d", function (d) { 
                    angleSumEnd = ref.dragStartAngle + d.nodes[displayView];
                    d.endAngle = angleSumEnd;					
				});						   
    
    this.widget.selectAll(".DisplayArcs")
	             .transition().duration(400)
	            .attrTween("d", function (d) {                    
                   var prevStart = d.startAngle; //Save the old angles before they are updated
				   var prevEnd = d.endAngle;                 				   
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
					    var interp = d3.interpolate({startAngle:prevStart,endAngle:prevEnd},d);
					    //console.log("id: "+d.id+"start angle: "+(d.startAngle*180/Math.PI)+" endangle "+(d.endAngle*180/Math.PI)+" angle: "+(d.nodes[displayView]*180/Math.PI));			
					    return function (t) {return ref.arcGenerator(interp(t))};
                    }	
                       var interp = d3.interpolate({startAngle:prevStart,endAngle:prevEnd},d);					
					  // console.log("start angle: "+(d.startAngle*180/Math.PI)+" endangle "+(d.endAngle*180/Math.PI)+" angle: "+(d.nodes[displayView]*180/Math.PI));
					   return function (t) {return ref.arcGenerator(interp(t))};			
				});
}

//Displays hint info
Piechart.prototype.showHintPath = function (id){    
        var ref = this; 
		//Sepcial arc generator for the hint arcs
		var hintArcs = d3.svg.arc()
	                   .outerRadius(ref.labelOffset)
					   .innerRadius(0) //Need to set this for arc.centroid function to work..
					   .startAngle(function (d) {                            						
							return ref.dragStartAngle;
					   })
					   .endAngle(function (d) { 					       											
							return d + ref.dragStartAngle;			
		               });
		
        //Render the hint pie segments						   
        this.widget.select("#gInner"+id).selectAll("path").data(function (d) {
		                                              ref.dragStartAngle = d.startAngle;
													  ref.dragColour = d.colour;													   
		                                               return d.nodes;
											}).enter().append("path")
                                             .attr("d", function (d) {                                                     											 
											       return hintArcs(d);
											 })											 										                                       												
											.style("fill","none")
											.style("stroke",ref.dragColour)
											.style("stroke-width",3)
											.attr("class","hintArcs")
											 .attr("transform", "translate(" + this.cx + "," + this.cy + ")")	 
											;
											
	//Render the hint labels
	  this.widget.select("#gInner"+id).selectAll("text").data(function (d){return d.nodes;}).enter()	                                     						  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })									  
                                              .attr("transform", function (d){											        
													//Resolve the angle w.r.t to the top of the chart, x and y = 0													
													var newAngle = ref.dragStartAngle + d;																									
													if (newAngle > ref.twoPi){ //Special case when angle wraps around
													    newAngle = newAngle - ref.twoPi;
													}																								    
													var x = ref.cx + (ref.labelOffset+20)*Math.cos(newAngle - ref.halfPi);
													var y = ref.cy+ (ref.labelOffset+20)*Math.sin(newAngle - ref.halfPi);
													return "translate("+x+","+y+")";
													
												})                                          												
											   .attr("fill", ref.dragColour)
											   .attr("class","hintLabels");		
    //Clear all other pie segments (for debugging) 
	/**this.widget.selectAll(".DisplayArcs").transition().duration(400).style("fill-opacity", function (d) {
		    if (d.id != id)
			   return 0.4;
		})	
		.style("stroke", function (d) {
		    if (d.id != id)
			   return "none";
		});*/
											   
}
//Clears hint info
 Piechart.prototype.clearHintPath = function (id){
        var ref = this;
		
        this.widget.select("#gInner"+id).selectAll("text").remove();  
        this.widget.select("#gInner"+id).selectAll("path").remove();	
        this.widget.selectAll(".DisplayArcs").style("fill-opacity", 1).style("stroke","white");								  
        								  
 }
 //Sorts the array of angles[angleValue, viewIndex] in ascending order
 // using a bubble sort
 //TODO: this is a repeated function from barchart.js, put all in a util.js file eventually
 Piechart.prototype.sortAngles= function (array){
    var n = array.length;
     do {
        var swapped = false;
        for (var i = 1; i < n; i++ ) {
           if (array[i - 1][0] > array[i][0]) {
              var temp = array[i-1];
              array[i-1] = array[i];
              array[i] = temp;			  
              swapped = true;
           }
        }
     } while (swapped);
	 return array;	
 }
 //Resolves the view variable indices, called when a new segment is dragged
//This function is needed because currentView and currentViewIndex do not match
// Need to pass the id of the segment being dragged and the sorted array of angles
Piechart.prototype.resolveViews = function (id,a){
       var ref = this;       
	   var newIndex = -1;	 
	   //Search for the index corresponding to 'currentView'
		for (var j=0; j< a.length;j++){
		   if (a[j][1] == ref.currentView){
			   newIndex = j;
			   break;
		  }
	  }
	   //Next, update the view index variables for this bar
	   if (newIndex == (a.length-1)){ //At the largest angle
			ref.nextViewIndex = newIndex;
			ref.currentViewIndex = newIndex-1;
		}else { //At the smallest angle or more			 
		     ref.currentViewIndex = newIndex;
			 ref.nextViewIndex = newIndex + 1;					
		}		  
			    
}

