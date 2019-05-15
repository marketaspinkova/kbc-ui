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
    return (
      <a onClick={this.openModal} className={classnames({ 'text-muted': this.props.disabled })}>
        <i className="fa fa-fw fa-align-justify" /> Activity Matching{' '}
        <Label bsStyle="info">BETA</Label>
        <ActivityMatchingModal
          transformation={this.props.transformation}
          tables={this.props.tables}
          show={this.state.showModal}
          onHide={this.closeModal}
        />
      </a>
    );
  },

  openModal() {
    if (this.props.disabled) {
      return;
    }

    this.setState({ showModal: true });
  },

  closeModal() {
    this.setState({ showModal: false });
  }
});
