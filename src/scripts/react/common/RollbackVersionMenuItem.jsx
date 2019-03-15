import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { MenuItem } from 'react-bootstrap';
import RollbackVersionModal from './RollbackVersionModal';
import {Loader} from '@keboola/indigo-ui';
import Tooltip from '../../react/common/Tooltip';

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
        <MenuItem
          eventKey={this.props.version.get('version') + '-rollback'}
          disabled
        >
          <em className="fa fa-fw">
            <Loader/>
          </em>
          Rollback
        </MenuItem>
      );
    } else {
      return (
        <Tooltip tooltip="Restore this version" placement="left">
          <MenuItem
            eventKey={this.props.version.get('version') + '-rollback'}
            onSelect={this.openModal}
            disabled={this.props.isDisabled}
          >
            <em className="fa fa-undo fa-fw" />
            Rollback
            <RollbackVersionModal
              version={this.props.version}
              show={this.state.showModal}
              onClose={this.closeModal}
              onRollback={this.onRollback}
            />
          </MenuItem>
        </Tooltip>
      );
    }
  }
});
