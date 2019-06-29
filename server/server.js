const notes = require('./timeTracker.js');

const express = require('express');
const port = 3000;
const app = express();
app.use(express.json()); 
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.get('', (req,res) => {
    res.send('HALLO!');
})

app.get('/start', (req,res) => {
    const username = req.query.username;
    var outcome = notes.addLog(username,'start',req.query.projectName);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/end', (req,res) => {
    const username = req.query.username;
    var outcome = notes.addLog(username,'end');
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/signup', (req,res) => {
    var outcome = notes.signup(req.query.username);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/create', (req,res) => {
    const username = req.query.username;
    var outcome = notes.createProject(username, req.query.projectName);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/delete', (req,res) => {
    const username = req.query.username;
    var outcome = notes.removeProject(username,req.query.projectName);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/ls', (req,res) => {
    const username = req.query.username;
    var outcome = notes.listProjects(username);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})


app.get('/current', (req,res) => {
    const username = req.query.username;
    var outcome = notes.currentProject(username);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/report', (req,res) => {
    const username = req.query.username;
    var outcome = notes.report(username);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

