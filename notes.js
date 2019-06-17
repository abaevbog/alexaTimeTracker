const fs = require('fs');
const timestamp = require('time-stamp');
const assert = require('assert');


const createProject = function (title) {
    //data - list of projects
    const data = loadLogs();
    const duplicateProject = data.find((project) => project.title === title);
    if (!duplicateProject) {
        const proj = { "project": title, "logs": [] };
        console.log(proj);
        data.push(proj);
        saveProjects(data);
    } else {
        console.log("Project title already taken");
    }
}
//activity = start of end
const addLog = function (projectName, activity) {
    assert(activity == 'start' || activity == 'end');
    const data = loadLogs();
    const projIndex = data.findIndex(function (projectDict) {
        return projectDict.project == projectName;
    })
    if (projIndex != -1) {
        activity == 'start' ? data[projIndex].logs.push({ start: timestamp('YYYY/MM/DD/HH:mm:ss') }) : data[projIndex].logs[data[projIndex].logs.length-1].end = timestamp('YYYY/MM/DD/HH:mm:ss');
        saveProjects(data);
    } else {
        console.log("Project not found");
    }
}



const saveProjects = (projects) => {
    const dataJson = JSON.stringify(projects);
    fs.writeFileSync('timetracker.json', dataJson);
}

const loadLogs = function () {
    try {
        const buffer = fs.readFileSync('timetracker.json');
        const dataJson = buffer.toString();
        return JSON.parse(dataJson);
    } catch (e) {
        return []
    }
}

const removeProject = function (projectName) {
    const data = loadLogs();
    const projIndex = data.findIndex(function (projectDict) {
        console.log(projectDict.project);
        console.log(projectName);
        return projectDict.project == projectName;
    })
    if (projIndex != -1) {
        data.splice(projIndex, 1);
        saveProjects(data);
        console.log("success");
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




module.exports = {
    createProject: createProject,
    addLog: addLog,
    removeProject: removeProject,
    listProjects: listProjects
}