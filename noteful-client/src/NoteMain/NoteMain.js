import React from 'react'
import Note from '../Note/Note'
import { findNote } from '../notes-helpers'
import './NoteMain.css'
import NotesContext from '../notesContext';

class NoteMain extends React.Component {

  static contextType = NotesContext;

  handleDeleteNote = noteId => {
    this.props.history.push('/')
  }

  render() {  
    
      // destructure the note from props
    const { notes } = this.context
    const { noteId } = this.props.match.params
    const note = findNote(notes, noteId) || {content: ''};
    // conditionally render the note section as
    // the props are created undefined before the call
    const noteItem = (!note) ? null 
                    : <>
                        <ul className="NoteMain__list">
                          <Note 
                            id={note.id}
                            name={note.name}
                            modified={note.modified}
                            onDeleteNote={this.handleDeleteNote}
                          />
                        </ul>
                        <p className="NoteMain__content">{note.content}</p>
                      </>


    return (

      // render the main section and then the conditionally
      // note information from the constant noteItem
      <section className="NoteMain">
        {noteItem}
      </section>
    )
  }
}

export default NoteMain
