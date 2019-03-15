import React from 'react';
import createReactClass from 'create-react-class';
import { fromJS } from 'immutable';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import RefreshTokenModal from '../modals/RefreshTokenModal';
import SendTokenModal from '../modals/SendTokenModal';
import Confirm from '../../../../react/common/Confirm';
import Tooltip from '../../../../react/common/Tooltip';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import TokensStore from '../../StorageTokensStore';
import TokensActions from '../../actionCreators';
import RoutesStore from '../../../../stores/RoutesStore';
import ApplicationActionCreators from '../../../../actions/ApplicationActionCreators';

export default createReactClass({
  mixins: [createStoreMixin(TokensStore)],

  getStateFromStores() {
    const tokenId = RoutesStore.getCurrentRouteParam('tokenId');
    const token = TokensStore.getAll().find(t => t.get('id') === tokenId) || fromJS({});

    return {
      tokenId,
      token,
      description: token.get('description'),
      isMaster: token.get('isMasterToken', false),
      isDeleting: TokensStore.isDeletingToken(tokenId),
      isSending: TokensStore.isSendingToken(tokenId),
      isRefreshing: TokensStore.isRefreshingToken(tokenId)
    };
  },

  getInitialState() {
    return {
      sendModal: false,
      refreshModal: false
    };
  },

  render() {
    if (!this.state.token.count()) {
      return null;
    }

    return (
      <span>
        {this.renderDeleteButton()}
        {this.renderSendButton()}
        {this.renderRefreshButton()}

        {this.renderRefreshModal()}
        {this.renderSendModal()}
      </span>
    );
  },

  renderDeleteButton() {
    if (this.state.token.has('admin')) {
      return null;
    }

    if (this.state.isDeleting) {
      return (
        <span className="btn btn-link">
          <Loader />
        </span>
      );
    }

    return (
      <Confirm
        title="Delete Token"
        text={`Do you really want to delete token ${this.state.description} (${this.state.tokenId})?`}
        buttonLabel="Delete"
        onConfirm={this.deleteToken}
      >
        <Tooltip placement="bottom" tooltip="Delete token" id="delete_token">
          <Button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </Button>
        </Tooltip>
      </Confirm>
    );
  },

  renderSendButton() {
    if (this.state.isMaster) {
      return null;
    }

    return (
      <Tooltip placement="bottom" tooltip="Send token via email" id="send_token">
        <Button onClick={this.openSendModal} className="btn btn-link">
          <i className="fa fa-share" />
        </Button>
      </Tooltip>
    );
  },

  renderRefreshButton() {
    return (
      <Tooltip placement="bottom" tooltip="Refresh token" id="refresh_token">
        <Button onClick={this.openRefreshModal} className="btn btn-link">
          <i className="fa fa-refresh" />
        </Button>
      </Tooltip>
    );
  },

  renderRefreshModal() {
    return (
      <RefreshTokenModal
        token={this.state.token}
        show={!!this.state.refreshModal}
        onHideFn={this.closeRefreshModal}
        onRefreshFn={this.refreshToken}
        isRefreshing={!!this.state.isRefreshing}
      />
    );
  },

  renderSendModal() {
    return (
      <SendTokenModal
        token={this.state.token}
        show={!!this.state.sendModal}
        onHideFn={this.closeSendModal}
        onSendFn={this.sendToken}
        isSending={!!this.state.isSending}
      />
    );
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

  openRefreshModal() {
    this.setState({
      refreshModal: true
    });
  },

  closeRefreshModal() {
    this.setState({
      refreshModal: false
    });
  },

  sendToken(params) {
    return TokensActions.sendToken(this.state.tokenId, params).then(() =>
      ApplicationActionCreators.sendNotification({
        message: `Token ${this.state.description} sent to ${params.email}`
      })
    );
  },

  deleteToken() {
    const description = this.state.description;

    return TokensActions.deleteToken(this.state.token).then(() => {
      RoutesStore.getRouter().transitionTo('tokens');

      ApplicationActionCreators.sendNotification({
        message: `Token ${description} has been removed`
      });
    });
  },

  refreshToken() {
    return TokensActions.refreshToken(this.state.token);
  }
});
