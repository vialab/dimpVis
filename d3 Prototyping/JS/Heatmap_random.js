//Heatmap layout taken from Mike Bobstock: http://bl.ocks.org/mbostock/4063318
////////////////////////////////////////////////////////////////////////////////
// Used to draw the heatmap
////////////////////////////////////////////////////////////////////////////////
function Heatmap(x, y, w, h, id,l,al,p) {

   // Position and size attributes
   this.xpos = x;
   this.ypos = y;
   this.width = w;
   this.height = h;
   this.id = id;   
   this.padding = p; //surrounding the heatmap
   this.cellSize = 35;
   this.selected = -1; //Variable to track whether or not a day is selected
   this.axisColour = "#c7c7c7"
   // Reference to the main widget
   this.widget = null;  
   //Variables to track dragged point location within path ("view switches")
   this.currentView = 0; //Start at the first view
   this.nextView = 1;
   this.viewChange = 1; //Decrement or increment the currentview
   this.previousMouseY=null; //To track the old mouse positions
   this.interpValue = 0; //Value to track the progress of colour interpolation when switching between views
   this.pixelTolerance = 2; //Number of pixels to move before an interpolation in colour occurs (slow down the colour switching)
   //Variables used for displaying the dataset
   this.allData = [];
   this.displayData=[];   
   this.labels = l;
   this.axisLabels = al;
   this.numViews = l.length;
   this.xSpacing = 30; //Spacing across x for hint path
   this.ySpacing = 20; //Spacing for the y of hint path
   this.xHint = -1; //Saves the x of the dragged cell
   this.hintData = []; //Save the hint data - change later
   //Declare some functions
   this.dragEvent = null;
   //Function for assigning colours to each cell
   this.generateColour = d3.scale.quantize()
    .domain([-0.05, 0.05])
    //.range(["rgb(165,0,38)","rgb(215,48,39)","rgb(244,109,67)","rgb(253,174,97)", "rgb(254,224,139)"]); //red
	//.range(["rgb(255, 255, 217)","rgb(237, 248, 177)","rgb(199, 233, 180)","rgb(127, 205, 187)","rgb(65, 182, 196)","rgb(29, 145, 192)","rgb(34, 94, 168)","rgb(12, 44, 132)"]); //blue long
	.range(["rgb(254,224,139)","rgb(253,174,97)","rgb(244,109,67)","rgb(215,48,39)","rgb(165,0,38)"]);
  this.generateHintY = d3.scale.quantize()
    .domain([-0.05, 0.05])
    .range([1,2,3,4, 5]);
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
     .append("g")  
     .attr("transform", "translate(" + this.xpos + "," + this.ypos + ")");	 
 
}
////////////////////////////////////////////////////////////////////////////////
// Render
////////////////////////////////////////////////////////////////////////////////
Heatmap.prototype.render = function(data,rows,columns,colours) {
  var ref = this;
 //Store all data and specify the data subset to display  
 ref.allData = data; 
 ref.displayData = data[ref.currentView]; 

this.widget.append("svg:defs")
				.append("svg:filter")
			    .attr("id", "blur")
				.append("svg:feGaussianBlur")
				.attr("stdDeviation", 2);
this.widget.append("svg:defs")
				.append("svg:filter")
			    .attr("id", "blur2")
				.append("svg:feGaussianBlur")
				.attr("stdDeviation", 3);
//Draw the cells for each day	
this.widget.selectAll(".cell")
    .data(ref.displayData.map(function (d,i) {   
	      var allColours = [];	
         var hintPathData = [];	
        var yValue = 0;		
       var totalDistance = 570; //start index at zero..	  
          for (var j=0;j<ref.allData.length;j++){ 		        
                //ref.generateColour.domain(colours[j]);
                //ref.generateHintY.domain(colours[j]);				
               // if (ref.allData[j][i].colourValue >0){		
					allColours[j] = ref.generateColour(ref.allData[j][i].colourValue);	
					yValue = ref.generateHintY(ref.allData[j][i].colourValue);	
               /** }else{
				   allColours[j] = "rgb(255,255,255)";					  
                   yValue = 0;				   
                }*/
				
                hintPathData[j] = [allColours[j],(j*ref.xSpacing),(yValue*ref.ySpacing),(j*ref.xSpacing)/totalDistance];				
         }	
		  
        //console.log(hintPathData);
	     return {id:i,values:d,x:d.row*ref.cellSize+ref.padding,y:d.column*ref.cellSize+ref.padding,colours:allColours,pathData:hintPathData};
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
	.style("cursor", "pointer")
	.append("title")
    .text(function(d) { return d.id; });

this.widget.selectAll(".cell")
        .attr("fill", function(d) { return d.colours[ref.currentView]; });
//Draw the g element to contain the hint path for the dragged tile
this.widget.append("g").attr("id","hintPath");     
//Draw the axis labels
this.widget.selectAll(".axisVertical text").data(this.axisLabels)
                             .enter()	                                     						  
						    .append("svg:text")
							.text(function(d,i) { return d; })
                            .attr("x",ref.cellSize*6+ref.padding)
                            .attr("y",function (d,i){
							  return ref.cellSize*i+ref.padding+ref.cellSize/2;
							})
                            .attr("fill",this.axisColour)							
                            .attr("font-size","12px")
							.attr("class","axisVertical");		
this.widget.selectAll(".axisHorizontal text").data(this.axisLabels)
                             .enter()	                                     						  
						    .append("svg:text")
							.text(function(d,i) { return d; })
                            .attr("x",function (d,i){
							    return ref.cellSize*i+ref.padding+ref.cellSize/2;
							})
                            .attr("y",ref.cellSize*6+ref.padding)
                            .attr("fill",this.axisColour)							
                            .attr("font-size","12px")
							.attr("class","axisHorizontal")
							 .style("text-anchor", "end");
							

}
//Updates the colour of the dragged cell by interpolation
Heatmap.prototype.updateDraggedCell = function(id, mouseY){
  var ref = this;
  var yDiff = Math.abs(mouseY - ref.previousMouseY); 
  /**if (yDiff>=ref.pixelTolerance && yDiff>0 && ref.interpValue < 0.9){
     ref.interpValue += 0.1;	 
  }else if (ref.interpValue>=0.9){
     ref.interpValue = 1;
  }*/
  if (yDiff<=ref.pixelTolerance && yDiff>0 && ref.interpValue <= 0.9){
     ref.interpValue += 0.1;	 
  }else {
     ref.interpValue = 1;
  }
  var direction = ref.previousMouseY - mouseY;

  this.widget.select("#cell"+id).each(function (d){
       //Get the y coordinate of the cell and calculate the middle of it      	   
	  var middleY = d.y+ref.cellSize/2;	 	   
	  if (direction>0 && ref.currentView !=0){ //Make sure not at first view 
	         ref.viewChange = -1;			
             if (ref.interpValue < 1){ //Not yet reached the next view
			      ref.interpolateColours(-1);
             }else{			 
				 ref.currentView--;
                 ref.interpValue = 0;				 
				 ref.updateView();	
             }			 
         	        		 
	  }else if (ref.currentView < ref.allData.length){	 //Make sure not at last view 
             ref.viewChange = 1;	  
		     if (ref.interpValue < 1){
			     ref.interpolateColours(1);
			 }else{
			    ref.currentView++;	
                ref.interpValue = 0;				
			    ref.updateView(); 
			 }		        		 
	  }    
	}); 
   ref.previousMouseY = mouseY;
   
}
//Updates the colour of the rest of the cells based on the dragged cell
//Updates the hint path of the dragged cell
Heatmap.prototype.updateView = function(){
  var lineGeneratorUpdate = d3.svg.line()
					.x(function(d,i) { return ref.findHintX(i,ref.currentView); })
					.y(function(d) { return d[2]; })
					.interpolate("linear");  
  var ref = this;
  //Re-colour all other cells
  this.widget.selectAll(".cell")
 // .transition().duration(400)
  .attr("fill", function (d){      
      return d.colours[ref.currentView];  
  });
  //Re-position the hint path indicator to show current view
  /**this.widget.select("#hintIndicator")
             .attr("y",(ref.currentView*ref.cellSize/2));*/
  this.widget.select("#hintPath").selectAll("text").attr("x",function (d,i) {return ref.findHintX(i,ref.currentView);});
  //Render the hint path line									    
    this.widget.select("#hintPath").selectAll("path").attr("d", function(d){                                         							  
								         return lineGeneratorUpdate(ref.hintData); 
								  });

}
//Updates the colour of the rest of the cells interpolating between views
//view: -1 if the view is transitioning backwards
//           1 if the view is transitioning forwards
Heatmap.prototype.interpolateColours = function(view){
  var ref = this; 
  var nextView = view + ref.currentView;
  //Re-colour all other cells
  this.widget.selectAll(".cell")
  //.transition().duration(400)
  .attr("fill", function (d){    
      var interpolator = d3.interpolate(d.colours[ref.currentView],d.colours[nextView]);  
      return interpolator(ref.interpValue);  
  }); 
    var travelAmount = Math.abs(nextView*ref.cellSize/2 - ref.currentView*ref.cellSize/2)*ref.interpValue;
   //Re-position the hint path indicator to show transition to next view
  /** this.widget.select("#hintIndicator")
             .attr("y",ref.currentView*ref.cellSize/2+travelAmount);*/
	/**this.widget.select("#hintPath").selectAll("text").attr("x",function (d,i) {
	         var currentX = ref.findHintX(i,ref.currentView);
			 var nextX = ref.findHintX(i,nextView);
			 var addedDistance = Math.abs(nextX - currentX)*travelAmount;
	        return currentX-addedDistance;
			});
 var animateLineGenerator = d3.svg.line()
								.x(function(d,i) { 
									  var currentX = ref.findHintX(i,ref.currentView);
									  var nextX = ref.findHintX(i,nextView);
									  var addedDistance = Math.abs(nextX - currentX)*travelAmount;								
									return currentX - addedDistance;											       
								  })
								.y(function(d) { return d[2]; })
								.interpolate("linear"); 
     //Render the hint path line									    
    this.widget.select("#hintPath").selectAll("path").attr("d", function(d){                                         							  
								         return animateLineGenerator(ref.hintData); 
								  });*/
  
			 
}
//Snaps to a view based on the direction of the mouse and the interpolation value (which colour is closer)
Heatmap.prototype.snapToView = function(){
  var ref = this;
  if (ref.interpValue > 0.5){ //Only update the view if the interpolation is over 50% to the next colour
      ref.currentView = ref.currentView+ref.viewChange;
  }
  //Update the view
  ref.interpValue = 0;
  ref.updateView();  
}
//Draws a hint path for the selected day tile
//id: The ID of the dragged tile
// colours: All colour states of the dragged cell
// x: the current x position of the cell
// y: the current y position of the cell
Heatmap.prototype.showHintPath = function(id,pathData,x,y){
   var ref = this; 
  ref.xHint = x;
  this.hintData = pathData;
 var lineGenerator = d3.svg.line()
					.x(function(d) { return d[1]; })
					.y(function(d) { return d[2]; })
					.interpolate("linear");   
					
   this.widget.append("linearGradient")                
        .attr("id", "line-gradient")            
        .attr("gradientUnits", "userSpaceOnUse")    
        .attr("x1", 0).attr("y1", 0)         
        .attr("x2", 0).attr("y2", 100)      
    .selectAll("stop")                      
        .data(pathData)                  
    .enter().append("stop")         
        .attr("offset", function(d) { return d[3]; })   
        .attr("stop-color", function(d) { return d[0]; }); 
//Render the underlayer of the hint path
this.widget.select("#hintPath").append("svg:path")								  
								  .attr("d", function(d){                                         							  
								         return lineGenerator(pathData); 
								  })								 
								  .style("stroke-width", 10)
								  .style("stroke", "white")
								  .style("fill","none")	
								  .attr("transform", "translate(" + x + "," + y + ")")
								  .attr("filter", "url(#blur2)");	
//Render the hint path line									    
    this.widget.select("#hintPath").append("svg:path")
                                  .attr("d", function(d){                                         							  
								         return lineGenerator(pathData); 
								  })								 
								  .style("stroke-width", 4)
								  .style("stroke", "url(#line-gradient)")
								  .style("fill","none")	
								  .attr("transform", "translate(" + x + "," + y +")")
								  .attr("filter", "url(#blur)");
	
//Draw the hint path labels								  
this.widget.select("#hintPath").selectAll("text")
            .data(pathData).enter()	   
		   .append("text")
		   .attr("x",function(d){return d[1];})		  
		   .attr("y",function (d){return d[2]-5;})
		   .text(function (d,i){ return ref.labels[i];})
		   .style("text-anchor", "middle") 
		   .attr("transform", "translate(" + x + "," + y + ")");							    

//Append a clear cell with a black border to show which cell is selected and dragged
this.widget.select("#hintPath").append("rect")
                               .attr("x",x)
							   .attr("y",y)
							   .attr("width",ref.cellSize)
							   .attr("height",ref.cellSize)
							   .attr("stroke-width",2)
							   .attr("fill","none")
							   .attr("stroke","#000");
		   
}
//Clears a hint path for the selected day tile
//id: The ID of the dragged tile
Heatmap.prototype.clearHintPath = function(id){  
   this.widget.select("#hintPath").selectAll("rect").remove();
    this.widget.select("#hintPath").selectAll("path").remove();
    this.widget.select("#line-gradient").remove();
	this.widget.select("#hintPath").selectAll("text").remove();	   
}
//Calculates the x-values for the moving hint path x-coordinates
Heatmap.prototype.findHintX = function (index,view){
    return this.padding+((index*this.xSpacing)-view*this.xSpacing);
}



