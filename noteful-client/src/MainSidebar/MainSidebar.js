import React from 'react'
import { NavLink } from 'react-router-dom'
import NotesContext from '../notesContext'
import './MainSidebar.css'

class MainSidebar extends React.Component {
  static contextType = NotesContext;
  

  render() {
    const { folders, notes } = this.context;
    // console.log( folders, notes);

    const list = (!folders || !notes) ? null 
                :  <ul className='MainSidebar__list'>
                {folders.map(folder =>
                  <li key={folder.id}>
                    <NavLink
                      className="MainSidebar__folder-link"
                      to={`/folder/${folder.id}`}
                    >
                    {folder.name} 
                    </NavLink>
                  </li>  
                )}
              </ul>
      
  
    return (
      <section className='MainSidebar'>
        <div className="MainSidebar__button-container">
        {list}
          <button 
            className="MainSidebar__add-folder-button"
            onClick={() => this.props.history.push('/add-folder')}
            to='/add-folder'
            type='button'
          >
            Add Folder
          </button>
        </div>
      </section>
    )
  }
}

export default MainSidebar


