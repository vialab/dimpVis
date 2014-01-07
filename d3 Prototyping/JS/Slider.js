/** Constructor for a slider widget
 * x: the left margin
 * y: the right margin
 * id: id of the div tag to append the svg container
 * labels: an array of labels corresponding to a tick along the slider
 * description: a title for the slider
 * colour: the colour of the slider
 * spacing: spacing between ticks (in pixels)
 */
//TODO: Get rid of magic numbers and find a way to automatically compute them (e.g., positioning of slider and title relative to width)
function Slider(x, y, labels,description,colour,spacing) {
   // Save the position, size and display properties
   this.xpos = x;
   this.ypos = y;
   this.mouseX = -1;
   this.numTicks  = labels.length;
   this.title = description;
   this.tickLabels = labels;
   this.displayColour = colour;
   this.tickSpacing = spacing;
   this.sliderOffset = x+(description.length*20); //Font size of title is 20px
   this.width = this.sliderOffset + this.numTicks*this.tickSpacing;
   this.height = 50;
   this.tickYPos = 35; //Amount to translate the draggable tick by in the y coordinate
   this.anchorYPos = 12; //Amount to translate the anchor which follows the draggable tick when it is not placed on the main slider
   this.sliderHeight = 10; //Thickness of the main slider line

   this.currentTick = 0; //Start the slider always at the first tick
   this.nextTick = 1;  //The next tick is after the current one
   this.interpValue=0; //Amount of distance travelled between ticks, used to interpolate other visualizations
   this.widget = null;  // Reference to the main widget
   this.sliderPos = this.sliderOffset; //The starting horizontal position of the slider tick (at the first tick)
   this.timeDirection = 1 //Direction travelling along time line (1 if forward, -1 if backwards)

   //Generate an array of x locations for each tick
   this.tickPositions = []; //All x locations of the ticks on the slider
   for (var i=0; i < this.numTicks; i++){
       if (i==0){
	        this.tickPositions[i] = this.sliderOffset;
	   }else {
	         this.tickPositions[i] =  this.tickPositions[i-1] + this.tickSpacing;
	   }      
   }     
}
/** Append a blank svg and g container to the div tag indicated by "id", this is where the widget
 *  will be drawn.
 * */
Slider.prototype.init = function() {
   this.widget = d3.select("#mainSvg").append("g").attr("id","gSlider")
       .attr("width", this.width).attr("height", this.height)
       .attr("transform", "translate(" + this.xpos + "," + this.ypos + ")");
}
/** Render the widget onto the svg
 *  Note: no data set is required because it was automatically generated in the constructor
 * */
Slider.prototype.render = function() {
   var ref = this;

   //Add the title beside the slider
   this.widget.append("text").text(this.title).attr("class","slider")
              .attr("x",0).attr("y",20).attr("fill",this.displayColour)
              .style("font-family", "sans-serif").style("font-size","20px");

   //Prepare the data for drawing the slider ticks
   this.widget.selectAll("rect")
     .data(this.tickPositions.map(function (d,i) {return {id:i,value:d,label:ref.tickLabels[i]};}))
      .enter().append("g").attr("class","slider");

   //Draw the ticks
   this.widget.selectAll("g").append("svg:rect")
      .attr("x", function (d) {return d.value;})
      //.attr("y", function (d,i){return ((i==0)||(i==ref.numTicks-1))?(10-ref.sliderHeight/2):10})
       .attr("y", function (d,i){return (10-ref.sliderHeight/2)})
	  .attr("width", 2)//.attr("height", function (d,i){return ((i==0)||(i==ref.numTicks-1))?(12+ref.sliderHeight):12})
       .attr("height", function (d,i){return (12+ref.sliderHeight)})
      .style("fill", ref.displayColour)
	  .attr("class","ticks");

   //Draw the labels for each tick
   this.widget.selectAll("g").append("svg:text")
      .text(function(d) { return d.label; })
	  .attr("x", function(d) {return d.value}).attr("y", 0)
	  .style("font-family", "sans-serif").style("font-size", "14px")
	  .style("fill", function (d,i){
	       if (ref.tickLabels.length >25){ //Only display every 5 labels to reduce clutter
		      if (i%5 ==0) return ref.displayColour;
			  else return "none";
		   }
		   return ref.displayColour;
	   })
	   .attr("text-anchor","middle").attr("class","tickLabels");

   //Draw a long line through all ticks
   this.widget.append("rect").attr("class","slider")
       .attr("x",ref.sliderOffset).attr("y",10)
       .attr("width", ref.tickPositions[ref.numTicks-1] - ref.sliderOffset)
       .attr("height", ref.sliderHeight)
       .attr("fill", ref.displayColour);

  //Draw the draggable slider tick
  /**this.widget.append("rect")
      .attr("transform", function(d) { return "translate(" +ref.sliderPos + "," + ref.tickYPos + ")"; })
	  .attr("rx",4).attr("ry",4) //For curved edges on the rectangle
	  .attr("width", 10).attr("height", 20)
	  .attr("stroke", "white").attr("fill", ref.displayColour)
	  .style("cursor", "pointer").attr("id","slidingTick");*/

 //Draw a triangle draggable tick
  this.widget.append("path").attr("d",d3.svg.symbol().type("triangle-up").size(180))
      .attr("transform", "translate(" +ref.sliderPos + "," + ref.tickYPos + ")")
      .attr("fill", ref.displayColour).style("stroke","white")
      .style("cursor", "pointer").attr("id","slidingTick").attr("class","slider");
  //Draw an anchor to attach the triangle with the main slider bar
   this.widget.append("rect").attr("transform", "translate(" +(ref.sliderPos+1) + "," + ref.anchorYPos + ")")
        .attr("stroke", "none").style("fill", "#bdbdbd").attr("width", 1).attr("height", (ref.sliderHeight-4))
        .style("cursor", "pointer").attr("id","anchor").attr("class","slider");
}
/** Re-draws the dragged tick by translating it according to the x-coordinate of the mouse
 *  mouseX: The x-coordinate of the mouse, received from the drag event
 * */
Slider.prototype.updateDraggedSlider = function( mouseX ) {
   var ref = this;
  this.mouseX = mouseX; //Save the mouse position
  var translateX;

   var current = ref.tickPositions[ref.currentTick];
   var next = ref.tickPositions[ref.nextTick];
   if (ref.currentTick == 0){ //First tick
       if (mouseX <= current){//Out of bounds: Passed first tick
           translateX = current;
       }else if (mouseX >= next){
           ref.currentTick = ref.nextTick;
           ref.nextTick++;
           ref.interpValue = (ref.timeDirection == -1)? 1:0;
           translateX = mouseX;
        }else{
           ref.setInterpolation(mouseX,current,next);
           translateX = mouseX;
        }
   }else if (ref.nextTick == (ref.numTicks-1)){ //Last tick
       if (mouseX>= next){  //Out of bounds: Passed last tick
          translateX = next;
       }else if (mouseX <= current){
            ref.nextTick = ref.currentTick;
            ref.currentTick--;
            ref.interpValue = (ref.timeDirection == -1)? 1:0;
            translateX = mouseX;
       }else{
           ref.setInterpolation(mouseX,current,next);
           translateX = mouseX;
       }
   }else{ //A tick in between the end ticks
        if (mouseX <= current){ //Passed current
            ref.nextTick = ref.currentTick;
            ref.currentTick--;
            ref.interpValue = (ref.timeDirection == -1)? 1:0;
        }else if (mouseX>=next){ //Passed next
            ref.currentTick = ref.nextTick;
            ref.nextTick++;
            ref.interpValue = (ref.timeDirection == -1)? 1:0;
        }else{
            ref.setInterpolation(mouseX,current,next);
        }
      translateX = mouseX;
   }

    this.widget.select("#slidingTick").attr("transform","translate(" + translateX + "," + ref.tickYPos + ")");
    this.widget.select("#anchor").attr("width",translateX-ref.sliderOffset);
    //this.widget.select("#anchor").attr("transform", "translate(" + translateX + "," + ref.anchorYPos + ")");
}
/** Determines how far the slider has travelled between two ticks (current and next) and sets
 * the interpolation value accordingly (as percentage travelled)
 * current,next: the tick indices
 * mouseX: x-coordinate of mouse
 * */
Slider.prototype.setInterpolation = function( mouseX,current,next) {
     var totalDistance = Math.abs(next-current);
	 var distanceTravelled = Math.abs(mouseX - current);
     var newInterp = distanceTravelled/totalDistance;

    this.timeDirection = (newInterp>this.interpValue)?1:(newInterp<this.interpValue)?-1:this.interpValue;
    this.interpValue = newInterp;
}
/** Updates the location of the draggable tick to the new view
 * */
Slider.prototype.updateSlider = function( newView ) {
     var ref = this;
    //Update the view tracker variables
    if (newView == ref.numTicks){  //Last point of path
        ref.nextTick = newView;
        ref.currentTick = newView -1;
    }else { //A point somewhere in the middle
        ref.currentTick = newView;
        ref.nextTick = newView + 1;
    }
    //Redraw the draggable tick at the new view
    this.widget.select("#slidingTick")
	           //.attr("x",function (){return ref.tickPositions[newView];});
                .attr("transform",function (){return "translate(" + ref.tickPositions[newView] + "," + ref.tickYPos + ")";});
    this.widget.select("#anchor").attr("width",this.tickPositions[newView] - this.sliderOffset);
}
/** Snaps the draggable tick to the nearest tick on the slider after the mouse is
 *  released
 * */
Slider.prototype.snapToTick = function() {
     var ref = this;
    this.widget.select("#slidingTick")
        //.attr("x",function (){
        .attr("transform",function (){
         var current = ref.tickPositions[ref.currentTick];
         var next = ref.tickPositions[ref.nextTick];
         var currentDist = Math.abs(current - ref.mouseX);
         var nextDist = Math.abs(next - ref.mouseX);
         if (currentDist > nextDist){
            ref.currentTick = ref.nextTick;
            ref.nextTick++;
            ref.widget.select("#anchor").attr("width",next-ref.sliderOffset);
             return "translate(" + next + "," + ref.tickYPos + ")";
            //return (next-5);
        }
            ref.widget.select("#anchor").attr("width",current-ref.sliderOffset);
            return "translate(" + current + "," + ref.tickYPos + ")";
        //return (current-5);
     });

}
/** The tick is drawn according the to the provided interpolation amount,
 *  and interpolation occurs between current and next view
 *  Note: This function can be used to update the slider as another visualization
 *  object is dragged (e.g., scatterplot point)
 * */
Slider.prototype.animateTick = function(interpAmount, currentView, nextView) {
    var ref = this;
    if (interpAmount != 0){
        this.widget.select("#slidingTick")
               .attr("transform",function (){
                     var current = ref.tickPositions[currentView];
                     var next = ref.tickPositions[nextView];
                     var interpX = d3.interpolate(current,next)(interpAmount);
                     ref.widget.select("#anchor").attr("width",interpX-ref.sliderOffset)
                     return "translate("+interpX+","+ref.tickYPos+")";
                 });
    }
}