// function to filter out the notes that are associated
// with the folder
export const getNotesForFolder = (notes, folderId) => {
  if (!notes) {
    return null;
  }
  return (!folderId) ? notes
    : notes.filter(note => note.folder_id === parseInt(folderId));
}

// this filters through the notes to find the note 
// associated with the current selected note
export const findNote = (notes, noteId) => {
  if(!notes) {
    return null;
  }
  return (!noteId) ?  notes 
        : notes.filter(note => note.id === parseInt(noteId) )[0];
}

// filters the folder needed to pull the folder name
// for the folder belonging to an individual note
export const findFolder = (folders, folderId) => {
  if(!folders) {
    return null;
  }
  return (!folderId) ? folders  
        : folders.filter(folder => folder.id === folderId)[0];
}
