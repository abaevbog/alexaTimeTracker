const fs = require('fs');
const timestamp = require('time-stamp');
const assert = require('assert');

var currentProject;

const createProject = function (title) {
    //data - list of projects
    const data = loadLogs();
    const duplicateProject = data.find((project) => project.title === title);
    if (!duplicateProject) {
        const proj = { "project": title, "logs": [] };
        data.push(proj);
        saveProjects(data);
        console.log("Done!");
    } else {
        console.log("Project title already taken");
    }
}
//activity = start of end
const addLog = function (projectName, activity) {
    assert(activity == 'start' || activity == 'end');
    const data = loadLogs();
    if(activity == 'end'){
        projectName = currentProject;
    }
    const projIndex = data.findIndex(function (projectDict) {
        return projectDict.project == projectName;
    })
    if (projIndex != -1) {
        const logsLen = data[projIndex].logs.length-1;
        if (activity == 'start'){
            if (currentProject){
                console.log(`You can't start a new project because you are working on ${currentProject}`);
                return;
            }
            if (logsLen  < 1 || typeof data[projIndex].logs[logsLen].start != 'undefined' &&
                typeof data[projIndex].logs[logsLen].end != 'undefined'){
                data[projIndex].logs.push({ start: timestamp('YYYY/MM/DD/HH:mm:ss') });
                console.log(projectName.slice());
                currentProject = projectName.slice();
                console.log(currentProject);
            } else{
                console.log("Work on this project has already been started");
            }
         } else {
             if (typeof data[projIndex].logs[logsLen].start != 'undefined'){
                if (typeof data[projIndex].logs[logsLen].end == 'undefined'){
                    data[projIndex].logs[logsLen].end = timestamp('YYYY/MM/DD/HH:mm:ss');
                    data[projIndex].logs[logsLen].duration = subtractTimeStamps(data[projIndex].logs[logsLen].end,data[projIndex].logs[logsLen].start);
                    currentProject = ''; 
                    console.log("Work finished");
                } else {
                    console.log("Work on this project has already been finished");
                }
             } else {
                 console.log("Work on this project was never started");
             }        
         }
        saveProjects(data);
    } else {
        console.log("Project not found");
    }
}



const saveProjects = (projects) => {
    const dataJson = JSON.stringify( {"current":currentProject,"recorded":projects});
    fs.writeFileSync('/Users/bogdanabaev/RandomProgramming/node/notes/timetracker.json', dataJson);
}

const loadLogs = function () {
    try {
        const buffer = fs.readFileSync('/Users/bogdanabaev/RandomProgramming/node/notes/timetracker.json');
        const dataJson = buffer.toString();
        currentProject = JSON.parse(dataJson).current;
        return JSON.parse(dataJson).recorded;
    } catch (e) {
        return []
    }
}

const removeProject = function (projectName) {
    const data = loadLogs();
    const projIndex = data.findIndex(function (projectDict) {
        return projectDict.project == projectName;
    })
    if (projIndex != -1) {
        data.splice(projIndex, 1);
        saveProjects(data);
        console.log("Success");
    } else {
        console.log("Note does not exist");
    }
}

const listProjects = function () {
    const data = loadLogs();
    for (var i = 0; i < data.length; i++) {
       console.log(`${data[i].project}\t`); 
    }

}


const getCurrentProjData = function(){
    const data = loadLogs();
    if (currentProject){
        const projIndex = data.findIndex(function (projectDict) {
            return projectDict.project == currentProject;
        });
        assert(projIndex!=-1);
        const logsLen = data[projIndex].logs.length-1;
        const duration = subtractTimeStamps(timestamp('YYYY/MM/DD/HH:mm:ss'),data[projIndex].logs[logsLen].start);
        console.log(`Current project: ${currentProject}`);
        console.log(`Work time elapsed: ${duration}`);
    }else {
        console.log("No current project");
    }
}


const subtractTimeStamps = function(stampTwo,stampOne){
    const timeOne = stampOne.toString().substring(11,stampOne.length);
    const timeTwo = stampTwo.toString().substring(11,stampTwo.length);
    const lstOne = timeOne.split(':');
    const lstTwo = timeTwo.split(':');
    var durationHour = parseInt(lstTwo[0] - lstOne[0]);
    var durationMin = parseInt(lstTwo[1] - lstOne[1]);
    var durationSec = parseInt(lstTwo[2] - lstOne[2]);
    if (durationMin < 0) {
        durationHour--;
        durationMin = 60 + durationMin;
    }
    if (durationSec < 0){
        durationMin--;
        durationSec = 60 + durationSec;
    }
    //console.log(`${durationHour}:${durationMin}:${durationSec}`);
    assert(durationHour >= 0);
    return `${durationHour}:${durationMin}:${durationSec}`;
}

//mode = week or today
const report = function(mode){
    const data = loadLogs();
    const today = timestamp('YYYY/MM/DD');
    const result = [];
    if (mode == 'today'){
        data.forEach(element => {
            var i = element.logs.length-1;
            while ( i > -1 && element.logs[i].end && element.logs[i].end.substring(0,10) == today){
                result.push(`Project ${element.project}: ${element.logs[i].duration}`);
                i--;
            }  
        });
    }
    console.log(result);
}




module.exports = {
    createProject: createProject,
    addLog: addLog,
    removeProject: removeProject,
    listProjects: listProjects,
    currentProject:getCurrentProjData,
    report:report
}