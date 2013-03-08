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
  
   //Colours
   this.hintColour = "steelblue";
   this.grey = "#7f7f7f";
   this.lightGrey = "#c7c7c7";
   // Reference to the main widget
   this.widget = null;  
   //Variables to track dragged point location within path ("view switches")
   this.currentView = -1;
   this.nextView = -1;
   this.totalViews = -1; //Last index of the points (nodes) array
   //The number of different instances across dimension (e.g., 4 different views for each year)
   this.numViews = 10;
   
   this.direction = 1; //Forward along the data dimension (e.g., time)
   // Data used for display
   this.displayData = [];   
   this.labels = [];
   this.clickedPoint = -1;
   this.hoveredPoint = -1;
   this.draggedPoint = -1;
   this.dragging = 0;
   this.dragEvent = null;
}

////////////////////////////////////////////////////////////////////////////////
// Prototype functions
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Initializes the svg 
////////////////////////////////////////////////////////////////////////////////
Heatmap.prototype.init = function() {
  
   // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
      .attr("width", this.width+(this.padding*2))
      .attr("height", this.height+(this.padding*2))  
     .append("g")    
   ; 
}
////////////////////////////////////////////////////////////////////////////////
// Render
// start = year or instance the view represents
// l =  labels for the hint path
////////////////////////////////////////////////////////////////////////////////
Heatmap.prototype.render = function( vdata, start, l) {
  var myRef = this; 
	
   this.labels = l;
   this.displayData = vdata;   
   this.currentView = start;
   if (this.currentView ==0){//First point on path			        
			this.nextView = this.currentView+1;
	}else if (this.currentView == this.numViews){  //Last point of path				
		   this.nextView = this.currentView;
		   this.currentView = this.currentView -1;
	}else { //A point somewhere in the middle				     
		this.nextView = this.currentView + 1;
	}
  
   //Remove everything in the svg - only need this if calling render more than once after page is loaded
	//this.widget.selectAll("g").remove(); 
	
	//Add the blur filter to the SVG so other elements can call it
	this.widget.append("svg:defs")
				.append("svg:filter")
			    .attr("id", "blur")
				.append("svg:feGaussianBlur")
				.attr("stdDeviation", 5);
	//Create the scales 	  
	 var xScale = d3.scale.linear().domain([0,10]).range([0,myRef.width]);   
     var yScale =  d3.scale.linear().domain([10, 80]).range([myRef.height,0]);
	//Define the axes
	var xAxis = d3.svg.axis()
                     .scale(xScale)
					 .orient("bottom");
	var yAxis = d3.svg.axis()
                     .scale(yScale)
					 .orient("left");
	 // Add the x-axis
    this.widget.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+myRef.padding+"," + myRef.height + ")")
		.call(xAxis);

     // Add the y-axis
     this.widget.append("g")
			.attr("class", "axis")
			.attr("transform", "translate("+ myRef.padding+ ",0)")
			.call(yAxis); 
	 
	 // Add an x-axis label
     this.widget.append("text")
		.attr("class", "axisLabel")			
		.attr("x", myRef.width)
		.attr("y", myRef.height+myRef.padding)
		.text("fertility rate");

     // Add a y-axis label
	this.widget.append("text")
		.attr("class", "axisLabel")		       	
		.attr("x", 6)		
		.attr("transform", "rotate(-90)")
		.text("life expectancy");
		
   // Draw the data points
  this.widget.selectAll("circle")
     .data(this.displayData.map(function (d,i) {
             //Create a list of nodes (x,y) point pairs for each country
			 //Dataset goes from 1955 to 2005 (11 increments)
			 //Try fertility vs population:
			 var points = [];		
			 points[0] = [xScale(d.F1955), yScale(d.L1955)];
			 points[1] = [xScale(d.F1960), yScale(d.L1960)];
			 points[2] = [xScale(d.F1965), yScale(d.L1965)];
			 points[3] = [xScale(d.F1970), yScale(d.L1970)];
			 points[4] = [xScale(d.F1975), yScale(d.L1975)];
			 points[5] = [xScale(d.F1980), yScale(d.L1980)];
			 points[6] = [xScale(d.F1985), yScale(d.L1985)];
			 points[7] = [xScale(d.F1990), yScale(d.L1990)];
			 points[8] = [xScale(d.F1995), yScale(d.L1995)];
			 points[9] = [xScale(d.F2000), yScale(d.L2000)];
			 points[10] = [xScale(d.F2005), yScale(d.L2005)];	
			myRef.totalViews = points.length-1;			 
	        return {nodes:points,id:i,country:d.Country,group:d.Group,cluster:d.Cluster};
	  }))	
      .enter()
      .append("g")	  
	  .attr("class","gDisplayPoints"); 
   
 //Drawing paths between points
 var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear"); //Interpolate curve should pass through all points, however curved interpolations falsify the data
   
    this.widget.selectAll(".gDisplayPoints").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                   .attr("class","gInner");									  
	 //Render the hint points							   
	this.widget.selectAll(".gDisplayPoints").selectAll(".gInner").selectAll("circle")
                                             .data(function(d) {return d.nodes;})
											 .enter().append("svg:circle")
											 .attr("cx", function(d) { return d[0]; })
											.attr("cy", function(d) { return d[1]; })
											.attr("r",myRef.pointRadius)
											.attr("class","hintPoints")
											.style("fill","none")
											.style("cursor","pointer")
											.attr("filter", "url(#blur)");
											//.on("click", this.clickHintPointFunction);
	//Render the hint path labels
    this.widget.selectAll(".gDisplayPoints").selectAll(".gInner").selectAll("text")
	                                        .data(function(d) {return d.nodes;}).enter()								  
								            .append("svg:text")
                                            .text(function(d,i) { return myRef.labels[i]; })
												.attr("x", function(d) {return d[0] + myRef.pointRadius*2})
												.attr("y", function (d) {  return d[1] + myRef.pointRadius*2; })												
											   .attr("fill", "none")											  
											   .attr("class","hintLabels")
											   .style("cursor","pointer")											  
											   .on("click", this.clickHintLabelFunction);
	//Render the hint path line									    
    this.widget.selectAll("g").selectAll(".gInner").append("svg:path")
                                  .attr("d", function(d){ 
								         return line(d.nodes); 
								  })
								  .attr("id",function (d){return "p"+d.id;})
								  .style("stroke-width", 2)
								  .style("stroke", "none")
								   .style("fill", "none")
								    .attr("filter", "url(#blur)");
     
	 //Render the actual data points last, so that they are displayed on top of the hint path
     this.widget.selectAll(".gDisplayPoints").append("svg:circle")
							  .attr("cx", function(d) {	     
								   return d.nodes[myRef.currentView][0];
							   })
							 .attr("cy", function(d) {        
								   return d.nodes[myRef.currentView][1];
							  })
							  .attr("r", myRef.pointRadius)
							  .attr("stroke", "none")
							  .attr("stroke-width", "2")
							  .attr("class", "displayPoints")
							  .attr("fill",myRef.grey)
							  .style("fill-opacity",1)
							   .attr("id", function (d){return "displayPoints"+d.id;})
							  .style("cursor", "pointer")  
							   .on("mouseover", myRef.mouseoverFunction)
							   .on("mouseout", myRef.mouseoutFunction)	
							   .on("click", myRef.clickFunction);  
}



