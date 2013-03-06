 function Barchart(width,height,left,top,id,l,p){
   //Widget initializaton variables
   this.width = width;
   this.height = height;
   this.leftMargin = left;
   this.topMargin = top;
   this.id = id;
   this.padding = p; //Padding mainly for the axes
   this.widget = null; //Reference to svg container
   //Display variables
   this.displayData = null;
   this.barWidth = 50;
   this.strokeWidth = 5;   
   this.hintColour = "#aec7e8";
   this.fadeColour = "#c7c7c7";
   this.barColour = "steelblue";
   //View index tracker variables
   this.currentView = 0; //Starting view of the bars (first year)
   this.currentViewIndex = 0; //Starting view of the bars, in terms of the sorted heights array (first year)
  
   this.nextViewIndex = 1;
   this.totalHeights = -1; //Last index in the heights sorted array
   //View information variables
   this.labels = l;
   this.numBars = 10; //Total number of bars (points along x-axis) in the dataset, hard code for debugging but change later!!!
   this.draggedBar = -1;  
   this.yPos = height-5;   
   //Event functions, all declared in main.js  
   this.placeholder = function() {}; 
   this.mouseoverFunction = this.placeholder;
   this.mouseoutFunction  = this.placeholder; 
   this.clickHintLabelFunction = this.placeholder;   
   this.dragEvent = null;   
 }
 Barchart.prototype.init = function(){
    // Initialize the main container
   this.widget = d3.select(this.id).append("svg")      
       .attr("width", this.width+(this.padding*2))
      .attr("height", this.height+(this.padding*2))  
      .style("position", "absolute")
      .style("left", this.leftMargin + "px")
      .style("top", this.topMargin + "px")  
     .append("g")
	  .attr("transform", "translate(" + this.padding + "," + this.padding + ")");
      
 }
 Barchart.prototype.render = function(data){
      var ref = this;
	  this.displayData = data;
	   //this.numBars = data.length; 
	  
    //Create the scales 	  
	// var xScale = d3.scale.linear().domain([0,10]).range([0,ref.width]);   
     //var yScale =  d3.scale.linear().domain([10, 80]).range([ref.height,0]);	
	 var xScale = d3.scale.linear().domain([0,ref.numBars]).range([0,ref.width]);   
     var yScale =  d3.scale.linear().domain([0, 100000]).range([ref.height,0]);
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
		.attr("transform", "translate("+ref.padding+"," + ref.height + ")")
		.call(xAxis);

     // Add the y-axis
     this.widget.append("g")
			.attr("class", "axis")
			.attr("transform", "translate("+ ref.padding+ ",0)")
			.call(yAxis); 
	 
	 // Add an x-axis label
     this.widget.append("text")
		.attr("class", "axisLabel")			
		.attr("x", ref.width)
		.attr("y", ref.height+ref.padding)
		.text("country");

     // Add a y-axis label
	this.widget.append("text")
		.attr("class", "axisLabel")		       	
		.attr("x", 6)		
		.attr("transform", "rotate(-90)")
		.text("population");
 
this.widget.selectAll("rect")
    .data(this.displayData.map(function (d,i) {
             //Create a list of heights (y) for each country
			 //Dataset goes from 1955 to 2005 (11 increments)
			 //Try population:
			 var heights = [];		
             var data = [];			
			 //TODO: Change this later because 'x' is being repeated
            //Reason for doing this is for the hint path of heights		
            //Array format is: data[viewIndex] = [x of top of bar, y of top of bar, height of bar]	          		 
             data[0] = [xScale(i), ref.yPos - d.Pop1955/100000, d.Pop1955/100000];
			 data[1] = [xScale(i),ref.yPos - d.Pop1960/100000, d.Pop1960/100000];
			 data[2] = [xScale(i),ref.yPos - d.Pop1965/100000, d.Pop1965/100000];
			 data[3] = [xScale(i), ref.yPos - d.Pop1970/100000, d.Pop1970/100000];
			 data[4] = [xScale(i), ref.yPos - d.Pop1975/100000, d.Pop1975/100000];
			 data[5] = [xScale(i), ref.yPos - d.Pop1980/100000, d.Pop1980/100000];
			 data[6] = [xScale(i), ref.yPos - d.Pop1985/100000, d.Pop1985/100000];
			 data[7] = [xScale(i), ref.yPos - d.Pop1990/100000, d.Pop1990/100000];
			 data[8] = [xScale(i), ref.yPos - d.Pop1995/100000, d.Pop1995/100000];
			 data[9] = [xScale(i), ref.yPos - d.Pop2000/100000, d.Pop2000/100000];
			 data[10] = [xScale(i), ref.yPos - d.Pop2005/100000, d.Pop2005/100000];
			 /**data[0] = [xScale(i), ref.yPos - yScale(d.Pop1955), yScale(d.Pop1955)];
			 data[1] = [xScale(i),ref.yPos - yScale(d.Pop1960), yScale(d.Pop1960)];
			 data[2] = [xScale(i),ref.yPos - yScale(d.Pop1965), yScale(d.Pop1965)];
			 data[3] = [xScale(i), ref.yPos - yScale(d.Pop1970), yScale(d.Pop1970)];
			 data[4] = [xScale(i), ref.yPos - yScale(d.Pop1975), yScale(d.Pop1975)];
			 data[5] = [xScale(i), ref.yPos - yScale(d.Pop1980), yScale(d.Pop1980)];
			 data[6] = [xScale(i), ref.yPos - yScale(d.Pop1985), yScale(d.Pop1985)];
			 data[7] = [xScale(i), ref.yPos - yScale(d.Pop1990), yScale(d.Pop1990)];
			 data[8] = [xScale(i), ref.yPos - yScale(d.Pop1995), yScale(d.Pop1995)];
			 data[9] = [xScale(i), ref.yPos - yScale(d.Pop2000), yScale(d.Pop2000)];
			 data[10] = [xScale(i), ref.yPos - yScale(d.Pop2005), yScale(d.Pop2005)];*/
            //Populate an array of only heights, so that they can be sorted in ascending order
			for (j=0;j<data.length;j++){
			    heights[j] = [];
			    heights[j][0] = data[j][2];
				heights[j][1] = j;
			}
			var h = ref.sortHeights(heights);    
            ref.totalHeights = h.length -1;			
	        return {nodes:data,id:i,country:d.Country,heights:h};
	  }))
     .enter()
	 .append("g")
	 .attr("class","gDisplayBars")
	  .attr("id", function (d){return "gDisplayBars"+d.id;});

	
	//Render the bars 
this.widget.selectAll(".gDisplayBars")
     .append("rect")
     .attr("x", function(d){return d.nodes[ref.currentView][0]+ref.padding+ref.strokeWidth;})
     .attr("y", function(d){ return d.nodes[ref.currentView][1];})
     .attr("width", ref.barWidth)
     .attr("height", function(d) { return d.nodes[ref.currentView][2]; })
	 .attr("fill", this.barColour)
	 .style("fill-opacity",1)
	 .attr("stroke", "#FFF")
	 .attr("stroke-width",ref.strokeWidth)
	 .attr("class", "displayBars")
	 .attr("id", function (d){return "displayBars"+d.id;})
     .style("cursor", "ns-resize")	 
	.on("mouseover", ref.mouseoverFunction)
    .on("mouseout", ref.mouseoutFunction);

	
	this.widget.selectAll(".gDisplayBars").append("g")                                  
								  .attr("id",function (d){return "gInner"+d.id;})
                                  .attr("class","gInner");  
    
 }

 //Update height of dragged bar
 //Base of bar is ref.yPos, top of bar is ref.yPos - barHeight, as defined during data initialization
Barchart.prototype.updateDraggedBar = function (id,mouseY){
     var ref = this;
	 var currentHeight = -1;
     this.widget.select("#displayBars"+id)
	            .attr("height", function (d){
                    var current =  ref.yPos - d.heights[ref.currentViewIndex][0];
					var next = ref.yPos - d.heights[ref.nextViewIndex][0];				  
                   if (ref.currentViewIndex ==0 && mouseY >= current){ //At lowest bar and out of bounds
					    return d.heights[ref.currentViewIndex][0];
                    } else if (ref.nextViewIndex == ref.totalHeights && mouseY <= next){ //At the highest bar and out of bounds
					    return d.heights[ref.nextViewIndex][0];
					}					
				    //Somewhere in the middle                       					
                    var yDiff = Math.abs(mouseY - ref.yPos); 
					var barHeight = d.heights[ref.currentViewIndex][0];								
					if (mouseY > current)
					   yDirection = -1;
					else 
					    yDirection = 1; 
                    
					currentHeight = (barHeight + yDirection*Math.abs(yDiff - barHeight));						
				    return currentHeight; 
				})
				.attr("y", function(d){ 
				    var current =  ref.yPos - d.heights[ref.currentViewIndex][0];
					var next = ref.yPos - d.heights[ref.nextViewIndex][0];					
                    if (ref.currentViewIndex ==0){ //At lowest bar
					    if (mouseY >= current){ //Passed lowest bar, out of bounds
						    return current;
						}else if (mouseY <= next){ //Passed the next bar height, update tracker variables
						    ref.animateBars(mouseY,current,next,currentHeight,id);
						    ref.currentViewIndex = ref.nextViewIndex;
							ref.nextViewIndex++;
						    ref.currentView = d.heights[ref.currentViewIndex][1];
							return mouseY;
                           // ref.redrawView(-1);							
						}
						//Otherwise, mouse is within bounds						
						ref.animateBars(mouseY,current,next,currentHeight,id);
						return mouseY;
						
                    } else if (ref.nextViewIndex == ref.totalHeights){ //At the highest bar
					    if (mouseY <= next){ //Passed highest, out of bounds
						   return next;
						}else if (mouseY >= current){ //Passed current, update tracker variables
						    ref.animateBars(mouseY,current,next,currentHeight,id);
						   ref.nextViewIndex = ref.currentViewIndex;
						   ref.currentViewIndex--;
						   ref.currentView = d.heights[ref.currentViewIndex][1];
						   return mouseY;
                           //ref.redrawView(-1);						   
						}
						//Otherwise, mouse is in bounds
						 ref.animateBars(mouseY,current,next,currentHeight,id);
						 return mouseY;
					}else { //At a bar somewhere in  the middle
					   if (mouseY >= current){ //Passed current
					        ref.animateBars(mouseY,current,next,currentHeight,id);	
					        ref.nextViewIndex = ref.currentViewIndex;
							ref.currentViewIndex--;	
                            ref.currentView = d.heights[ref.currentViewIndex][1];	
							return mouseY;
							//ref.redrawView(-1);
					   }else if (mouseY <=next){ //Passed next
					       ref.animateBars(mouseY,current,next,currentHeight,id);					   
					       ref.currentViewIndex = ref.nextViewIndex;
						   ref.nextViewIndex++;	
                           ref.currentView = d.heights[ref.currentViewIndex][1];
                           return mouseY;						   
						   //ref.redrawView(-1);
					   }						
					   //Within bounds
					   ref.animateBars(mouseY,current,next,currentHeight,id);
					   return mouseY;
                   }	                    
				});	
}
//Animates the rest of the bars while one is being dragged
//TODO: Refactor this function, lots of repetition, consider using "each"
Barchart.prototype.animateBars = function (mouseY,current,next,height,id){
    var ref = this;   
    //Determine the percentage dragged vertically between current and next
	  var distanceTravelled = Math.abs(mouseY-current);
	  var totalDistance = Math.abs(next - current);
	  var distanceRatio = distanceTravelled/totalDistance;      
	 this.widget.selectAll(".displayBars")	         
		          .attr("height", function (d){	
                          if (d.id != id){
						      var current =  ref.yPos - d.heights[ref.currentViewIndex][0];
					          var next = ref.yPos - d.heights[ref.nextViewIndex][0];
							  var addedHeight = Math.abs(next - current)*distanceRatio;
						      return d.nodes[ref.currentView][2] + addedHeight;
						  }	
                          return height;						  
		           })
				  .attr("y", function (d){				         
				         if (d.id != id){
						   var current =  ref.yPos - d.heights[ref.currentViewIndex][0];
					       var next = ref.yPos - d.heights[ref.nextViewIndex][0];
						   var addedHeight = Math.abs(next - current)*distanceRatio;						     
						   return d.nodes[ref.currentView][1] - addedHeight;
						 }	  
                         return mouseY;						 
				   });	
	 
}
 //Sorts the array of heights[heightValue, viewIndex] in ascending order
 // using a bubble sort
 Barchart.prototype.sortHeights = function (array){
    var n = array.length;
     do {
        var swapped = false;
        for (var i = 1; i < n; i++ ) {
           if (array[i - 1][0] > array[i][0]) {
              var temp = array[i-1];
              array[i-1] = array[i];
              array[i] = temp;			  
              swapped = true;
           }
        }
     } while (swapped);
	 return array;	
 }
 //Redraws the barchart view 
 //This function does not update any tracker variables
Barchart.prototype.redrawView = function (view){      
       var displayView = this.currentView;
       if (view!=-1){
	     displayView = view;
	    }	   
       this.widget.selectAll(".displayBars")
		          //.transition().duration(400)
		          .attr("height", function (d){				          
		                  return d.nodes[displayView][2];
		           })
				   .attr("y", function (d){
				         return d.nodes[displayView][1];
				   });	
}
//Updates the tracker variables according to the new view
//Then calls the redraw function to update the display
Barchart.prototype.changeView = function (newView){    
     this.currentView = newView;  
     this.redrawView(-1); 
}
//Animates the barchart sequentially by year based on a clicked year
Barchart.prototype.animateAlongPath = function (newView){    
     this.currentView = newView;  
	 for (var j=0;j<=this.currentView;j++){
		 this.widget.selectAll(".displayBars")
					  .transition().duration(1200)					  
					  .attr("height", function (d){	                             						  
							  return d.nodes[j][2];
					   })
					   .attr("y", function (d){
							 return d.nodes[j][1];
					   });  
	 }
	 
}
//Snaps to the nearest view (in terms of mouse location distance and the bar being dragged)
Barchart.prototype.snapToView = function (id, mouseY,h){
       var ref = this;    
	   var current =  ref.yPos - h[ref.currentViewIndex][0];
	   var next = ref.yPos - h[ref.nextViewIndex][0];	
	   var currentDist = Math.abs(current - mouseY);
	   var nextDist = Math.abs(next - mouseY);
	   if (currentDist > nextDist && ref.nextViewIndex != ref.totalHeights){ //Passed next, advance the variables forward
			//Make sure the nextViewIndex wasn't the last one to avoid index out of bounds
			ref.currentViewIndex = ref.nextViewIndex;
			ref.nextViewIndex++;			
            ref.currentView = h[ref.currentViewIndex][1];   					                    				
		}
      if (ref.nextViewIndex == ref.totalHeights){
	      ref.redrawView(ref.currentView+1);		
       }else{
	      ref.redrawView(-1);		
       }	   
      		
}
//Resolves the view variable indices, called when a new bar is dragged
//This function is needed because currentView and currentViewIndex do not match
// Need to pass the id of the bar being dragged and the sorted array of heights
Barchart.prototype.resolveViews = function (id,h){
       var ref = this;       
	   var newIndex = -1;
	   //Search for the index corresponding to 'currentView'
		for (var j=0; j<= ref.totalHeights;j++){
		   if (h[j][1] == ref.currentView){
			   newIndex = j;
			   break;
		  }
	  }
	   //Next, update the view index variables for this bar
	   if (newIndex == ref.totalHeights){ //At the last (highest) bar height
			ref.nextViewIndex = newIndex;
			ref.currentViewIndex = newIndex-1;
		}else { //At the lowest bar or greater					 
		     ref.currentViewIndex = newIndex;
			 ref.nextViewIndex = newIndex + 1;					
		}		  
			    
}
//Displays hint info
Barchart.prototype.showHintPath = function (id,d){    
        var ref = this;      
		this.widget.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill-opacity", function (d){
		                                           if (id != d.id)
												      return 0.4;
		                                    });		
	//Render the hint bars							   
	 this.widget.select("#gInner"+id).selectAll("rect").data(d).enter()
											 .append("svg:rect")
											 .attr("x", function (d) {return d[0]+ref.padding+ref.strokeWidth;})
											 .attr("y", function (d) {return d[1];})
											 .attr("width", ref.barWidth)
											.attr("height", function(d) { return 3; })											                                       												
											.style("fill",ref.hintColour);
											
	//Render the hint labels
   this.widget.select("#gInner"+id).selectAll("text").data(d).enter()	                                     						  
								            .append("svg:text")
                                            .text(function(d,i) { return ref.labels[i]; })
												.attr("x", function (d,i){return (d[0]+ref.padding+ref.strokeWidth+(ref.barWidth*1.5));})
												.attr("y", function (d) {return d[1]+5;})												
											   .attr("fill", ref.hintColour)
											   .on("click",this.clickHintLabelFunction)
											   .style("cursor", "pointer"); 
											   
}
//Clears hint info
 Barchart.prototype.clearHintPath = function (id){
        var ref = this;
        this.widget.select("#gInner"+id).selectAll("text").remove();  
        this.widget.select("#gInner"+id).selectAll("rect").remove();    		
		this.widget.selectAll(".displayBars").style("fill-opacity", 1);							  
		/**this.widget.selectAll(".displayBars")
		                                   .transition().duration(400)
		                                   .style("fill", function (d){
		                                           return ref.barColour;
		                                    });*/
        								  
 }

