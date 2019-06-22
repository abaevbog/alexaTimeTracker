const chalk = require('chalk')
const yargs = require('yargs')
const request = require('request')


yargs.command({
    'command':'start <project>',
    'describe': 'work on project',

    handler: function(argv){
        const url = "http://localhost:3000/start?projectName=" + argv.project;
        request.get(url,json=true, (err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});


yargs.command({
    'command':'end',
    'describe': 'finish working on current project',

    handler: function(argv){
        request.get("http://localhost:3000/end",(err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});

yargs.command({
    'command':'create <project>',
    'describe': 'create new project',
    handler: function(argv){
        const url = "http://localhost:3000/create?projectName=" + argv.project;
        request.get(url,json=true, (err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});

yargs.command({
    'command':'delete <project>',
    'describe': 'delete project',
    handler: function(argv){
        const url = "http://localhost:3000/delete?projectName=" + argv.project;
        request.get(url,json=true, (err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});

yargs.command({
    'command':'ls',
    'describe': 'show existing projects',
    handler: function(argv){
        request.get("http://localhost:3000/ls",(err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});

yargs.command({
    'command':'current',
    'describe': 'current project',
    handler: function(argv){
        request.get("http://localhost:3000/current",(err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});

yargs.command({
    'command':'report',
    'describe': 'report daily or weekly work progress',
    handler: function(argv){
        request.get("http://localhost:3000/report",(err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});


yargs.command({
    'command':'signup <username>',
    'describe': 'signup',
    handler: function(argv){
        const url = "http://localhost:3000/signup?username=" + argv.username;
        request.get(url,json=true, (err,result) => {
            if (err){
                console.log(err)
            } else{
                console.log(result.body)
            }
        })
    }
});




yargs.parse()


