import React from 'react';

const NotesContext = React.createContext({
  folders: [{}],
  notes: [{}],
  addNote: () => {},
  deleteNote: () => {},
  addFolder: () => {}
});

export default NotesContext