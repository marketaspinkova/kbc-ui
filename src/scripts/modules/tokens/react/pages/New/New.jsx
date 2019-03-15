import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import { Map } from 'immutable';
import { FormGroup, Col, Alert, Button } from 'react-bootstrap';

import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TokenEditor from '../../components/tokenEditor/TokenEditor';
import SendTokenModal from '../../modals/SendTokenModal';
import TokenString from '../../components/TokenString';
import TokensStore from '../../../StorageTokensStore';
import TokensActions from '../../../actionCreators';

export default createReactClass({
  mixins: [createStoreMixin(TokensStore, BucketsStore)],

  getStateFromStores() {
    const localState = TokensStore.localState();

    return {
      localState,
      allBuckets: BucketsStore.getAll(),
      token: localState.get('newToken', Map()),
      isSendingToken: TokensStore.isSendingToken
    };
  },

  getInitialState() {
    return {
      createdToken: Map(),
      sendModal: false,
      isSaving: false
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="kbc-inner-padding">
            {this.state.createdToken.count() ? (
              this.renderTokenCreated()
            ) : (
              <div className="form form-horizontal">
                <FormGroup>
                  <Col sm={12} className="text-right">
                    <ConfirmButtons
                      saveButtonType="submit"
                      isSaving={this.state.isSaving}
                      isDisabled={!this.isValid()}
                      onSave={this.handleSave}
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
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },

  renderTokenCreated() {
    const creatorLink = (
      <Link to="tokens-detail" params={{ tokenId: this.state.createdToken.get('id') }}>
        {this.state.createdToken.get('description')}
      </Link>
    );

    return (
      <div className="text-center">
        {this.renderSendModal()}
        <Alert bsStyle="success">
          <p>Token {creatorLink} has been created.</p>
        </Alert>
        <TokenString token={this.state.createdToken} sendTokenComponent={this.renderSendButton()} />
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

  renderSendModal() {
    const isSending = this.state.isSendingToken(this.state.createdToken.get('id'));

    return (
      <SendTokenModal
        token={this.state.createdToken}
        show={!!this.state.sendModal}
        onSendFn={params => this.sendToken(params)}
        onHideFn={this.closeSendModal}
        isSending={!!isSending}
      />
    );
  },

  sendToken(params) {
    return TokensActions.sendToken(this.state.createdToken.get('id'), params).then(() => {
      ApplicationActionCreators.sendNotification({
        message: `Token ${this.state.createdToken.get('description')} sent to ${params.email}`
      });

      this.closeSendModal();
    });
  },

  isValid() {
    return !!(this.state.token.get('description') && this.state.token.get('expiresIn') !== 0);
  },

  handleSave(e) {
    e.preventDefault();

    this.saving(true);
    return TokensActions.createToken(this.state.token.toJS())
      .then(createdToken => {
        this.setState({
          createdToken
        });
        this.resetToken();
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        this.saving(false);
      });
  },

  updateToken(name, value) {
    const updatedToken = this.state.token.set(name, value);
    const updatedLocalState = this.state.localState.set('newToken', updatedToken);
    TokensActions.updateLocalState(updatedLocalState);
  },

  resetToken() {
    const updatedLocalState = this.state.localState.delete('newToken');
    TokensActions.updateLocalState(updatedLocalState);
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
