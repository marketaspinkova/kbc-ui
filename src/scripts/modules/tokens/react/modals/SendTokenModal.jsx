import React, {PropTypes} from 'react';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({

  propTypes: {
    show: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func.isRequired,
    onSendFn: PropTypes.func.isRequired,
    isSending: PropTypes.bool.isRequired,
    token: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      email: '',
      message: ''
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
            Send Token {token.get('description')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderInfo()}
          <div className="form form-horizontal" style={{marginLeft: 0, marginRight: 0}}>
            <div className="form-group">
              <label className="control-label col-sm-3">
                Recipient
              </label>
              <div className="col-sm-9">
                <input
                  placeholder="mail@example.com"
                  disabled={this.props.isSending}
                  className="form-control"
                  type="email"
                  value={this.state.email}
                  onChange={e => this.setState({email: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="control-label col-sm-3">
                Message
              </label>
              <div className="col-sm-9">
                <textarea
                  placeholder="Here's the token to upload your data"
                  disabled={this.props.isSending}
                  className="form-control"
                  type="textarea"
                  value={this.state.message}
                  onChange={e => this.setState({message: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSending}
            isDisabled={!this.isValid()}
            onSave={this.handleSend}
            onCancel={this.handleClose}
            placement="right"
            saveLabel="Send"
          />
        </Modal.Footer>
      </Modal>
    );
  },

  isValid() {
    return !!this.state.email && !!this.state.message;
  },

  handleSend() {
    this.props.onSendFn(this.state).then(this.handleClose);
  },

  renderInfo() {
    return (
      <div>
        <p className="alert alert-info">
          The recipient will receive an email with a link to retrieve the token. The link will expire in 24 hours.
        </p>
      </div>
    );
  },

  handleClose() {
    this.props.onHideFn();
    this.resetState();
  },

  resetState() {
    this.setState({email: '', message: ''});
  }

});
