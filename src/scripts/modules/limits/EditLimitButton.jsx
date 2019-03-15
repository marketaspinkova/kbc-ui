import PropTypes from 'prop-types';
import React from 'react';
import EditLimitModal from './EditLimitModal';
import { Button } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    limit: PropTypes.object.isRequired,
    redirectTo: PropTypes.string
  },

  getInitialState() {
    return {
      isOpen: false
    };
  },

  render() {
    return (
      <Button bsStyle="success" onClick={this.openModal}>
        <span className="kbc-icon-pencil" /> Edit limit
        <EditLimitModal
          limit={this.props.limit}
          onHide={this.closeModal}
          isOpen={this.state.isOpen}
          redirectTo={this.props.redirectTo}
        />
      </Button>
    );
  },

  openModal() {
    this.setState({
      isOpen: true
    });
  },

  closeModal() {
    this.setState({
      isOpen: false
    });
  }
});
