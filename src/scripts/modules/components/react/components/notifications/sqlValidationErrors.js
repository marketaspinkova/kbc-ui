import React from 'react';
import { Button } from 'react-bootstrap';

export default (errors, onClick) => {
  return React.createClass({
    propTypes: {
      onClick: React.PropTypes.func.isRequired
    },

    render() {
      return (
        <span onClick={this.props.onClick}>
          SQL Validation found{' '}
          <Button className="btn btn-link" onClick={onClick} style={{ padding: 0 }}>
            <b>
              {errors} error
              {errors > 1 ? 's' : ''}.
            </b>
          </Button>
        </span>
      );
    }
  });
};
