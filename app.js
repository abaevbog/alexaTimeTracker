const validator = require('validator');
const chalk = require('chalk')
const yargs = require('yargs')
const notes = require('./notes.js')



yargs.command({
    'command':'start <project>',
    'describe': 'work on project',

    handler: function(argv){
        notes.addLog('start',argv.project);
    }
});


yargs.command({
    'command':'end',
    'describe': 'finish working on current project',

    handler: function(argv){
        notes.addLog('end');
    }
});

yargs.command({
    'command':'create <project>',
    'describe': 'create new project',
    handler: function(argv){
        notes.createProject(argv.project);
    }
});

yargs.command({
    'command':'delete <project>',
    'describe': 'delete project',
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

yargs.command({
    'command':'current',
    'describe': 'current project',
    handler: function(argv){
        notes.currentProject();
    }
});

yargs.command({
    'command':'report',
    'describe': 'report daily or weekly work progress',
    handler: function(argv){
        notes.report();
    }
});


yargs.command({
    'command':'signup <username>',
    'describe': 'signup',
    handler: function(argv){
        notes.signup(argv.username);
    }
});




yargs.parse()

