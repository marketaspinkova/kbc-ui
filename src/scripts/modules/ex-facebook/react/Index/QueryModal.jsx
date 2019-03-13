import React, {PropTypes} from 'react';
import {Map} from 'immutable';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import TemplateSelector from './TemplateSelector';
import GraphAPIExplorerLink from './GraphAPIExplorerLink';
import DateRangeSelector from './DateRangeSelector';
import {Modal, Tabs, Tab} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';
import Select from 'react-select';

const NAME_HELP = 'Helps describe the query and is also used to prefix names of output tables resulting from the query if they differ.';
const ENDPOINT_HELP = 'URL part of the Facebook Graph API request specifying node-id and/or edge-name, e.g. feed, me/photos etc. Can be empty.';
const FIELDS_HELP = 'Parameter of the Facebook Graph API nested request specifying fields and/or additional parameters of the endpoint.';
const SINCE_HELP = 'Parameter of the Facebook Graph API nested request. Applies only if the endpoint parameter is given and specifies the date since data of the given endpoint will be retrieved. Can by specified absolutely (yyyy-mm-dd) or relatively (e.g. 15 days ago)';
const UNTIL_HELP = 'Parameter of the Facebook Graph API nested request. Applies only if the endpoint parameter is given and specifies the date until data of the given endpoint will be retrieved. Can by specified absolutely (yyyy-mm-dd) or relatively (e.g. 15 days ago)';
const LIMIT_HELP = 'Parameter of the Facebook Graph API nested request. Specifies the size of data returned in one page of the request. Maximum is 100, the default 25.';

export default React.createClass({

  propTypes: {
    accounts: PropTypes.object.isRequired,
    placeholders: PropTypes.object.isRequired,
    queryTemplates: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    helpUrl: PropTypes.string.isRequired,
    isSavingFn: PropTypes.func.isRequired,
    onHideFn: PropTypes.func,
    authorizedDescription: PropTypes.string,
    apiVersion: PropTypes.string,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    accountDescFn: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    onSaveQuery: PropTypes.func.isRequired
  },

  render() {
    const placeholders = this.props.placeholders || {};
    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {this.localState(['currentQuery', 'name'], false) ? 'Edit' : 'New'} Query
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs className="tabs-inside-modal" defaultActiveKey={1} animation={false} id="ex-facebook-query-modal-tabs">
            <Tab title="General" eventKey={1}>
              <div className="form-horizontal">
                {this.renderTemplateSelect()}
                {this.renderInput('Name', 'name', NAME_HELP, placeholders.name, this.nameInvalidReason)}
                {this.renderInput('Endpoint', ['query', 'path'], this.enhanceHelp('endpoint', ENDPOINT_HELP), placeholders.path)}
                {this.renderFieldsInput(placeholders.fields)}
                {this.renderAccountSelector()}
              </div>
            </Tab>
            <Tab title="Advanced" eventKey={2}>
              <div className="form-horizontal">
                {this.renderDateRangeSelector()}
                {this.renderInput('Since', ['query', 'since'], SINCE_HELP, 'yyyy-mm-dd or 15 days ago')}
                {this.renderInput('Until', ['query', 'until'], UNTIL_HELP, 'yyyy-mm-dd or 15 days ago')}
                {this.renderInput('Limit', ['query', 'limit'], LIMIT_HELP, '25')}
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isSavingFn(this.query('id'))}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            saveLabel={this.localState(['currentQuery', 'name'], false) ? 'Save Query' : 'Create'}
            isDisabled={this.isSavingDisabled()}
          >
            <GraphAPIExplorerLink
              ids={this.props.accounts.keySeq()}
              query={this.query('query', Map())}
              apiVersion={this.props.apiVersion}
            />
          </ConfirmButtons>
        </Modal.Footer>
      </Modal>
    );
  },

  enhanceHelp(name, text) {
    const url = `${this.props.helpUrl}#${name}`;
    return (
      <span>
        {text}
        <ExternalLink href={url}>
          {' '}more info
        </ExternalLink>
      </span>
    );
  },

  nameInvalidReason() {
    const name = this.query('name');
    if (name && !(/^[a-zA-Z0-9_.]+$/.test(name))) return 'Can only contain alphanumeric characters, underscores and dots.';
    return null;
  },

  isSavingDisabled() {
    const queryHasChanged = !this.query(null, Map()).equals(this.localState('currentQuery'));
    const fieldsValid = !!this.query(['query', 'fields']);
    const nameEmpty = !!this.query(['name']);
    const limitEmpty = !!this.query(['query', 'limit']);
    return !queryHasChanged || !fieldsValid || !nameEmpty || !limitEmpty || this.nameInvalidReason();
  },

  renderDateRangeSelector() {
    return (
      <div className="form-group">
        <div className="col-xs-12">
          <div className="text-right">
            <DateRangeSelector
              query={this.query(null, Map())}
              updateQueryFn={(query) => this.updateLocalState(['query'], query)}
            />
          </div>
        </div>
      </div>
    );
  },

  renderTemplateSelect() {
    return (
      <div className="form-group">
        <div className="col-xs-12">
          <div className="text-right">
            <TemplateSelector
              templates={this.props.queryTemplates}
              query={this.query(null, Map())}
              updateQueryFn={(query) => this.updateLocalState(['query'], query)}
            />
          </div>
        </div>
      </div>
    );
  },

  renderFieldsInput(placeholder) {
    const control = (<textarea
      placeholder={placeholder}
      value={this.query(['query', 'fields'])}
      onChange={(e) => this.updateLocalState(['query', 'query', 'fields'], e.target.value)}
      className="form-control" rows="2" required/>);
    return this.renderFormControl('Fields', control, this.enhanceHelp('fields', FIELDS_HELP));
  },

  renderInputControl(propertyPath, placeholder) {
    return (
      <input
        placeholder={placeholder}
        type="text"
        value={this.query(propertyPath)}
        onChange={(e) => this.updateLocalState(['query'].concat(propertyPath), e.target.value)}
        className="form-control"
      />
    );
  },

  renderInput(caption, propertyPath, helpText, placeholder, validationFn = () => null) {
    const validationText = validationFn();
    const inputControl = this.renderInputControl(propertyPath, placeholder);
    return this.renderFormControl(caption, inputControl, helpText, validationText);
  },

  renderFormControl(controlLabel, control, helpText, errorMsg) {
    return (
      <div className={errorMsg ? 'form-group has-error' : 'form-group'}>
        <label className="col-xs-2 control-label">
          {controlLabel}
        </label>
        <div className="col-xs-10">
          {control}
          <span className="help-block">
            {errorMsg || helpText}
          </span>
        </div>
      </div>
    );
  },

  renderAccountSelector() {
    const hasIds = this.query('query', Map()).has('ids');
    const ids = this.query(['query', 'ids'], '');
    let value = hasIds ? ids : '--non--';
    if (!value) value = '--all--';
    const basicOptions = [
      {value: '--all--', label: `All ${this.props.accountDescFn('Pages')}`},
      {value: '--non--', label: 'None'}
    ];
    const restOptions = this.props.accounts.map((account, accountId) => {
      return {value: accountId, label: account.get('name')};
    }).toArray();
    const selectOptions = basicOptions.concat(restOptions);
    const selectControl = (
      <Select
        name="ids"
        key="ids"
        clearable={false}
        multi={false}
        options={selectOptions}
        value={value}
        onChange={this.onSelectAccount}/>
    );
    const descFn = this.props.accountDescFn;
    const accountsHelp = `Specifies ${descFn('page')} that will be applied to the query. Could be either none, all or one of the selected ${descFn('pages')}. It is represented by the Facebook Graph API nested request parameter ids.`;
    return this.renderFormControl(this.props.accountDescFn('Pages'), selectControl, accountsHelp);
  },

  onSelectAccount({value}) {
    const query = this.query('query');
    switch (value) {
      case '--non--':
        return this.updateLocalState(['query', 'query'], query.delete('ids'));
      case '--all--':
        return this.updateLocalState(['query', 'query'], query.set('ids', ''));
      default:
        return this.updateLocalState(['query', 'query'], query.set('ids', value));
    }
  },

  localState(path, defaultVal) {
    return this.props.localState.getIn([].concat(path), defaultVal);
  },

  query(path, defaultValue) {
    if (path) {
      return this.localState(['query'].concat(path), defaultValue);
    } else {
      return this.localState(['query'], defaultValue);
    }
  },

  updateLocalState(path, newValue) {
    return this.props.updateLocalState([].concat(path), newValue);
  },

  handleSave() {
    this.props.onSaveQuery(this.query()).then(
      () => this.props.onHideFn());
  }

});
