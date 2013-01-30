////////////////////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////////////////////
function Slider(x, y, w, h, id,num) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id; 
   this.numTicks  = num;
   // Reference to the main widget
   this.widget = null;  
   this.sliderPos = x; //The horizontal position of the slider tick, changes while its dragged
   this.tickSpacing = 50; //Distance between ticks
   this.tickPositions = []; //All x locations of the ticks on the slider
   for (var i=0; i < this.numTicks; i++){
       if (i==0){
	        this.tickPositions[i] = this.xpos;
	   }else {
	         this.tickPositions[i] =  this.tickPositions[i-1] + this.tickSpacing;
	   }      
   }  
   this.clicked = -1;
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
	
   // Render the slider ticks
   this.widget.selectAll("rect")
     .data(this.tickPositions.map(function (d,i) {
	        return {id:i,value:d};
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
     .attr("height", 20)	  
      .attr("fill", "gray")
	  .attr("class","ticks")
	  ;  
    //Slider labels for each tick  
   this.widget.selectAll("g")
      .append("svg:text")
      .text(function(d) { return d.id; })
	  .attr("x", function(d) {return d.value})
	 .attr("y", function (d) {
	       return 45;
	  })
	  .attr("font-family", "sans-serif")
   .attr("font-size", "12px")
   .attr("fill", "gray")
   .attr("text-anchor","middle");
   //Draw a long line through all ticks
   this.widget.append("rect").attr("class","sliderAxis")
               .attr("x",ref.xpos)
			   .attr("y",10)
			   .attr("width", function(){
			       return (ref.tickPositions[ref.numTicks-1] - ref.xpos);
			   })	
               .attr("height", 2)	  
               .attr("fill", "gray")
	        ;
  //Draw the draggable slider tick
  this.widget.append("rect")
      .attr("x", ref.sliderPos)
     .attr("y", 0)
	  .attr("width", 5)	
     .attr("height", 20)	  
	  .attr("stroke", "white")
      .attr("fill", "gray")
	  .style("cursor", "pointer") 
      .attr("id","slidingTick");	  
   /**
   this.widget.append("triangle")
              .attr("id", "goForward");
	
	this.widget.append("triangle")
	           .attr("id","goBackward");*/

  
}
////////////////////////////////////////////////////////////////////////////////
// Update the location of the slider tick during drag movement
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.updateDraggedSlider = function( mouseX ) {
     var ref = this;
    this.widget.select("#slidingTick")
	           .attr("x",function (){	
                   var lowerBound = ref.xpos;
                   var upperBound = ref.tickPositions[ref.numTicks-1];
                   if (mouseX <lowerBound){
				       return lowerBound;
				   }else if (mouseX > upperBound){
				       return upperBound;
				   }
				   //Dragged within bounds of the entire slider
				    return mouseX;  
				   			       
	});
	
  
}
////////////////////////////////////////////////////////////////////////////////
// Snap the draggable tick to the nearest tick on the slider (mouse released
// indicating end of drag event)
////////////////////////////////////////////////////////////////////////////////
Slider.prototype.snapToTick = function( mouseX ) {
     var ref = this;
    this.widget.select("#slidingTick")
	           .attr("x",function (){	
			        var minDistance = 1000000000;
					var nearestTick = null;
                   //Search for the nearest tick
                   	for (var i=0;i<ref.tickPositions.length;i++){
					      var distance = Math.abs(ref.tickPositions[i] - mouseX);
						  if (distance < minDistance){
						      minDistance = distance;
							  nearestTick = i;
						  }
                    }
					ref.sliderPos = nearestTick;
                    return ref.tickPositions[nearestTick];					
	             });
	
  
}