var dataset = [
  
  [191,169,104,48,116,128,131,154,109,141,114,147,40,83,177,155,172,135,103,77,34],
  [41,51,111,208,99,95,97,72,107,95,136,103,211,169,2,20,12,0,0,0,0],
  [0,0,0,0,19,17,21,22,31,16,26,32,30,43,9,21,13,19,29,37,103],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [13,23,25,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [10,15,19,0,30,24,14,14,15,11,6,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,52,60,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,66,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,99,124,143,166],
  [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,44,38,54,51,49,4],
  [6,6,6,1,1,1,2,2,2,1,0,0,1,0,1,1,0,0,1,2,1]
];
var totals = [262,265,265,265,265,265,265,264,264,264,282,282,282,295,295,301,301,307,308,308,308];
//Generate data for the piechart
//Format of array: 
// pieDataset = ["clusterLabel":name, "values":[list of all values, one per view]
var pieDatasetElect = [];
//Initiliaze general information for all clusters
pieDatasetElect[0] = [];
pieDatasetElect[0] = {"label":"Liberal","values":[]};
pieDatasetElect[1] = [];
pieDatasetElect[1] = {"label":"Progressive Conservative","values":[]};
pieDatasetElect[2] = [];
pieDatasetElect[2] = {"label":"New Democrats","values":[]};
pieDatasetElect[3] = [];
pieDatasetElect[3] = {"label":"Progressive","values":[]};
pieDatasetElect[4] = [];
pieDatasetElect[4] = {"label":"Cooperative Commonwealth Federation","values":[]};
pieDatasetElect[5] = [];
pieDatasetElect[5] = {"label":"Anti Confederate","values":[]};
pieDatasetElect[6] = [];
pieDatasetElect[6] = {"label":"Social Credit","values":[]};
pieDatasetElect[7] = [];
pieDatasetElect[7] = {"label":"United Farmers","values":[]};
pieDatasetElect[8] = [];
pieDatasetElect[8] = {"label":"Reform","values":[]};
pieDatasetElect[9] = [];
pieDatasetElect[9] = {"label":"Canadian Alliance","values":[]};
pieDatasetElect[10] = [];
pieDatasetElect[10] = {"label":"Conservative","values":[]};
pieDatasetElect[11] = [];
pieDatasetElect[11] = {"label":"Liberal Progressive","values":[]};
pieDatasetElect[12] = [];
pieDatasetElect[12] = {"label":"Bloq Quebecois","values":[]};
pieDatasetElect[13] = [];
pieDatasetElect[13] = {"label":"Other","values":[]};

//Now, update the piedataset to contain percentages, using the totals array
for (var j=0;j<pieDatasetElect.length;j++){
   for (var k=0;k<totals.length;k++){
       pieDatasetElect[j].values[k] = dataset[j][k]/totals[k];
   }
}
console.log(pieDatasetElect);


