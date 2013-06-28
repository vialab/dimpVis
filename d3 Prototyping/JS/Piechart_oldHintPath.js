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
   this.svg = null; //Reference to svg container
   this.hArcs = [];
   this.hDirections = [];
   this.corners = [];  //Corners of the hint path
   this.labels = hLabels;
   this.numArcs = -1; //Total number of arcs in the piechart

   //View index tracker variables
   this.currentView = 0; //Starting view of the piechart (first year)
   this.nextView = 1;
   this.currentArc = 0;
   this.nextArc = 1;

   this.lastView = hLabels.length-1;
   this.numViews = hLabels.length;
   this.startAngles = [];//Saves the start and end angles each time they are changed
   this.endAngles = [];
   this.nextAngles = []; //An array for each segment which stores the previous angle (used for interpolation in interpolateSegments())
   this.currentAngles = [];
   this.dragStartAngle = 0;  //The starting angle for the pie segment being dragged
   this.draggedSegment = 0; //Id of the dragged segment
   this.interpValue=0;
   this.previousDirection = 1; //Tracks the direction travelled (forward or backward in time) to infer the next view
                               //1 if going forward, -1 if going backward
   this.mouseAngle = -1; //Save the angle of the previously dragged segment

   //Constants for angle calculations involving PI
   this.pi = Math.PI;
   this.halfPi = Math.PI/2;
   this.twoPi = Math.PI*2;

   //Event functions, declared in the init.js file
   this.clickHintLabelFunction = {};
   this.clickSVG = {};
   this.dragEvent = null;

  //Function for drawing the arc segments
   this.arcGenerator = d3.svg.arc().innerRadius(0).outerRadius(this.radius)
					   .startAngle(function (d) {return d.startAngle;})
					   .endAngle(function (d) {return d.endAngle;});
  //Interpolate function between two values, at the specified amount
   this.interpolator = function (a,b,amount) {return d3.interpolate(a,b)(amount)};

    //Hint path colours
    this.hintLabelColour = "#7f7f7f";
    this.hintColour = "#1f77b4";
    this.grey = "#c7c7c7";
}
//TODO:Not high priority, customize the display colours of the piechart, to change the default

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
     .attr("stdDeviation", 2);
 }
/** Render the visualization onto the svg
 * data: The dataset to be visualized
 * start: The starting view of the visualization, as an index into the labels array
 * colours: an array of colours for the piechart, if none is specified (empty array), use a default
 * Data MUST be provided in the following array format:
 * Object{"values":{v1,v2...vn},
 *        "label":"name of pie segment"
 *       }
 *       ..... number of pie segments
 * */
 Piechart.prototype.render = function(data,colours){
      var ref = this;
	  this.numArcs = data.length-1;

      var colourScale = d3.scale.category20();
     //Create a colour scale for the pie segments
     if (colours.length >0){
         if (this.numArcs <= colours.length){
             colourScale = d3.scale.quantize().domain([0,this.numArcs]).range(colours);
         }else{
             colourScale = d3.scale.linear().domain([0,this.numArcs]).range(colours);
         }
     }
	//Assign the data to the paths drawn as pie segments
	this.svg.selectAll("path").data(data.map(function (d,i) {
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
 this.calculateLayout(this.svg.selectAll(".gDisplayArcs").data().map(function (d){return d.nodes[ref.currentView]}),0,0);

 //Render the pie segments
this.svg.selectAll(".gDisplayArcs").append("path")
         .attr("fill",function (d){return d.colour;})
         .attr("transform", "translate(" + this.cx + "," + this.cy + ")")
         .attr("id", function (d) {return "displayArcs"+d.id;})
         .attr("class","displayArcs")
         .attr("d", function (d) {
                d.startAngle = ref.startAngles[d.id];
                d.endAngle = ref.endAngles[d.id];
               return ref.arcGenerator(d);
         })
//TODO: labels on the piechart? Or a legend?
        /** .append("text")
         .attr("transform", function (d,i){
                return "translate(" + arc.centroid(d) + ")";
        })
         .attr("fill", ref.hintLabelColour)
         .text("Test")*/
         .append("title").text(function(d){return d.label;});
 // Add the title of the chart
 this.svg.append("text").attr("id", "graphTitle").style("fill", this.grey).text(this.graphTitle).attr("x",10).attr("y",13);

 //Add a g element to contain the hint info
 this.svg.append("g").attr("id","hintPath");
 }
/** Re-calculates layout of the piechart for a list of angles
 *  The angles are saved in the global arrays startAngles, and endAngles
 *  angles: a 1D array containing the angle values of each segment for one view
 *  start: indicates at which angle to start drawing from (usually w.r.t the startAngle of the dragged angle)
 *  id: index of the dragged segment corresponding to start
 * */
Piechart.prototype.calculateLayout = function (angles,start,id){
    var angleSum, currentAngle;

    //Adjust the id (if using the slider)
    var newId  = id;
    if (id==-1){newId = this.draggedSegment}

    //First assign the start and end angles to the currently dragged segment (id)
    var endAngle = start+angles[newId];
    this.startAngles[newId] = start;
    this.endAngles[newId] = endAngle;
    angleSum = endAngle;

    //Then, assign start/end angles to all segments whose indices occur after id (> id)
    for (var j=(newId+1);j<angles.length;j++){
        currentAngle = angles[j];
        this.startAngles[j] = angleSum;
        this.endAngles[j] = angleSum + currentAngle;
        angleSum += currentAngle;
    }
    //Now assign start/end angles to all segments with indices before id (0 to <id)
    for (var j=0;j<newId;j++){
        currentAngle = angles[j];
        this.startAngles[j] = angleSum;
        this.endAngles[j] = angleSum + currentAngle;
        angleSum += currentAngle;
    }
    //console.log("ends "+this.endAngles.map(function (d){return d*180/Math.PI})+" starts "+this.startAngles.map(function (d){return d*180/Math.PI}));
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
/** Compares the dragging angle of the mouse with the two bounding views (using the
 *  endAngles along the hint path).  From this comparison, the views are resolved and
 *  (if needed), the piechart segments are re-drawn based on the dragging amount
 *  id: The id of the dragged segment
 *  mouseX,mouseY: The coordinates of the mouse
 * */
Piechart.prototype.updateDraggedSegment2 = function (id,mouseX, mouseY){
    var ref = this;
    //TODO: handle when switching directions (infer time continuity)
    this.svg.select("#displayArcs"+id).attr("d", function (d) {

        //Set the start angle of the dragged segment
        d.startAngle = ref.dragStartAngle;

       //Calculate the angle of the dragged segment
        var adj = mouseX - ref.cx;
        var opp = ref.cy - mouseY;
        var angle = Math.atan2(adj,opp);
        //DEBUG: console.log("original angle: "+angle*180/Math.PI);

        //Wrapped around 180, make angle positive
        if (angle < 0){	angle = (ref.pi - angle*(-1))+ref.pi;}
        angle = angle - ref.dragStartAngle;
        //Wrapped around 360, adjust the angle according to the start angle
        if (angle < 0){ angle = (ref.twoPi - ref.dragStartAngle)+(angle + ref.dragStartAngle)}

        //DEBUG: console.log("positive angle: "+angle*180/Math.PI);
        //Find the angles for the current and next view
        var current = d.nodes[ref.currentView];
        var next =  d.nodes[ref.nextView];
        var bounds = ref.checkBounds(current,next,angle);
       //The interp value can tell the dragging direction (increasing -> forward in time, decreasing -> backward in time)

        //DEBUG: console.log("current: "+current*180/Math.PI+" next "+next*180/Math.PI+" angle "+(angle+ref.dragStartAngle)*180/Math.PI+" view"+ref.currentView);
        //TODO: Drawing of angles is still choppy, especially when at an edge of the hint path, in this case might need to force the interaction to move in the desired angular direction
        //TODO: e.g., if the edge changes from counter clockwise to clockwise, then the only dragging direction allowed at this edge is clockwise.. can use hDirections array for this
        //TODO: once at edge, wait for dragging to occur in the desire direction and then assign the year based on previous directions
       // console.log(ref.currentView+" "+ref.nextView+" "+ref.previousDirection);
      // console.log("current: "+current*180/Math.PI+" next "+next*180/Math.PI+" end "+d.endAngle*180/Math.PI+" view"+ref.currentView);
        var atEdge = 0;
       // console.log(d.hDirections);
      /**  if (ref.corners[ref.currentView]==1){
                console.log("current is edge "+ref.currentView);

        }
        if (ref.corners[ref.nextView]==1){
                console.log("next is edge "+ref.nextView);

        }*/
        /**if (d.hDirections[ref.currentView][1] != d.hDirections[ref.nextView][1]){  //At an edge along the hint path, need to set the direction
            //console.log("at edge");
                atEdge = 1;
               /**if (current > next){
                   console.log("one d");
               }else{
                   console.log("other d");
               }
        }*/
       /** if (ref.corners[ref.nextView]==1){ //Next is a corner

            if (current < next ){ //Dragging angle must stay less than next

                if (angle < next){ //infer direction
                    console.log("infer");
                    if (ref.previousDirection ==1){
                        ref.moveForward();
                    }else{
                        ref.moveBackward();
                    }
                }
            }else{ //Dragging angle must stay over next
                if (angle > next){ //infer direction
                    if (ref.previousDirection ==1){
                        ref.moveForward();
                    }else{
                        ref.moveBackward();
                    }
                }
            }
            console.log((next*180/Math.PI)+" "+(current*180/Math.PI)+" "+(angle*180/Math.PI));
        }*/
        if (ref.currentView == 0) {  //At the start angle
            if (bounds == current){ //Passed current view angle, going out of bounds
                d.endAngle = ref.dragStartAngle + current;
            }else if (bounds == next){ //Passed the next view angle, update the tracker variables
                d.endAngle = ref.dragStartAngle + next;
                ref.moveForward();
            }else{   //Otherwise, dragged angle is in bounds
                d.endAngle = ref.dragStartAngle + angle;
                ref.interpolateSegments(d.id, angle, ref.currentView,ref.nextView,ref.interpValue);
                ref.animateHintPath(d.hDirections, d.nodes);
            }
        } else if (ref.nextView == ref.lastView){ //At the last view
            if (bounds == next) { //Passed the next view end angle, going out of bounds
                d.endAngle = ref.dragStartAngle + next;
            }else if (bounds == current){ //Passed the current view end angle, update the tracker variables
                d.endAngle = ref.dragStartAngle + current;
                ref.moveBackward();
            }else { //Otherwise, dragged angle is in bounds
                d.endAngle = ref.dragStartAngle + angle;
                ref.interpolateSegments(d.id, angle,ref.currentView,ref.nextView,ref.interpValue);
                ref.animateHintPath(d.hDirections, d.nodes);
            }
        }	else { //At an angle somewhere in between the current and next view
            if (bounds == current){ //Passed current
                d.endAngle = ref.dragStartAngle + current;
                ref.moveBackward();
            } else if (bounds ==next){ //Passed next
                d.endAngle = ref.dragStartAngle + next;
                ref.moveForward();
            }else { //Within bounds
                d.endAngle = ref.dragStartAngle + angle;
                ref.interpolateSegments(d.id, angle,ref.currentView,ref.nextView,ref.interpValue);
                ref.animateHintPath(d.hDirections, d.nodes);
            }
        }
        ref.mouseAngle = angle;  //Save the dragging angle
       // console.log(ref.currentView+" "+ref.nextView);
        //console.log("current arc"+ref.currentArc+" "+ref.nextArc);
        return ref.arcGenerator(d);
    });

}
Piechart.prototype.updateDraggedSegment = function (id,mouseX, mouseY){
    var ref = this;
    //TODO: handle when switching directions (infer time continuity)
    this.svg.select("#displayArcs"+id).attr("d", function (d) {

        //Set the start angle of the dragged segment
        d.startAngle = ref.dragStartAngle;

        //Calculate the angle of the dragged segment
        var adj = mouseX - ref.cx;
        var opp = ref.cy - mouseY;
        var angle = Math.atan2(adj,opp);
        //DEBUG: console.log("original angle: "+angle*180/Math.PI);

        //Wrapped around 180, make angle positive
        if (angle < 0){	angle = (ref.pi - angle*(-1))+ref.pi;}
        angle = angle - ref.dragStartAngle;
        //Wrapped around 360, adjust the angle according to the start angle
        if (angle < 0){ angle = (ref.twoPi - ref.dragStartAngle)+(angle + ref.dragStartAngle)}

        //DEBUG: console.log("positive angle: "+angle*180/Math.PI);
        //Find the angles for the current and next view
        var current = d.nodes[ref.currentView];
        var next =  d.nodes[ref.nextView];

        //The interp value represents the dragging direction (increasing -> forward in time, decreasing -> backward in time)
        //Find the amount travelled from current to next view (remember: angle1 is current and angle2 is next)
        var distanceTravelled = Math.abs(angle-current);
        var totalDistance = Math.abs(next - current);
        var distanceRatio = distanceTravelled/totalDistance;
        var bounds = ref.checkBounds(current,next,angle);
        /**var flag = 0;
        if (ref.corners[ref.nextView]==1){ //Next is a corner
            if (current < next ){ //Dragging angle must stay less than next
                console.log(angle+" "+next);
                if (angle <= next){ //infer direction
                     if (Math.abs(angle-next) <= 0.005){
                    bounds = next;
                         flag =1;
                     console.log("almost corner");
                   }

                }

               }  else{ //Dragging angle must stay over next
                if (angle >= next){ //infer direction
                    if (Math.abs(angle-next) <= 0.005){
                    bounds = next;
                        flag=1;
                     console.log("almost corner");
                   }
                }
            }
        }else if (ref.corners[ref.currentView]==1){ //Current is a corner

            if (next < current ){ //Dragging angle must stay less than current

                if (angle <= current){ //infer direction
                     if (Math.abs(angle-current) <= 0.005){
                    bounds = current;
                         flag=1;
                     console.log("almost corner");
                   }

                }

               }  else{ //Dragging angle must stay over next
                if (angle >= current){ //infer direction
                    if (Math.abs(angle-current) <= 0.005){
                    bounds = current;
                        flag=1;
                     console.log("almost corner");
                   }
                }
            }
        }*/

        if (bounds == angle){
            //Set the dragging direction
            if (distanceRatio > ref.interpValue){ //Forward in time
                //console.log("moving forward");
                if (ref.previousDirection == -1){
                    ref.previousDirection = 1;
                }
            }else { //Going backward in time
                //console.log("moving backward");
                if (ref.previousDirection == 1){
                    ref.previousDirection = -1;
                }
            }
            //Update the rest of the view
            ref.interpolateSegments(d.id, angle,ref.currentView,ref.nextView,distanceRatio);
            ref.animateHintPath(d.hDirections, d.nodes);
            ref.interpValue = distanceRatio;
        }else if (bounds == current) { //At current
            if (ref.corners[ref.currentView]==1){ //At a corner
                if (flag==1){
                if (ref.previousDirection ==1){
                 ref.moveForward();
                 }else{
                 ref.moveBackward();
                 }
                }
            }else{
                ref.moveBackward();
            }
        }else{ //At next
            if (ref.corners[ref.nextView]==1 ){ //Next is a corner
                  if (distanceRatio > ref.interpValue){ //Forward in time
                    if (ref.previousDirection == -1){
                        console.log("switched");
                    }
                }else { //Going backward in time
                    //console.log("moving backward");
                    if (ref.previousDirection == 1){
                        console.log("switched");
                    }
                }
                /**if (ref.previousDirection ==1){
                        ref.moveForward();
                    }else{

                        ref.moveBackward();
                    }  */

            }else{
                ref.moveForward();
            }
        }

        console.log(ref.currentView+" "+ref.nextView+" "+ref.previousDirection);
        d.endAngle = ref.dragStartAngle + bounds;
        ref.mouseAngle = angle;
        return ref.arcGenerator(d);
    });

}
/** Updates the view tracking variables to move the visualization forward
 * (passing the next view)
 * */
Piechart.prototype.moveForward = function (){
    if(this.corners[this.nextView]==1){
        this.currentArc = this.nextArc;
        this.nextArc++;
    }
    if (this.nextView < this.lastView){ //Avoid index out of bounds
        this.currentView = this.nextView;
        this.nextView++;
    }
    this.previousDirection = 1;
}
/** Updates the view tracking variables to move the visualization backward
 * (passing the current view)
 * */
Piechart.prototype.moveBackward = function (){
    if(this.corners[this.currentView]==1){
        this.nextArc = this.currentArc;
        this.currentArc--;
    }
    if (this.currentView > 0){ //Avoid index out of bounds
        this.nextView = this.currentView;
        this.currentView--;
    }
    this.previousDirection = -1;
}
/** Checks if the mouse's dragged angle is in the bounds defined by angle1, angle2
 *  angle1,angle2: the bounds
 *  mouseAngle: the mouse position
 *  @return start,end: boundary values are returned if the given
 *                     mouse position is equal to or has crossed it
 *          distanceRatio: the percentage the mouse has travelled from
 *                         angle1 to angle2
 * */
Piechart.prototype.checkBounds = function(angle1,angle2,mouseAngle){
    var start,end;
	if (angle1>angle2){
	 end = angle1;
	 start = angle2;
	}else{
	  start = angle1;
	  end = angle2;
    }

    if (mouseAngle <= start){
        this.interpValue = 0;
        return start;
    }else if (mouseAngle >=end){
        this.interpValue = 0;
        return end;
    }
    //Find the amount travelled from current to next view (remember: angle1 is current and angle2 is next)
   /** var distanceTravelled = Math.abs(mouseAngle-angle1);
    var totalDistance = Math.abs(angle2 - angle1);
    var distanceRatio = distanceTravelled/totalDistance;
    this.interpValue = distanceRatio;
    return distanceRatio;*/
    return mouseAngle;
}
/**"Animates" the rest of the segments while one is being dragged
 * Uses the interpAmount to determine how far the segment has travelled between the two angles
 * defined at start and end view. The angles of the other bars are estimated using the
 * interpAmount and re-drawn at the new angles
 * id: The id of the dragged segment
 * mouseAngle: the angle of the dragged segment
 * startView,endView: Define the range to interpolate across
 * */
Piechart.prototype.interpolateSegments = function (id,mouseAngle,startView,endView,interpAmount){
    var ref = this;
    var newAngles = [];

	this.svg.selectAll(".displayArcs").each(function (d) {
       if (d.id == id){newAngles.push(mouseAngle);}
       else{newAngles.push(ref.interpolator(d.nodes[startView], d.nodes[endView], interpAmount));}
	 });

    this.calculateLayout(newAngles,this.dragStartAngle,id);

    //Redraw the segments at the interpolated angles
    this.svg.selectAll(".displayArcs").filter(function (d){return d.id!=id})
        .attr("d", function (d){
            d.startAngle = ref.startAngles[d.id];
            d.endAngle = ref.endAngles[d.id];
            return ref.arcGenerator(d);
        });
}
/** Animates the hint path by angular translating it inwards corresponding to the dragging
 *  amount
 * hDirections: the drawing directions for the hint path and the segment numbers
 * angles: an array of all angles to appear on the hint path
 * */
//TODO: using the election dataset, hint path not animating inwards enough
Piechart.prototype.animateHintPath = function (hDirections,angles){
    var ref = this;
    var hintArcInfo = ref.calculateHintAngles(angles,hDirections.map(function (d){return d[1]}),1);
    var hintPathArcString = ref.createArcString(hintArcInfo,hDirections,0);
    //Redraw the hint path
    this.svg.select("#hintPath").selectAll("path").attr("d", hintPathArcString);
    //Update the hint labels
   this.svg.selectAll(".hintLabels").attr("transform",function (d,i) {
       return "translate("+hintArcInfo[i][0]+","+hintArcInfo[i][1]+")";
    });
}
/**Snaps to the nearest view in terms of mouse angle and the two views bounding the time frame
 * id: of the dragged segment
 * allAngles: of the dragged segment (across all views)
 * mouseAngle: the angle of the mouse
 * */
Piechart.prototype.snapToView = function (id,allAngles){
   var current =  allAngles[this.currentView];
   var next = allAngles[this.nextView];
   var currentDist = Math.abs(current - this.mouseAngle);
   var nextDist = Math.abs(next - this.mouseAngle);

   if (currentDist>nextDist && this.nextView != this.numArcs){ //Passed next, advance the variables forward
        this.currentView = this.nextView;
        this.nextView++;
        this.redrawView(this.currentView,id);
    }else if (this.nextView == this.numArcs){
        this.redrawView((this.currentView+1),id);
    }else{
        this.redrawView(this.currentView,id);
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
/** Redraws the piechart at a specified view, by re-calculating the layout
 *  view: the view to draw at
 *  id: of the currently or previously dragged segment
 * */
 Piechart.prototype.redrawView = function (view,id){
   var ref = this;
   var newAngles = [];
   newAngles = this.svg.selectAll(".displayArcs").data().map(function (d){return d.nodes[view]});
   //Recalculate the piechart layout at the view
   this.calculateLayout(newAngles,this.dragStartAngle,id);
   //Redraw the piechart at the new view
   this.svg.selectAll(".displayArcs").attr("d", function (d){
             d.startAngle = ref.startAngles[d.id];
             d.endAngle = ref.endAngles[d.id];
             return ref.arcGenerator(d);
         });
}
/** Calculates the hint angles for drawing a hint path, an array stores
 *  the x,y position for drawing the label, the radius of the arc and
 *  the new angle value (along the hint path) for each angle value along
 *  the hint path.
 * angles: 1D array of all angles belonging to the hint path
 * arcIndices: 1D array of all arcs the angles should be drawn on
 * flag: if set to 0, no interpolation
 *       if set to 1, interpolate between two views
 * */
Piechart.prototype.calculateHintAngles = function (angles,arcIndices,flag){
    var newAngle, r, x,y;
    var hintAngles = [];
    for (var j=0;j<angles.length;j++){
        newAngle = this.dragStartAngle + angles[j];
        if (flag ==0){
            r = this.findHintRadius(arcIndices[j],this.currentArc);
        }else{
            r = this.interpolateHintRadius(arcIndices[j],this.currentArc,this.nextArc);
        }
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
    this.dragStartAngle = start; //Important: save the start angle and re-set interpolation
    this.interpValue = 0;

    //Set the current and next arc tracking vars
    this.currentArc = hDirections[this.currentView][1];
    this.nextArc = this.currentArc +1;

    var hintArcInfo = ref.calculateHintAngles(angles,hDirections.map(function (d){return d[1]}),0);
    var hintPathArcString = ref.createArcString(hintArcInfo,hDirections,1);

    //Render white path under the main hint path
    this.svg.select("#hintPath").append("path")
        .attr("d", hintPathArcString)
        .style("fill","none").style("stroke","white").style("stroke-width",4)
        .attr("filter", "url(#blur)");

    //Render the hint path
    this.svg.select("#hintPath").append("path")
        .attr("d", hintPathArcString)
        .style("fill","none").style("stroke",ref.hintColour).style("stroke-width",1)
        .attr("filter", "url(#blur)");

	//Render the hint labels
	this.svg.select("#hintPath").selectAll("text")
         .data(hintArcInfo.map(function (d) {return {x:d[0],y:d[1]}})).enter()
         .append("svg:text").text(function(d,i) { return ref.labels[i]; })
         .attr("transform", function (d){return "translate("+ d.x+","+ d.y+")";})
         .attr("fill", ref.hintLabelColour).style("font-size","10px")
         .on("click",this.clickHintLabelFunction)
         .style("cursor", "pointer")
         .attr("class","hintLabels");

    //Fade out all the other segments
	this.svg.selectAll(".displayArcs").filter(function (d){return d.id!=id})
         .transition().duration(400).style("fill-opacity", 0.3);
}
/** Clears the hint path by removing all svg elements in #hintPath
 * */
 Piechart.prototype.clearHintPath = function (){
        this.svg.select("#hintPath").selectAll("text").remove();
        this.svg.select("#hintPath").selectAll("path").remove();
        this.svg.selectAll(".displayArcs").style("fill-opacity", 1);
 }
/**Calculates the amount to translate the hint path inwards or outwards on the piechart
 * this is really acheived by growing or shrinking the radius of the hint path segments
 * index: the arc index (which arc the hint angle lies on)
 * view: the view index*/
Piechart.prototype.findHintRadius = function (index,view){
    return this.labelOffset+10*(index-view);
}
/**Interpolates radius between start and end view, used for animating the hint path
 * while a segment is dragged
 * startView,endView: the views to interpolate between
 * index: the arc index (which arc the hint angle lies on) */
Piechart.prototype.interpolateHintRadius = function (index,startView,endView){
    var startRadius = this.findHintRadius(index,startView);
    var endRadius = this.findHintRadius(index,endView);
   // if(index==0) console.log(startRadius+" "+endRadius);
    return this.interpolator(startRadius,endRadius,this.interpValue);
}
/** A function which manually constructs the path string to draw a hint path consisting of arcs
 *  The format of the string is: M startX startY A rX rY 0 0 0 endX endY
 *  Where: startX,startY define the starting point, endX,endY is the ending point
 *         A is the rotation angle, rx,ry is the radius of the arc and the 0's are just unset flags
 *  pathInfo: all information required to draw the path (a 2D array of [x,y,r,angle] for each hint angle
 *  directions: the drawing directions to indicate when to create a new arc on the hint path
 *  findCorners: a flag to determine whether or not corners should be located
 * */
Piechart.prototype.createArcString = function (pathInfo,directions,findCorners){
    var dString = "";
    var ref = this;
    var x,y;
    var corners = [];
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
                corners.push(1);
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
                corners.push(0);
                //Always written as bigger to smaller angle to get the correct drawing direction of arc
                dString +="M "+x2+" "+y2+" A "+pathInfo[j][2]+" "
                    +pathInfo[j][2]+" 0 0 0 "+x1+" "+y1;
            }
        }
    }
    if (findCorners==1){
        this.corners = corners;
    }
    return dString;
}
//TODO: this function is not working
/** Animates all segments on the piechart along the hint path of a selected segment
 *  startView to endView, this function is called when "fast-forwarding"
 *  is invoked (by clicking a year label on the hint path)
 *  startView, endView: View indices bounding the animation
 *  id: of the dragged segment (if any)
 *  NOTE: This function does not update the view tracking variables
 * */
Piechart.prototype.animateSegments = function(id, startView, endView) {
    if (startView == endView){return;}
    var ref = this;
    //Determine the travel direction (e.g., forward or backward in time)
    var direction = 1;
    if (startView>endView) direction=-1;

    //Define some counter variables to keep track of the views passed during the transition
    var totalViews = this.lastView+1;
    var viewCounter = -1; //Identifies when a new view is reached
    var animateView = startView; //Indicates when to switch the views (after all points are finished transitioning)

    //Apply multiple transitions to each display point by chaining them
    this.svg.selectAll(".displayArcs").each(animate());

    //Recursively invoke this function to chain transitions, a new transition is added once
    //the current one is finished
    function animate() {
        viewCounter++;
        if (viewCounter==totalViews) {
            animateView = animateView + direction;
            var newAngles = [];
            newAngles = ref.svg.selectAll(".displayArcs").data().map(function (d){return d.nodes[animateView]});
            console.log(ref.dragStartAngle);
            //Recalculate the piechart layout at the view
            ref.calculateLayout(newAngles,ref.dragStartAngle,id);
            viewCounter = 0;
        }
        if (direction == 1 && animateView>=endView) return;
        if (direction ==-1 && animateView<=endView) return;

        return function(d) {
            //Redraw the piechart at the new view
            d3.select(this).transition(400)//.ease("linear")
                .attr("d", function (d){
                    d.startAngle = ref.startAngles[d.id];
                    d.endAngle = ref.endAngles[d.id];
                    return ref.arcGenerator(d);
                 })
                .each("end", animate());
            //TODO:animate hint path
            //If the bar's hint path is visible, animate it
           /**  if (d.id == id){
                //Re-draw the hint path
                /d3.select("#hintPath").selectAll("path").attr("d", function(d,i){
                    return ref.hintPathGenerator(ref.pathData.map(function (d,i){return {x:ref.findHintX(d[0],i,animateView),y:d[1]}}));
                });
                //Re-draw the hint path labels
                d3.select("#hintPath").selectAll(".hintLabels").attr("transform",function (d,i) {
                        //Don't rotate the label resting on top of the bar
                        if (i==animateView) return "translate("+ref.findHintX(d.x,i,animateView)+","+ d.y+")";
                        else return "translate("+(ref.findHintX(d.x,i,animateView)-10)+","+ d.y+")";
                });
            }*/
        };
    }
}