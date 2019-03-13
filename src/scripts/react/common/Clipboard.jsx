import PropTypes from 'prop-types';
import React from 'react';
import ClipboardButton from 'react-clipboard.js';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    text: PropTypes.string,
    label: PropTypes.string,
    tooltipText: PropTypes.string,
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return {
      tooltipText: 'Copy to clipboard',
      tooltipPlacement: 'right'
    };
  },

  getInitialState() {
    return {
      isCopied: false,
      isError: false
    };
  },

  render() {
    if (this.props.text && this.props.text !== '') {
      return (
        <OverlayTrigger placement={this.props.tooltipPlacement} overlay={this.tooltip()} ref="overlay">
          <span>
            <ClipboardButton
              component="span"
              className="kbc-cursor-pointer"
              data-clipboard-text={this.props.text}
              onError={this.handleError}
              onSuccess={this.handleAfterCopy}
            >
              {this.renderLabel()}
            </ClipboardButton>
          </span>
        </OverlayTrigger>
      );
    }

    return (
      <OverlayTrigger placement={this.props.tooltipPlacement} overlay={this.tooltip()} ref="overlay">
        {this.renderLabel()}
      </OverlayTrigger>
    );
  },

  renderLabel() {
    if (!this.props.label) {
      return <i className="fa fa-fw fa-copy" />;
    }

    return (
      <span>
        <i className="fa fa-fw fa-copy" /> {this.props.label}
      </span>
    );
  },

  tooltip() {
    return <Tooltip id="clipboardtooltip">{this.state.isError ? this.errorTooltip() : this.okTooltip()}</Tooltip>;
  },

  okTooltip() {
    if (this.props.text && this.props.text !== '') {
      return this.state.isCopied ? 'Copied!' : this.props.tooltipText;
    }

    return 'Nothing to copy';
  },

  handleAfterCopy() {
    this.setState({
      isCopied: true
    });
    this.refs.overlay.show();
    /* global setTimeout */
    setTimeout(this.hideOverlay, 300);
  },

  handleError() {
    this.setState({
      isCopied: false,
      isError: true
    });
    this.refs.overlay.show();
    /* global setTimeout */
    setTimeout(this.hideOverlay, 2000);
  },

  errorTooltip() {
    let actionMsg = '';

    if (/iPhone|iPad/i.test(navigator.userAgent)) {
      actionMsg = 'No support :(';
    } else if (/Mac/i.test(navigator.userAgent)) {
      actionMsg = 'Press ⌘-C to copy';
    } else {
      actionMsg = 'Press Ctrl-C to copy';
    }

    return actionMsg;
  },

  hideOverlay() {
    this.refs.overlay.hide();
    this.setState({
      isCopied: false,
      isError: false
    });
  }
});
