const chalk = require('chalk')
const yargs = require('yargs')
const request = require('request')
const fs = require('fs');
host = "http://54.209.84.219";
path = "/Users/bogdanabaev/RandomProgramming/node/notes/CLI/"



yargs.command({
    'command':'start <project>',
    'describe': 'work on project',

    handler: function(argv){
        var username = '';
        try{
            username = fs.readFileSync(path+'.username.txt');
        } catch(e){
            console.log("You need to sign up first");
            return;
        }
        const url = host+"/start?projectName=" + argv.project+"&username=" + username;
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
        var username = '';
        try{
            username = fs.readFileSync(path+'.username.txt');
        } catch(e){
            console.log("You need to sign up first");
            return;
        }
        request.get(host+"/end"+"?username=" + username,(err,result) => {
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
        var username = '';
        try{
            username = fs.readFileSync(path+'.username.txt');
        } catch(e){
            console.log("You need to sign up first");
            return;
        }
        const url = host+"/create?projectName=" + argv.project+"&username=" + username;
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
        var username = '';
        try{
            username = fs.readFileSync(path+'.username.txt');
        } catch(e){
            console.log("You need to sign up first");
            return;
        }
        const url = host+"/delete?projectName=" + argv.project+"&username=" + username;
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
        var username = '';
        try{
            username = fs.readFileSync(path+'.username.txt').toString(); 
        } catch(e){
            console.log("You need to sign up first");
            return;
        }
        request.get(host+"/ls"+"?username=" + username,(err,result) => {
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
        var username = '';
        try{
            username = fs.readFileSync(path+'.username.txt');
        } catch(e){
            console.log("You need to sign up first");
            return;
        }
        request.get(host+"/current"+"?username=" + username,(err,result) => {
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
        var username = '';
        try{
            username = fs.readFileSync(path+'.username.txt');
        } catch(e){
            console.log("You need to sign up first");
            return;
        }
        request.get(host+"/report"+"?username=" + username,(err,result) => {
            if (err){
                console.log(err)
            } else{
                const dict = JSON.parse(result.body);
                for (var project in dict) {
                    console.log("\nProject: " + dict[project]._id);
                    var minSpent = dict[project].timeSpent;
                    var hr = parseInt(minSpent / 60);
                    var min = minSpent % 60;
                    console.log(`Total time: ${hr}:${min}`);
                    console.log("Work sessions:\n")
                    dict[project].workSessions.forEach(session => {
                        console.log(`Start:${session.start.day}/${session.start.month} at ${session.start.time}`);
                        console.log(session.finish?`Finish:${session.finish.day}/${session.finish.month} at ${session.finish.time}`:"In progress" );
                        console.log(session.duration? `Duration: ${parseInt(session.duration/60)}:${session.duration%60} `: "");
                        console.log("-------------------------------------\n");                        
                    });
                }
            }
        })
    }
});


yargs.command({
    'command':'signup <username>',
    'describe': 'signup',
    handler: function(argv){
        const url = host+"/signup?username=" + argv.username;
        request.get(url,json=true, (err,result) => {
            if (err){
                console.log(err)
            } else{
                fs.writeFileSync(path+'.username.txt', argv.username);
                console.log(result.body)
            }
        })
    }
});




yargs.parse()


