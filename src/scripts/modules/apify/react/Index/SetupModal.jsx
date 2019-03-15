import PropTypes from 'prop-types';
import React from 'react';
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
    loadActors: PropTypes.func.isRequired,
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
      const savedCrawlerList = fromJS([{
        id: crawlerId,
        settingsLink: paramsToSave.get('settingsLink'),
        customId: paramsToSave.get('customId')
      }]);
      const crawler = this
        .localState(['crawlers', 'data'], savedCrawlerList)
        .find((c) => c.get('id') === crawlerId);
      paramsToSave = Map({
        crawlerId: paramsToSave.get('crawlerId'),
        customId: crawler.get('customId'),
        settingsLink: crawler.get('settingsLink'),
        crawlerSettings: crawlerSettings,
        '#token': paramsToSave.get('#token'),
        'userId': paramsToSave.get('userId')
      });
    }
    if (action === 'dataset') {
      paramsToSave = Map({
        actionType: 'getDatasetItems',
        datasetId: paramsToSave.get('datasetId'),
        '#token': paramsToSave.get('#token'),
        'userId': paramsToSave.get('userId')
      });
    }
    if (action === 'actor') {
      paramsToSave = Map({
        actionType: 'runActor',
        memory: paramsToSave.get('memory') || '2048',
        build: paramsToSave.get('build') || 'latest',
        input: crawlerSettings || {},
        actId: paramsToSave.get('actId'),
        '#token': paramsToSave.get('#token'),
        'userId': paramsToSave.get('userId')
      });
    }
    if (action === 'executionId') {
      paramsToSave = Map({
        executionId: paramsToSave.get('executionId'),
        '#token': paramsToSave.get('#token'),
        'userId': paramsToSave.get('userId')
      });
    }
    this.props.onSave(paramsToSave.delete('action'), this.getInputTableId());
  },

  canNext() {
    const step = this.step();
    if (step === AUTH_KEY) return this.hasAuth();
    return true;
  },

  getSettings() {
    const settingsKey  = this.getAction() === 'actor' ? 'input' : 'crawlerSettings';
    let defaultValue = this.props.parameters.get(settingsKey, Map()) || Map();
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
    let otherAction = params.get('actionType') === 'getDatasetItems' ? 'dataset' : 'crawler';
    if (params.get('actionType') === 'runActor') {
      otherAction = 'actor';
    }
    const action = params.get('action', !!params.get('executionId') ? 'executionId' : otherAction);
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
    const isActorAction = this.getAction() === 'actor';
    const isLoadingCrawlers = this.localState(['crawlers', 'loading'], false);
    const hasDataset = !!this.parameters().get('datasetId');
    if (isActorAction) {
      const isLoadingActors = this.localState(['actors', 'loading'], false);
      return !isLoadingActors && hasAuth && this.parameters().get('actId') && hasSettingsValid;
    }
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
    const isActorAction = this.getAction() === 'actor';

    switch (currentStep) {
      case CRAWLER_KEY:
        if (delta === 1) {
          if (isCrawlerAction || isDatasetAction || isActorAction) {
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
          if (isCrawlerAction || isDatasetAction || isActorAction) {
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
    if (nextStep === OPTIONS_KEY && isActorAction) this.onLoadActors();
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
        loadActors={this.onLoadActorsForce}
        actors={this.localState('actors', Map())}
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
    this.props.loadCrawlers(this.parameters()).then(
      (data) => {
        const isError = data.status === 'error' || data.timeout;
        const crawlers = {
          data: !isError ? data : null,
          loading: false,
          error: isError ? 'Error: ' + data.message : null
        };
        return this.updateLocalState('crawlers', fromJS(crawlers));
      },
      (err) => this.updateLocalState('crawlers', fromJS({data: null, error: err, loading: false}))
    ).catch(() =>
      this.updateLocalState('crawlers', fromJS({loading: false, data: null, error: 'Error Loading Crawlers'}))
    );
  },

  onLoadActors() {
    if (this.localState('actors')) return;
    this.onLoadActorsForce();
  },

  onLoadActorsForce() {
    this.updateLocalState(['actors'], Map({'loading': true, 'error': null}));
    this.props.loadActors(this.parameters()).then(
      (data) => {
        const isError = data.status === 'error' || data.timeout;
        const actors = {
          data: !isError ? data : null,
          loading: false,
          error: isError ? 'Error: ' + data.message : null
        };
        return this.updateLocalState('actors', fromJS(actors));
      },
      (err) => this.updateLocalState('actors', fromJS({data: null, error: err, loading: false}))
    ).catch(() =>
      this.updateLocalState('actors', fromJS({loading: false, data: null, error: 'Error Loading Actors'}))
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
