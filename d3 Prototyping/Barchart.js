 function Barchart(width,height,x,y,id,l){
   this.width = width;
   this.height = height;
   this.xPos = x;
   this.yPos = y;
   this.id = id;
   this.widget = null; //Reference to svg container
   this.displayData = null;
   this.barWidth = 25;
   this.barSpacing = 10; //Spacing between bars
   this.currentView = 0;
   this.labels = l;
   this.numBars = -1; //Total number of bars (points along x-axis) in the dataset
   this.draggedBar = -1;
   this.hintColour = "#aec7e8";
   this.fadeColour = "#c7c7c7";
   this.barColour = "steelblue";
   //Event functions, declared in main.js  
   this.placeholder = function() { 
		console.log("Not implemented"); 
   }; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder;  
   this.dragEvent = null;   
 }
 Barchart.prototype.init = function(){
    // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
      .attr("width", this.width)
      .attr("height", this.height)
      .style("position", "absolute")
      .style("left", this.xPos + "px")
      .style("top", this.yPos + "px")  
     .append("g")
     //.attr("transform", "translate(" + this.xPos + "," + this.yPos + ")")
   ; 
    /**var chart = d3.select("body")         
     .append("svg")   
     .attr("width", ref.width * data.length - 1)
     .attr("height", ref.height)
	  .style("position", "absolute")
      .style("left", this.xPos + "px")
      .style("top", this.yPos + "px");*/
 }
 Barchart.prototype.render = function(data){
      var ref = this;
	  this.displayData = data;
	  this.numBars = data.length; 
       //Create the scales 
     //var xScale = d3.scale.linear().domain([0,ref.numBars]).range([0,ref.width]);   
     //var yScale =  d3.scale.linear().domain([0, 100000]).range([ref.height,0]);
this.widget.selectAll("rect")
    .data(this.displayData.map(function (d,i) {
             //Create a list of heights (y) for each country
			 //Dataset goes from 1955 to 2005 (11 increments)
			 //Try population:
			 var heights = [];		
				
			 /**heights[0] = yScale(d.Pop1955);
			 heights[1] = yScale(d.Pop1960);
			 heights[2] = yScale(d.Pop1965);
			 heights[3] = yScale(d.Pop1970);
			 heights[4] = yScale(d.Pop1975);
			 heights[5] = yScale(d.Pop1980);
			 heights[6] = yScale(d.Pop1985);
			 heights[7] = yScale(d.Pop1990);
			 heights[8] = yScale(d.Pop1995);
			 heights[9] = yScale(d.Pop2000);
			 heights[10] = yScale(d.Pop2005);*/	
			 //Change this later**********, because 'x' should be hardcoded			 
             heights[0] = [i*ref.barWidth, ref.yPos - d.Pop1955/100000, d.Pop1955/100000];
			 heights[1] = [i*ref.barWidth,ref.yPos - d.Pop1960/100000, d.Pop1960/100000];
			 heights[2] = [i*ref.barWidth,ref.yPos - d.Pop1965/100000, d.Pop1965/100000];
			 heights[3] = [i*ref.barWidth, ref.yPos - d.Pop1970/100000, d.Pop1970/100000];
			 heights[4] = [i*ref.barWidth, ref.yPos - d.Pop1975/100000, d.Pop1975/100000];
			 heights[5] = [i*ref.barWidth, ref.yPos - d.Pop1980/100000, d.Pop1980/100000];
			 heights[6] = [i*ref.barWidth, ref.yPos - d.Pop1985/100000, d.Pop1985/100000];
			 heights[7] = [i*ref.barWidth, ref.yPos - d.Pop1990/100000, d.Pop1990/100000];
			 heights[8] = [i*ref.barWidth, ref.yPos - d.Pop1995/100000, d.Pop1995/100000];
			 heights[9] = [i*ref.barWidth, ref.yPos - d.Pop2000/100000, d.Pop2000/100000];
			 heights[10] = [i*ref.barWidth, ref.yPos - d.Pop2005/100000, d.Pop2005/100000];	
             //Find the largest height, tallest bar and the shortest bar to define dragging bounds
			 var tallestBar = -1;	
             var shortestBar = 1000000;			 
             for (var j=0;j<heights.length;j++){			       
			     if (heights[j][1] > tallestBar){
				       tallestBar = j;
				  }
				  if (heights[j][0] < shortestBar){
				      shortestBar = j;
				  }
			 }			 
	        return {nodes:heights,id:i,country:d.Country,highestBar:tallestBar,lowestBar:shortestBar};
	  }))
     .enter().append("g").attr("class","gDisplayBars");

	
	//Render the bars 
this.widget.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.nodes[ref.currentView][0];})
     .attr("y", function(d){ return d.nodes[ref.currentView][1];})
     .attr("width", ref.barWidth)
     .attr("height", function(d) { return d.nodes[ref.currentView][2]; })
	 .attr("fill", this.barColour)
	// .attr("stroke", "#FFF")
	 //.attr("stroke-width",5)
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})	       	 
	.on("mouseover", ref.mouseoverFunction)
    .on("mouseout", ref.mouseoutFunction);

//Render the tips of the bars for dragging
this.widget.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.nodes[ref.currentView][0];})
     .attr("y", function(d){ return d.nodes[ref.currentView][1];})
     .attr("width", ref.barWidth)
     .attr("height", 5)
	 .attr("fill", this.barColour)
	// .attr("stroke", "white")
	// .attr("stroke-width",5)
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBarsTips"+d.id;})
	 .style("cursor", "ns-resize")
	;
	
	this.widget.selectAll(".gDisplayBars").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");
    //Render the hint bars							   
	this.widget.selectAll(".gDisplayBars").selectAll(".gInner").selectAll("rect")
                                             .data(function(d) {return d.nodes;})
											 .enter().append("svg:rect")
											 .attr("x", function (d) {return d[0];})
											 .attr("y", function (d) {return d[1];})
											 .attr("width", ref.barWidth)
											.attr("height", function(d) { return 3; })
											.attr("class","hintBars")	                                          												
											.style("fill","none");
											
	//Render the hint labels
    this.widget.selectAll(".gDisplayBars").selectAll(".gInner").selectAll("text")
	                                        .data(function(d) {return d.nodes;}).enter()								  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })
												.attr("x", function (d,i){return (d[0]+(ref.barWidth*1.5));})
												.attr("y", function (d) {return d[1];})												
											   .attr("fill", "none")											  
											   .attr("class","hintBars");

	
/**var x = d3.scale.linear()
      .domain([0, 1])
      .range([0, ref.width]);
  
      var y = d3.scale.linear()
      .domain([0, 300])
     .rangeRound([0, ref.height]);*/
/**chart.append("line")
    .attr("x1", 0)
     .attr("x2", ref.width * data.length)
     .attr("y1", ref.height - .5)
     .attr("y2", ref.height - .5)
     .style("stroke", "#000");
	 
chart.append("text")
    .attr("x", ref.xPos)
     .attr("y", ref.yPos+ref.height+10)
    .text(id);*/     
 }

 //Update height of dragged bar
 //Base of bar is ref.yPos, top of bar is ref.yPos - barHeight, as defined during data initialization
Barchart.prototype.updateDraggedBar = function (id,mouseY){
     var ref = this;
     this.widget.select("#displayBars"+id)
	            .attr("height", function (d){				
				    if (mouseY >= d.nodes[d.lowestBar][1]){ //Past base of bars, out of bounds
					   return d.nodes[d.lowestBar][2];
					}else if (mouseY < (d.nodes[d.highestBar][1])){ //Past highest point, out of bounds
					   return d.nodes[d.highestBar][2];
					}					
				                           					
                    var yDiff = Math.abs(mouseY - ref.yPos); 
					var barHeight = d.nodes[ref.currentView][2];	
					var barTop = d.nodes[ref.currentView][1];					
					if (mouseY > barTop)
					   yDirection = -1;
					else 
					    yDirection = 1;
                    				
				    return (barHeight + yDirection*Math.abs(yDiff - barHeight)); 
				})
				.attr("y", function(d){ 
                    if (mouseY >= d.nodes[d.lowestBar][1]){
					   return d.nodes[d.lowestBar][1];
					} else if (mouseY < d.nodes[d.highestBar][1]){
					   return d.nodes[d.highestBar][1];
                    }				
					return mouseY;
				});
	this.widget.select("#displayBarsTips"+id)	          
				.attr("y", function(d){ 
                     if (mouseY >= d.nodes[d.lowestBar][1]){
					   return d.nodes[d.lowestBar][1];
					} else if (mouseY < d.nodes[d.highestBar][1]){
					   return d.nodes[d.highestBar][1];
                    }			
					 
					return mouseY;
				});
}
//Displays hint info
Barchart.prototype.showHintPath = function (id){    
        var ref = this;      
        this.widget.select("#gInner"+id).selectAll(".hintBars")                                  
								  .style("fill", this.hintColour);	
		this.widget.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill", function (d){
		                                           if (id != d.id)
												      return ref.fadeColour;
		                                    });		
}
//Clears hint info
 Barchart.prototype.clearHintPath = function (id){
        var ref = this;
        this.widget.select("#gInner"+id).selectAll(".hintBars")                                  
								  .style("fill", "none");
		this.widget.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill", function (d){
		                                           return ref.barColour;
		                                    });
        								  
 }

