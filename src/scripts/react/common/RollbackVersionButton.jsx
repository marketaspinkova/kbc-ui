import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Tooltip from '../../react/common/Tooltip';
import RollbackVersionModal from './RollbackVersionModal';
import {Loader} from '@keboola/indigo-ui';

export default createReactClass({

  propTypes: {
    version: PropTypes.object.isRequired,
    onRollback: PropTypes.func.isRequired,
    isPending: PropTypes.bool,
    isDisabled: PropTypes.bool
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
        <Tooltip tooltip="Restore this version" placement="top">
          <button className="btn btn-link" disabled={this.props.isDisabled} onClick={this.openModal}>
            <em className="fa fa-undo fa-fw" />
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
