import PropTypes from 'prop-types';
import React from 'react';
import {Alert, Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TokenString from '../components/TokenString';

export default React.createClass({

  propTypes: {
    show: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func.isRequired,
    onRefreshFn: PropTypes.func.isRequired,
    isRefreshing: PropTypes.bool.isRequired,
    token: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      newToken: null
    };
  },

  render() {
    const {token} = this.props;
    return (
      <Modal
        show={this.props.show}
        onHide={this.handleClose}
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Refresh Token {token.get('description')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.newToken ?
            this.renderRefreshed()
            : <p> You are about to refresh token {token.get('description')} ({token.get('id')}). A new token will be generated and the old token becomes immediately invalid. </p>
          }
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isRefreshing}
            onSave={this.handleRefresh}
            onCancel={this.handleClose}
            saveLabel="Refresh"
            showSave={!this.state.newToken}
            cancelLabel="Close"
          />
        </Modal.Footer>
      </Modal>
    );
  },

  handleRefresh() {
    this.setState({newToken: null});
    this.props.onRefreshFn().then((newToken) => this.setState({newToken: newToken}));
  },

  renderRefreshed() {
    return (
      <div>
        <Alert bsStyle="success">
          Token has been refreshed. Make sure to copy it. You won&apos;t be able to see it again.
        </Alert>
        <TokenString token={this.state.newToken} />
      </div>
    );
  },

  handleClose() {
    this.props.onHideFn();
    this.setState({newToken: null});
  }

});
