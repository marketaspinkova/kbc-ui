import React, {PropTypes} from 'react';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      pid: PropTypes.string.isRequired,
      login: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },


  render() {
    return (
      <div>
        Your project is {this.props.value.pid}
      </div>
    );
  }


});
