//Test data for the heatmap visualization
var data = [];

var max = 0.05;
var min = -0.05;
//Format: data[index] = {label:name assigned to this object, values (for heatmap): [[list of values], [list of values] ... number of views of dataset]}
/**for (var col=0;col<6;col++){
     data[col] = {"label":"blah","values":[]};
     for (var view=0;view<6;view++){
	     data[col].values[view] = [];
		 for (var row=0;row<4;row++){
		     data[col].values[view][row] = Math.random() * (max - min) + min;
		 }
	 }     
}*/
//Format: 
var row = 4;
var col = 6;
var matrixColours = [];
for (var view=0;view<6;view++){
     data[view] = [];
	 matrixColours[view] = [];
	 var currentRow = 0;
	 var currentColumn = 0;
     for (var i=0;i<(row*col);i++){	   
		  if (currentColumn%col == 0){
		      currentRow++;
		      currentColumn = 0;
		  }
		  //console.log(currentRow+" "+currentColumn);
		  var randomValue = Math.random() * (max - min) + min;
	      data[view][i] = {"row":currentRow,"column":currentColumn,"colourValue":randomValue};	
		  matrixColours[view] = randomValue;
          currentColumn++;		  
	 }     
}
//console.log(data);
