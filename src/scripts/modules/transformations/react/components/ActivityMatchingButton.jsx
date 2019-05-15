import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Label } from 'react-bootstrap';
import ActivityMatchingModal from '../modals/ActivityMatchingModal';

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  render() {
    return (
      <a onClick={() => this.setState({ showModal: true })}>
        <i className="fa fa-fw fa-align-justify" /> Activity Matching{' '}
        <Label bsStyle="info">BETA</Label>
        <ActivityMatchingModal
          transformation={this.props.transformation}
          tables={this.props.tables}
          show={this.state.showModal}
          onHide={() => this.setState({ showModal: false })}
        />
      </a>
    );
  }
});
