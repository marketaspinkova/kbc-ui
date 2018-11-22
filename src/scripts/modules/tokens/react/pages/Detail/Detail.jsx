import React from 'react';
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

export default React.createClass({
  mixins: [createStoreMixin(TokensStore, BucketsStore)],

  getStateFromStores() {
    const tokenId = RoutesStore.getCurrentRouteParam('tokenId');
    const token = TokensStore.getAll().find(t => t.get('id') === tokenId);

    return {
      tokenId,
      token,
      savedToken: token,
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
        <div className="kbc-main-content">
          <Tabs id="token-detail-tabs" animation={false}>
            <Tab title="Overview" eventKey="overview">
              <div className="form form-horizontal">
                <div className="form-group">
                  <div className="col-sm-12 text-right">
                    <SaveButtons
                      isSaving={this.state.isSaving}
                      disabled={!this.isValid()}
                      isChanged={!this.state.token.equals(this.state.savedToken)}
                      onSave={this.handleSave}
                      onReset={this.handleReset}
                    />
                  </div>
                </div>
                <TokenEditor
                  isEditing={true}
                  disabled={!!this.state.isSaving}
                  token={this.state.token}
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
        </div>
      </div>
    );
  },

  isValid() {
    return !!(this.state.token.get('description') && this.state.token.get('expiresIn') !== 0);
  },

  handleReset() {
    this.setState({
      token: this.state.savedToken
    });
  },

  updateToken(name, value) {
    this.setState({
      token: this.state.token.set(name, value)
    });
  },

  handleSave() {
    this.saving(true);
    return TokensActions.updateToken(this.state.tokenId, this.state.token.toJS())
      .catch(error => {
        throw error;
      })
      .finally(() => {
        this.saving(false);
      });
  },

  saving(value) {
    this.setState({
      isSaving: value
    });
  }
});
