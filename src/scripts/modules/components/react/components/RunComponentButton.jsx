import PropTypes from 'prop-types';
import React from 'react';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import {Button} from 'react-bootstrap';
import Tooltip from './../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';
import RoutesStore from '../../../../stores/RoutesStore';
import classnames from 'classnames';
import RunModal from './RunComponentButtonModal';

export default React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    mode: PropTypes.oneOf(['button', 'link']),
    component: PropTypes.string.isRequired,
    runParams: PropTypes.func.isRequired,
    method: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string,
    redirect: PropTypes.bool,
    tooltip: PropTypes.string,
    disabled: PropTypes.bool,
    disabledReason: PropTypes.string,
    tooltipPlacement: PropTypes.string,
    children: PropTypes.node,
    modalRunButtonDisabled: PropTypes.bool,
    modalOnHide: PropTypes.func
  },

  getDefaultProps: function() {
    return {
      mode: 'button',
      method: 'run',
      icon: 'fa-play',
      redirect: false,
      tooltip: 'Run',
      disabled: false,
      disabledReason: '',
      tooltipPlacement: 'top',
      modalRunButtonDisabled: false
    };
  },

  getInitialState: function() {
    return {
      isLoading: false,
      showModal: false
    };
  },

  componentWillUnmount() {
    this.cancellablePromise && this.cancellablePromise.cancel();
  },

  _handleRunStart: function() {
    this.setState({
      isLoading: true
    });
    const params = {
      method: this.props.method,
      component: this.props.component,
      data: this.props.runParams(),
      notify: !this.props.redirect
    };

    this.cancellablePromise = InstalledComponentsActionCreators.runComponent(params)
      .then(this._handleStarted)
      .catch((error) => {
        this.setState({
          isLoading: false
        });
        throw error;
      });
  },

  _handleStarted: function(response) {
    this.setState({
      isLoading: false
    });
    if (this.props.redirect) {
      return RoutesStore.getRouter().transitionTo('jobDetail', {
        jobId: response.id
      });
    }
  },

  renderModal() {
    return (
      <RunModal
        onHide={() => {
          if (this.props.modalOnHide) {
            this.props.modalOnHide();
          }
          this.setState({showModal: false});
        }}
        show={this.state.showModal}
        title={this.props.title}
        body={this.props.children}
        onRequestRun={this._handleRunStart}
        disabled={this.props.modalRunButtonDisabled}
      />
    );
  },

  render() {
    if (this.props.mode === 'button') {
      return this.tooltipWrapper(this._renderButton());
    } else {
      return this._renderLink();
    }
  },

  onOpenButtonClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (this.props.disabled || this.state.isLoading) {
      return;
    }
    this.setState({showModal: true});
  },

  tooltipWrapper(body) {
    if (this.props.disabled || this.state.isLoading) {
      return (
        <Tooltip
          tooltip={this.state.isLoading ? 'Component is running' : this.props.disabledReason}
          placement={this.props.tooltipPlacement}
        >
          {body}
        </Tooltip>
      );
    } else if (this.props.mode === 'button') {
      return (
        <Tooltip
          tooltip={this.props.tooltip}
          placement={this.props.tooltipPlacement}
        >
          {body}
        </Tooltip>
      );
    }
    return body;
  },

  _renderButton: function() {
    return (
      <Button
        className="btn btn-link"
        disabled={this.props.disabled || this.state.isLoading}
        onClick={this.onOpenButtonClick}
      >
        {this.renderModal()}
        {this._renderIcon()}{this.props.label && ` ${this.props.label}`}
      </Button>
    );
  },

  _renderLink: function() {
    const body = (
      <span>
        {this._renderIcon()} {this.props.title}
      </span>
    );
    return (
      <a className={
        classnames({
          'text-muted': this.props.disabled || this.state.isLoading
        })}
      onClick={this.onOpenButtonClick}
      >
        {this.renderModal()}
        {this.tooltipWrapper(body)}
      </a>
    );
  },

  _renderIcon: function() {
    if (this.state.isLoading) {
      return (<Loader className="fa-fw" />);
    } else {
      const className = 'fa fa-fw ' + this.props.icon;
      return (<i className={className} />);
    }
  }
});
