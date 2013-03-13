//Heatmap layout taken from Mike Bobstock: http://bl.ocks.org/mbostock/4063318
////////////////////////////////////////////////////////////////////////////////
// Used to draw the heatmap
////////////////////////////////////////////////////////////////////////////////
function Heatmap(x, y, w, h, id,l) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id;   
   this.cellSize = 35;
   this.selected = -1; //Variable to track whether or not a day is selected
  this.selectedColours = []; //All colours of the dragged cell
   // Reference to the main widget
   this.widget = null;  
   //Variables to track dragged point location within path ("view switches")
   this.currentView = 0; //Start at the first view
   this.nextView = -1;
   this.totalViews = -1; //Last index of the points (nodes) array
   //Variables used for displaying the dataset
   this.allData = [];
   this.displayData=[];   
   this.labels = l;
   //Declare some functions
   this.mouseDownFunction = {};
   this.mouseUpFunction = {};
   this.mouseMoveFunction = {};
   //Function for assigning colours to each cell
   this.generateColour = d3.scale.quantize()
    .domain([-.05, .05])
    .range(["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)", "rgb(254,224,139)"]);
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
 
//Label of the heatmap
/**this.widget.append("text")
    .attr("transform", "translate(-6," + ref.cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text("1999");*/
//Draw the cells for each day	
this.widget.selectAll(".cell")
    .data(ref.displayData.map(function (d,i) {   
	      var allColours = [];
          for (var j=0;j<ref.allData.length;j++){       
				allColours[j] = ref.generateColour(ref.allData[j][i].colourValue);	   
         }		 
	     return {id:i,values:d,x:d.row*ref.cellSize,y:d.column*ref.cellSize,colours:allColours};
	}))
  .enter().append("rect")
    .attr("class", "cell")
    .attr("width", this.cellSize)
    .attr("height", this.cellSize)	
	.attr("id", function (d) {return "cell"+d.id;})
    .attr("x", function(d) { 	 
	      return d.x; })
    .attr("y", function(d) {    
	    return d.y; })
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
        .attr("fill", function(d) { return ref.generateColour(d.values.colourValue); });
//Draw the g element to contain the hint path for the dragged tile
this.widget.append("g").attr("id","hintPath");     

}
//Updates the colour of the dragged cell by interpolation
Heatmap.prototype.updateDraggedCell = function(id, mouseY){
  var ref = this;
  this.widget.select("#cell"+id)
  .attr("fill", function (d){
      //Get the y coordinate of the cell and calculate the middle of it	  
	  var middleY = d.y+ref.cellSize/2;
	  var oldColour = d.colours[ref.currentView]; //Save the previous colour	
      var newColour;	   
	  if (mouseY<middleY){
         if (ref.currentView !=0){ //Make sure not at first view		    
		     ref.currentView--;
			 newColour = d.colours[ref.currentView];
			 ref.updateAllCells(id);
			 return newColour;
         }	        		 
	  }else {	
         if (ref.currentView != (ref.allData.length-1)){ //Make sure not at last view
		     ref.currentView++;
			 newColour = d.colours[ref.currentView];
			 ref.updateAllCells(id);
			 return newColour;
         }		 
	  } 
      return oldColour;	  
  });
}
//Updates the colour of the rest of the cells based on the dragged cell
Heatmap.prototype.updateAllCells = function(id){
  var ref = this;
  this.widget.selectAll(".cell")
  .attr("fill", function (d){
      return d.colours[ref.currentView];  
  });
}
//Draws a hint path for the selected day tile
//id: The ID of the dragged tile
Heatmap.prototype.showHintPath = function(id,colours){
   var ref = this;   
   
  //Draw the "hint cells" and hint labels
   this.widget.select("#hintPath").selectAll("rect")
		   .data(colours).enter().append("rect")
		   .attr("x",200)
		   .attr("y",function (d,i){return i*ref.cellSize/2;})
		   .attr("width",ref.cellSize)
		   .attr("height",ref.cellSize/2)
		   .attr("fill", function (d){ return d;});
  this.widget.select("#hintPath").selectAll("text")
            .data(colours).enter()	   
		   .append("text")
		   .attr("x",(200+ref.cellSize))		  
		   .attr("y",function (d,i){return (i*ref.cellSize/2+ref.cellSize/3);})
		   .text(function (d,i){ return ref.labels[i];}); 
		   
}
//Clears a hint path for the selected day tile
//id: The ID of the dragged tile
Heatmap.prototype.clearHintPath = function(id){
  this.selectedColours = [];  
   this.widget.select("#hintPath").selectAll("rect").remove();
	this.widget.select("#hintPath").selectAll("text").remove();	   
}




