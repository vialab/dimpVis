//Heatmap layout taken from Mike Bobstock: http://bl.ocks.org/mbostock/4063318
////////////////////////////////////////////////////////////////////////////////
// Used to draw the heatmap
////////////////////////////////////////////////////////////////////////////////
function Heatmap(x, y, w, h, id) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id;   
   this.cellSize = 20;
   this.selected = -1; //Variable to track whether or not a day is selected
   // Reference to the main widget
   this.widget = null;  
   //Variables to track dragged point location within path ("view switches")
   this.currentView = 0; //Start at the first view
   this.nextView = -1;
   this.totalViews = -1; //Last index of the points (nodes) array
   //Variables used for displaying the dataset
   this.allData = [];
   this.displayData=[];   
   this.labels = [];
   //Declare some functions
   this.mouseDownFunction = {};
   this.mouseUpFunction = {};
   this.mouseMoveFunction = {};
}

////////////////////////////////////////////////////////////////////////////////
// Prototype functions
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Initializes the svg 
////////////////////////////////////////////////////////////////////////////////
Heatmap.prototype.init = function() {
  
   // Initialize the main container
   this.widget = d3.select(this.id)
      .append("svg")	   
      .attr("width", this.width)
      .attr("height", this.height)  
	   .attr("class", "RdYlGn")
     .append("g") ; 
     //.attr("transform", "translate(" + ((this.width - this.cellSize * 53) / 2) + "," + (this.height - this.cellSize * 7 - 1) + ")");	 
 
}
////////////////////////////////////////////////////////////////////////////////
// Render
////////////////////////////////////////////////////////////////////////////////
Heatmap.prototype.render = function(data,rows,columns) {
  var ref = this;
 //Store all data and specify the data subset to display  
 ref.allData = data;
 ref.displayData = data[ref.currentView];
 var color = d3.scale.quantize()
    .domain([-.05, .05])
    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
//Label of the heatmap
/**this.widget.append("text")
    .attr("transform", "translate(-6," + ref.cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text("1999");*/
//Draw the cells for each day	
this.widget.selectAll(".cell")
    .data(ref.displayData.map(function (d,i) {        	
	     return {id:i,values:d};
	}))
  .enter().append("rect")
    .attr("class", "cell")
    .attr("width", this.cellSize)
    .attr("height", this.cellSize)	
	.attr("id", function (d) {return "cell"+d.id;})
    .attr("x", function(d) { 	 
	      return d.values.row*ref.cellSize; })
    .attr("y", function(d) {    
	    return d.values.column*ref.cellSize; })
	.on("mousedown",ref.mouseDownFunction)
	.on("mousemove",ref.mouseMoveFunction)
	.on("mouseup",ref.mouseUpFunction)    
	.append("title")
    .text(function(d) { return d.id; });
	

//TODO Later: assign data values to the days and colour them accordingly, using the colour scale
/** this.widget.selectAll(".day").filter(function(d) { return d in dates; })
        .attr("class", function(d) { return "day q" + Math.round(color(dates[d])) + "-9"; })
        .select('title')
        .text(function(d) { return fullFormat(d) + ": " + dates[d].toFixed(1); });*/
//Debugging: Find real daily data to populate calendar		
this.widget.selectAll(".cell")
        .attr("class", function(d) { return color(d.values.colourValue); });
//Draw the g element to contain the hint path for the dragged tile
this.widget.append("g").attr("id","hintPath");     

}

//Draws a hint path for the selected day tile
//id: The ID of the dragged tile
Heatmap.prototype.showHintPath = function(id){
   var ref = this;   
   this.widget.select("#cell"+id);
}




