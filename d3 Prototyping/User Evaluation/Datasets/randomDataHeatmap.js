//Test data for the heatmap visualization
var data = [];
/**var savedValues = //3x3 matrix
 [[0.014919507593881692,-0.04412808563515243,0.030966485791704856,0.00989321951528098],
[0.001518031339355061,0.015791048693943613,-0.037057272269264176,0.035236359046380436],
[-0.021234589756733216,0.025728133270985706,0.025126304073368994,0.03272149939003596],
[-0.014493093309886997,0.02456072110963435,0.042210184539329496,-0.025513681991568296],
[-0.007620099813122651,-0.013663124160522101,0.03216005562253241,0.010516017008541878],
[-0.030581393210373155,0.030613493819569876,-0.048409337185142724,0.04033824118189354],
[0.04674858541008674,0.017035052883415405,0.04190556030115565,0.019222397070311995],
[0.029543471705979638,0.04882628036825247,0.03097629564879434,-0.023073996760424986],
[-0.04922022691718564,0.0080166950076054,0.00031277067575728734,-0.029512320647729275]];*/
var savedValues = //4x4 matrix
[[-0.016045591764116067,0.006586822229801857,-0.038470936526136645,-0.02794496772463824],
 [0.0054337216817194195,0.03708742600902802,0.023741610597828075,0.019611057268979576],
[-0.017158095269617257,0.04021162404500879,0.04765705708232566,0.0425279557633088],
[-0.0399524679754657,-0.007531054611631463,-0.03649092897986789,0.006374137076607611],
[-0.002998142291112872,0.02506378354795337,-0.03136414904145275,-0.03600937336871779],
[-0.02518020676635936,0.03341756741434361,0.022772993568989,-0.02023072310525679],
[0.015971737732572266,-0.0428294214797373,-0.0283087853462911,-0.007118572113225682],
[0.0074067304090778205,-0.027878393287465976,-0.014905002785050248,-0.01403603697343353],
[-0.03235000375686951,-0.02605757168248407,-0.025516483534718616,-0.046788864693051636],
[0.03026564040102478,-0.024991910869391034,-0.03541474429744908,0.042386932095236154],
[0.025547896758827723,-0.01968718751808908,0.02801293653673506,-0.021035862947913056],
[0.029901974291418068,-0.043804694104121494,-0.043054474027850946,-0.03258728629207429],
[0.018098240277194658, -0.04352389269273798, 0.03792922433263876,0.004601452133390346],
[-0.0025689012963545227,0.024613570742430008,0.0162995341236222,0.03334330379042143],
[0.024786588120508365,0.04761392724777325,-0.014738380907873785,0.010306199912281634],
[0.007720395242089853,0.007720395242089853,0.007720395242089853,0.007720395242089853]]; //Last one is the same value for the entire hint path
var max = 0.05;
var min = -0.05;
var matrixColours = [];
//var labels = [1,2,3,4];
//var xLabels = ["a","b","c"];
//var yLabels = ["d","e","f"];
var labels = [1,2,3,4];
var xLabels = ["","","",""];
var yLabels = ["","","",""];
var counter = 0;
for (var row =0;row < xLabels.length;row++){
    for (var col=0;col<yLabels.length;col++){
        data[counter] = {"row":row,"column":col,"values":[]};
        for (var j=0;j<labels.length;j++){
            //var randomValue = Math.random() * (max - min) + min;
            var randomValue = savedValues[counter][j];
            data[counter].values.push(randomValue);
        }
        counter++;
    }
}


