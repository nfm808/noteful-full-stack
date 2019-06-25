import React, { Component } from 'react'

class AppError extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       hasError: false
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
    return (
      <h2>
        There was an issue with your request.  Please refresh and try again.
      </h2>
      )
    }
    return this.props.children;
  }
}

export default AppError
