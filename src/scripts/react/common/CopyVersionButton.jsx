import React from 'react';
import Tooltip from '../../react/common/Tooltip';
import CopyVersionModal from './CopyVersionModal';
import {Loader} from '@keboola/indigo-ui';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    version: React.PropTypes.object.isRequired,
    onCopy: React.PropTypes.func.isRequired,
    newVersionName: React.PropTypes.string,
    onChangeName: React.PropTypes.func.isRequired,
    isPending: React.PropTypes.bool,
    isDisabled: React.PropTypes.bool
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
