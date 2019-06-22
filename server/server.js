const notes = require('./timeTracker.js');

const express = require('express');

const app = express();
app.use(express.json()); 

app.get('', (req,res) => {
    res.send('hello');
})

app.get('/start', (req,res) => {
    var outcome = notes.addLog('start',req.query.projectName);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/end', (req,res) => {
    var outcome = notes.addLog('end');
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
    var outcome = notes.createProject(req.query.projectName);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/delete', (req,res) => {
    var outcome = notes.removeProject(req.query.projectName);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/ls', (req,res) => {
    var outcome = notes.listProjects();
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})


app.get('/current', (req,res) => {
    var outcome = notes.currentProject();
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.get('/report', (req,res) => {
    var outcome = notes.report();
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})


app.listen(3000, () => {
    console.log('server running');
});