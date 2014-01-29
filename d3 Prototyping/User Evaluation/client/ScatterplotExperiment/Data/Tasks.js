/**
 * Task descriptions to complete for the scatterplot experiment,
 * dimpVis tasks are at index 0, time slider tasks are 1
 */

//Task array entry format: [datasetNumber, taskId, taskType, techniqueType, description, objectType, ambiguity , barIndices, solution]
//Codes:
// datasetNumber: 0 - set 1, 1 - set 2 and 2 - set 3
// techniqueType: the type of technique the task is assigned to (0 - dimp, 1 - slider and 2 - multiples)
// taskId: unique id assigned to each task (go from 0 to number of tasks)
// taskType: 0 - retrieve value, 1 - distribution
// task description: text explaining what to do for the task
// objectType: 0 - Single object, 1 - Multiple objects
// ambiguity: 0 -  nonAmbiguous, 1 - ambiguous
// barIndices: one or two indices of the bars involved in the task
// solution: the solution (view index) to the task

/**var tasks = [
    [
        [0,0,4,1,"When does the orange point's age change from <span style='color:#D95F02'>increasing to decreasing </span> " +
            "<span style='font-weight:bold'>AND</span> the green point's age change from <span style='color:#1B9E77'>decreasing to increasing</span>?",1,0,[8],7],
        [0,0,0,0,"When is the orange point at 80 years?",0,0,[0],4],
        [0,0,1,0,"When is the orange point higher than 60 years?",0,0,[2],8],
        [0,0,2,0,"When is the orange point lower than 50 years?",0,0,[7],4],
        [0,0,3,0,"When is the orange point at an age greater than the green point?",1,0,[7,8],8],
        [0,0,4,1,"When does the orange point's age change from increasing to decreasing?",0,0,[8],7]

    ], //Tasks for dimpvis

    [
        [0,0,0,0,"When is the orange point at 80 years?",0,0,[0],4],
        [0,0,1,0,"When is the orange point higher than 60 years?",0,0,[2],8],
        [0,0,2,0,"When is the orange point lower than 50 years?",0,0,[7],4],
        [0,0,3,0,"When is the orange point at an age greater than the green point?",1,0,[7,8],8],
        [0,0,4,1,"When does the orange point's age change from increasing to decreasing?",0,0,[8],7]

    ], //Tasks for time slider

    [
        [0,0,0,0,"When is the orange point at 80 years?",0,0,[0],4],
        [0,0,1,0,"When is the orange point higher than 60 years?",0,0,[2],8],
        [0,0,2,0,"When is the orange point lower than 50 years?",0,0,[7],4],
        [0,0,3,0,"When is the orange point at an age greater than the green point?",1,0,[7,8],8],
        [0,0,4,1,"When does the orange point's age change from increasing to decreasing?",0,0,[8],7]

    ] //Tasks for multiples

 //[0,0,0,0,"When is the orange point's age at <span style='color:#377eb8'>70 years </span> and height at <span style='color:#e41a1c'>3 feet</span>?",0,0,[5,6],4],
];*///Single Dimension Tasks

var tasks = [
    [
        [3,0,0,0,"When does the orange point's age=60 years and height=6 feet?",0,0,[0],6],
        [3,0,1,0,"When is the orange point's age > 70 years and height = 4 feet?",0,0,[2],7],
        [3,0,2,0,"When is the orange point's age < 50 and height = 3 feet?",0,0,[1],7],
        [4,0,3,0,"When are the orange and the green point at the same age and height? ",1,0,[0,1],7],
        [4,0,4,0,"When is the orange point's age and height greater than the green points?",1,0,[2,3],8],
        [4,0,5,0,"When is the orange point's age and height less than the green points?",1,0,[4,5],7],
        [3,0,6,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[9],5],
        [3,0,7,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[10],6],
        [3,0,8,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[11],5],
        [6,0,9,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,0,10,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,0,11,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],

        [5,0,36,0,"When does the orange point's age=60 years and height=5 feet?",0,1,[0],7],
        [5,0,37,0,"When is the orange point's age > 60 years and height = 3 feet?",0,1,[2],8],
        [5,0,38,0,"When is the orange point's age < 40 and height = 5 feet?",0,1,[1],7],
        [5,0,39,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[9],6],
        [5,0,40,1,"When does the orange point's age and height change from decreasing to increasing?",0,1,[10],7],
        [5,0,41,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[11],7],

        [0,0,54,0,"When does the orange point's age=70 years and height=3 feet?",0,0,[0],4],
        [0,0,55,0,"When is the orange point's age > 60 years and height = 4 feet?",0,0,[2],5],
        [0,0,56,0,"When is the orange point's age < 50 and height = 4 feet?",0,0,[3],7],
        [2,0,57,0,"When are the orange and the green point at the same age and height? ",1,0,[0,1],5],
        [2,0,58,0,"When is the orange point's age and height greater than the green points?",1,0,[4,5],6],
        [2,0,59,0,"When is the orange point's age and height less than the green points?",1,0,[2,3],5],
        [0,0,60,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[7],6],
        [0,0,61,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[5],5],
        [0,0,62,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[6],5],
        [6,0,63,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,0,64,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,0,65,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],

        [1,0,66,0,"When does the orange point's age=70 years and height=4 feet?",0,1,[0],6],
        [1,0,67,0,"When is the orange point's age > 80 years and height =7 feet?",0,1,[1],8],
        [1,0,68,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[3],6],
        [1,0,69,1,"When does the orange point's age and height change from decreasing to increasing?",0,1,[4],7]
    ], //Tasks for dimpvis
    [
        [3,1,12,0,"When is the orange point's age > 60 years and height = 6 feet?",0,0,[4],7],
        [3,1,13,0,"When is the orange point's age < 50 and height = 2 feet?",0,0,[5],6],
        [3,1,14,0,"When does the orange point's age=70 years and height=5 feet?",0,0,[3],7],
        [4,1,15,0,"When are the orange and the green point at the same age and height? ",1,0,[8,9],7],
        [4,1,16,0,"When is the orange point's age and height greater than the green points?",1,0,[6,7],7],
        [4,1,17,0,"When is the orange point's age and height less than the green points?",1,0,[10,11],8],
        [3,1,18,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[12],5],
        [3,1,19,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[13],6],
        [3,1,20,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[14],5],
        [6,1,21,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,1,22,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,1,23,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],

        [5,1,42,0,"When does the orange point's age=50 years and height=2 feet?",0,1,[5],8],
        [5,1,43,0,"When is the orange point's age > 80 years and height = 1 foot?",0,1,[4],7],
        [5,1,44,0,"When is the orange point's age < 50 and height = 2 feet?",0,1,[3],7],
        [5,1,45,1,"When does the orange point's age and height change from decreasing to increasing?",0,1,[12],6],
        [5,1,46,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[13],7],
        [5,1,47,1,"When does the orange point's age and height change from decreasing to increasing?",0,1,[14],7],

        [0,1,70,0,"When does the orange point's age=60 years and height=3 feet?",0,0,[1],5],
        [0,1,71,0,"When is the orange point's age > 80 years and height = 2 feet?",0,0,[0],5],
        [0,1,72,0,"When is the orange point's age < 40 and height = 3 feet?",0,0,[4],9],
        [2,1,73,1,"When are the orange and the green point at the same age and height? ",1,0,[6,7],7],
        [2,1,74,1,"When is the orange point's age and height greater than the green points?",1,0,[8,9],6],
        [2,1,75,1,"When is the orange point's age and height less than the green points?",1,0,[10,11],7],
        [0,1,76,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[8],6],
        [0,1,77,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[9],6],
        [0,1,78,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[10],5],
        [6,1,79,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,1,80,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,1,81,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6]
    ], //Tasks for time slider
    [
        [3,2,24,0,"When is the orange point's age < 60 and height = 2 feet?",0,0,[7],7],
        [3,2,25,0,"When is the orange point's age > 60 years and height = 6 feet?",0,0,[8],6],
        [3,2,26,0,"When does the orange point's age=60 years and height=1 foot?",0,0,[6],7],
        [4,2,27,0,"When are the orange and the green point at the same age and height? ",1,0,[12,13],8],
        [4,2,28,0,"When is the orange point's age and height greater than the green points?",1,0,[14,15],7],
        [4,2,29,0,"When is the orange point's age and height less than the green points?",1,0,[16,17],7],
        [3,2,30,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[15],5],
        [3,2,31,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[16],6],
        [3,2,32,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[17],5],
        [6,2,33,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,2,34,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,2,35,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],

        [5,2,48,0,"When is the orange point's age < 40 and height = 5 feet?",0,1,[6],8],
        [5,2,49,0,"When is the orange point's age > 70 years and height = 5 feet?",0,1,[7],7],
        [5,2,50,0,"When does the orange point's age = 40 years and height= 6 feet?",0,1,[8],7],
        [5,2,51,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[16],7],
        [5,2,52,1,"When does the orange point's age and height change from decreasing to increasing?",0,1,[17],6],
        [5,2,53,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[15],7],

        [0,2,82,0,"When is the orange point's age < 40 and height = 1 foot?",0,0,[1],8],
        [0,2,83,0,"When does the orange point's age=70 years and height=6 feet?",0,0,[4],4],
        [0,2,84,0,"When is the orange point's age > 80 years and height = 5 feet?",0,0,[3],9],
        [2,2,85,1,"When are the orange and the green point at the same age and height? ",1,0,[14,15],6],
        [2,2,86,1,"When is the orange point's age and height greater than the green points?",1,0,[12,13],7],
        [2,2,87,1,"When is the orange point's age and height less than the green points?",1,0,[16,17],7],
        [0,2,88,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[12],6],
        [0,2,89,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[13],5],
        [0,2,90,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[11],5],
        [6,2,91,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,2,92,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [6,2,93,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6]
    ] //Tasks for multiples
];
