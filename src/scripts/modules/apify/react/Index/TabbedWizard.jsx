import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Tab, Tabs, FormGroup, Radio, HelpBlock } from 'react-bootstrap';
import SapiTableSelector from '../../../components/react/components/SapiTableSelector';
import ApifyObjectSelector from './ApifyObjectSelector';
import { ExternalLink } from '@keboola/indigo-ui';
import { Controlled as CodeMirror } from 'react-codemirror2'

export const CRAWLER_KEY = 1;
export const AUTH_KEY = 2;
export const OPTIONS_KEY = 3;

const inputTableHelpText = {
  'crawler': 'Optional parameter. Data from the input table will be pushed to crawler, where you can access them through the Key-value store. The ID of the Key-value store will be saved to the customData attribute of the crawler execution.',
  'actor': 'Optional parameter. Data from the input table will be pushed to actor, where you can access them through the Key-value store. The ID of the Key-value store and key of record will be saved to the input of actor in attribute inputTableRecord.'
};


export default createReactClass({

  propTypes: {
    localState: PropTypes.object.isRequired,
    settings: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    updateSettings: PropTypes.func.isRequired,
    crawlers: PropTypes.object.isRequired,
    actors: PropTypes.object.isRequired,
    inputTableId: PropTypes.string,
    updateInputTableId: PropTypes.func.isRequired,
    step: PropTypes.number.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    parameters: PropTypes.object.isRequired,
    loadCrawlers: PropTypes.func.isRequired,
    loadActors: PropTypes.func.isRequired,
    updateParameters: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired
  },

  render() {
    return (
      <span>
        <Tabs className="tabs-inside-modal" activeKey={this.props.step} animation={false} onSelect={this.props.selectTab} id="controlled-tab-wizard">
          <Tab 
            title="Action"
            eventKey={CRAWLER_KEY} 
            disabled={this.isTabDisabled(CRAWLER_KEY)}
          >
            <div className="clearfix">
              <FormGroup>
                <Radio
                  value="crawler"
                  checked={this.props.action === 'crawler'}
                  onChange={(event) => this.updateParameter('action', event.target.value)}
                >
                  Run Crawler
                </Radio>
                <HelpBlock>
                  Runs a specific Crawler and retrieves its results if it finishes successfully.
                </HelpBlock>
              </FormGroup>
              <FormGroup>
                <Radio
                  value="actor"
                  checked={this.props.action === 'actor'}
                  onChange={(event) => this.updateParameter('action', event.target.value)}
                >
                  Run Actor
                </Radio>
                <HelpBlock>
                  Runs a specific Actor and retrieves its results if it finishes successfully.
                </HelpBlock>
              </FormGroup>
              <FormGroup>
                <Radio
                  value="executionId"
                  checked={this.props.action === 'executionId'}
                  onChange={(event) => this.updateParameter('action', event.target.value)}
                >
                  Retrieve results from Crawler run
                </Radio>
                <HelpBlock>
                  Retrieves the results from a Crawler run specified by its Execution ID.
                </HelpBlock>
              </FormGroup>
              <FormGroup>
                <Radio
                  value="dataset"
                  checked={this.props.action === 'dataset'}
                  onChange={(event) => this.updateParameter('action', event.target.value)}
                >
                  Retrieve items from Dataset
                </Radio>
                <HelpBlock>
                  Retrieves items from a Dataset specified by its ID or name.
                </HelpBlock>
              </FormGroup>
            </div>
          </Tab>
          {['crawler', 'dataset', 'actor'].includes(this.props.action) && (
            <Tab title="Authentication" eventKey={AUTH_KEY}
              disabled={this.isTabDisabled(AUTH_KEY)}>
              {this.renderTokenForm()}
            </Tab>
          )}
          <Tab 
            title="Specification"
            eventKey={OPTIONS_KEY} 
            disabled={this.isTabDisabled(OPTIONS_KEY)}
          >
            {this.props.step === OPTIONS_KEY && this.renderOptionsContent()}
          </Tab>
        </Tabs>
      </span>
    );
  },

  renderOptionsContent() {
    switch (this.props.action) {
      case 'crawler':
      case 'executionId':
        return this.renderCrawlerSettingsForm();
      case 'dataset':
        return this.renderDatasetSettingsForm();
      case 'actor':
        return this.renderActorSettingsForm();
      default:
        return null;
    }
  },

  renderActorSettingsForm() {
    return (
      <div className="form-horizontal">
        {this.renderActorSelector()}
        {this.renderInputTableIdSelector('actor')}
        {this.renderInput(
          'Memory',
          'memory',
          '(Optional) Specifies the amount of memory allocated for Actor run.',
          '2048'
        )}
        {this.renderInput(
          'Build',
          'build',
          '(Optional) Tag or number of Actor build to run (e.g. latest or 1.2.34)',
          'latest'
        )}

        <div className="form-group">
          <div className="col-xs-2 control-label">
            Actor Input
          </div>
          <div className="col-xs-10">
            <CodeMirror
              editorDidMount={(editor) => editor.refresh()}
              value={this.props.settings}
              onBeforeChange={this.handleCrawlerSettingsChange}
              options={{
                theme: 'solarized',
                mode: 'application/json',
                lineNumbers: false,
                readOnly: false,
                lineWrapping: true,
                autofocus: false,
                lint: true,
                tabSize: 2,
                gutters: ['CodeMirror-lint-markers']
              }}
            />
            <div className="help-text">
              (Optional) Contains input for the Actor in JSON format.
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderDatasetSettingsForm() {
    return (
      <div className="form-horizontal">
        {this.renderInput('Dataset', 'datasetId', 'ID or name of the Dataset to fetch the data from.', 'Enter dataset id or dataset name')}
      </div>
    );
  },

  renderCrawlerSettingsForm() {
    const editor = (
      <CodeMirror
        editorDidMount={(editor) => editor.refresh()}
        value={this.props.settings}
        onBeforeChange={this.handleCrawlerSettingsChange}
        options={{
          theme: 'solarized',
          lineNumbers: false,
          readOnly: false,
          mode: 'application/json',
          lineWrapping: true,
          autofocus: false,
          lint: true,
          tabSize: 2,
          gutters: ['CodeMirror-lint-markers']
        }}
      />
    );
    const eidHelp = 'Execution ID of the Crawler run to retrieve the results from.';
    const executionIdControl = (
      <div className="form-horizontal">
        {this.renderInput('Execution ID', 'executionId', eidHelp, 'Enter Execution ID')}
      </div>
    );
    const action = this.props.action;
    return (
      action === 'executionId' ? executionIdControl
        :
        <div className="form-horizontal">
          {this.renderCrawlerSelector()}
          {this.renderInputTableIdSelector('crawler')}
          <div className="form-group">
            <div className="col-xs-2 control-label">
            Crawler Settings
            </div>
            <div className="col-xs-10">
              {editor}
              <div className="help-text">
              Optional parameter. Specifies a JSON object with properties that override the default crawler settings. For more information, see <ExternalLink href="https://www.apify.com/docs#crawlers">documentation</ExternalLink>.
              </div>
            </div>
          </div>
        </div>
    );
  },

  renderInputTableIdSelector(helpTextKey) {
    const error = false;

    return (
      <div className={error ? 'form-group has-error' : 'form-group'}>
        <div className="col-xs-2 control-label">
          Input Table
        </div>
        <div className="col-xs-10">
          <SapiTableSelector
            clearable={true}
            onSelectTableFn={this.props.updateInputTableId}
            placeholder="Select table"
            value={this.props.inputTableId || ''}
          />
          <span className="help-block">
            {inputTableHelpText[helpTextKey]}
          </span>
        </div>
      </div>
    );
  },

  handleCrawlerSettingsChange(editor, data, value) {
    this.props.updateSettings(value);
  },


  isTabDisabled(tabKey) {
    return this.props.step !== tabKey;
  },

  renderTokenForm() {
    const userHelp = <span>User ID from your <ExternalLink href="https://my.apify.com/account#/integrations">account page</ExternalLink>.</span>;
    const tokenHelp = <span>API token from your <ExternalLink href="https://my.apify.com/account#/integrations">account page</ExternalLink>.</span>;
    return (
      <div className="form-horizontal">
        {this.renderInput('User ID', 'userId', userHelp, 'Enter User ID')}
        {this.renderInput('Token', '#token', tokenHelp, 'Enter token')}
      </div>

    );
  },

  renderCrawlerSelector() {
    return (
      <ApifyObjectSelector
        objectName="crawler"
        objectLabelKey="customId"
        object={this.props.crawlers}
        selectedValue={this.props.parameters.get('crawlerId')}
        onLoadObjectsList={this.props.loadCrawlers}
        onSelect={(crawlerId) => this.updateParameter('crawlerId', crawlerId)}
      />
    );
  },

  renderActorSelector() {
    return (
      <ApifyObjectSelector
        objectName="actor"
        objectLabelKey="name"
        object={this.props.actors}
        selectedValue={this.props.parameters.get('actId')}
        onLoadObjectsList={this.props.loadActors}
        onSelect={(actId) => this.updateParameter('actId', actId)}
      />
    );
  },

  renderInputControl(propertyPath, placeholder) {
    const propValue = this.parameter(propertyPath, '');
    const isEncrypted = propValue.includes('KBC::') && (propValue.includes('Encrypted') || propValue.includes('Secure'));
    let value = '';
    let placeholderValue = '';
    if (isEncrypted ) {
      value = '';
      placeholderValue = 'Encrypted value, leave blank to keep it';
    } else {
      value = propValue;
      placeholderValue = placeholder;
    }
    return (
      <input
        placeholder={placeholderValue}
        type="text"
        value={value}
        onChange={(e) => this.updateParameter(propertyPath, e.target.value)}
        className="form-control"
      />
    );
  },

  parameter(key, defaultValue) {
    return this.props.parameters.get(key, defaultValue);
  },

  updateParameter(key, newValue) {
    this.props.updateParameters(this.props.parameters.set(key, newValue));
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
  }

});
