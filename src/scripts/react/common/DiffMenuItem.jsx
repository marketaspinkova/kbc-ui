import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { MenuItem } from 'react-bootstrap';
import VersionsDiffModal from './VersionsDiffModal';
import {Loader} from '@keboola/indigo-ui';
import Tooltip from '../../react/common/Tooltip';

export default createReactClass({

  propTypes: {
    version: PropTypes.object.isRequired,
    previousVersion: PropTypes.object.isRequired,
    onLoadVersionConfig: PropTypes.func.isRequired,
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
    this.props.onLoadVersionConfig().then(() =>
      this.setState({'showModal': true})
    );
  },

  render() {
    if (this.props.isPending) {
      return (
        <MenuItem
          eventKey={this.props.version.get('version') + '-diff'}
          disabled
        >
          <Loader/> Compare
        </MenuItem>
      );
    } else {
      const tooltipMsg = `Compare prior changes(#${this.props.version.get('version')} vs #${this.props.previousVersion.get('version')})`;
      return (
        <Tooltip tooltip={tooltipMsg} placement="left">
          <MenuItem
            eventKey={this.props.version.get('version') + '-diff'}
            onSelect={this.openModal}
            disabled={this.props.isDisabled}
          >
            <em className="fa fa-fw fa-exchange" />
            Compare
            <VersionsDiffModal
              onClose={this.closeModal}
              show={this.state.showModal}
              referentialVersion={this.props.version}
              compareVersion={this.props.previousVersion}
            />
          </MenuItem>
        </Tooltip>
      );
    }
  }

});
