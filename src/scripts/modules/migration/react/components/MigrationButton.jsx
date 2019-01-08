import React, { PropTypes } from 'react';
import Confirm from '../../../../react/common/Confirm';

export default React.createClass({
  propTypes: {
    onClick: PropTypes.func.isRequired
  },

  render() {
    return (
      <Confirm
        title="Migrate"
        text={this.deleteConfirmMessage()}
        buttonLabel="Start migration"
        onConfirm={this.props.onClick}
      >
        <button className="btn btn-success" type="button">
          <i className="fa fa-play fa-fw" /> Start migration
        </button>
      </Confirm>
    );
  },

  deleteConfirmMessage() {
    return <span>Are you sure you want to execute this migration?</span>;
  }
});
