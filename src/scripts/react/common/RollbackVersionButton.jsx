import React from 'react';
import {Tooltip} from '../../react/common/common';
import RollbackVersionModal from './RollbackVersionModal';
import {Loader} from 'kbc-react-components';

export default React.createClass({

  propTypes: {
    version: React.PropTypes.object.isRequired,
    onRollback: React.PropTypes.func.isRequired,
    isPending: React.PropTypes.bool
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  closeModal() {
    this.setState({'showModal': false});
  },

  openModal() {
    this.setState({'showModal': true});
  },

  onRollback() {
    this.props.onRollback();
    this.closeModal();
  },

  render() {
    if (this.props.isPending) {
      return (
        <span className="btn btn-link">
          <Loader/>
        </span>
      );
    } else {
      return (
        <Tooltip tooltip="Rollback this version" placement="top">
          <button className="btn btn-link" onClick={this.openModal}>
            <em className="fa fa-undo fa-fw"> </em>
            <RollbackVersionModal
              version={this.props.version}
              show={this.state.showModal}
              onClose={this.closeModal}
              onRollback={this.onRollback}
            />
          </button>
        </Tooltip>
      );
    }
  }
});
