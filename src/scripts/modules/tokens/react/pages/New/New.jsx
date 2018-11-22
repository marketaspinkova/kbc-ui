import React from 'react';
import { Link } from 'react-router';
import { Map } from 'immutable';
import { Form, FormGroup, Col, Alert, Button } from 'react-bootstrap';

import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TokenEditor from '../../components/tokenEditor/TokenEditor';
import SendTokenModal from '../../modals/SendTokenModal';
import TokenString from '../../components/TokenString';
import TokensStore from '../../../StorageTokensStore';
import TokensActions from '../../../actionCreators';

export default React.createClass({
  mixins: [createStoreMixin(TokensStore, BucketsStore)],

  getStateFromStores() {
    return {
      token: Map(),
      sendModal: false,
      tokenCreated: false,
      allBuckets: BucketsStore.getAll(),
      isSendingToken: TokensStore.isSendingToken,
      isSaving: false
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="kbc-inner-padding">
            {this.state.tokenCreated ? (
              this.renderTokenCreated()
            ) : (
              <Form horizontal onSubmit={this.handleSubmit}>
                <FormGroup>
                  <Col sm={12} className="text-right">
                    <ConfirmButtons
                      saveButtonType="submit"
                      isSaving={this.state.isSaving}
                      isDisabled={!this.isValid()}
                      saveLabel="Create"
                      showCancel={false}
                    />
                  </Col>
                </FormGroup>
                <TokenEditor
                  isEditing={false}
                  disabled={!!this.state.isSaving}
                  token={this.state.token}
                  allBuckets={this.state.allBuckets}
                  updateToken={this.updateToken}
                />
              </Form>
            )}
          </div>
        </div>
      </div>
    );
  },

  renderTokenCreated() {
    const creatorLink = (
      <Link to="tokens-detail" params={{ tokenId: this.state.token.get('id') }}>
        {this.state.token.get('description')}
      </Link>
    );

    return (
      <div className="text-center">
        {this.renderTokenSendModal()}
        <Alert bsStyle="success">
          <p>Token {creatorLink} has been created.</p>
        </Alert>
        <TokenString token={this.state.token} sendTokenComponent={this.renderSendButton()} />
      </div>
    );
  },

  renderSendButton() {
    return (
      <Button onClick={this.openSendModal} className="btn btn-link">
        <span className="fa fa-fw fa-share" /> Send token via email
      </Button>
    );
  },

  renderTokenSendModal() {
    const isSending = this.state.isSendingToken(this.state.token.get('id'));

    return (
      <SendTokenModal
        token={this.state.token}
        show={!!this.state.sendModal}
        onSendFn={params => this.sendToken(params)}
        onHideFn={this.closeSendModal}
        isSending={!!isSending}
      />
    );
  },

  sendToken(params) {
    return TokensActions.sendToken(this.state.token.get('id'), params).then(() => {
      ApplicationActionCreators.sendNotification({
        message: `Token ${this.state.token.get('description')} sent to ${params.email}`
      });

      this.closeSendModal();
    });
  },

  isValid() {
    return !!(this.state.token.get('description') && this.state.token.get('expiresIn') !== 0);
  },

  handleSubmit(e) {
    e.preventDefault();

    this.saving(true);
    return TokensActions.createToken(this.state.token.toJS())
      .then(createdToken => {
        this.setState({
          tokenCreated: true,
          token: createdToken
        });
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        this.saving(false);
      });
  },

  updateToken(name, value) {
    this.setState({
      token: this.state.token.set(name, value)
    });
  },

  openSendModal() {
    this.setState({
      sendModal: true
    });
  },

  closeSendModal() {
    this.setState({
      sendModal: false
    });
  },

  saving(value) {
    this.setState({
      isSaving: value
    });
  }
});
