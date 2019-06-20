const fs = require('fs');
const timestamp = require('time-stamp');
const assert = require('assert');

const { MongoClient, ObjectId } = require('mongodb');
const connectionUrl = 'mongodb://127.0.0.1:27017';
const mongoUtils = require('./mongoUtils.js');

var currentProject;

// const createProject = function(title) {
//     return createProjectPromise.then((_)=>{
//         mongoUtils.getClient.close();
//     }).catch((e) => console.log(e));
// };

const createProject = function (title) {
    mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            console.log(title);
            const db = mongoUtils.getDb();
            const getUser = db.collection('userData').findOne({ user: 'username' });
            getUser.then((usr) => {
                if (usr.projectNames.includes(title)) {
                    reject("Project title already taken");
                    return;
                }
                db.collection('userData').updateOne({
                    user: 'username'
                }, {
                        $push: { projectNames: title }
                    }).then((_) => {
                        console.log("yay");
                        resolve("Done!");
                    });

                console.log("Done!");
            }).catch((e) => console.log(e));
        })
    );
}

const addLog = function (projectName, activity) {
    mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            console.log(activity);
            assert(activity == 'start' || activity == 'end');
            const db = mongoUtils.getDb();
            const searchUser = db.collection('userData').findOne({ user: 'username' });
            searchUser.then((result) => {
                if (result.projectNames.includes(projectName) || result.currentProject) {

                    if (activity == 'start') {

                        if (!result.currentProject) {
                            log = { user: 'username', projectName: projectName, start: timestamp('YYYY/MM/DD/HH:mm:ss'), finish: null, duration: null };
                            insertLogToDb(log);
                            db.collection('userData').updateOne({ user: 'username' },
                            {
                                $set: {
                                    currentProject: projectName
                                }
                            }).then((suc) => resolve()).catch((e) => console.log(e));
                        } else {
                            reject("Work on this project has already been started");
                        }
                    } else {
                        if (result.currentProject) {
                            db.collection('userData').findOne({ user: 'username' }).then((result) => {
                                db.collection('logs').findOne({ projectName: result.currentProject, finish: null })
                                    .then((log) => {
                                        updateLog = { projectName: result.currentProject, finish: timestamp('YYYY/MM/DD/HH:mm:ss'), duration: subtractTimeStamps(timestamp('YYYY/MM/DD/HH:mm:ss'), log.start) }
                                        updateLogInDb(updateLog);
                                        nullifyCurrentProject('username');
                                        resolve();
                                    }).catch((e) => console.log(e));
                            }).catch((e) => console.log(e));
                        } else {
                            reject("Work on this project has already been finished");
                        }
                    }
                } else {
                    reject("Project not found");
                }
            }).catch((e) => reject(e));
        })
    );
}



const saveProjects = (projects) => {
    const dataJson = JSON.stringify({ "current": currentProject, "recorded": projects });
    MongoClient.connect(connectionUrl, { useNewUrlParser: true }, (error, MongoClient) => {
        if (error) {
            return console.log("DB connection failed");
        }
        const db = MongoClient.db(database);
    });
    //fs.writeFileSync('/Users/bogdanabaev/RandomProgramming/node/notes/timetracker.json', dataJson);
}

// log = {user:..., projectName:..., start:...,finish:...,duration:...}
const insertLogToDb = (log) => {
    //mongoUtils.connectToDb(() => {
        const db = mongoUtils.getDb();
        const addToCollection = db.collection('logs').insertOne(log);

        addToCollection.then((suc) => {
            console.log("DB updated");
        }).catch((e) => console.log(e));
    //});
}


const updateLogInDb = (log) => {
    //mongoUtils.connectToDb(() => {
    const db = mongoUtils.getDb();

    db.collection('logs').updateOne({
        user: 'username',
        projectName: log.projectName
    }, {
            $set: {
                finish: log.finish,
                duration: log.duration
            }
        }).then((suc) => console.log('updated'))
        .catch((e) => console.log(e));
    // });
}


const nullifyCurrentProject = (username) => {
    const db = mongoUtils.getDb();
    db.collection('userData').updateOne({
        user: username
    }, {
            $set: {
                currentProject: null
            }
        }).then((suc) => console.log("current project nulled"))
        .catch((e) => console.log(e))
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



const subtractTimeStamps = function (stampTwo, stampOne) {
    const timeOne = stampOne.toString().substring(11, stampOne.length);
    const timeTwo = stampTwo.toString().substring(11, stampTwo.length);
    const lstOne = timeOne.split(':');
    const lstTwo = timeTwo.split(':');
    var durationHour = parseInt(lstTwo[0] - lstOne[0]);
    var durationMin = parseInt(lstTwo[1] - lstOne[1]);
    var durationSec = parseInt(lstTwo[2] - lstOne[2]);
    if (durationMin < 0) {
        durationHour--;
        durationMin = 60 + durationMin;
    }
    if (durationSec < 0) {
        durationMin--;
        durationSec = 60 + durationSec;
    }
    //console.log(`${durationHour}:${durationMin}:${durationSec}`);
    assert(durationHour >= 0);
    return `${durationHour}:${durationMin}:${durationSec}`;
}

//mode = week or today
const report = function (mode) {
    const data = loadLogs();
    const today = timestamp('YYYY/MM/DD');
    const result = [];
    if (mode == 'today') {
        data.forEach(element => {
            var i = element.logs.length - 1;
            while (i > -1 && element.logs[i].end && element.logs[i].end.substring(0, 10) == today) {
                result.push(`Project ${element.project}: ${element.logs[i].duration}`);
                i--;
            }
        });
    }
    console.log(result);
}


const signup = function (username) {
    mongoUtils.connectToDb(() => {
        const db = mongoUtils.getDb();
        const checkUserNames = db.collection('userData').findOne({ user: username });
        console.log("a");
        checkUserNames.then((usr) => {
            console.log("b");
            if (usr) {
                console.log("Username already exists");
                return;
            }
            console.log("c");
            db.collection('userData').insertOne({ user: 'username', projectNames: [], currentProject: null }).
                then((_) => {
                    console.log("Username registered")
                    return;
                }).catch((e) => console.log(e));
        });
    });
}


module.exports = {
    createProject: createProject,
    addLog: addLog,
    removeProject: removeProject,
    listProjects: listProjects,
    //currentProject: getCurrentProjData,
    report: report,
    signup: signup
}