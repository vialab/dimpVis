////////////////////////////////////////////////////////////////////////////////
// Constructor
////////////////////////////////////////////////////////////////////////////////
function Scatterplot(x, y, w, h, id) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id; 

   // Reference to the main widget
   this.widget = null;  

   // Data used for display
   this.displayData = [];
   this.dataLength = 0;
   
   this.clickedPoint = null;
   this.hoveredPoint = -1;
   // Function objects, these should be implemented by the controller
   // Each components should get its own set of listeners,
   // do not share unless there is a reason to
   //this.nothing = function() { console.log("Not implemented"); };  // DO NOT OVERRIDE THIS !!!
   //this.mouseoverFunc = this.nothing;
   //this.mouseoutFunc  = this.nothing;
}






////////////////////////////////////////////////////////////////////////////////
// Prototype functions
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Initializes a container group 
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.init = function() {
   
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
Scatterplot.prototype.render = function( vdata ) {
    
   this.widget.attr("transform", "translate(0,0)"); 
   this.offset = 0;
   this.displayData = vdata;
   this.dataLength = this.displayData.length;
   var myRef = this;  
   var drag = d3.behavior.drag()
    .origin(function(d){ //Set the starting point of the drag interaction
	   return d;
	})
    .on("drag", dragmove);
	
   // Remove the data points
   this.widget.data([this.displayData] ).selectAll("circle").remove();
   
   // Render the data points
   this.widget.selectAll("circle")
      .data(this.displayData.map(function (d,i) {
	        return {x:d[0], y:d[1], id:i};
	  }))
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return d.x;
       })
     .attr("cy", function(d) {
        return d.y;
      })
	  .attr("r", function(d) {
         return Math.sqrt(100 - d.y);
      })
	  .style("cursor", "pointer")
	  .call(drag)
   ;   
   function dragmove(d) {
	  d3.select("#scatter").selectAll("g").selectAll("circle")
		  .attr("cx", d3.event.x)
		 .attr("cy", d3.event.y);
    }
}





