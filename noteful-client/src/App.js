import React from 'react';
import { Route, Link } from 'react-router-dom';
import './App.css';
import NotesContext from './notesContext'
import MainSidebar from './MainSidebar/MainSidebar'
import NoteSidebar from './NoteSidebar/NoteSidebar'
import MainMain from './MainMain/MainMain'
import NoteMain from './NoteMain/NoteMain'
import config from './config'
import AddFolder from './AddFolder/AddFolder';
import AddNote from './AddNote/AddNote';
import AppError from './AppError/AppError';

class App extends React.Component {
  constructor(props) {
    super(props)
  
    this.state = {
       notes: [],
       folders: [],
    }
  }

  // api call for the json server
  componentDidMount() {
    // this promise all creates a grouping of multiple
    // fetch calls to get multiple endpoints and organizes
    // them into an array
    Promise.all([
      fetch(`${config.API_ENDPOINT}/notes`),
      fetch(`${config.API_ENDPOINT}/folders`)
    ], {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    // we then take the responses and organize them
    // into an array at assigned positions
    .then(([notesRes, foldersRes]) =>{
      if (!notesRes.ok) {
        console.log('Notes error')
        return notesRes.json().then(e => Promise.reject(e))
      }
      if (!foldersRes.ok) {
        console.log('folders error')
        return foldersRes.json().then(e => Promise.reject(e))
      }
      return Promise.all([
        notesRes.json(),
        foldersRes.json()
      ])
    })
    .then(([notes, folders]) => {
      this.setState({ notes, folders })
    })
    .catch(error => {
      console.error({ error })
    })
  }
  handleAddFolder = folder => {
    const { folders } = this.state;
    this.setState({
      folders : [...folders, folder]
    })
  }

  handleAddNote = note => {
    const { notes } = this.state;
    this.setState({
      notes: [...notes, note]
    })

  }

  handleDeleteNote = noteId => {
    // here we update the state to remove the deleted
    // note
    this.setState({
      notes: this.state.notes.filter(note=> note.id !== noteId)
    });
  }
  // maps over the sidebar routes to render the routes
  // without having to type each out concise, less verbose
  renderSidebarRoutes() {
    return (
      <>
        {['/', '/folder/:folderId'].map(path => 
          <Route  
            exact
            key={path}
            path={path}
            component={MainSidebar}
            // render={routeProps =>
            //   <MainSidebar
            //     folders={folders}
            //     notes={notes}
            //     {...routeProps}
            //   />
            // }
          />
        )}
        <Route 
          path='/note/:noteId'
          component={NoteSidebar}
          // render={routeProps => { 
          //   const { noteId } = routeProps.match.params
          //   const note = findNote(notes, noteId) || {}
          //   const folder = findFolder(folders, note.folderId)
          //   console.log('folder function resultes:', folder)
          //   return (
          //     <NoteSidebar 
          //       {...routeProps}
          //       folder={folder}
          //       note={note}
          //     />
          //   )
          // }}
        />
        <Route 
          path='/add-folder'
          component={AddFolder}
        />
      </>
    )
  }

  // map across the different routes to create the routes
  // without having to list them each in the render
  renderMainRoutes() {
    return (
      <>
        {['/', '/folder/:folderId'].map(path =>
          <Route 
            exact
            key={path}
            path={path}
            component={MainMain}
            // render={routeProps => {
            //   const { folderId } = routeProps.match.params
            //   const notesForFolder = getNotesForFolder(notes, folderId)
            //   return (
            //     <MainMain
            //       {...routeProps}
            //       notes={notesForFolder}
            //     />
            //   )
            // }}
          />
        )}
        <Route 
          path='/note/:noteId'
          component={NoteMain}
          // render={routeProps => {
          //   const { noteId } = routeProps.match.params
          //   const note = findNote(notes, noteId)
          //   return (
          //     <NoteMain 
          //       {...routeProps}
          //       note={note}
          //     />
          //   )
          // }}
        />
        <Route
          path='/add-note'
          component={AddNote}
        />
      </>
    )
  }


  render() {
    const contextValue = {
      folders: this.state.folders,
      notes: this.state.notes,
      addFolder: this.handleAddFolder,
      addNote: this.handleAddNote,
      deleteNote: this.handleDeleteNote,
    }
    return (
      <NotesContext.Provider value={contextValue}>
        <div className="App">
          <header className="App__header">
            <h1><Link to="/">Noteful</Link></h1>
          </header>
          <AppError>
            <section className="App__main">
              {this.renderSidebarRoutes()}
              {this.renderMainRoutes()}
            </section>
          </AppError>
        </div>
      </NotesContext.Provider>
    )
  }

}

export default App