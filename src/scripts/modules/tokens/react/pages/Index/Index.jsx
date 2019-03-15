import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import SettingsTabs from '../../../../../react/layout/SettingsTabs';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import ApplicationActionCreators from '../../../../../actions/ApplicationActionCreators';
import TokensActions from '../../../actionCreators';
import TokensStore from '../../../StorageTokensStore';
import TokensTable from './TokensTable';

export default createReactClass({
  mixins: [createStoreMixin(TokensStore)],

  getStateFromStores() {
    const tokens = TokensStore.getAll();
    const currentAdmin = ApplicationStore.getCurrentAdmin();
    return {
      tokens: tokens,
      currentAdmin,
      isDeletingTokenFn: TokensStore.isDeletingToken,
      isSendingToken: TokensStore.isSendingToken,
      isRefreshingTokenFn: TokensStore.isRefreshingToken,
      localState: TokensStore.localState()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <SettingsTabs active="tokens" />
          <div className="tab-content">
            <div className="tab-pane tab-pane-no-padding active">
              <TokensTable
                localState={this.state.localState.get('TokensTable', Map())}
                updateLocalState={newState => this.updateLocalState('TokensTable', newState)}
                isDeletingFn={t => this.state.isDeletingTokenFn(t.get('id'))}
                onDeleteFn={TokensActions.deleteToken}
                onSendTokenFn={this.sendToken}
                isSendingTokenFn={this.state.isSendingToken}
                onRefreshFn={TokensActions.refreshToken}
                isRefreshingFn={t => this.state.isRefreshingTokenFn(t.get('id'))}
                currentAdmin={this.state.currentAdmin}
                tokens={this.state.tokens}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },

  sendToken(token, params) {
    return TokensActions.sendToken(token.get('id'), params).then(() =>
      ApplicationActionCreators.sendNotification({
        message: `Token ${token.get('description')} sent to ${params.email}`
      })
    );
  },

  updateLocalState(key, newValue) {
    TokensActions.updateLocalState(this.state.localState.set(key, newValue));
  }
});
