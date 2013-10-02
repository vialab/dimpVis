/** Data sets for running the barchart experiment
 * */
/**var temp = [];
 for (var i=0;i<10;i++){

        temp.push(Math.floor(Math.random()*10));

}
console.log(temp);*/

//Format: dataset = [[non-ambiguous data],[ambiguous data]]

/**Test dataset containing ambiguous cases
 * Size: 20 years, 10 bars
 */
/**var nonAmbiguousData = [
    {"heights":[8, 1, 1, 9, 2, 6, 9, 9, 5, 7],"label":""},
    {"heights":[7, 0, 3, 3, 5, 0, 0, 2, 2, 8],"label":""},
    {"heights":[1, 3, 5, 4, 3, 3, 6, 5, 0, 7],"label":""},
    {"heights":[5, 2, 5, 3, 9, 4, 2, 9, 9, 0],"label":""},
    {"heights":[3, 4, 6, 2, 8, 0, 5, 5, 7, 2],"label":""},
    {"heights":[8, 7, 3, 7, 4, 6, 5, 6, 2, 8],"label":""},
    {"heights": [2, 0, 5, 1, 2, 7, 7, 7, 9, 2],"label":""},
    {"heights":[9, 5, 6, 4, 4, 9, 7, 0, 4, 1],"label":""},
    {"heights":[6, 9, 1, 9, 6, 0, 7, 5, 0, 4],"label":""},
    {"heights": [3, 0, 0, 2, 8, 0, 1, 2, 3, 9],"label":""},
    {"heights": [9, 6, 2, 6, 8, 8, 5, 8, 2, 2],"label":""}
];
var ambiguousData = [
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""},
    {"heights":[],"label":""}
];*/

var dataset = [
        {"label":"0","heights":[150,130,120,133,120,100,120,160,175,160]},
        {"label":"1","heights":[160,142,135,125,110,100,156,165,170,175]},
        {"label":"2","heights":[110,120,130,135,139,140,160,145,140,122]},
        {"label":"3","heights":[110,115,120,130,120,110,80,120,130,160]},
        {"label":"4","heights":[100,80,100,120,110,100,112,120,130,145]},
        {"label":"5","heights":[60,75,75,75,75,90,100,120,120,150]}, //Ambiguous
        {"label":"6","heights":[80,140,120,140,130,100,130,135,137,175]},
        {"label":"7","heights":[80,92,115,130,130,130,120,100,100,100]},//Ambiguous
        {"label":"8","heights":[90,70,65,55,45,30,40,50,87,95]},
        {"label":"9","heights":[89,76.71,76.71,82.19,87.67,84.93,79.45,87.67,87.67,93.15,93.15,93.15,93.15]}, //Ambiguous
        {"label":"10","heights":[100,115,100,119,95,80,70,100,115,119]},
        {"label":"11","heights":[150,165,175,185,193,199,180,170,150,120]}
];
//dataset[0] = nonAmbiguousData;
//dataset[1] = ambiguousData;
var labels = ["1","2","3","4","5","6","7","8","9","10"];

/**Real data for exploratory period */
