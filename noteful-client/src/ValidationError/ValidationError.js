import React from 'react'
import PropTypes from 'prop-types'

function ValidationError(props) {
  if(props.hasError) {
    return (
      <div className='error'>
        {props.message}
      </div>
    )
  }
  return <></>;
}

ValidationError.propTypes = {
  hasError: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired
}

export default ValidationError

