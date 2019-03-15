import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {List, Map} from 'immutable';
import {Modal, Alert} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import {Loader} from '@keboola/indigo-ui';
import {SearchBar} from '@keboola/indigo-ui';

import EmptyState from '../../../components/react/components/ComponentEmptyState';

export default createReactClass({

  propTypes: {
    accounts: PropTypes.object.isRequired,
    syncAccounts: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func,
    authorizedDescription: PropTypes.string,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    onSaveAccounts: PropTypes.func.isRequired,
    accountDescFn: PropTypes.func.isRequired
  },

  render() {
    const getDesc = this.props.accountDescFn;
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Setup {getDesc('Pages')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-xs-6">
              <div>
                <h4 className="text-center">All {getDesc('Pages')} of {this.props.authorizedDescription}</h4>
                <SearchBar
                  className="col-searchbar-padded"
                  query={this.localState(['filter'])}
                  onChange={(newVal) => this.updateLocalState(['filter'], newVal)}
                />
                {this.renderAllAccounts()}
              </div>
            </div>
            <div className="col-xs-6">
              <div>
                <h4 className="text-center">Selected {getDesc('Pages')}</h4>
                {this.renderConfigAccounts()}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSaving}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            saveLabel="Save Changes"
            isDisabled={this.isSavingDisabled()}
          />

        </Modal.Footer>
      </Modal>
    );
  },

  isSavingDisabled() {
    const hasChanged = !this.props.accounts.equals(this.localState(['selected']));
    return !hasChanged;
  },

  renderConfigAccounts() {
    const getDesc = this.props.accountDescFn;
    const accounts = this.localState(['selected'], Map());
    if (accounts.count() > 0) {
      return (
        <table className="table table-striped table-hover">
          <tbody>
            {accounts.map((a) => {
              return (
                <tr key={a.get('id')}>
                  <td>
                    {a.get('name') || 'Unknown'}
                    <small><div>{a.get('id')}</div></small>
                  </td>
                  <td>
                    <span onClick={this.deselectAccount.bind(this, a.get('id'))}
                      className="kbc-icon-cup kbc-cursor-pointer" />
                  </td>
                </tr>
              );
            }).toArray()}
          </tbody>
        </table>
      );
    } else {
      return (<EmptyState> No {getDesc('Pages')} Selected </EmptyState>);
    }
  },

  renderError(error, code) {
    let message = 'Unexpected error';
    const errorBody = error.get('error');
    try {
      const jsError = JSON.parse(errorBody).error;
      message = jsError.message || jsError;
    } catch (e) {
      message = error.get('message') || error;
    }

    return (
      <Alert bsStyle="danger">
        <p>Error: {message}</p>
        {code >= 500 ? <div>{error.get('exceptionId')}</div> : null}
      </Alert>
    );
  },

  renderAllAccounts() {
    const getDesc = this.props.accountDescFn;
    if (this.props.syncAccounts.get('isLoading')) return (<span> <Loader /> Fetching {getDesc('pages')} from Facebook...</span>);

    let data = this.props.syncAccounts.get('data', List()) || List();
    data = data.filter((a) => !this.localState(['selected'], Map()).has(a.get('id')));
    let allCaption = '';
    if (!!this.localState(['filter'], '')) {
      allCaption = 'Filtered';
      data = data.filter((a) => {
        return a.get('name')
          .toLowerCase()
          .includes(this.localState(['filter']).toLowerCase()) ||
               a.get('id')
                 .toLowerCase()
                 .includes(this.localState(['filter']).toLowerCase());
      });
    }

    const isError = this.props.syncAccounts.get('isError');
    const error = this.props.syncAccounts.get('error');
    const code = this.props.syncAccounts.get('code');

    if (isError) return this.renderError(error, code);

    if (data.count() > 0) {
      return (
        <table className="table table-striped table-hover kbc-tasks-list">
          <tbody>
            <tr>
              <td>
                <a
                  key="--all--"
                  onClick={this.selectAllAccounts.bind(this, data)}>
                  --Select All {allCaption}--
                </a>
              </td>
              <td>
                <span
                  onClick={this.selectAllAccounts.bind(this, data)}
                  className="kbc-icon-arrow-right pull-right kbc-cursor-pointer" />
              </td>
            </tr>
            {data.map((d) => {
              return (
                <tr key={d.get('id')}>
                  <td>
                    <a onClick={this.selectAccount.bind(this, d)}>
                      {d.get('name')}
                      <small><div>{d.get('id')}</div></small>
                    </a>
                  </td>
                  <td>
                    <span
                      onClick={this.selectAccount.bind(this, d)}
                      className="kbc-icon-arrow-right pull-right kbc-cursor-pointer" />
                  </td>
                </tr>
              );
            }).toArray()}
          </tbody>
        </table>
      );
    } else {
      return (<EmptyState>No {getDesc('Pages')}</EmptyState>);
    }
  },

  deselectAccount(accountId) {
    const accounts = this.localState(['selected'], Map()).delete(accountId);
    this.updateLocalState(['selected'], accounts.count() > 0 ? accounts : Map());
  },

  selectAllAccounts(accountsList) {
    const selected = this.localState(['selected'], Map());
    const accounts = accountsList.reduce((memo, a) => memo.set(a.get('id'), a),
      selected);
    this.updateLocalState(['selected'], accounts);
  },

  selectAccount(account) {
    let accounts = this.localState(['selected'], Map());
    // make sure we have an empty map if no accounts selected
    accounts = accounts.count() > 0 ? accounts : Map();
    this.updateLocalState(['selected'], accounts.set(account.get('id'), account));
  },

  localState(path, defaultVal) {
    return this.props.localState.getIn(path, defaultVal);
  },

  updateLocalState(path, newValue) {
    return this.props.updateLocalState([].concat(path), newValue);
  },

  handleSave() {
    this.props.onSaveAccounts(this.localState(['selected'], Map())).then(
      () => this.props.onHideFn()
    );
  }

});
