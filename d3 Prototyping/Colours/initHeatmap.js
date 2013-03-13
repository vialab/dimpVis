            

var heatmap = new Heatmap(0, 0, 1200, 800, "#vis");
heatmap.init();
//Define some mouse events for each day in the calendar
heatmap.mouseDownFunction = function (d){
   heatmap.selected = d.id;
   heatmap.showHintPath(d.id);
}
heatmap.mouseUpFunction = function (d){
   heatmap.selected = -1;
}
heatmap.mouseMoveFunction = function (d){
    if (heatmap.selected != -1){
	   console.log("move mouse");
	}   
}
//Render 4x6 matrix
heatmap.render(data,4,6);



	

