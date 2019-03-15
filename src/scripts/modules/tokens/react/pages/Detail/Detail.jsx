import React from 'react';
import createReactClass from 'create-react-class';
import { Tabs, Tab } from 'react-bootstrap';

import Events from '../../../../sapi-events/react/Events';
import SaveButtons from '../../../../../react/common/SaveButtons';
import RoutesStore from '../../../../../stores/RoutesStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import BucketsStore from '../../../../components/stores/StorageBucketsStore';
import TokenEditor from '../../components/tokenEditor/TokenEditor';
import TokensStore from '../../../StorageTokensStore';
import createTokenEventsApi from '../../../TokenEventsApi';
import TokensActions from '../../../actionCreators';

export default createReactClass({
  mixins: [createStoreMixin(TokensStore, BucketsStore)],

  getStateFromStores() {
    const localState = TokensStore.localState();
    const tokenId = RoutesStore.getCurrentRouteParam('tokenId');
    const token = TokensStore.getAll().find(t => t.get('id') === tokenId);

    return {
      localState,
      tokenId,
      token,
      editedToken: localState.getIn(['editedToken', tokenId], token),
      allBuckets: BucketsStore.getAll(),
      eventsApi: createTokenEventsApi(tokenId)
    };
  },

  getInitialState() {
    return {
      isSaving: false
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">{this.state.token ? this.renderDetail() : this.renderNotFound()}</div>
      </div>
    );
  },

  renderDetail() {
    return (
      <Tabs id="token-detail-tabs" animation={false}>
        <Tab title="Overview" eventKey="overview">
          <div className="form form-horizontal">
            <div className="form-group">
              <div className="col-sm-12 text-right">
                <SaveButtons
                  isSaving={this.state.isSaving}
                  disabled={!this.isValid()}
                  isChanged={!this.state.token.equals(this.state.editedToken)}
                  onSave={this.handleSave}
                  onReset={this.resetEditedToken}
                />
              </div>
            </div>
            <TokenEditor
              isEditing={true}
              disabled={!!this.state.isSaving}
              token={this.state.editedToken}
              allBuckets={this.state.allBuckets}
              updateToken={this.updateToken}
            />
          </div>
        </Tab>
        <Tab title="Events" eventKey="events">
          <Events
            eventsApi={this.state.eventsApi}
            autoReload={true}
            link={{ to: 'tokens-detail', params: { tokenId: this.state.tokenId } }}
          />
        </Tab>
      </Tabs>
    );
  },

  renderNotFound() {
    return (
      <div className="kbc-inner-padding text-center">
        <p>Token {this.state.tokenId} does not exist or has been removed.</p>
      </div>
    );
  },

  isValid() {
    return !!(this.state.editedToken.get('description') && this.state.editedToken.get('expiresIn') !== 0);
  },

  resetEditedToken() {
    const updatedLocalState = this.state.localState.deleteIn(['editedToken', this.state.tokenId]);
    TokensActions.updateLocalState(updatedLocalState);
  },

  updateToken(name, value) {
    const updatedToken = this.state.editedToken.set(name, value);
    const updatedLocalState = this.state.localState.setIn(['editedToken', this.state.tokenId], updatedToken);
    TokensActions.updateLocalState(updatedLocalState);
  },

  handleSave() {
    this.saving(true);
    return TokensActions.updateToken(this.state.tokenId, this.state.editedToken.toJS())
      .catch(error => {
        throw error;
      })
      .finally(() => {
        this.saving(false);
        this.resetEditedToken();
      });
  },

  saving(value) {
    this.setState({
      isSaving: value
    });
  }
});
