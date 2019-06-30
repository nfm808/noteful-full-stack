import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ValidationError from '../ValidationError/ValidationError';
import config from '../config';
import NotesContext from '../notesContext';

export default class AddFolder extends Component {

  // gives access to the context provider
  static contextType = NotesContext

  constructor(props) {
    super(props)

    // setting up the state for form validation 
    this.state = {
       name: '',
       nameValid: false,
       formValid: false,
       validationMessages: {
         name: ''
       }
    }
  }
  
  handleSubmit(e) {
    e.preventDefault();
    const { name } = this.state;

    // create the new object for the folder post
    const newFolder = {
      "folder_name": name
    }
    
    fetch(`${config.API_URL}/folders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      // this converts the object to be json ready
      // for the server
      body: JSON.stringify(newFolder)
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(e => Promise.reject(e))
      }
      return res.json()
      // add the new folder to the current state
    })
    .then(resJson => {
      this.context.addFolder(resJson);
      this.props.history.push(`/folder/${resJson.id}`)

    })
    .catch(error => {
      console.error({error});
    })

  }

  updateName(name) {
    this.setState({ name }, () => this.validateName(name));
  }

  validateName(fieldValue) {
    const fieldErrors = {...this.state.validationMessages};
    let hasError = false;

    fieldValue = fieldValue.trim();
    if (fieldValue.length === 0) {
      fieldErrors.name = 'Name is required';
      hasError = true;
    } else {
      fieldErrors.name = '';
      hasError = false;

      this.setState({
        validationMessages: fieldErrors,
        nameValid: !hasError
      }, this.formValid);  
    }    
  }

  formValid() {
    this.setState({
      formValid: this.state.nameValid
    })
  }

  render() {
    return (
      <form onSubmit={(e) => this.handleSubmit(e)} className="addFolder">
        <h2>Add Folder</h2>
        <div className="form-group">
          <label htmlFor='name'>Name *</label>
          <input type="text" className="addFolder_name"
            name='name' id='name' value={this.state.name} onChange={(e) => this.updateName(e.target.value)} />
          <ValidationError hasError={this.state.nameValid} message={this.state.validationMessages.name} />
        </div>
        <button 
          type='button' 
          className='addFolder_cancel'
          onClick={() => this.props.history.goBack()}  
        >
          Cancel
        </button>
        <button type='submit' className="addFolder_submit" disabled={!this.state.formValid}>
          Add Folder
        </button>
      </form>
    )
  }
}

AddFolder.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  match: PropTypes.object
}
