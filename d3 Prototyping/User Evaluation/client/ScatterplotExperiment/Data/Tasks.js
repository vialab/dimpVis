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
];*///Single Dimension Tasks

var tasks = [
    [
        //[0,0,0,0,"When is the orange point's age at <span style='color:#377eb8'>70 years </span> and height at <span style='color:#e41a1c'>3 feet</span>?",0,0,[5,6],4],
        [0,0,4,0,"When is the orange point's age and height equal to the green points?",1,0,[5,6],8],
        [0,0,1,0,"When is the orange point's age > 60 years and height > 4 feet?",0,0,[2],5],
         [0,0,4,0,"When is the orange point's age and height equal to the green points?",1,0,[2,0],8],
         [0,0,6,1,"When does the correlation between age and height of the orange point change from negative to positive?",0,0,[10],5],
         [0,0,7,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[10],5]

    ], //Tasks for dimpvis

    [
         [0,0,0,0,"When does the orange point's age=70 years and height=3 feet?",0,0,[0],4],
         [0,0,1,0,"When is the orange point's age > 60 years and height > 4 feet?",0,0,[2],5],
         [0,0,4,0,"When is the orange point's age and height equal to the green points?",1,0,[2,0],8],
         [0,0,6,1,"When does the correlation between age and height of the orange point change from negative to positive?",0,0,[10],5],
         [0,0,7,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[10],5]

 ], //Tasks for time slider

 [
     [0,0,0,0,"When does the orange point's age=70 years and height=3 feet?",0,0,[0],4],
     [0,0,1,0,"When is the orange point's age > 60 years and height > 4 feet?",0,0,[2],5],
     [0,0,4,0,"When is the orange point's age and height equal to the green points?",1,0,[2,0],8],
     [0,0,6,1,"When does the correlation between age and height of the orange point change from negative to positive?",0,0,[10],5],
     [0,0,7,1,"When does the orange point's age and height change from increasing to decreasing?",0,0,[10],5]

 ] //Tasks for multiples
];
