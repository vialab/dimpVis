 function Barchart(width,height,x,y,id,l){
   this.width = width;
   this.height = height;
   this.xPos = x;
   this.yPos = y;
   this.id = id;
   this.widget = null; //Reference to svg container
   this.displayData = null;
   this.barWidth = 20;
   this.currentView = 0;
   this.labels = l;
   this.numBars = -1; //Total number of bars (points along x-axis) in the dataset
   
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
            heights[0] = d.Pop1955/100000;
			 heights[1] = d.Pop1960/100000;
			 heights[2] = d.Pop1965/100000;
			 heights[3] = d.Pop1970/100000;
			 heights[4] = d.Pop1975/100000;
			 heights[5] = d.Pop1980/100000;
			 heights[6] = d.Pop1985/100000;
			 heights[7] = d.Pop1990/100000;
			 heights[8] = d.Pop1995/100000;
			 heights[9] = d.Pop2000/100000;
			 heights[10] = d.Pop2005/100000;			 
	        return {x:i*ref.barWidth,nodes:heights,id:i,country:d.Country,group:d.Group,cluster:d.Cluster};
	  }))
     .enter().append("g").attr("class","gDisplayBars");

	
     this.widget.selectAll(".gDisplayBars").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");
    //Render the hint bars							   
	/**this.widget.selectAll(".gDisplayBars").selectAll(".gInner").selectAll("rect")
                                             .data(function(d) {return d.nodes;})
											 .enter().append("svg:rect")
											 .attr("x", 0)
											 .attr("y", ref.yPos)
											 .attr("width", ref.barWidth)
											.attr("height", function(d) { return d; })
											.attr("class","hintBars")
											.style("fill","none");
											
	//Render the hint labels
    this.widget.selectAll(".gDisplayBars").selectAll(".gInner").selectAll("text")
	                                        .data(function(d) {return d.nodes;}).enter()								  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })
												.attr("x", function (d,i){return ref.barWidth*i})
												.attr("y", function (d) {return d;})												
											   .attr("fill", "none")											  
											   .attr("class","hintLabels");*/
//Render the bars last
this.widget.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.x;})
     .attr("y", function(d){ return(ref.yPos - d.nodes[ref.currentView]);})
     .attr("width", ref.barWidth)
     .attr("height", function(d) { return d.nodes[ref.currentView]; })
	 .attr("fill", "steelblue")
	 .attr("stroke", "#FFF")
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})
	.style("cursor", "pointer")  
	.on("mouseover", ref.mouseoverFunction)
    .on("mouseout", ref.mouseoutFunction);
	
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
Barchart.prototype.updateDraggedBar = function (id,mouseX,mouseY){
     var ref = this;
     this.widget.select("#displayBars"+id)
	            .attr("height", function (d){
				    return mouseY;
				});
}
  
 

