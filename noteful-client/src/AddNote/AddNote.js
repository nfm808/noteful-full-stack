import React, { Component } from 'react'
import NotesContext from '../notesContext';
import config from '../config';
import ValidationError from '../ValidationError/ValidationError';

class AddNote extends Component {
  static contextType = NotesContext;
  constructor(props) {
    super(props)
  
    this.state = {
       name: '',
       folderId: '',
       content: '',
       nameValid: false,
       folderValid: false,
       contentValid: false,
       formValid: false,
       validationMessages: {
         name: '',
         folder: '',
         content: '',
       }
    };
  }

  updateName(name) {
    this.setState({
      name: name,
    }, () => {this.validateName(name)})
  }

  updateFolder(folderId) {
    this.setState({
      folderId: folderId,
    }, () => {this.validateFolderId(folderId)})
  }

  updateContent(content) {
    this.setState({
      content: content,
    }, () => {this.validateContent(content)})
  }

  validateName(fieldValue) {
    const fieldErrors = {...this.state.validationMessages}
    let hasError = false;

    fieldValue = fieldValue.trim();
    if(fieldValue.length === 0) {
      fieldErrors.name = 'Name is required';
      hasError = true;
    } else {
      fieldErrors.name = '';
      hasError = false;
    }

    this.setState({
      validationMessages: fieldErrors,
      nameValid: !hasError
    }, this.formValid);
  }
  
  validateContent(fieldValue) {
    const fieldErrors = {...this.state.validationMessages};
    let hasError = false;

    fieldValue = fieldValue.trim();
    if (fieldValue.length === 0) {
      fieldErrors.content = 'Notes require content';
      hasError = true;
    } else {
      fieldErrors.content = '';
      hasError = false;
    }

    this.setState({
      validationMessages: fieldErrors,
      contentValid: !hasError
    }, this.formValid);
  }

  validateFolderId(fieldValue) {
    const fieldErrors = {...this.state.validationMessages};
    let hasError = false;
    const { folders } = this.context;

    const filteredFolders = folders.filter(id => id.id === fieldValue);
    if (!filteredFolders) {
      fieldErrors.folder = 'Folder does not exist';
      hasError = true;
    } else {
      fieldErrors.folder = '';
      hasError = false;
    }
    this.setState({
      validationMessages: fieldErrors,
      folderValid: !hasError
    }, this.formValid);
  }

  formValid() {
    this.setState({
      formValid: this.state.nameValid && this.state.folderValid && this.state.contentValid
    })
  }

  idGenerator() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }


  handleSubmit(e) {
    e.preventDefault()
    const { name, folderId, content } = this.state;
    
    let newNote = {
      name: name,
      folderId: folderId,
      content: content,
      id: this.idGenerator(),
      modified: `${new Date()}`
    }

    fetch(`${config.API_ENDPOINT}/notes`, {
      method: `POST`,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(newNote)
    })
    .then(res => {
      if(!res.ok) {
        return res.json().then(e => Promise.reject(e))
      }
      this.context.addNote(newNote);
      this.props.history.push(`/note/${newNote.id}`);
    }).catch(err => {
      console.error({err});
    });
  }
  
  render() {
    const { folders } = this.context;
    const folderOptions = !folders ? null 
                          :folders.map(folder => 
                          <option key={folder.id} value={folder.id}>{folder.name}</option>
                          );

    return (
      <form className="form" onSubmit={(e) => this.handleSubmit(e)} >
        <h2>Add Note</h2>
        <h3>* fields required</h3>
        <div className='form-group'>
          <label htmlFor='name'>* Name: </label>
          <input type='text' name='name' id='name' value={this.state.name} onChange={(e) => this.updateName(e.target.value)}/>
          <ValidationError hasError={this.state.nameValid} message={this.state.validationMessages.name} />
          <label htmlFor='folder'>* Folder: </label>
          <select name='folder' id='folder' value={this.state.folderId} onChange={(e) => this.updateFolder(e.target.value)}>
            <option key={0} value={null}>Select a Folder</option>
            {folderOptions}
          </select>
          <label htmlFor='content'>* Content: </label>
          <textarea type="text" rows='5' name='content' id='content' value={this.state.content} onChange={(e) => this.updateContent(e.target.value)} />
          <ValidationError hasError={this.state.contentValid} message={this.state.validationMessages.content} />
        </div>
        <button type='button' onClick={() => this.props.history.goBack()} >Cancel</button>
        <button type='submit' disabled={!this.state.formValid}>Submit</button>
      </form>
    )
  }
}

export default AddNote
