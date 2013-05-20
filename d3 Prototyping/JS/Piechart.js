/** Constructor for a piechart visualization
 * x: the left margin
 * y: the right margin
 * r: radius of the piechart
 * id: id of the div tag to append the svg container
 * title: of the graph
 * hLabels: A list of labels for the hint path, indicating all the different views of the visualization
 */
function Piechart(x,y, r,id,title,hLabels){
    //Save some display properties
   this.xPos = x;
   this.yPos = y;
   this.graphTitle = title;
   this.id = id;
   this.radius = r;
   this.labelOffset = r+10;
   //Height and width of SVG can be calculated based on radius
   this.width = x + r*5;
   this.height = y+ r*5;
   this.cx = this.width/3; //Center of the piechart
   this.cy = this.height/3;

   //Variables to save display information
   this.displayData = [];
   this.svg = null; //Reference to svg container
   this.hArcs = [];
   this.hDirections = [];
   this.labels = hLabels;
   this.numArcs = -1; //Total number of arcs in the piechart

   //View index tracker variables
   this.currentView = 0; //Starting view of the piechart (first year)
   this.nextView = 1;
   this.lastView = hLabels.length-1;
   this.numViews = hLabels.length;
   this.startAngles = [];//Saves the start and end angles each time they are changed
   this.endAngles_current = [];
   this.endAngles_next = [];
   this.nextAngles = []; //An array for each segment which stores the previous angle (used for interpolation in interpolateSegments())
   this.currentAngles = [];     
   this.dragStartAngle = 0;  //The starting angle for the pie segment being dragged
   this.interpValue=0;

   //Constants for angle calculations involving PI
   this.pi = Math.PI;
   this.halfPi = Math.PI/2;
   this.twoPi = Math.PI*2;
   
   //Event functions, all declared in main.js  
   this.placeholder = function() {}; 
   this.clickHintLabelFunction = this.placeholder;
   this.clickSVG = this.placeholder;
   this.dragEvent = null; 
  //Function for drawing the arc segments   
   this.arcGenerator = d3.svg.arc().innerRadius(0).outerRadius(this.radius)
					   .startAngle(function (d) {return d.startAngle;})
					   .endAngle(function (d) {return d.endAngle;});
    //Hint path colours
    this.hintLabelColour = "#7f7f7f";
    this.hintColour = "#1f77b4";
    this.grey = "#c7c7c7";
}
/**TODO:Customize the display colours of the piechart, to change the default?*/

 /** Append a blank svg and g container to the div tag indicated by "id", this is where the visualization
 *  will be drawn. Also, add a blur filter for the hint path effect.
 * */
Piechart.prototype.init = function(){
   //Draw the main svg to contain the whole visualization
   this.svg = d3.select(this.id).append("svg")
      .attr("width", this.width).attr("height", this.height)
      .style("position", "absolute").style("left", this.xPos + "px")
      .style("top", this.yPos + "px")
      .on("click",this.clickSVG)
     .append("g");
   //Add the blur filter to the SVG so other elements can call it
    this.svg.append("svg:defs")
        .append("svg:filter")
        .attr("id", "blur")
        .append("svg:feGaussianBlur")
        .attr("stdDeviation", 3);
 }
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * start: The starting view of the visualization, as an index into the labels array
 *
 * Data MUST be provided in the following array format:
 * Object{"values":{v1,v2...vn},
 *        "label":"name of pie segment"
 *       }
 *       ..... number of pie segments
 * */
 Piechart.prototype.render = function(data,start){
      var ref = this;
     //Save the parameters
	  this.displayData = data;
      this.currentView = start;
	  this.numArcs = data.length-1;
     //Resolve the index value for the next view (e.g., if currentView is 0, then nextView should be set to 1)
     if (this.currentView ==0){
         this.nextView = this.currentView+1;
     }else if (this.currentView == this.lastView){
         this.nextView = this.currentView;
         this.currentView = this.currentView -1;
     }else {
         this.nextView = this.currentView + 1;
     }
     //Create a colour scale for the pie segments
     var colourScale = d3.scale.quantize()
         .domain([0,this.numArcs])
         .range(["#74c476", "#31a354","#a1d99b","#c7e9c0",  "#3182bd", "#6baed6", "#9ecae1","#c6dbef"]);

	//Assign the data to the paths drawn as pie segments
	this.svg.selectAll("path")
                 .data(this.displayData.map(function (d,i) {
                     var angles = [];
                    //Calculate and save the angle values based on a given percentage value (as a decimal)
                    for (var j=0;j< ref.numViews;j++){
                        angles[j] = d.values[j]*ref.twoPi;
                    }
                    var hintArcInfo = ref.findHintArcs(angles);
	                return {nodes:angles,label:d.label,id:i,startAngle:0,endAngle:0,colour:colourScale(i),
                          hDirections:hintArcInfo};
	              }))
				 .enter().append("g")
                 .attr("class","gDisplayArcs");

 //Find the start and end angles for the current view
 this.calculateNewAngles(this.svg.selectAll(".gDisplayArcs").data().map(function (d){return d.nodes}),0);

 //Render the pie segments               				 
this.svg.selectAll(".gDisplayArcs").append("path")
				 .attr("fill",function (d){return d.colour;})
				 .attr("transform", "translate(" + this.cx + "," + this.cy + ")")	 
				 .attr("id", function (d) {return "displayArcs"+d.id;})	                			 
				 .attr("class","displayArcs")
				 .attr("d", function (d) {
                        d.startAngle = ref.startAngles[d.id];
                        d.endAngle = ref.endAngles_current[d.id];
                       return ref.arcGenerator(d);
                 })
    //TODO: labels on the piechart?
				/** .append("text")
				 .attr("transform", function (d,i){											        
						return "translate(" + arc.centroid(d) + ")"; 													
				})                                          												
				 .attr("fill", ref.hintLabelColour)				 
				 .text("Test")*/
				 .append("title").text(function(d){return d.label;});
// Add the title of the chart
this.svg.append("text")
         .attr("id", "graphTitle").style("fill", this.grey)
         .text(this.graphTitle).attr("x",10).attr("y",13);

//Add a g element to contain the hint info		
this.svg.append("g").attr("id","hintPath");

 }
/** Re-calculates the start angles for current view and the end angles
 *  for both current and next view, of each segment.
 *  The angles are saved in the global arrays startAngles, endAngles_current and
 *  endAngles_next
 *  angles: an array containing the angle values of each segment for all views
 *  start: indicates at which angle to start drawing from (based on the startAngle of the dragged angle)
 * */
Piechart.prototype.calculateNewAngles = function (angles,start){
    var angleSumCurrent = angleSumNext = start;
    var currentAngle, nextAngle;
   for (var j=0;j<angles.length;j++){
       this.startAngles.push(angleSumCurrent);
       currentAngle = angles[j][this.currentView];
       nextAngle = angles[j][this.nextView];
       //Add the new angles to their arrays, make sure the newAngle does not exceed 360 deg, if so, reduce the angle
       this.endAngles_current.push(((angleSumCurrent + currentAngle)>this.twoPi) ? (angleSumCurrent + currentAngle-this.twoPi):(angleSumCurrent + currentAngle));
       this.endAngles_next.push(((angleSumNext + nextAngle)>this.twoPi) ? (angleSumNext + nextAngle-this.twoPi):(angleSumNext + nextAngle));
       angleSumCurrent += currentAngle;
       angleSumNext += nextAngle;
   }

}
/** Finds the hint arcs of a pie segment, specifically this function finds when the arc changes growth direction
 *  as it increases and decreases over time
 *  angles: an array of all angles defined along the hint path
 *  @return hintArcDirections: a 2D array consisting of a set of flags to determine when
 *  to switch drawing direction (1=change direction, 0=no change), and the arc which the angle should be drawn on.
 * */
Piechart.prototype.findHintArcs = function (angles){
    var flag = 1;	//Tracks increasing or decreasing segments
    var currentSegment = 0; //index to indicate which years are drawn on the same hint arc
    var hintArcDirections = []; //Indicators of when to start changing the drawing direction of the hint path
    //Add the first angle
    hintArcDirections[0] = [0,currentSegment];
    for (var j=1;j< angles.length;j++){
            if ((angles[j] - angles[j-1])>0){ //increasing
                if (flag ==0){ //Was previously decreasing, direction changed
                    currentSegment++;
                    flag = 1;
                    hintArcDirections[j] = [1,currentSegment];
                }else{
                    hintArcDirections[j] = [0,currentSegment];
                }
            }else{ //decreasing
                if (flag==1){	//Was previously increasing, direction changed
                    flag=0;
                    currentSegment++;
                    hintArcDirections[j] = [1,currentSegment];
                }else{
                    hintArcDirections[j] = [0,currentSegment];
                }
            }
    }
    return hintArcDirections;
}

//Updates the angle of a dragged pie segment
Piechart.prototype.updateDraggedSegment = function (id,mouseX, mouseY){
     var ref = this;
	 //console.log(ref.currentView+" "+ref.nextView);
     this.svg.select("#displayArcs"+id)
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
						 //ref.interpolateSegments(d.id,d.endAngle,current,next);
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
						//ref.interpolateSegments(d.id,d.endAngle,current,next);
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
						  //ref.interpolateSegments(d.id,d.endAngle,current,next);
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
   this.svg.selectAll(".displayArcs").each(function (d){
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
Piechart.prototype.interpolateSegments = function (id,mouseAngle,current,next){
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
	this.svg.selectAll(".displayArcs")
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
  this.svg.selectAll(".hintArcs").attr("d", function (d,i) {
                                                  											   
		   var pathInfo = [];
		   var current,next,addedRadius;
		  // var r,x,y,newAngle;
		  for (var j=0;j<ref.savedAngles.length;j++){
			  current = ref.findHintRadius(ref.savedAngles[j][1],ref.currentView);
			  next = ref.findHintRadius(ref.savedAngles[j][1],ref.nextView);
			   addedRadius = Math.abs(next-current)*ratio;
				//console.log(current+" "+next+" "+addedRadius+" "+ref.savedAngles[1]);
				//savedRadii[i] = current-addedRadius			                                                													
				r = current-addedRadius;	                                                 									
				x = ref.cx + r*Math.cos(ref.savedAngles[j][0] - ref.halfPi);
				y = ref.cy+ r*Math.sin(ref.savedAngles[j][0] - ref.halfPi);
				pathInfo[j] = [x,y,r,ref.savedAngles[j][0]];
               savedRadii[j] = r;				
		   }													   
		   return ref.createArcString(pathInfo,ref.savedDirections);

  })
	//Update the hint labels	
  this.svg.selectAll(".hintLabels")
			  .attr("transform",function (d,i) {  
						
                    var r = savedRadii[i];										
					var x = ref.cx + r*Math.cos(ref.savedAngles[i][0] - ref.halfPi);
				    var y = ref.cy+ r*Math.sin(ref.savedAngles[i][0] - ref.halfPi);													
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
/** Updates the view tracking variables when the view is being changed by an external
 * visualization (e.g., slider)
 * */
Piechart.prototype.changeView = function (newView){
   if (newView == this.numArcs){
       this.currentView = newView-1;
	   this.nextView = newView;	   
   }else {
	   this.currentView = newView;
	   this.nextView = newView+1;	   
   }
}
//Redraws the Piechart, mainly used for snapToView and to update based on other svg changes
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
	this.svg.select("#displayArcs"+id)
	            .attr("d", function (d) { 
                    angleSumEnd = ref.dragStartAngle + d.nodes[displayView];
                    d.endAngle = angleSumEnd;					
				});						   
    //Update the angles of the rest of the stationary segments
    this.svg.selectAll(".displayArcs")
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
/** Calculates the hint angles for drawing a hint path, an array stores
 *  the x,y position for drawing the label, the radius of the arc and
 *  the new angle value (along the hint path) for each angle value along
 *  the hint path.
 * angles: 1D array of all angles belonging to the hint path
 * arcIndices: 1D array of all arcs the angles should be drawn on
 * */
Piechart.prototype.calculateHintAngles = function (angles,arcIndices){
    var newAngle, r, x,y;
    var hintAngles = [];
   // console.log(arcIndices);
    for (var j=0;j<angles.length;j++){
        newAngle = this.dragStartAngle + angles[j];
        /**if (newAngle > this.twoPi){ //Special case when angle wraps around
            newAngle = newAngle - this.twoPi;
        }*/
        r = this.findHintRadius(arcIndices[j],this.currentView);
        x = this.cx + r*Math.cos(newAngle - this.halfPi);
        y = this.cy+ r*Math.sin(newAngle - this.halfPi);
        hintAngles.push([x,y,r,newAngle]);
    }
    return hintAngles;
}
/**Displays the hint path for the dragged segment
 * id: the id of the dragged segment
 * hDirections: the drawing directions for the hint path and the segment numbers
 * angles: an array of all angles to appear on the hint path
 * */
Piechart.prototype.showHintPath = function (id,hDirections,angles,start){
    var ref = this;
    this.dragStartAngle = start; //Important: save the start angle
    var hintArcInfo = ref.calculateHintAngles(angles,hDirections.map(function (d){return d[1]}));
    var hintPathArcString = ref.createArcString(hintArcInfo,hDirections);
    //TODO: not sure if this is needed? Render a white background under the main hint path
    /**this.svg.select("#hintPath").append("path")
        .attr("d", hintPathArcString)
        .style("fill","none").style("stroke","white").style("stroke-width",2)
        .attr("class","hintArcs").attr("filter", "url(#blur)");*/
    //Render the hint path
    this.svg.select("#hintPath").append("path")
            .attr("d", hintPathArcString)
            .style("fill","none").style("stroke",ref.hintColour).style("stroke-width",1)
            .attr("class","hintArcs").attr("filter", "url(#blur)");
	//Render the hint labels
	this.svg.select("#hintPath").selectAll("text")
        .data(hintArcInfo.map(function (d) {return {x:d[0],y:d[1]}})).enter()
                .append("svg:text")
                 .text(function(d,i) { return ref.labels[i]; })
                 .attr("transform", function (d){return "translate("+ d.x+","+ d.y+")";})
                 .attr("fill", ref.hintLabelColour)
                 .style("font-size","10px")
                 .attr("class","hintLabels");

    //Fade out all the other segments
	this.svg.selectAll(".displayArcs").filter(function (d){return d.id!=id})
            .transition().duration(400).style("fill-opacity", 0.5);
}
/** Clears the hint path by removing all svg elements in #hintPath
 * */
 Piechart.prototype.clearHintPath = function (){
        this.svg.select("#hintPath").selectAll("text").remove();
        this.svg.select("#hintPath").selectAll("path").remove();
        this.svg.selectAll(".displayArcs").style("fill-opacity", 1);
 }
/**Calculates the amount to translate the hint path inwards or outwards on the piechart
 * this is really acheived by growing or shrinking the radius of the hint path segments*/
Piechart.prototype.findHintRadius = function (index,view){
    return this.labelOffset+15*(index-view);
}
/** A function which manually constructs the path string to draw a hint path consisting of arcs
 *  The format of the string is: M startX startY A rX rY 0 0 0 endX endY
 *  Where: startX,startY define the starting point, endX,endY is the ending point
 *         A is the rotation angle, rx,ry is the radius of the arc and the 0's are just unset flags
 *  pathInfo: all information required to draw the path (a 2D array of [x,y,r,angle] for each hint angle
 *  directions: the drawing directions to indicate when to create a new arc on the hint path
 * */
Piechart.prototype.createArcString = function (pathInfo,directions){
    var dString = "";
    var ref = this;
    var x,y;
  //TODO: doesn't draw properly when angle exceeds 360
   for (var j=0;j<pathInfo.length;j++){
        //Either increasing or decreasing
        if (j>0){
            var x1,y1,x2,y2; //x2,y2 represents the bigger angle
            if (pathInfo[j][3] > pathInfo[j-1][3]){ //compare the angles to see which one is bigger
                x1 = pathInfo[j-1][0];
                y1 = pathInfo[j-1][1];
                x2 = pathInfo[j][0];
                y2 = pathInfo[j][1];
            }else{
                x1 = pathInfo[j][0];
                y1 = pathInfo[j][1];
                x2 = pathInfo[j-1][0];
                y2 = pathInfo[j-1][1];
            }
            if (directions[j][0]==1){ //Want to change directions
                x = ref.cx + pathInfo[j][2]*Math.cos(pathInfo[j-1][3] - ref.halfPi);
                y = ref.cy+ pathInfo[j][2]*Math.sin(pathInfo[j-1][3] - ref.halfPi);
                dString +="M "+pathInfo[j-1][0]+" "+pathInfo[j-1][1]+" L "+x+" "+y; //Small connecting line which joins two different radii
                if (pathInfo[j][3] > pathInfo[j-1][3]){
                    dString +="M "+pathInfo[j][0]+" "+pathInfo[j][1]+" A "+pathInfo[j][2]+" "
                        +pathInfo[j][2]+" 0 0 0 "+x+" "+y;
                }else{
                    dString +="M "+x+" "+y+" A "+pathInfo[j][2]+" "
                        +pathInfo[j][2]+" 0 0 0 "+pathInfo[j][0]+" "+pathInfo[j][1];
                }
            } else {
                //Always written as bigger to smaller angle to get the correct drawing direction of arc
                dString +="M "+x2+" "+y2+" A "+pathInfo[j][2]+" "
                    +pathInfo[j][2]+" 0 0 0 "+x1+" "+y1;
            }
        }
    }
    return dString;
}
/** Animates all segments on the piechart along the hint path of a selected segment
 *  startView to endView, this function is called when "fast-forwarding"
 *  is invoked (by clicking a year label on the hint path)
 *  startView: View index to start the animation at
 *  endView: View to end the animation at (need to update view variables
 *  according to this value)
 *  NOTE: This function does not update the view tracking variables
 * */
Piechart.prototype.animateSegments = function( startView, endView) {
    var ref = this;
    //Determine the travel direction (e.g., forward or backward in time)
    var direction = 1;
    if (startView>endView) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalViews = ref.lastView+1;
    var viewCounter = -1; //Identifies when a new view is reached
    var animateView = startView; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".displaySegments").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        viewCounter++;
        if (viewCounter==totalViews) {
            animateView = animateView + direction;
            viewCounter = 0;
        }
        if (direction == 1 && animateView>=endView) return;
        if (direction ==-1 && animateView<=endView) return;
        return function(d) {
            d3.select(this).transition(400).ease("linear")
                .attr("d", d.nodes[animateView][0])
                .each("end", animate());
            //TODO:animate hint path
        };
    }
}
//A function meant only to interface with other visualizations or the slider
//Given an interpolation value, update segments accordingly between the view 'current' and 'next'
//TODO: merge with interpolateSegments(), as in scatter and bar charts
Piechart.prototype.updateSegments = function(interpValue,currentI,nextI){  
var ref = this;
 		this.svg.selectAll(".displayArcs")
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