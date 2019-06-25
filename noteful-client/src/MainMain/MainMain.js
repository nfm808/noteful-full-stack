import React from 'react'
import Note from '../Note/Note'
import NotesContext from '../notesContext'
import { getNotesForFolder } from '../notes-helpers'
import './MainMain.css'

 class MainMain extends React.Component {
  static contextType = NotesContext;
  render() {

    // moved the logic to filter the notes per folder
    // to the component level and retrieve the objects
    // from context and props
    const { notes } = this.context;
    const { folderId } = this.props.match.params;
    const notesForFolder =  getNotesForFolder(notes, folderId);
    const list = (!notes) ? null 
            :  <ul className="MainMain__list">
            {notesForFolder.map(note =>
              <li key={note.id} className="MainMain__list-item">
                <Note 
                  id={note.id}
                  name={note.name}
                  modified={note.modified}
                />
              </li>
            )}
            <div className="MainMain__button-container">
              <button 
                className="MainMain__add-note-button"
                onClick={() => this.props.history.push('/add-note')}
                to='/add-note'
                type='button'
              >
                Add Note
              </button>
            </div>
          </ul>
  

    return (
      <section className="MainMain">
        {list}
      </section>
      )
    }
}

export default MainMain
