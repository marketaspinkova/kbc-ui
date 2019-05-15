import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Label } from 'react-bootstrap';
import ActivityMatchingModal from '../modals/ActivityMatchingModal';

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    disabled: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  render() {
    if (this.props.disabled) {
      return <a>{this.renderLabel()}</a>;
    }

    return (
      <a onClick={() => this.setState({ showModal: true })}>
        {this.renderLabel()}
        <ActivityMatchingModal
          transformation={this.props.transformation}
          tables={this.props.tables}
          show={this.state.showModal}
          onHide={() => this.setState({ showModal: false })}
        />
      </a>
    );
  },

  renderLabel() {
    return (
      <span className={classnames({ 'text-muted': this.props.disabled })}>
        <i className="fa fa-fw fa-align-justify" /> Activity Matching{' '}
        <Label bsStyle="info">BETA</Label>
      </span>
    );
  }
});
