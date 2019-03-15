import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Tooltip from '../../react/common/Tooltip';
import CopyVersionModal from './CopyVersionModal';
import {Loader} from '@keboola/indigo-ui';
import ImmutableRenderMixin from 'react-immutable-render-mixin';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    version: PropTypes.object.isRequired,
    onCopy: PropTypes.func.isRequired,
    newVersionName: PropTypes.string,
    onChangeName: PropTypes.func.isRequired,
    isPending: PropTypes.bool,
    isDisabled: PropTypes.bool
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  closeModal() {
    this.props.onChangeName();
    this.setState({'showModal': false});
  },

  openModal() {
    this.setState({'showModal': true});
  },

  onCopy() {
    this.props.onCopy();
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
        <Tooltip tooltip="Copy to new configuration" placement="top">
          <button className="btn btn-link" disabled={this.props.isDisabled} onClick={this.openModal}>
            <em className="fa fa-code-fork fa-fw" />
            <CopyVersionModal
              version={this.props.version}
              show={this.state.showModal}
              onClose={this.closeModal}
              onCopy={this.onCopy}
              onChangeName={this.props.onChangeName}
              newVersionName={this.props.newVersionName}
            />
          </button>
        </Tooltip>
      );
    }
  }
});
