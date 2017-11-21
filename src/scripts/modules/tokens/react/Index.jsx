import React from 'react';
import {Link} from 'react-router';
import ApplicationStore from '../../../stores/ApplicationStore';
import TokensStore from '../StorageTokensStore';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import TokensTable from './TokensTable';
import TokensActions from '../actionCreators';
import {Map} from 'immutable';


export default React.createClass({
  mixins: [createStoreMixin(TokensStore)],

  getStateFromStores() {
    const tokens = TokensStore.getAll();
    const currentAdmin = ApplicationStore.getCurrentAdmin();
    return {
      tokens: tokens,
      currentAdmin,
      isDeletingTokenFn: TokensStore.isDeletingToken,
      isRefreshingTokenFn: TokensStore.isRefreshingToken,
      localState: TokensStore.localState()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          {this.renderTabs()}
          <div>
            <div className="kbc-header">
              <div className="row">
                <div className="col-md-12">
                  <TokensTable
                    localState={this.state.localState.get('TokensTable', Map())}
                    updateLocalState={(newState) => this.updateLocalState('TokensTable', newState)}
                    isDeletingFn={t => this.state.isDeletingTokenFn(t.get('id'))}
                    onDeleteFn={TokensActions.deleteToken}
                    onRefreshFn={TokensActions.refreshToken}
                    isRefreshingFn={t => this.state.isRefreshingTokenFn(t.get('id'))}
                    currentAdmin={this.state.currentAdmin}
                    tokens={this.state.tokens}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  updateLocalState(key, newValue) {
    TokensActions.updateLocalState(this.state.localState.set(key, newValue));
  },

  renderTabs() {
    return (
      <ul className="nav nav-tabs">
        <li role="presentation">
          <a href={this.projectPageUrl('settings-users')}>Users</a>
        </li>
        <li role="presentation">
          <a href={this.projectPageUrl('settings')}>Settings</a>
        </li>
        <li role="presentation">
          <Link to="settings-limits">Limits</Link>
        </li>
        <li role="presentation">
          <Link to="settings-project-power">Project Power</Link>
        </li>
        <li role="presentation">
          <Link to="settings-trash">Trash</Link>
        </li>
        <li role="presentation" className="active">
          <Link to="tokens">Tokens</Link>
        </li>
      </ul>
    );
  },

  projectPageUrl(path) {
    return ApplicationStore.getProjectPageUrl(path);
  }


});
