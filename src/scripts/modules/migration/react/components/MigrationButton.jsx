import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Confirm from '../../../../react/common/Confirm';
import {Button} from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    onClick: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Confirm
        title="OAuth Credentials Migration"
        text={this.deleteConfirmMessage()}
        buttonLabel="Start migration"
        onConfirm={this.props.onClick}
      >
        <Button bsStyle="success" disabled={!this.props.enabled}>
          <i className="fa fa-play fa-fw" /> Start migration
        </Button>
      </Confirm>
    );
  },

  deleteConfirmMessage() {
    return <span>Are you sure you want to execute this migration?</span>;
  }
});
