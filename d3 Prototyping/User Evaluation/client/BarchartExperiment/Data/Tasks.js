/**
 * Task descriptions to complete for the bar chart experiment,
 * dimpVis tasks are at index 0, time slider tasks are 1
 */
//Inner Array format: technique: [taskDescription,type(0 if single object, 1 if multiple objects), ambiguity (0 if ambiguous, 1 if non-ambiguous), index(ices) of bar(s) involed in the task, solution]
//Inner Array format - practice: technique: [taskDescription,type(0 if single object, 1 if multiple objects), index(ices) of bar(s) involed in the task]

var practiceTasks = [
    [
        ["",0,0,1]
    ], //Tasks for dimpvis

    [
        ["",0,0,1]
    ], //Tasks for detour

    [
        ["",0,0,1]
    ], //Tasks for time slider

    [
        ["",0,0,1]
    ] //Tasks for multiples
];

var objectiveTasks = [
    [
        ["When is the orange bar at 3?",0,0,1,0],
        ["When is the orange bar at 4?",0,0,2,0],
        ["When is the orange bar at 9?",0,0,3,0]

    ], //Tasks for dimpvis

    [
        ["When is the orange bar at 7?",0,0,0,0],
        ["When is the orange bar at 2?",0,0,6,0],
        ["When is the orange bar at 7?",0,0,7,0]

    ], //Tasks for time slider

    [
        ["When is the orange bar at 3?",0,0,1,100]
    ] //Tasks for multiples
];