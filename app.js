const validator = require('validator');
const chalk = require('chalk')
const yargs = require('yargs')
const notes = require('./notes.js')

yargs.command({
    'command':'list',
    'describe': 'list notes',
    handler: function(argv){
        console.log("Listing notes \n");
        notes.loadNotes().forEach(element => {
            console.log(`Title:${element.title}\nBody:${element.body}\n`);
        });
    }
});

yargs.command({
    'command':'remove',
    'describe': 'remove note',
    'builder':{
        'title': {
            'describe':'remove note with a given title',
            'demandOption':true,
            'type':'string'
        }
    },
    handler: function(argv){
        notes.removeNote(argv.title);
    }
});

yargs.command({
    'command':'add',
    'describe': 'add new note',
    'builder': {
        'title': {
            'describe': 'Note title',
             demandOption:true,
             type: 'string'
        },
        'body': {
            'describe': 'note body',
            demandOption:true,
            type: 'string'
        }
    },
    handler: function(argv){
        notes.addNote(argv.title,argv.body);
    }
});

yargs.command({
    'command':'read',
    'describe': 'read the note',
    'builder': {
        'title': {
            'describe': 'Note title',
             demandOption:true,
             type: 'string'
        },
    },
    handler: function(argv){
        console.log("reading the note...");
        notes.readNote(argv.title);
    }
});


yargs.parse()

