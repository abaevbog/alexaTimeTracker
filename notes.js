const fs = require('fs');
const timestamp = require('time-stamp');
const assert = require('assert');

const { MongoClient, ObjectId } = require('mongodb');
const connectionUrl = 'mongodb://127.0.0.1:27017';
const mongoUtils = require('./mongoUtils.js');

var currentProject;

//
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

//
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
                            log = { user: 'username', projectName: projectName, start: {year:timestamp('YYYY'),month:timestamp('MM'),day:timestamp('DD'),time:timestamp('HH:mm:ss') }, finish: null, duration: null };
                            insertLogToDb(log);
                            db.collection('userData').updateOne({ user: 'username' },
                                {
                                    $set: {
                                        currentProject: projectName
                                    }
                                }).then((suc) => resolve()).catch((e) => console.log(e));
                        } else {
                            reject("You are already working on " + result.currentProject);
                        }
                    } else {
                        if (result.currentProject) {
                            db.collection('userData').findOne({ user: 'username' }).then((result) => {
                                db.collection('logs').findOne({ projectName: result.currentProject, finish: null })
                                    .then((log) => {
                                        const fin = {year:timestamp('YYYY'),month:timestamp('MM'),day:timestamp('DD'),time:timestamp('HH:mm:ss') };
                                        updateLog = { projectName: result.currentProject, finish: fin,id:log._id, duration: subtractTimeStamps(fin, log.start) }
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




// log = {user:..., projectName:..., start:...,finish:...,duration:...}
const insertLogToDb = (log) => {
    const db = mongoUtils.getDb();
    const addToCollection = db.collection('logs').insertOne(log);

    addToCollection.then((suc) => {
        console.log("DB updated");
    }).catch((e) => console.log(e));

}


const updateLogInDb = (log) => {
    const db = mongoUtils.getDb();

    db.collection('logs').updateOne({
        _id: log.id
    }, {
            $set: {
                finish: log.finish,
                duration: log.duration
            }
        }).then((suc) => console.log(suc))
        .catch((e) => console.log(e));
}

//
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
    mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            db.collection('userData').updateOne({
                user: 'username'
            }, {
                    $pull: {
                        projectNames: projectName
                    }
                }).then((suc) => resolve())
                .catch((e) => reject(e))
        })
    );
}

const listProjects = function () {
    mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            db.collection('userData').findOne({ user: 'username' })
                .then((suc) => {
                    suc.projectNames.forEach((name) => console.log(name + '\t'));
                    resolve();
                })
                .catch((e) => reject(e))
        })
    );
}


//finish/start = {year:...,date:day/mon,time:...}
const subtractTimeStamps = function (finish, start) {
    const timesOne = start.time.split(':');
    const timesTwo = finish.time.split(':');
    var durationDay = parseInt(finish.day-start.day);
    var durationHour = parseInt(timesTwo[0] - timesOne[0]);
    var durationMin = parseInt(timesTwo[1] - timesOne[1]);
    var durationSec = parseInt(timesTwo[2] - timesOne[2]);
    if (durationHour < 0){
        assert(durationDay > 0);
        durationDay--;
        durationHour = 24 + durationHour;
    }
    if (durationMin < 0) {
        durationHour--;
        durationMin = 60 + durationMin;
    }
    if (durationSec < 0) {
        durationMin--;
        durationSec = 60 + durationSec;
    }
    assert(durationHour >= 0);
    console.log(`${durationHour}:${durationMin}:${durationSec}`);
    return `${durationHour}:${durationMin}:${durationSec}`;
}
 

//search only for todays tasks so far
const report = function () {
    mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            const today = timestamp('DD');
            db.command({
                find:"logs",
                filter: {"start.day":today}
            }, (err,result) => {
                if( err){
                    console.log(err);
                } else {
                    console.log(result.cursor.firstBatch);
                }
            });
        })
    );
}

//
const signup = function (username) {
    mongoUtils.connectToDb(
        () => new Promise(function (resolve, reject) {
            const db = mongoUtils.getDb();
            const checkUserNames = db.collection('userData').findOne({ user: username });
            checkUserNames.then((usr) => {
                if (usr) {
                    reject("Username already exists");
                }
                db.collection('userData').insertOne({ user: 'username', projectNames: [], currentProject: null }).
                    then((_) => {
                        resolve("Username registered")
                    }).catch((e) => reject(e));
            });
        })
    );
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