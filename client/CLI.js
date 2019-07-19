// Comand line interface for testing the time tracker.


const yargs = require('yargs')
const request = require('request')
const fs = require('fs');
//host = "http://localhost:3000";
host = "http://54.237.77.73:80";
path = "/Users/bogdanabaev/RandomProgramming/node/notes/client/";


const sendQuery = function (query, username, signup) {
    if (username) {
        request.post({
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            url: host + "/graphql",
            body: JSON.stringify({ "query": query })
        }, (err, result) => {
            if (err) {
                console.log(err)
                return null;
            } else {
                if (signup) {
                    fs.writeFileSync(path + '.username.txt', username);
                }
                const data = JSON.parse(result.body).data.time;
                const key = Object.keys(data)[0];
                console.log(data[`${key}`]);
            }
        })
    } else {
        console.log("No username found, you need to sign up!");
        return null;
    }
}


yargs.command({
    'command': 'start <project>',
    'describe': 'work on project',

    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                start(projectName: "${argv.project}")
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});


yargs.command({
    'command': 'end',
    'describe': 'finish working on current project',

    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                end
              }
            }`;
        } catch (e) {
            console.log("You need to sign up first");
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'create <project>',
    'describe': 'create new project',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                create(projectName: "${argv.project}")
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'delete <project>',
    'describe': 'delete project',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                remove(projectName: "${argv.project}")
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'ls',
    'describe': 'show existing projects',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                ls
              }
            }`;

        } catch (e) {
            console.log(e);
            return;
        }
        const body = sendQuery(query, username);
        if (body){
            body.data.time.ls.forEach((el)=>{
                console.log(el + '\t');
            })
        }
    }
});

yargs.command({
    'command': 'current',
    'describe': 'current project',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query = `{
                time(username: "${username}"){
                current
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        sendQuery(query, username);
    }
});

yargs.command({
    'command': 'report <days>',
    'describe': 'report daily or weekly work progress',
    handler: function (argv) {
        var username = '';
        try {
            username = fs.readFileSync(path + '.username.txt').toString();
            var query=`{
                time(username: "${username}" ){
                    report(days:${argv.days}){ 
                        _id
                        totalTime
                        brief{
                        timeSpent
                          day
                          month
                          }
                    }
              }
            }`;
        } catch (e) {
            console.log(e);
            return;
        }
        if (username) {
            request.post({
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                url: host + "/graphql",
                body: JSON.stringify({ "query": query })
            }, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    const dict = JSON.parse(result.body).data.time.report;
                    var temp = "Your activities: \n";
                    dict.forEach((prj) => {
                        temp  += `\nYou spent total of ${prj.totalTime} minutes on ${prj._id}\n `;
                        prj.brief.forEach((session)=>{
                          temp += `--${session.timeSpent} minutes spent on day ${session.day}\n `
                        });
                      });
                    console.log(temp);
                }
            })
        } else {
            console.log("You need to sign up");
        }
    }
});


yargs.command({
    'command': 'signup <username>',
    'describe': 'signup',
    handler: function (argv) {
        var query = `{
            signup(username: "${argv.username}")
        }`;
        const res = sendQuery(query, argv.username, true);
        if (res) {
            fs.writeFileSync(path + '.username.txt', argv.username);
        }
    }
});




yargs.parse()


