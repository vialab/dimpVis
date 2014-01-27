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
        [0,0,0,0,"When does the orange point's age=70 years and height=3 feet?",0,0,[0],4],
        [0,0,1,0,"When is the orange point's age > 60 years and height = 4 feet?",0,0,[2],5],
        [0,0,2,0,"When is the orange point's age < 50 and height = 4 feet?",0,0,[3],7],
        [2,0,3,0,"When are the orange and the green point at the same age and height? ",1,0,[0,1],5],
        [2,0,4,0,"When is the orange point's age and height greater than the green points?",1,0,[4,5],6],
        [2,0,5,0,"When is the orange point's age and height less than the green points?",1,0,[2,3],5],
        [0,0,6,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[7],6],
        [0,0,7,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[5],5],
        [0,0,8,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[6],5],
        [3,0,9,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [3,0,10,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [3,0,11,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [1,0,12,0,"When does the orange point's age=70 years and height=4 feet?",0,1,[0],6],
        [1,0,13,0,"When is the orange point's age > 80 years and height =7 feet?",0,1,[1],8],
        [1,0,14,0,"When is the orange point's age < 30 years and height = 3 feet?",0,1,[2],9],
        [1,0,15,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[3],6],
        [1,0,16,1,"When does the orange point's age and height change from decreasing to increasing?",0,1,[4],7],
        [1,0,17,1,"When does the orange point's age and height change from increasing to decreasing?",0,1,[5],6]
    ], //Tasks for dimpvis

    [
        [0,1,18,0,"When does the orange point's age=60 years and height=3 feet?",0,0,[1],5],
        [0,1,19,0,"When is the orange point's age > 80 years and height = 2 feet?",0,0,[0],5],
        [0,1,20,0,"When is the orange point's age < 40 and height = 3 feet?",0,0,[4],9],
        [2,1,21,1,"When are the orange and the green point at the same age and height? ",1,0,[6,7],7],
        [2,1,22,1,"When is the orange point's age and height greater than the green points?",1,0,[8,9],6],
        [2,1,23,1,"When is the orange point's age and height less than the green points?",1,0,[10,11],7],
        [0,1,24,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[8],6],
        [0,1,25,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[9],6],
        [0,1,26,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[10],5],
        [3,1,27,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [3,1,28,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
        [3,1,29,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6]
 ], //Tasks for time slider

 [
         [0,2,30,0,"When is the orange point's age < 40 and height = 1 foot?",0,0,[1],8],
         [0,2,31,0,"When does the orange point's age=70 years and height=6 feet?",0,0,[4],4],
         [0,2,32,0,"When is the orange point's age > 80 years and height = 5 feet?",0,0,[3],9],
         [2,2,34,1,"When are the orange and the green point at the same age and height? ",1,0,[14,15],6],
         [2,2,35,1,"When is the orange point's age and height greater than the green points?",1,0,[12,13],7],
         [2,2,36,1,"When is the orange point's age and height less than the green points?",1,0,[16,17],7],
         [0,2,37,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[12],6],
         [0,2,38,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[13],5],
         [0,2,39,1,"When does the orange point's age and height change from decreasing to increasing?",0,0,[11],5],
         [3,2,40,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
         [3,2,41,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6],
         [3,2,42,1,"When does the orange point start moving in the opposite direction of the other points?",1,0,[6],6]

 ] //Tasks for multiples
];
