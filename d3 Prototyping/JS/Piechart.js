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
   this.hintRadiusSpacing = 18;

   //Height and width of SVG can be calculated based on radius
   this.width = x + r*5;
   this.height = y+ r*5;
   this.cx = this.width/3; //Center of the piechart
   this.cy = this.height/3;

   //Variables to save display information
   this.svg = null; //Reference to svg container
   this.corners = [];  //Corners of the hint path
   this.labels = hLabels;
   this.numArcs = -1; //Total number of arcs in the piechart

   //View index tracker variables
   this.currentView = 0; //Starting view of the piechart (first year)
   this.nextView = 1;
   /**this.currentArc = 0;
   this.nextArc = 1;*/

   this.lastView = hLabels.length-1;
   this.numViews = hLabels.length;
   this.startAngles = [];//Saves the start and end angles each time they are changed
   this.endAngles = [];
   this.dragStartAngle = 0;  //The starting angle for the pie segment being dragged
   this.draggedSegment = 0; //Id of the dragged segment
   this.interpValue=0;
   this.timeDirection = 1; //Tracks the direction travelled (forward or backward in time) to infer the next view
                               //1 if going forward, -1 if going backward
   this.previousDragDirection = 1;
   this.mouseAngle = -1; //Save the angle of the previously dragged segment
   this.hintArcInfo = []; //The points and radii along the hint path

   this.ambiguousSegments = [];
   this.interactionPaths = [];
   this.isAmbiguous = 0;
   this.amplitude = 20; //Of the sine wave (interaction path)

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
   //Function for drawing a sine wave
   this.interactionPathGenerator = d3.svg.line().interpolate("monotone");
  //Interpolate function between two values, at the specified amount
   this.interpolator = function (a,b,amount) {return d3.interpolate(a,b)(amount)};
}
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
                return {nodes:angles,label:d.label,id:i,startAngle:0,endAngle:0,colour:colourScale(i)};
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
//TODO: labels on the piechart? Or a legend? (not high priority)
        /** .append("text")
         .attr("transform", function (d,i){
                return "translate(" + arc.centroid(d) + ")";
        })
         .attr("fill", ref.hintLabelColour)
         .text("Test")*/
         .append("title").text(function(d){return d.label;});
 // Add the title of the chart
 this.svg.append("text").attr("id", "graphTitle").text(this.graphTitle).attr("x",10).attr("y",13);

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
/** Compares the dragging angle of the mouse with the two bounding views (using the
 *  endAngles along the hint path).  From this comparison, the views are resolved and
 *  (if needed), the piechart segments are re-drawn based on the dragging amount
 *  id: The id of the dragged segment
 *  mouseX,mouseY: The coordinates of the mouse
 * */
Piechart.prototype.updateDraggedSegment = function (id,mouseX, mouseY){
    var ref = this;

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

        //Find the angles for the current and next view
        var current = d.nodes[ref.currentView];
        var next =  d.nodes[ref.nextView];
        var newAngle;

        //Assuming no ambiguity right now
        newAngle = ref.handleDraggedSegment(id,current,next,angle,d.nodes);

        //console.log(ref.currentView+" "+ref.nextView+" "+ref.timeDirection);
        d.endAngle = ref.dragStartAngle + newAngle; //Set the new end angle
        ref.mouseAngle = angle; //Save the dragging angle
        return ref.arcGenerator(d); //Re-draw the arc
    });
}
/** Finds the new end angle of a dragged pie segment
 *  current,next: the angles corresponding to current and next views
 *  mouseAngle: the dragging angle
 *  id: of the dragged segment
 *  @return new end angle of the dragged segment
 * */
Piechart.prototype.handleDraggedSegment = function(id,current,next,mouseAngle,nodes){
    //Find the current angular dragging direction
    var draggingDirection = (mouseAngle>this.mouseAngle)?1:-1;

   //Check to see if the mouse angle is in between current and next, or beyond one of them
    var bounds = this.checkBounds(current,next,mouseAngle);

    //Change views or update the view
    if (bounds == mouseAngle){
        this.findInterpolation(current,next,mouseAngle,0);
        this.interpolateSegments(id, mouseAngle,this.currentView,this.nextView,this.interpValue);
        this.animateHintPath(nodes);
    }else if (bounds == current) { //At current
        if (this.corners[this.currentView]==1){ //Current is a corner
            this.inferTimeDirection(current,next,mouseAngle,draggingDirection);
        }else{
            this.moveBackward();
        }
    }else{ //At next
        if (this.corners[this.nextView]==1){ //Next is a corner
            this.inferTimeDirection(next,current,mouseAngle,draggingDirection);
        }else{
            this.moveForward();
        }
    }
    this.previousDragDirection = draggingDirection; //Save the current dragging direction
    return bounds;
}
/**Infers the time direction when user arrives at corners, inference is based on previous direction
 * travelling over time.  The views are updated (forward or backward) whenever the dragging direction
 * changes.
 * b1,b2: the boundary views (b1 should be the currently encountered corner)
 * mouseAngle: dragging angle of the mouse
 * draggingDirection: 1 if dragging clockwise, -1 is counter-clockwise
 * */
Piechart.prototype.inferTimeDirection = function (b1,b2,mouseAngle,draggingDirection){

    if (b1 > b2){ //Dragging needs to switch 1 -> -1 in order for view to change
        if (mouseAngle>=b1 && draggingDirection==-1 && this.previousDragDirection==1){
            if (this.timeDirection ==1){this.moveForward();}
            else{this.moveBackward();}
        }
    }else{//Dragging needs to switch -1 -> 1 in order for the view to change
        if (mouseAngle<=b1 && draggingDirection==1 && this.previousDragDirection==-1){
            if (this.timeDirection ==1){this.moveForward();}
            else{this.moveBackward();}
        }
    }
}
/** Calculates the interpolation amount  (percentage travelled) of the mouse, between views.
 *   Uses the interpolation amount to find the direction travelling over time and save it
 *   in the global variable.
 *   b1,b2: y-position of boundary values (mouse is currently in between)
 *   mouse: y-position of the mouse
 *   ambiguity: a flag, = 1, stationary case (interpolation split by the peak on the sine wave)
 *                      = 0, normal case
 */
Piechart.prototype.findInterpolation  = function (b1,b2,mouseY,ambiguity){

    var distanceTravelled, currentInterpValue;
    var total = Math.abs(b2 - b1);

    //Calculate the new interpolation amount
    if (ambiguity == 0){
        distanceTravelled = Math.abs(mouseY-b1);
        currentInterpValue = distanceTravelled/total;
    }/*else{
        if (this.passedMiddle ==0 ){ //Needs to be re-mapped to lie between [0,0.5] (towards the peak/trough)
            distanceTravelled = Math.abs(mouseY - b1);
            currentInterpValue = distanceTravelled/(total*2);
        }else{ //Needs to be re-mapped to lie between [0.5,1] (passed the peak/trough)
            distanceTravelled = Math.abs(mouseY - b2);
            currentInterpValue = (distanceTravelled+total)/(total*2);
        }
    }*/ //TODO: implement this when ambiguous case detection is working

    //Set the direction travelling over time (1: forward, -1: backward)
    this.timeDirection = (currentInterpValue > this.interpValue) ? 1:-1;

    this.interpValue = currentInterpValue; //Save the current interpolation value
}
/** Updates the view tracking variables to move the visualization forward
 * (passing the next view)
 * */
Piechart.prototype.moveForward = function (){
    /**if(this.corners[this.nextView]==1){
        this.currentArc = this.nextArc;
        this.nextArc++;
    }*/
    if (this.nextView < this.lastView){ //Avoid index out of bounds
        this.currentView = this.nextView;
        this.nextView++;
    }    
}
/** Updates the view tracking variables to move the visualization backward
 * (passing the current view)
 * */
Piechart.prototype.moveBackward = function (){
    /**if(this.corners[this.currentView]==1){
        this.nextArc = this.currentArc;
        this.currentArc--;
    }*/
    if (this.currentView > 0){ //Avoid index out of bounds
        this.nextView = this.currentView;
        this.currentView--;
    }    
}
/** Checks if the mouse's dragged angle is in the bounds defined by angle1, angle2
 *  angle1,angle2: the bounds
 *  mouseAngle: the mouse position
 *  @return start,end: boundary values are returned if the given
 *                     mouse position is equal to or has crossed it
 *          mouseAngle: the original dragging angle, if mouse is in bounds
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
        if (this.timeDirection == -1) {this.interpValue = 1; }
        else{this.interpValue = 0;}
        return start;
    }else if (mouseAngle >=end){
        if (this.timeDirection == -1) {this.interpValue = 1; }
        else{this.interpValue = 0;}
        return end;
    }

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
 * angles: an array of all angles to appear on the hint path
 * */
Piechart.prototype.animateHintPath = function (angles){
    var ref = this;
    var hintArcInfo = ref.calculateHintAngles(angles,null,1);
    var hintPathArcString = ref.createArcString(hintArcInfo,0);

    //Redraw the hint path
    this.svg.select("#hintPath").selectAll("path").attr("d", hintPathArcString);

    //Update the hint labels
   this.svg.selectAll(".hintLabels").attr("transform",function (d,i) {
       return "translate("+hintArcInfo[i][0]+","+hintArcInfo[i][1]+")";
    }).attr("fill-opacity",function (d){return ref.interpolateLabelOpacity(d)});

    //Redraw interaction path(s) if any
    if (this.isAmbiguous==1){
           this.svg.selectAll(".interactionPath").attr("d",function (d) {
                var xTranslate = hintArcInfo[d.view][0];
                var yTranslate = hintArcInfo[d.view][1];
                var translatedPoints = d.points.map(function (b){return [b[0]+xTranslate,b[1]+yTranslate]});
                d3.select(this).attr("transform","rotate("+d.rotationAngle+","+xTranslate+","+yTranslate+")");
                return ref.interactionPathGenerator(translatedPoints);
            });
    }
}
/** Interpolates across two labels to show the user's transition between views
 * d: a node from .hintLabels
 * */
Piechart.prototype.interpolateLabelOpacity = function (d){
    if (d.id ==this.currentView){ //Dark to light
        return d3.interpolate(1,0.3)(this.interpValue);
    }else if (d.id == this.nextView){ //Light to dark
        return d3.interpolate(0.3,1)(this.interpValue);
    }
    return 0.3;
}
/** Darkens the label colour opacity of one view label and keeps the rest faded out,
 *  to show the current view when dragging a segment
 * */
Piechart.prototype.changeLabelOpacity = function (d,view){
    return (d.id==view)?1:0.3;
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
        this.redrawHintPath(this.currentView,allAngles);
    }else if (this.nextView == this.numArcs){
        this.redrawView((this.currentView+1),id);
        this.redrawHintPath((this.currentView+1),allAngles);
    }else{
        this.redrawView(this.currentView,id);
        this.redrawHintPath(this.currentView,allAngles);
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
/**Re-draws the hint path at a specified view
 * view: the view to draw at
 * angles: a 1D array of all angles along the hint path
 * */
Piechart.prototype.redrawHintPath = function (view,angles){
    var ref = this;
    var hintArcInfo = this.calculateHintAngles(angles,view,0);
    var hintPathArcString = this.createArcString(hintArcInfo,0);

    //Redraw the hint path
    this.svg.select("#hintPath").selectAll("path").attr("d", hintPathArcString);

    //Update the hint labels and change the opacity to show current view
    this.svg.selectAll(".hintLabels").attr("transform",function (d,i) {
        return "translate("+hintArcInfo[i][0]+","+hintArcInfo[i][1]+")";
    }).attr("fill-opacity",function (d){return ref.changeLabelOpacity(d,view)});

    //Redraw the interaction path(s) if any
    if (this.isAmbiguous ==1){
        this.svg.selectAll(".interactionPath").attr("d",function (d) {
            var xTranslate = hintArcInfo[d.view][0];
            var yTranslate = hintArcInfo[d.view][1];
            var translatedPoints = d.points.map(function (b){return [b[0]+xTranslate,b[1]+yTranslate]});
            d3.select(this).attr("transform","rotate("+d.rotationAngle+","+xTranslate+","+yTranslate+")");
            return ref.interactionPathGenerator(translatedPoints);
        });
    }
}
/** Calculates the hint angles for drawing a hint path, an array stores
 *  the x,y position for drawing the label, the radius of the arc and
 *  the new angle value (along the hint path) for each angle value along
 *  the hint path.
 * angles: 1D array of all angles belonging to the hint path
 * view: the current view to draw at
 * flag: if set to 0, no interpolation
 *       if set to 1, interpolate between current and next view
 * */
Piechart.prototype.calculateHintAngles = function (angles,view,flag){

  //The old hint path design (radius changes when dragging direction changes)
  //NOTE: for this design need to pass the arcIndices: which arc should the label be drawn on
  /**  var newAngle, r, x,y;
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
    }*/

  //New hint path design: separate radius for each year
  var newAngle, r, x,y;
  var hintAngles = [];

    for (var j=0;j<angles.length;j++){

        newAngle = this.dragStartAngle + angles[j];
        if (flag ==0){
            r = this.findHintRadius(j,view);
        }else{
            r = this.interpolateHintRadius(j,this.currentView,this.nextView);
        }
        x = this.cx + r*Math.cos(newAngle - this.halfPi);
        y = this.cy+ r*Math.sin(newAngle - this.halfPi);
        hintAngles.push([x,y,r,newAngle]);
    }
    return hintAngles;
}
/**Displays the hint path for the dragged segment
 * id: the id of the dragged segment
 * angles: an array of all angles to appear on the hint path
 * */
Piechart.prototype.showHintPath = function (id,angles,start){
    var ref = this;
    this.dragStartAngle = start; //Important: save the start angle and re-set interpolation
    this.interpValue = 0;

    this.hintArcInfo = this.calculateHintAngles(angles,this.currentView,0);
    var hintPathArcString = this.createArcString(this.hintArcInfo,1);

    //Check for ambiguous cases in the data
    this.checkAmbiguous(angles);

    //Set the current and next arc tracking vars
    /**this.currentArc = hDirections[this.currentView][1];
    this.nextArc = this.currentArc +1;*/

    //NOTE: Angle has to be converted to match the svg rotate standard: (offset by 90 deg)
    //http://commons.oreilly.com/wiki/index.php/SVG_Essentials/Transforming_the_Coordinate_System#The_rotate_Transformation
    if (this.isAmbiguous ==1 ){ //Draw interaction paths (if any)
        this.svg.select("#hintPath").selectAll(".interactionPath")
            .data(this.interactionPaths.map(function (d,i) {
                var viewIndex = d[1];
                var angle_deg = (angles[viewIndex]+ref.dragStartAngle)*(180/Math.PI);
                if (angle_deg >=0 && angle_deg < Math.PI/2){
                    angle_deg = 270 + angle_deg;
                }else{
                    angle_deg = angle_deg - 90;
                }
                return {points:d[0],id:i,rotationAngle:angle_deg,view:viewIndex}
             })).enter().append("path").attr("class","interactionPath")
            .attr("d",function (d) {
                var xTranslate = ref.hintArcInfo[d.view][0];
                var yTranslate = ref.hintArcInfo[d.view][1];
                var translatedPoints = d.points.map(function (b){return [b[0]+xTranslate,b[1]+yTranslate]});
                d3.select(this).attr("transform","rotate("+d.rotationAngle+","+xTranslate+","+yTranslate+")");
                return ref.interactionPathGenerator(translatedPoints);
            });
    }
    //Render white path under the main hint path
    this.svg.select("#hintPath").append("path")
        .attr("d", hintPathArcString)
        .attr("id","pathUnderlayer")
        .attr("filter", "url(#blur)");

    //Render the hint path
    this.svg.select("#hintPath").append("path")
        .attr("d", hintPathArcString)
        .attr("id","path")
        .attr("filter", "url(#blur)");

	//Render the hint labels
	this.svg.select("#hintPath").selectAll("text")
         .data(this.hintArcInfo.map(function (d,i) {return {x:d[0],y:d[1],id:i}})).enter()
         .append("svg:text").text(function(d) { return ref.labels[d.id]; })
         .attr("transform", function (d){return "translate("+ d.x+","+ d.y+")";})
         .on("click",this.clickHintLabelFunction)
         .attr("fill-opacity",function (d){ return ref.changeLabelOpacity(d,ref.currentView)})
         .attr("id",function (d){return "hintLabel"+ d.id})
         .attr("class","hintLabels");

    //Fade out all the other segments
	this.svg.selectAll(".displayArcs").filter(function (d){return d.id!=id})
         .transition().duration(400).style("fill-opacity", 0.3);

   this.hintArcInfo = [];
}
/** Clears the hint path by removing all svg elements in #hintPath
 * */
 Piechart.prototype.clearHintPath = function (){
     this.pathData = [];
     this.interactionPaths = [];
     this.svg.select("#hintPath").selectAll("text").remove();
     this.svg.select("#hintPath").selectAll("path").remove();
     this.svg.selectAll(".displayArcs").style("fill-opacity", 1);
 }
/**Calculates the amount to translate the hint path inwards or outwards on the piechart
 * this is really acheived by growing or shrinking the radius of the hint path segments
 * index: the arc index (which arc the hint angle lies on)
 * view: the view index
 * */
Piechart.prototype.findHintRadius = function (index,view){
    return this.labelOffset+this.hintRadiusSpacing*(index-view);
}
/**Interpolates radius between start and end view, used for animating the hint path
 * while a segment is dragged
 * startView,endView: the views to interpolate between
 * index: the arc index (which arc the hint angle lies on)
 * */
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
 *  findCorners: a flag to determine whether or not corners should be located
 * */
Piechart.prototype.createArcString = function (pathInfo,findCorners){
    var dString = "";
    var x,y;
    var corners = [];
    var currentDirection = 1, previousDirection = 1;
  //TODO: doesn't draw properly when angle wraps around 360 deg
   for (var j=0;j<pathInfo.length;j++){
        //Either increasing or decreasing
        if (j>0){
            var x1,y1,x2,y2; //x2,y2 represents the bigger angle
            if (pathInfo[j][3] > pathInfo[j-1][3]){ //compare the angles to see which one is bigger
                currentDirection = 1;
                x1 = pathInfo[j-1][0];
                y1 = pathInfo[j-1][1];
                x2 = pathInfo[j][0];
                y2 = pathInfo[j][1];
            }else{
                currentDirection = 0;
                x1 = pathInfo[j][0];
                y1 = pathInfo[j][1];
                x2 = pathInfo[j-1][0];
                y2 = pathInfo[j-1][1];
            }

            if (currentDirection != previousDirection){ //Changing directions
                corners.push(1);
                x = this.cx + pathInfo[j][2]*Math.cos(pathInfo[j-1][3] -this.halfPi);
                y = this.cy+ pathInfo[j][2]*Math.sin(pathInfo[j-1][3] - this.halfPi);
                dString +="M "+pathInfo[j-1][0]+" "+pathInfo[j-1][1]+" L "+x+" "+y; //Small connecting line which joins two radii
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
       previousDirection = currentDirection;
    }

    //TODO: not recognizing stationary sequences as a corner (if they lie on a corner), but this might not be a problem because ambiguous cases are handled differently
    if (findCorners==1){
        this.corners = corners;
        this.corners.push(0); //For the last view
    }
    return dString;
}
//TODO: this function is not working (not high priority)
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
/** Search for ambiguous cases in a list of angles.  Ambiguous cases are tagged by type, using a number.
 *  The scheme is:
 *  0: not ambiguous
 *  1: stationary segment (doesn't move for at least 2 consecutive years)
 *  This information is stored in the ambiguousSegments array, which gets re-populated each time a
 *  new segment is dragged.  This array is in  the format: [type...number of views]
 *  angles: all angles along the hint path
 * */
Piechart.prototype.checkAmbiguous = function (angles){
    var j, currentSegment;
    var stationarySegments = [];
    this.isAmbiguous = 0;
    this.ambiguousSegments = [];

    //Re-set the ambiguousPoints array
    for (j=0;j<=this.lastView;j++){
        this.ambiguousSegments[j] = [0];
    }
    //Populate the stationary and revisiting bars array
    //Search for heights that are equal (called "repeated bars")
    for (j=0;j<=this.lastView;j++){
        currentSegment= angles[j];
        for (var k=j;k<=this.lastView;k++){
            if (j!=k && angles[k]== currentSegment){ //Repeated bar is found
                //if (j!=k && (Math.abs(this.pathData[k][1]- currentBar))<1){ //An almost stationary segment, less than one pixel difference
                if (Math.abs(k-j)==1){ //Stationary segment is found
                    this.isAmbiguous = 1;
                    //If the bar's index does not exist in the array of all stationary bars, add it
                    if (stationarySegments.indexOf(j)==-1){
                        stationarySegments.push(j);
                        this.ambiguousSegments[j] = [1];
                    }if (stationarySegments.indexOf(k)==-1){
                        stationarySegments.push(k);
                        this.ambiguousSegments[k] = [1];
                    }
                }
            }
        }
    }
    //If there exists any stationary segments in the dataset
    if (stationarySegments.length>0){
        //Then, generate points for drawing an interaction path
        this.findPaths(d3.min(stationarySegments));
    }
}
/** Populates "interactionsPath" array with all points for drawing the sine waves:
 * interactionPaths[] = [[points for the sine wave]..number of paths]
 * startIndex: the index of the first stationary bar (only for reducing the search time, can just
 * set this to 0)
 * */
Piechart.prototype.findPaths = function (startIndex){
    var pathInfo = [];
    for (var j=startIndex; j<=this.lastView;j++){
        if (this.ambiguousSegments[j][0]==1){
            if (j!=startIndex && this.ambiguousSegments[j-1][0]!=1){ //Starting a new path
                this.interactionPaths.push(this.calculatePathPoints(pathInfo));
                pathInfo = [];
            }
            pathInfo.push(j);
        }
    }
    this.interactionPaths.push(this.calculatePathPoints(pathInfo));
}
/** Calculates a set of points to compose a sine wave (for an interaction path)
 * indices: the corresponding year indices, this array's length is the number of peaks of the path
 * @return an array of points for drawing the sine wave: [[x,y], etc.]
 * */
Piechart.prototype.calculatePathPoints = function (indices){
    var angle = 0;
    var pathPoints = [];

    //Find the period of the sine function
    var length = indices.length;
    var totalPts = 3*length + (length-3);
    var xPos = 0, yPos = 0;
    var k = 0;

    //Calculate the points (5 per gap between views)
    for (var j=0;j<totalPts;j++){
        if (j%4 == 0){ //Crossing the axis of the sine wave (at a view point)
          xPos = this.hintArcInfo[indices[k]][0];
          yPos = this.hintArcInfo[indices[k]][1];
          k++;
        }
        var theta = angle + (Math.PI/4)*j;
        var y = this.amplitude*Math.sin(theta);
        var x = (this.hintRadiusSpacing/4)*j;

        pathPoints.push([x,y,xPos,yPos]);
    }

    //Insert the end direction (1=peak, -1=trough) of the sine wave into ambiguousBars array
    // (first direction will always be -1)
    var endDirection = (indices.length % 2==0)?-1:1;
    this.ambiguousSegments[indices[indices.length-1]] = [1,endDirection];

    return [pathPoints,indices[0]];
}