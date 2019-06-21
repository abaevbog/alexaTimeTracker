const notes = require('../notes')
const bodyParser = require('body-parser');

const express = require('express');

const app = express();
app.use(express.json()); 

app.get('', (req,res) => {
    res.send('hello');
})

app.post('/start', (req,res) => {
    console.log(req.body);
    var outcome = notes.addLog('start',req.body.projectName);
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

app.post('/signup', (req,res) => {
    var outcome = notes.signup(req.body.username);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.post('/create', (req,res) => {
    var outcome = notes.createProject(req.body.projectName);
    outcome.then((result) => {
        res.send(result);
    }).catch((e) => {
        res.send(e)
    });
})

app.post('/delete', (req,res) => {
    var outcome = notes.removeProject(req.body.projectName);
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