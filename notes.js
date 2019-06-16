const fs = require('fs');


const addNote = function(title,body){
    const notes = loadNotes();
    const duplicateNotes = notes.find((note) => note.title === title);
    if (!duplicateNotes){
        notes.push({
            title:title,
            body:body
        });
        saveNotes(notes);
    } else {
        console.log("Note title taken");
    }
}

const saveNotes = (notesArr) =>{
    const dataJson = JSON.stringify(notesArr);
    fs.writeFileSync('notes.json',dataJson);
}

const loadNotes = function(){
    try{
        const buffer = fs.readFileSync('notes.json');
        const dataJson = buffer.toString();
        return JSON.parse(dataJson);
    } catch(e){
        return []
    }
}

const removeNote = function(title){
    const notes = loadNotes();
    const index = notes.findIndex(function(note) {
        return note.title == title;
    });
    console.log(index);
    if (typeof index != 'undefined'){
      notes.splice( index,1);
      saveNotes(notes);
      console.log("success");
    } else{
        console.log("Note does not exist");
    }
}

const readNote = function(title){
    const notes = loadNotes();
    const index= notes.find(function(note) {
        return note.title == title;
    });
    if (index){
      console.log(`Title:${index.title}\nBody:${index.body}\n`);
    } else{
        console.log("Note does not exist");
    }
}
 



module.exports = {
    loadNotes:loadNotes,
    addNote:addNote,
    removeNote:removeNote,
    readNote:readNote
}