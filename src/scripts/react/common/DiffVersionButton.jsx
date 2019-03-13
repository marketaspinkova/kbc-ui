import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from './Tooltip';
import VersionsDiffModal from './VersionsDiffModal';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    version: PropTypes.object.isRequired,
    versionConfig: PropTypes.object.isRequired,
    previousVersion: PropTypes.object.isRequired,
    previousVersionConfig: PropTypes.object.isRequired,
    isPending: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isSmall: PropTypes.bool,
    onLoadVersionConfig: PropTypes.func,
    tooltipMsg: PropTypes.string,
    buttonText: PropTypes.string,
    buttonClassName: PropTypes.string,
    buttonAsSpan: PropTypes.bool
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  getDefaultProps() {
    return {
      buttonClassName: 'btn btn-link'
    };
  },

  closeModal() {
    this.setState({ showModal: false });
  },

  openModal() {
    if (this.props.isDisabled || this.props.isPending) return;
    this.props.onLoadVersionConfig().then(() => this.setState({ showModal: true }));
  },

  render() {
    if (this.props.isPending) {
      return this.renderLoading();
    }

    const Wrapper = this.props.buttonAsSpan ? 'span' : 'button';

    return (
      <Tooltip tooltip={this.props.tooltipMsg || this.tooltipMsg()} placement="top" trigger={['hover']}>
        <Wrapper
          className={this.props.buttonClassName}
          style={{ cursor: 'pointer' }}
          disabled={this.props.isDisabled}
          onClick={this.openModal}
        >
          {this.props.isSmall ? (
            <small>
              <em className="fa fa-fw fa-exchange" />
              {this.props.buttonText}
            </small>
          ) : (
            <span className="text-muted">
              <em className="fa fa-fw fa-exchange" />
              {this.props.buttonText}
            </span>
          )}
          {this.renderDiffModal()}
        </Wrapper>
      </Tooltip>
    );
  },

  tooltipMsg() {
    const { previousVersion, version } = this.props;
    return `Compare with previous (#${previousVersion.get('version')} to #${version.get('version')})`;
  },

  renderLoading() {
    const Wrapper = this.props.buttonAsSpan ? 'span' : 'button';

    return (
      <Wrapper className={this.props.buttonClassName}>
        {this.props.isSmall ? (
          <small>
            <Loader />
            {this.props.buttonText}
          </small>
        ) : (
          <Loader />
        )}
      </Wrapper>
    );
  },

  renderDiffModal() {
    return (
      <VersionsDiffModal
        key="diff-button-modal"
        onClose={this.closeModal}
        show={this.state.showModal}
        referentialVersion={this.props.versionConfig}
        compareVersion={this.props.previousVersionConfig}
      />
    );
  }
});
