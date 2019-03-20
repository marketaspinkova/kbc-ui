import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import { List, Map } from 'immutable';
import { Check, Loader, SearchBar } from '@keboola/indigo-ui';
import Tooltip from '../../../../../react/common/Tooltip';
import Confirm from '../../../../../react/common/Confirm';
import ExpiresInfo from '../../components/tokenEditor/ExpiresInfo';
import TokenAge from '../../components/TokenAge';
import CreatedDate from '../../components/CreatedDate';
import SendTokenModal from '../../modals/SendTokenModal';
import RefreshTokenModal from '../../modals/RefreshTokenModal';

export default createReactClass({
  propTypes: {
    tokens: PropTypes.object.isRequired,
    currentAdmin: PropTypes.object.isRequired,
    onDeleteFn: PropTypes.func.isRequired,
    isDeletingFn: PropTypes.func.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    onSendTokenFn: PropTypes.func.isRequired,
    isSendingTokenFn: PropTypes.func.isRequired,
    onRefreshFn: PropTypes.func.isRequired,
    isRefreshingFn: PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        {this.renderTokenRefreshModal()}
        {this.renderTokenSendModal()}
        <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
          <SearchBar
            placeholder="Search token"
            query={this.props.localState.get('searchQuery', '')}
            onChange={(query) => this.updateLocalState('searchQuery', query)}
            additionalActions={
              <Link to="tokens-new" className="btn btn-success">
                + New Token
              </Link>
            }
          />
        </div>
        <div className="table table-striped table-hover">
          <div className="thead">
            <div className="tr">
              <div className="th">Description</div>
              <div className="th">Created</div>
              <div className="th">Refreshed</div>
              <div className="th">Expires</div>
              <div className="th">Files</div>
              <div className="th">Components</div>
              <div className="th">Buckets</div>
              <div className="th">Tokens</div>
              <div className="th" />
            </div>
          </div>
          <div className="tbody">
            {this.getFilteredTokens()
              .map(this.renderTableRow)
              .toArray()}
          </div>
        </div>
      </div>
    );
  },

  getFilteredTokens() {
    const searchQuery = this.props.localState.get('searchQuery', '').toLowerCase();

    return this.props.tokens
      .filter((token) => !searchQuery || token.get('description').toLowerCase().indexOf(searchQuery) >= 0)
      .sortBy((token) => token.get('description').toLowerCase())
      .sortBy((token) => token.getIn(['admin', 'id']) === this.props.currentAdmin.get('id') ? -1 : 0)
  },

  renderComponentsAccess(token) {
    const allAccess = token.get('canManageBuckets');
    const accessCnt = token.get('componentAccess', List()).count();
    if (allAccess) {
      return 'All components';
    }

    if (accessCnt === 0) {
      return 'None';
    }
    const pluralSuffix = accessCnt > 1 ? 's' : '';
    return `${accessCnt} component${pluralSuffix}`;
  },

  renderBucketsAccess(token) {
    const allAccess = token.get('canManageBuckets');
    const accessCnt = token.get('bucketPermissions', List()).count();
    if (allAccess) {
      return 'All buckets';
    }

    if (accessCnt === 0) {
      return 'None';
    }

    const pluralSuffix = accessCnt > 1 ? 's' : '';
    return `${accessCnt} bucket${pluralSuffix}`;
  },

  renderMasterLabel(token) {
    const isMaster = token.get('isMasterToken', false);
    if (isMaster) {
      return <div className="label kbc-label-rounded-small label-success">Master</div>;
    } else {
      return null;
    }
  },
  renderYoursLabel(token) {
    const adminId = token.getIn(['admin', 'id']);
    if (adminId && adminId === this.props.currentAdmin.get('id')) {
      return <div className="label kbc-label-rounded-small label-primary">Yours</div>;
    }
    return null;
  },

  renderTokenDelete(token) {
    if (token.has('admin')) {
      return null;
    }
    if (this.props.isDeletingFn(token)) {
      return (
        <span className="btn btn-link">
          <Loader />
        </span>
      );
    }
    const tokenDesc = `${token.get('description')}(${token.get('id')})`;
    return (
      <Confirm
        title="Delete Token"
        text={`Do you really want to delete token ${tokenDesc}?`}
        buttonLabel="Delete"
        onConfirm={() => this.props.onDeleteFn(token)}
      >
        <Tooltip placement="top" tooltip="Delete token">
          <button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </button>
        </Tooltip>
      </Confirm>
    );
  },

  renderTokenSendModal() {
    const token = this.props.localState.get('sendToken', Map());
    const isSending = this.props.isSendingTokenFn(token.get('id'));

    return (
      <SendTokenModal
        token={token}
        show={!!token.get('id')}
        onHideFn={() => this.updateLocalState('sendToken', Map())}
        onSendFn={(params) => this.props.onSendTokenFn(token, params)}
        isSending={!!isSending}
      />
    );
  },

  renderTokenSendButton(token) {
    const isMaster = token.get('isMasterToken', false);
    if (isMaster) {
      return null;
    } else {
      const onClickButton = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.updateLocalState('sendToken', token);
      };
      return (
        <button onClick={onClickButton} className="btn btn-link">
          <Tooltip placement="top" tooltip="Send token via email">
            <i className="fa fa-share" />
          </Tooltip>
        </button>
      );
    }
  },

  renderTokenRefreshButton(token) {
    const onClickButton = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.updateLocalState('refreshToken', token);
    };
    return (
      <button onClick={onClickButton} className="btn btn-link">
        <Tooltip placement="top" tooltip="Refresh token">
          <i className="fa fa-refresh" />
        </Tooltip>
      </button>
    );
  },

  renderTokenRefreshModal() {
    const token = this.props.localState.get('refreshToken', Map());
    const isRefreshing = token && this.props.isRefreshingFn(token);

    return (
      <RefreshTokenModal
        token={token}
        show={!!token.get('id')}
        onHideFn={() => this.updateLocalState('refreshToken', Map())}
        onRefreshFn={() => this.props.onRefreshFn(token)}
        isRefreshing={!!isRefreshing}
      />
    );
  },

  updateLocalState(path, newValue) {
    const newls = this.props.localState.setIn([].concat(path), newValue);
    this.props.updateLocalState(newls);
  },

  renderTableRow(token) {
    return (
      <Link
        to="tokens-detail"
        params={{ tokenId: token.get('id') }}
        className="tr"
        key={token.get('id')}
      >
        <div className="td">
          {token.get('description')} {this.renderYoursLabel(token)}
          {this.renderMasterLabel(token)}
        </div>
        <div className="td">
          <CreatedDate token={token} />
        </div>
        <div className="td">
          <TokenAge token={token} />
        </div>
        <div className="td">
          <ExpiresInfo token={token} />
        </div>
        <div className="td">{token.get('canReadAllFileUploads') ? 'All files' : 'Own files'}</div>
        <div className="td">{this.renderComponentsAccess(token)}</div>
        <div className="td">{this.renderBucketsAccess(token)}</div>
        <div className="td">
          <Check isChecked={token.get('canManageTokens', false)} />
        </div>
        <div className="td text-right kbc-no-wrap">
          {this.renderTokenDelete(token)}
          {this.renderTokenSendButton(token)}
          {this.renderTokenRefreshButton(token)}
        </div>
      </Link>
    );
  }
});
