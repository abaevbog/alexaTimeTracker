const validator = require('validator');
const chalk = require('chalk')
const yargs = require('yargs')
const notes = require('./notes.js')


yargs.command({
    'command':'start',
    'describe': 'work on project',
    'builder':{
        'project': {
            'describe':'name of the project to work on',
            'demandOption':true,
            'type':'string'
        }
    },
    handler: function(argv){
        notes.addLog(argv.project,'start');
    }
});


yargs.command({
    'command':'end',
    'describe': 'finish working on project',
    'builder':{
        'project': {
            'describe':'name of the project to stop working on',
            'demandOption':true,
            'type':'string'
        }
    },
    handler: function(argv){
        notes.addLog(argv.project, 'end');
    }
});

yargs.command({
    'command':'create',
    'describe': 'create new project',
    'builder': {
        'project': {
            'describe': 'New project to create',
             demandOption:true,
             type: 'string'
        },
    },
    handler: function(argv){
        notes.createProject(argv.project);
    }
});

yargs.command({
    'command':'delete',
    'describe': 'delete project',
    'builder': {
        'project': {
            'describe': 'Delete existing project',
             demandOption:true,
             type: 'string'
        },
    },
    handler: function(argv){
        notes.removeProject(argv.project);
    }
});

yargs.command({
    'command':'ls',
    'describe': 'show existing projects',
    handler: function(argv){
        console.log("Existing projects:\n");
        notes.listProjects();
    }
});




yargs.parse()

