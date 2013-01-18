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
   
   this.clickedPoint = -1;
   this.hoveredPoint = -1;
   this.dragEvent = null;
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
  
	
   // Remove the data points
   this.widget.data([this.displayData] ).selectAll("circle").remove(); 
	
   // Render the data points
   this.widget.selectAll("circle")
     .data(this.displayData.map(function (d,i) {
	        return {x:d[0],y:d[1],nodes:d[2],id:i};
	  }))
	 // .data(this.displayData)
      .enter()
      .append("g")
	  .attr("id",function (d) {return "g"+d.id;});
   this.widget.selectAll("g").append("svg:circle")
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
   ;  
   
 //Testing drawing paths between points
 var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("basis");

     /**var path1data = [{x:0, y:33},{x:300,y:95},{x:400,y:15}];
	 var path2data = [{x:250, y:50},{x:100,y:30}]; 	
 
    var path = this.widget.append("svg:path")
                                  .attr("d", line(path1data))
								  .attr("id","1")
								  .style("stroke-width", 2)
								  .style("stroke", "steelblue")
								   .style("fill", "none");
	var path2 = this.widget.append("svg:path")
								  .attr("id","2")
                                  .attr("d", line(path2data))
								  .style("stroke-width", 2)
								  .style("stroke", "steelblue")
								   .style("fill", "none");*/
    this.widget.selectAll("g").append("svg:path")
                                  .attr("d", function(d){ return line(d.nodes); })
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", "steelblue")
								   .style("fill", "none");
   
  
}
//TODO:make sure doesn't go out of bounds!
//Updates the point location when a point is dragged
Scatterplot.prototype.updateDraggedPoint = function() {
    this.widget.selectAll("circle")
	 .attr("cx", function(d) {
        return d.x;
       })
     .attr("cy", function(d) {
        return d.y;
      });	
  
}
//Updates the display when a point is being dragged 
Scatterplot.prototype.updateDrag = function(clickedPoint) {	 
       var ref = this;
	  this.widget.selectAll("circle")     
        .attr("cx", function(d){
		      var point = ref.findPointOnCurve(d.id);	
		     // if (d.id == clickedPoint)
			      return point.x;
			 // return d.x;
		})
        .attr("cy", function(d){
		 var point = ref.findPointOnCurve(d.id);	
		   // if(d.id==clickedPoint)
			     return point.y;
			//return d.y;
		});
  
}
Scatterplot.prototype.findPointOnCurve = function(pathId){
    //Code from: http://bl.ocks.org/3824661	
   // var path = this.widget.select("path");	
   var path = d3.select("#scatter").select("svg").select("#g"+pathId).select("#p"+pathId); //Note: valid id's have to begin with a letter
  
	 var pathEl = path.node();
	 var pathLength = pathEl.getTotalLength();
	 //var BBox = pathEl.getBBox(); //gets the bounding box of the geometry
	 //var scale = pathLength/BBox.width;
	 //Number of pixels the upper left corner of current element is offset to the left within the parent
	 //var offsetLeft = document.getElementById("scatter").offsetLeft;
     
	 var x = d3.event.pageX; //X-coordinate of the mouse          
     var beginning = x, end = pathLength, target;
	 //Binary search for point to draw circle on
      while (true) {
        target = Math.floor((beginning + end) / 2); 
        pos = pathEl.getPointAtLength(target); //Gets the point at the specified distance
        if ((target === end || target === beginning) && pos.x !== x) {
            break;
        }
        if (pos.x > x)     
			end = target;
        else if (pos.x < x) 
			beginning = target;
        else                
			break; //position found
      }
	  pos.x = x;
	  return pos;
}




