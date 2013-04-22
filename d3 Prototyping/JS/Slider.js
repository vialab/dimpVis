////////////////////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////////////////////
function Slider(x, y, w, h, id,num,labels,description,colour,spacing) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id; 
   this.numTicks  = num;
   this.title = description;
   this.currentTick = 0; //Start the slider always at the first tick
   this.nextTick = 1;  //The next tick after the current one
   this.interpValue=0; //Amount of distance travelled between ticks, used to interpolate other visualizations
   // Reference to the main widget
   this.widget = null;  
   this.sliderOffset = x+80;
   this.sliderPos = this.sliderOffset; //The horizontal position of the slider tick, changes while its dragged
   this.tickSpacing = spacing; //Distance between ticks
   this.tickPositions = []; //All x locations of the ticks on the slider
   this.tickLabels = labels;
   this.displayColour = colour;
   //Generate a list of all x locations for each tick
   for (var i=0; i < this.numTicks; i++){
       if (i==0){
	        this.tickPositions[i] = this.sliderOffset;
	   }else {
	         this.tickPositions[i] =  this.tickPositions[i-1] + this.tickSpacing;
	   }      
   }     
}
////////////////////////////////////////////////////////////////////////////////
// Prototype functions
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Initializes a container group 
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.init = function() {
   
   var myRef = this;
  
   // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
      .attr("width", this.width)
      .attr("height", this.height)
      .style("position", "absolute")
      .style("left", this.xpos + "px")
      .style("top", this.ypos + "px")  
      .append("g")	  
   ; 
}
////////////////////////////////////////////////////////////////////////////////
// Render
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.render = function() {   
   
   var ref = this;   
	
   // Remove 
   this.widget.selectAll("g").remove(); 
   this.widget.append("text").text(this.title).attr("x",this.xpos).attr("y",20).attr("fill",this.displayColour)
                                              .style("font-family", "sans-serif").style("font-size","20px");
   // Render the slider ticks
   this.widget.selectAll("rect")
     .data(this.tickPositions.map(function (d,i) {
	        return {id:i,value:d,label:ref.tickLabels[i]};
	  }))	 
      .enter()  
	  .append("g")
	  ;
	 //Draw the ticks
    this.widget.selectAll("g").append("svg:rect")
      .attr("x", function (d) {
	       return d.value;
	  })
     .attr("y", 10)
	  .attr("width", 1)	
     .attr("height", 12)	  
      .attr("fill", ref.displayColour)
	  .attr("class","ticks")
	  ;  
    //Slider labels for each tick  
   this.widget.selectAll("g")
      .append("svg:text")
      .text(function(d) { return d.label; })
	  .attr("x", function(d) {return d.value})
	 .attr("y", function (d) {
	       return 37;
	  })
	  .attr("font-family", "sans-serif")
	   .attr("font-size", "12px")
	   .attr("fill", function (d,i){
	       if (ref.tickLabels.length >25){ //only display every 5 labels
		      if (i%5 ==0){
			     return ref.displayColour;				 
			  }else{
			    return "none";
			  }
		   }
		   return ref.displayColour
	   })
	   .attr("text-anchor","middle");
   //Draw a long line through all ticks
   this.widget.append("rect").attr("class","sliderAxis")
               .attr("x",ref.sliderOffset)
			   .attr("y",10)
			   .attr("width", function(){
			       return (ref.tickPositions[ref.numTicks-1] - ref.sliderOffset);
			   })	
               .attr("height", 2)	  
               .attr("fill", ref.displayColour)
	        ;
  //Draw the draggable slider tick
  this.widget.append("rect")
      .attr("x", (ref.sliderPos-5))
     .attr("y", 0)
	 .attr("rx",4)
	 .attr("ry",4)
	  .attr("width", 10)	
     .attr("height", 20)	  
	  .attr("stroke", "white")
      .attr("fill", ref.displayColour)
	  .style("cursor", "pointer") 
      .attr("id","slidingTick"); 
}
////////////////////////////////////////////////////////////////////////////////
// Update the location of the slider tick during drag movement
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.updateDraggedSlider = function( mouseX ) {
     var ref = this;
     this.widget.select("#slidingTick")
	           .attr("x",function (){                   			   
				   var current = ref.tickPositions[ref.currentTick];
				   var next = ref.tickPositions[ref.nextTick];				   
                   if (ref.currentTick == 0){ //First tick
				       //Out of bounds: Passed first tick
					   if (mouseX <= current){
					      return current;
					   }else if (mouseX >= next){
					       ref.currentTick = ref.nextTick;
						   ref.nextTick = ref.currentTick+1;					   
						}
						  ref.setInterpolation(mouseX,current,next);
						  return mouseX;			       
				   }else if (ref.nextTick == (ref.numTicks-1)){ //Last tick
				       //Out of bounds: Passed last tick
					   if (mouseX>= next){
					      return next;
					   }else if (mouseX <= current){
					        ref.nextick = ref.currentTick;
							ref.currentTick--;						
					   }
					   ref.setInterpolation(mouseX,current,next);
					   return mouseX;
				   }else{
				        if (mouseX <= current){
						    ref.nextTick = ref.currentTick;
							ref.currentTick--;
						}else if (mouseX>=next){
						    ref.currentTick = ref.nextTick;
							ref.nextTick++;
						}	
                        ref.setInterpolation(mouseX,current,next);						
						return mouseX;
				   }				 		   			       
	});
  
}
////////////////////////////////////////////////////////////////////////////////
// Determines how far the slider has travelled between two ticks (current and next) and sets
// the interpolation value accordingly (as percentage travelled)
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.setInterpolation = function( mouseX,current,next) {
     var totalDistance = Math.abs(next-current);
	 var distanceTravelled = Math.abs(mouseX - current);
	 if (totalDistance !=0){
	    this.interpValue = distanceTravelled/totalDistance;
	 }else {
	    this.interpValue = 1;
	 }
}
////////////////////////////////////////////////////////////////////////////////
// Update the location of the slider tick according to dragged data point/object
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.updateSlider = function( newLocation ) {
     var ref = this;
    this.widget.select("#slidingTick")
	           .attr("x",function (){	
                   return ref.tickPositions[newLocation];
				   			       
	});  
}
////////////////////////////////////////////////////////////////////////////////
// Snap the draggable tick to the nearest tick on the slider (mouse released
// indicating end of drag event)
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.snapToTick = function(mouseX) {
     var ref = this;
    this.widget.select("#slidingTick")
	           .attr("x",function (){	
			         var current = ref.tickPositions[ref.currentTick];
				     var next = ref.tickPositions[ref.nextTick];	
					 var currentDist = Math.abs(current - mouseX);
					 var nextDist = Math.abs(next - mouseX);
					 if (currentDist > nextDist){
					    ref.currentTick = ref.nextTick;
						ref.nextTick++;
						return (next-5);
					}
					return (current-5);					 
	             });  
}
////////////////////////////////////////////////////////////////////////////////
// This function is meant to interface with other visualization, the tick is
// moved according to the interpolation value of a dragged data object
// between the current and next view
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.animateTick = function(interpValue, currentView, nextView) {
    var ref = this;     
    this.widget.select("#slidingTick")
	           .attr("x",function (){	
			         var current = ref.tickPositions[currentView];
				     var next = ref.tickPositions[nextView];	
					 var interpolator = d3.interpolate(current,next);						 
					 return interpolator(interpValue);
	             });  
}