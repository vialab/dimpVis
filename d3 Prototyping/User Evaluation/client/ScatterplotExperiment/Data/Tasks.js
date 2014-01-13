/**
 * Task descriptions to complete for the bar chart experiment,
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

var tasks = [
    [
        //Dummy tasks for testing the technique
        [0,0,0,0,"When is the orange point at 80 years?",0,0,[0],4],
        [0,0,1,0,"When is the orange point higher than 60 years?",0,0,[2],8],
        [0,0,2,0,"When is the orange point lower than 50 years?",0,0,[7],4]

    ], //Tasks for dimpvis

    [
        //Dummy tasks for testing the technique
        [0,0,0,0,"When is the orange point at 50 years?",0,0,[0],3],
        [0,0,1,0,"When is the orange point higher than 60 years?",0,0,[2],8],
        [0,0,2,0,"When is the orange point lower than 50 years?",0,0,[7],4]

    ], //Tasks for time slider

    [
        //Dummy tasks for testing the technique
        [0,0,0,0,"When is the orange point at 50 years?",0,0,[0],3],
        [0,0,1,0,"When is the orange point higher than 60 years?",0,0,[2],8],
        [0,0,2,0,"When is the orange point lower than 50 years?",0,0,[7],4]

    ] //Tasks for multiples
];