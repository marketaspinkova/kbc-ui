import React, {PropTypes} from 'react';
import {Modal} from 'react-bootstrap';
import TabbedWizard, {CRAWLER_KEY, AUTH_KEY, OPTIONS_KEY} from './TabbedWizard';
import {fromJS, Map} from 'immutable';
import WizardButtons from '../../../components/react/components/WizardButtons';
import _ from 'underscore';
export default React.createClass({

  propTypes: {
    onHideFn: PropTypes.func,
    show: PropTypes.bool.isRequired,
    localState: PropTypes.object.isRequired,
    parameters: PropTypes.object.isRequired,
    inputTableId: PropTypes.string,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    loadCrawlers: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
    onSave: PropTypes.func.isRequired
  },

  render() {
    const step = this.step();
    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.props.onHideFn}>
        <Modal.Header closeButton>
          <Modal.Title>
            Setup Crawler
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderWizard()}
        </Modal.Body>
        <Modal.Footer>
          <WizardButtons
            onNext={() => this.cycleTab(1)}
            onPrevious={() => this.cycleTab(-1)}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            isSaving={this.props.isSaving}
            isSaveDisabled={!this.canSave()}
            isNextDisabled={!this.canNext()}
            isPreviousDisabled={step === 1}
            showNext={step < 3}
            showSave={true}
            savingMessage=""
          />
        </Modal.Footer>
      </Modal>

    );
  },

  getInputTableId() {
    return this.localState('inputTableId', this.props.inputTableId);
  },

  handleSave() {
    let crawlerSettings = JSON.parse(this.getSettings());
    crawlerSettings = _.isEmpty(crawlerSettings) ? null : fromJS(crawlerSettings);
    let paramsToSave = this.parameters();
    const action = this.getAction();
    if (action === 'crawler') {
      const crawlerId = paramsToSave.get('crawlerId');
      const crawler = this.localState(['crawlers', 'data']).find((c) => c.get('id') === crawlerId);
      paramsToSave = paramsToSave
        .set('customId', crawler.get('customId'))
        .set('settingsLink', crawler.get('settingsLink'))
        .set('crawlerSettings', crawlerSettings)
        .delete('executionId');
    }
    if (action === 'dataset') {
      paramsToSave = Map({
        actionType: 'getDatasetItems',
        datasetId: paramsToSave.get('datasetId'),
        '#token': paramsToSave.get('#token'),
        'userId': paramsToSave.get('userId')
      });
    } else {
      paramsToSave = paramsToSave.delete('actionType').delete('datasetId');
    }
    this.props.onSave(paramsToSave.delete('action'), this.getInputTableId());
  },

  canNext() {
    const step = this.step();
    if (step === AUTH_KEY) return this.hasAuth();
    return true;
  },

  getSettings() {
    let defaultValue = this.props.parameters.get('crawlerSettings', Map()) || Map();
    defaultValue = JSON.stringify(defaultValue, null, '  ');
    return this.localState('settings', defaultValue);
  },

  isSettingsValid() {
    try {
      JSON.parse(this.getSettings());
      return true;
    } catch (e) {
      return false;
    }
  },

  hasAuth() {
    const params = this.parameters();
    return !!params.get('userId') && !!params.get('#token');
  },

  getAction() {
    const params = this.parameters();
    const otherAction = params.get('actionType') === 'getDatasetItems' ? 'dataset' : 'crawler';
    let action = params.get('action', !!params.get('executionId') ? 'executionId' : otherAction);

    return action;
  },

  hasCrawler() {
    const params = this.parameters();
    const action = this.getAction();
    return action === 'executionId' ? !!params.get('executionId') : !!params.get('crawlerId');
  },

  canSave() {
    const hasAuth = this.hasAuth();
    const hasCrawler = this.hasCrawler();
    const hasSettingsValid = this.isSettingsValid();
    const isCrawlerAction = this.getAction() === 'crawler';
    const isDatasetAction = this.getAction() === 'dataset';
    const isLoadingCrawlers = this.localState(['crawlers', 'loading'], false);
    const hasDataset = !!this.parameters().get('datasetId');
    if (isDatasetAction) {
      return !isLoadingCrawlers && hasAuth && hasDataset;
    }
    if (isCrawlerAction) {
      return !isLoadingCrawlers && hasAuth && hasCrawler && hasSettingsValid;
    } else {
      return !isLoadingCrawlers && hasCrawler;
    }
  },

  cycleTab(delta) {
    const currentStep = this.step();
    let nextStep = 0;
    const isCrawlerAction = this.getAction() === 'crawler';
    const isDatasetAction = this.getAction() === 'dataset';
    switch (currentStep) {
      case CRAWLER_KEY:
        if (delta === 1) {
          if (isCrawlerAction || isDatasetAction) {
            nextStep = AUTH_KEY;
          } else {
            nextStep = OPTIONS_KEY;
          }
        }
        break;
      case AUTH_KEY:
        if (delta === 1) {
          nextStep = OPTIONS_KEY;
        } else {
          nextStep = CRAWLER_KEY;
        }
        break;
      case OPTIONS_KEY:
        if (delta === -1) {
          if (isCrawlerAction || isDatasetAction) {
            nextStep = AUTH_KEY;
          } else {
            nextStep = CRAWLER_KEY;
          }
        }
        break;
      default:
        nextStep = currentStep;
    }
    if (nextStep === OPTIONS_KEY && isCrawlerAction) this.onLoadCrawlers();
    /* let newStep = this.step() + delta;
     * newStep = newStep === 0 ? AUTH_KEY : newStep;
     * newStep = newStep > 3 ? AUTH_KEY : newStep;
     * */
    this.updateLocalState('step', nextStep);
  },

  renderWizard() {
    return (
      <TabbedWizard
        loadCrawlers={this.onLoadCrawlersForce}
        crawlers={this.localState('crawlers', Map())}
        step={this.step()}
        action={this.getAction()}
        selectTab={(s) => this.updateLocalState('step', s)}
        localState={this.props.localState}
        updateLocalState={this.props.updateLocalState}
        inputTableId={this.getInputTableId()}
        updateInputTableId={(tableId) => this.updateLocalState('inputTableId', tableId)}
        parameters={this.parameters()}
        updateParameters={(parameters) => this.updateLocalState('parameters', parameters)}
        settings={this.getSettings()}
        updateSettings={(val) => this.updateLocalState('settings', val)}
      />
    );
  },

  onLoadCrawlers() {
    if (this.localState('crawlers')) return;
    this.onLoadCrawlersForce();
  },

  onLoadCrawlersForce() {
    this.updateLocalState(['crawlers'], Map({'loading': true, 'error': null}));
    this.props.loadCrawlers(this.parameters()).then((data) => {
      const crawlers = {
        data: data.status !== 'error' ? data : null,
        loading: false,
        error: data.status === 'error' ? 'Error: ' + data.message : null
      };
      return this.updateLocalState('crawlers', fromJS(crawlers));
    }).catch(() =>
      this.updateLocalState('crawlers', fromJS({loading: false, data: null, error: 'Error Loading Crawlers'}))
    );
  },

  renderInputControl(propertyPath, placeholder) {
    return (
      <input
        placeholder={placeholder}
        type="text"
        value={1}
        onChange={() => null}
        className="form-control"
      />
    );
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

  localState(key, defaultValue) {
    return this.props.localState.getIn([].concat(key), defaultValue);
  },

  parameters() {
    return this.localState('parameters', this.props.parameters);
  },

  step() {
    return this.localState('step', CRAWLER_KEY);
  },

  updateLocalState(path, value) {
    this.props.updateLocalState(path, value);
  }

});
