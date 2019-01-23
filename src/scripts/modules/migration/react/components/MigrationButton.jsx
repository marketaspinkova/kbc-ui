import React, { PropTypes } from 'react';
import Confirm from '../../../../react/common/Confirm';
import {Button} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    onClick: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Confirm
        title="Migrate"
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
