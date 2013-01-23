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
   this.currentView = -1;   
   this.motionDirection = 1; //To the right
   // Data used for display
   this.displayData = [];
   this.dataLength = 0;
   
   this.clickedPoint = -1;
   this.hoveredPoint = -1;
   this.dragEvent = null;
   
  
   this.placeholder = function() { 
		console.log("Not implemented"); 
   }; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder;  
   this.clickFunction = this.placeholder;
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
// start = year or instance the view represents
////////////////////////////////////////////////////////////////////////////////
Scatterplot.prototype.render = function( vdata, start ) {
    
   this.displayData = vdata;  
   this.currentView = start;   
   var myRef = this; 
   //Remove everything in the svg
	this.widget.selectAll("g").remove(); 
   // Draw the data points
   this.widget.selectAll("circle")
     .data(this.displayData.map(function (d,i) {
	        return {nodes:d,id:i,x:d[myRef.currentView][0], y:d[myRef.currentView][1]};
	  }))	
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
         return 10;		 
      })
	  .attr("class", "displayPoints")
	  .style("cursor", "pointer")  
       .on("mouseover", myRef.mouseoverFunction)
       .on("mouseout", myRef.mouseoutFunction)	
       .on("click", myRef.clickFunction)		   
   ;  
   
 //Testing drawing paths between points
 var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear"); //Interpolate curve should pass through all points, however concaved interpolations falsify the data

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
								  .style("stroke", "none")
								   .style("fill", "none");
    this.widget.selectAll("g").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})								  
								   ;
	this.widget.selectAll("g").selectAll("g").selectAll("circle")
                                             .data(function(d) {return d.nodes;})
											 .enter().append("svg:circle")
											 .attr("cx", function(d) { return d[0]; })
											.attr("cy", function(d) { return d[1]; })
											.attr("r",3)
											.attr("class","hintPoints")
											.style("fill","none");
  
}

//TODO:make sure doesn't go out of bounds!
//Updates the point location when a point is dragged
Scatterplot.prototype.updateDraggedPoint = function() {
    this.widget.selectAll(".displayPoints")
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
	   var mouseX = d3.event.pageX;
	  this.widget.selectAll(".displayPoints")     
        .attr("cx", function(d){
		      if(d.id==clickedPoint){
			    //Check to make sure mouse is within the defined path of the node
                if (mouseX < d.x){
			     return d.x;
				  }else if (mouseX > d.nodes[d.nodes.length-1][0]){
					 return d.nodes[d.nodes.length-1][0];
				  }	              			  
               return mouseX;
			}			
			return d.x;
		})
        .attr("cy", function(d){		   
		   if (d.id==clickedPoint){	 
		     //Check to make sure mouse is within the defined path of the node
              if (mouseX < d.x){
			     return d.y;
              }else if (mouseX > d.nodes[d.nodes.length-1][0]){
			     return d.nodes[d.nodes.length-1][1];
			  }				  
			  var x0 = d.nodes[ref.currentView][0];
			  var y0 = d.nodes[ref.currentView][1];			 
			  var x1,y1,interpY;
              //Determine motion direction			  
			  if (mouseX < x0) {//Moving to the left
			     ref.motionDirection = -1;			 
			  }
			  else {//Moving to the right
			      ref.motionDirection = 1;				  
			  }
			  x1 = d.nodes[ref.currentView+ref.motionDirection][0];
			  y1 = d.nodes[ref.currentView+ref.motionDirection][1]; 
              		  
			  var interpY = ref.findInterpY(mouseX,x0,y0,x1,y1);
              //Check for a view transition
              if (mouseX <= x0 || mouseX >=x1)
                  ref.currentView = ref.currentView + ref.motionDirection;				  
              return interpY;	   
		   }
			return d.y;
		});
  
}

//Finds the interpolated value of the unknown y-coordinate
Scatterplot.prototype.findInterpY = function(x,x0,y0,x1,y1){      
	var interpY = y0 + (y1 - y0)*((x - x0)/(x1 - x0));
	return interpY;
    
}
Scatterplot.prototype.showHintPath = function (id){
        this.widget.select("#g"+id).select("#p"+id)                                  
								  .style("stroke", "steelblue");
        this.widget.select("#g"+id).select("#gInner"+id).selectAll(".hintPoints")                                  
								  .style("fill", "steelblue");								  
}
//Emphasize when the point has passed a view change
/**Scatterplot.prototype.highlightPoint = function (id){
       this.widget.selectAll(".displayPoints")
			 .attr("cx", function(d) {
				return d.x;
			   })
			 .attr("cy", function(d) {
				return d.y;
			  });							  
}
Scatterplot.prototype.clearHighlightPoint = function (id) {
	 this.widget.selectAll(".displayPoints")
				 .attr("cx", function(d) {
					return d.x;
				   })
				 .attr("cy", function(d) {
					return d.y;
				  });
}*/
Scatterplot.prototype.clearHintPath = function (id) {
      this.widget.select("#g"+id).select("#p"+id)                                  
								  .style("stroke", "none");
	   this.widget.select("#g"+id).select("#gInner"+id).selectAll(".hintPoints")                                  
								  .style("fill", "none");	
}


