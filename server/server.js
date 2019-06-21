const notes = require('../notes')
const bodyParser = require('body-parser');

const express = require('express');

const app = express();
app.use(express.json()); 

app.get('', (req,res) => {
    res.send('hello');
})

app.get('/start', (req,res) => {
    res.send('hello');
})

app.get('/end', (req,res) => {
    res.send('hello');
})

app.get('', (req,res) => {
    res.send('hello');
})

app.post('/create', (req,res) => {
    var x = notes.createProject(req.body.projectName)
    res.send(x);
})

app.get('/delete', (req,res) => {
    res.send('delete');
})

app.get('/ls', (req,res) => {
    res.send('ls');
})

app.get('/start', (req,res) => {
    res.send('hello');
})

app.get('/end', (req,res) => {
    res.send('hello');
})

app.get('/current', (req,res) => {
    res.send('hello');
})

app.get('/report', (req,res) => {
    res.send('hello');
})


app.listen(3000, () => {
    console.log('server running');
});