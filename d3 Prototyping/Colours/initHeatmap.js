            
var years = ["1955","1960","1965","1970","1975","1980"];
var heatmap = new Heatmap(0, 0, 1200, 800, "#vis",years);
heatmap.init();
//Define some mouse events for each day in the calendar
heatmap.mouseDownFunction = function (d){  	 
	   heatmap.selected = d.id;
	   console.log("mousedown");
	   heatmap.showHintPath(d.id,d.colours);   
}
heatmap.mouseUpFunction = function (d){
heatmap.clearHintPath(heatmap.selected);
   heatmap.selected = -1;  
}
heatmap.mouseMoveFunction = function (d){
    if (heatmap.selected == d.id){
	    heatmap.updateDraggedCell(d.id,d3.mouse(this)[1]);	   
	   //console.log("move mouse");
	}   
}
//Render 4x6 matrix
heatmap.render(data,4,6);



	

