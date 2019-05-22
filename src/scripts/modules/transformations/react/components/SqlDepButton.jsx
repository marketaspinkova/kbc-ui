import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Button, Label } from 'react-bootstrap';
import Modal from '../modals/SqlDepModal';

export default createReactClass({
  propTypes: {
    transformationId: PropTypes.string.isRequired,
    bucketId: PropTypes.string.isRequired,
    backend: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  close() {
    this.setState({
      showModal: false
    });
  },

  open() {
    this.setState({
      showModal: true
    });
  },

  betaWarning() {
    if (this.props.backend !== 'snowflake') {
      return null;
    }

    return <Label bsStyle="info">BETA</Label>;
  },

  render() {
    return (
      <Button bsStyle="link" className="btn-block" onClick={this.open}>
        <i className="fa fa-sitemap fa-fw" /> SQLdep {this.betaWarning()}
        <Modal
          transformationId={this.props.transformationId}
          bucketId={this.props.bucketId}
          backend={this.props.backend}
          show={this.state.showModal}
          onHide={this.close}
        />
      </Button>
    );
  }
});
