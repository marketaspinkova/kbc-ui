import React from 'react';
import {Link} from 'react-router';
import {Map} from 'immutable';
import {Tabs, Tab} from 'react-bootstrap';

import Events from '../../../../sapi-events/react/Events';
import SaveButtons from '../../../../../react/common/SaveButtons';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TokenEditor from '../../components/tokenEditor/TokenEditor';
import SendTokenModal from '../../modals/SendTokenModal';
import TokenString from '../../components/TokenString';
import TokensStore from '../../../StorageTokensStore';
import createTokenEventsApi from '../../../TokenEventsApi';
import TokensActions from '../../../actionCreators';

const makeDetailPath = (tokenId) => (rest) => ['TokenDetail', tokenId].concat(rest || []);

export default React.createClass({
  mixins: [createStoreMixin(TokensStore, BucketsStore)],

  getStateFromStores() {
    const tokenId = RoutesStore.getCurrentRouteParam('tokenId');
    const isNew = tokenId === 'new-token';
    const tokens = TokensStore.getAll();
    const token = !isNew && tokens.find(t => t.get('id') === tokenId);
    const path = makeDetailPath(tokenId);
    const localState = TokensStore.localState();
    const tokenDetailState = localState.getIn(path(), Map());
    const dirtyToken = tokenDetailState.get('dirtyToken', token || Map());
    const isSaving = tokenDetailState.get('isSaving', false);
    const tokenToSend = tokenDetailState.get('sendToken', Map());
    const eventsApi = !isNew && createTokenEventsApi(tokenId);

    return {
      localState: localState,
      tokenToSend: tokenToSend,
      isNew: isNew,
      token: token,
      tokenId: tokenId,
      dirtyToken: dirtyToken,
      isSaving: isSaving,
      allBuckets: BucketsStore.getAll(),
      eventsApi: eventsApi,
      isSendingToken: TokensStore.isSendingToken
    };
  },

  updateLocalState(key, value) {
    const path = makeDetailPath(this.state.tokenId);
    const newLs = this.state.localState.setIn(path(key), value);
    TokensActions.updateLocalState(newLs);
  },

  resetDirtyToken() {
    const path = makeDetailPath(this.state.tokenId);
    const {localState} = this.state;
    const newLs = localState.deleteIn(path('dirtyToken'));
    TokensActions.updateLocalState(newLs);
  },

  updateDirtyToken(key, value) {
    const path = makeDetailPath(this.state.tokenId);
    const {localState} = this.state;
    const newDirtyToken = this.state.dirtyToken.setIn([].concat(key), value);
    const newLs = localState.setIn(path('dirtyToken'), newDirtyToken);
    TokensActions.updateLocalState(newLs);
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {this.state.token ?
            <Tabs id="token-detail-tabs" animation={false}>
              <Tab title="Overview" eventKey="overview">
                <div className="form form-horizontal">
                  <div className="form-group">
                    <div className="col-sm-12 text-right">
                      <SaveButtons
                        isSaving={this.state.isSaving}
                        disabled={!this.isValid()}
                        isChanged={!this.state.token.equals(this.state.dirtyToken)}
                        onSave={this.handleSaveToken}
                        onReset={this.handleClose}
                      />
                    </div>
                  </div>
                  {this.renderTokenEditor(true)}
                </div>
              </Tab>
              <Tab title="Events" eventKey="events">
                <Events
                  eventsApi={this.state.eventsApi}
                  autoReload={true}
                  link={{to: 'tokens-detail', params: {tokenId: this.state.tokenId}}}
                />
              </Tab>
            </Tabs>
            : this.renderNewToken()
          }
        </div>
      </div>
    );
  },

  renderTokenEditor(isEditing) {
    return (
      <TokenEditor
        disabled={!!this.state.isSaving}
        isEditing={isEditing}
        token={this.state.dirtyToken}
        allBuckets={this.state.allBuckets}
        updateToken={this.updateDirtyToken}
      />
    );
  },

  renderTokenCreated() {
    const creatorLink = (
      <Link to="tokens-detail" params={{tokenId: this.state.createdToken.get('id')}}>
        {this.state.createdToken.get('description')}
      </Link>
    );
    return (
      <div className="text-center">
        {this.renderTokenSendModal()}
        <p className="alert alert-success">Token {creatorLink} has been created. </p>
        <TokenString token={this.state.createdToken}
          sendTokenComponent={this.renderTokenSendButton(this.state.createdToken)}/>

      </div>
    );
  },

  renderTokenSendButton(token) {
    const onClickButton = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.updateLocalState('sendToken', token);
    };
    return (
      <div
        style={{cursor: 'pointer'}}
        onClick={onClickButton}
        className="btnf btn-linkf">
        <span className="fa fa-fw fa-share"/>
        {' '}
        Send token via email
      </div>
    );
  },


  renderTokenSendModal() {
    const token = this.state.tokenToSend;
    const isSending = this.state.isSendingToken(token.get('id'));
    return (
      <SendTokenModal
        token={token}
        show={!!token.get('id')}
        onHideFn={() => this.updateLocalState('sendToken', Map())}
        onSendFn={(params) => this.sendToken(token, params)}
        isSending={!!isSending}
      />
    );
  },

  sendToken(token, params) {
    return TokensActions.sendToken(token.get('id'), params).then(() =>
      ApplicationActionCreators.sendNotification({
        message: `Token ${token.get('description')} sent to ${params.email}`
      }));
  },


  renderNewToken() {
    if (!this.state.isNew) {
      return (
        <div className="text-center">
          Token {this.state.tokenId} does not exist or has been removed.
        </div>
      );
    }
    return (
      <div className="kbc-inner-padding">
        <div className="form form-horizontal">
          {this.state.createdToken
            ? this.renderTokenCreated()
            : (
              <div className="form-group">
                <div className="col-sm-12 text-right">
                  <ConfirmButtons
                    isSaving={this.state.isSaving}
                    isDisabled={!this.isValid()}
                    onSave={this.handleSaveToken}
                    onCancel={this.handleClose}
                    saveLabel="Create"
                    showCancel={false}
                  />
                </div>
              </div>
            )
          }
          {!this.state.createdToken && this.renderTokenEditor(false)}
        </div>
      </div>
    );
  },

  handleClose() {
    this.resetDirtyToken();
  },

  isValid() {
    const {dirtyToken} = this.state;
    const expiresIn = dirtyToken.get('expiresIn');
    const validExpiresIn = expiresIn !== 0;
    return !!dirtyToken.get('description') && validExpiresIn;
  },

  handleCreateToken() {
    const token = this.state.dirtyToken;
    this.updateLocalState('isSaving', true);
    const cancelSaving = () => this.updateLocalState('isSaving', false);
    return TokensActions.createToken(token.toJS()).then((createdToken) => {
      cancelSaving();
      this.resetDirtyToken();
      this.setState({ createdToken: createdToken});
      return createdToken;
    }).catch((e) => {
      cancelSaving();
      throw e;
    });
  },

  handleSaveToken() {
    if (this.state.isNew) {
      return this.handleCreateToken();
    }

    const tokenId = this.state.tokenId;
    this.updateLocalState('isSaving', true);
    return TokensActions.updateToken(tokenId, this.state.dirtyToken.toJS()).then(() => {
      this.updateLocalState('isSaving', false);
      this.resetDirtyToken();
    }).catch((e) => {
      this.updateLocalState('isSaving', false);
      throw e;
    });
  }
});
