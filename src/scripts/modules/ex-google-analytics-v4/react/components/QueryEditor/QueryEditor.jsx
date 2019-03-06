import React, {PropTypes} from 'react';
import {Map, fromJS, List} from 'immutable';
import {sanitizeTableName} from '../../../common';
import ProfileSelector from './ProfileSelector';
import GaMultiSelect from './GaMultiSelect';
import DateRangesSelector from './DateRangesSelector';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import QuerySample from './QuerySample';
import UrlParserModal from './UrlParserModal';
import AntiSamplingModal from './AntiSamplingModal';
import EndpointSelect from '../EndpointSelect';
import {Constants, MCF_DIMENSIONS, MCF_METRICS} from '../Constants';

const PREFERED_METRICS = ['ga:sessions', 'ga:users', 'ga:transactions', 'ga:pageviews', 'ga:uniquePageviews', 'ga:sessionDuration', 'ga:newUsers', 'ga:impressions', 'ga:transactionRevenue', 'ga:adClicks', 'ga:adCost', 'ga:bounces', 'ga:bounceRate'];

const PREFERED_DIMENSTIONS = ['ga:segment', 'ga:date', 'ga:medium', 'ga:sourceMedium', 'ga:source', 'ga:campaign', 'ga:yearMonth', 'ga:isoYearIsoWeek', 'ga:transactionId', 'ga:adwordsCampaignID', 'ga:deviceCategory', 'ga:keyword'];

export default React.createClass({
  propTypes: {
    allProfiles: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    outputBucket: PropTypes.string.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired,
    onChangeQuery: PropTypes.func.isRequired,
    onRunQuery: PropTypes.func.isRequired,
    isLoadingMetadata: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    metadata: PropTypes.object.isRequired,
    sampleDataInfo: PropTypes.object.isRequired,
    accountSegments: PropTypes.object.isRequired,
    isQueryValidFn: PropTypes.func
  },

  render() {
    const {query, isEditing} = this.props;
    const outTableId = this.props.outputBucket + '.' + query.get('outputTable');
    const endpoint = query.get('endpoint', Constants.ENDPOINT_REPORT);

    return (
      <div className="row">
        <div className="form-horizontal">
          <EndpointSelect
            selectedValue={endpoint}
            onSelectValue={this.onSelectEndpoint}
            name={'Endpoint'}
            disabled={!this.props.isEditing}
          />
          <div className="form-group">
            <label className="col-md-2 control-label">
              Name
            </label>
            <div className="col-md-6">
              {isEditing ?
                <input
                  type="text"
                  className="form-control"
                  value={query.get('name')}
                  placeholder="e.g. Untitled Query"
                  onChange={this.onChangeTextPropFn('name')}/>
                :
                <p className="form-control-static">
                  {query.get('name')}
                </p>
              }
            </div>
            <div className="col-md-2 checkbox">
              <label>
                <input type="checkbox" checked={query.get('enabled')}
                  disabled={!isEditing}
                  onChange={this.onChangePropertyFn('enabled', (e) => e.target.checked)}/>
                Enabled
              </label>
            </div>
            <div className="col-md-2">
              {isEditing ? this.renderUrlParser() : null}
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">
              Output Table
            </label>
            <div className="col-md-10">
              {isEditing ?
                <div className="input-group">
                  <div className="input-group-addon">
                    <small>{this.props.outputBucket}</small>.
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    value={query.get('outputTable')}
                    placeholder={sanitizeTableName(query.get('name'))}
                    onChange={this.onChangeTextPropFn('outputTable')}/>
                </div>
                :
                <p className="form-control-static">
                  <SapiTableLinkEx tableId={outTableId} />
                </p>
              }
            </div>
          </div>
        </div>

        <div className="form form-horizontal">
          <ProfileSelector
            isEditing={isEditing}
            allProfiles={this.props.allProfiles}
            selectedProfile={query.getIn(['query', 'viewId'])}
            onSelectProfile={this.onChangePropertyFn(['query', 'viewId']) }
          />
          <GaMultiSelect
            isLoadingMetadata={this.props.isLoadingMetadata}
            metadata={this.getMetrics(endpoint)}
            isEditing={isEditing}
            name="Metrics"
            preferedOrderIds={this.getPreferredMetrics(endpoint)}
            onSelectValue={this.onSelectMetric}
            selectedValues={this.getSelectedMetrics()}
          />
          <GaMultiSelect
            isLoadingMetadata={this.props.isLoadingMetadata}
            metadata={this.getDimensions(endpoint)}
            name="Dimensions"
            preferedOrderIds={this.getPreferredDimensions(endpoint)}
            onSelectValue={this.onSelectDimension}
            selectedValues={this.getSelectedDimensions()}
            isEditing={isEditing}
          />

          {endpoint === Constants.ENDPOINT_REPORT ?
            <GaMultiSelect
              isLoadingMetadata={this.props.accountSegments.get('isLoading', false)}
              metadata={this.props.accountSegments.get('data', List()).toJS()}
              name="Segments (optional)"
              onSelectValue={this.onSelectSegment}
              selectedValues={this.getSelectedSegments()}
              isEditing={isEditing}
            />
          : null}

          <div className="form-group">
            <label className="col-md-2 control-label">
              Filters (optional)
            </label>
            <div className="col-md-10">
              {isEditing ?
                <input
                  type="text"
                  placeholder="e.g ga:sourceMedium=~(something)"
                  className="form-control"
                  value={query.getIn(['query', 'filtersExpression'])}
                  onChange={this.onChangeTextPropFn(['query', 'filtersExpression'])}/>
                :
                <p className="form-control-static">
                  {query.getIn(['query', 'filtersExpression']) || 'N/A'}
                </p>
              }

            </div>
          </div>

          {endpoint === Constants.ENDPOINT_REPORT ?
          <div className="form-group">
            <label className="col-md-2 control-label">
              {this.renderOptionsModal()}
              Anti-sampling
            </label>
            <div className="col-md-9 pull-left">
              {isEditing ?
                <span className="btn btn-link form-control-static"
                  onClick={this.openOptionsDialogModal}>
                  {query.get('antisampling') || 'None'}
                  {' '}
                  <span className="kbc-icon-pencil" />
                </span>
                :
                <p className="form-control-static">
                  {query.get('antisampling') || 'None'}
                </p>
              }
            </div>
          </div>
          : null}

          <DateRangesSelector
            isEditing={isEditing}
            ranges={query.getIn(['query', 'dateRanges'], List())}
            onChange={this.onChangePropertyFn(['query', 'dateRanges'])}
            maxRanges={endpoint === Constants.ENDPOINT_MCF ? 1 : 2}
            {...this.props.prepareLocalState('DateRangeSelector')}/>


        </div>
        <QuerySample
          onRunQuery={() => this.props.onRunQuery(this.props.query)}
          isQueryValid={this.props.isQueryValidFn(this.props.query)}
          sampleDataInfo={this.props.sampleDataInfo}
        />
      </div>
    );
  },

  openOptionsDialogModal() {
    const stav = {
      show: true,
      value: this.props.query.get('antisampling', null)
    };
    this.props.updateLocalState(['OptionsModal'], fromJS(stav));
  },

  renderOptionsModal() {
    const {query, onChangeQuery} = this.props;
    const path = ['OptionsModal'];
    const ls = this.props.localState.getIn(path, Map());
    return (
      <AntiSamplingModal
        show={ls.get('show', false)}
        onHideFn={() => this.props.updateLocalState(path, Map())}
        onSaveFn={(newVal) => onChangeQuery(query.set('antisampling', newVal))}
        {...this.props.prepareLocalState(path)}
      />
    );
  },


  renderUrlParser() {
    const {localState, query, onChangeQuery} = this.props;
    return (
      <span>
        <button onClick={() => this.props.updateLocalState('showUrlParser', true)}
          className="btn btn-primary btn-sm">
          Parse Query Url
        </button>
        <UrlParserModal
          onSave={(newQuery) => onChangeQuery(query.set('query', newQuery))}
          show={localState.get('showUrlParser', false)}
          onCancel={() => this.props.updateLocalState('showUrlParser', false)}
          {...this.props.prepareLocalState('UrlParser')}/>
      </span>
    );
  },

  getMetrics(endpoint) {
    if (endpoint === Constants.ENDPOINT_MCF) {
      return fromJS(MCF_METRICS).map((item) => ({
        id: item,
        attributes: {
          group: 'MCF',
          uiName: item,
          description: ''
        }
      })).toJS();
    }
    return this.props.metadata.get('metrics', List()).toJS();
  },

  getDimensions(endpoint) {
    if (endpoint === Constants.ENDPOINT_MCF) {
      return fromJS(MCF_DIMENSIONS).map((item) => ({
        id: item,
        attributes: {
          group: 'MCF',
          uiName: item,
          description: ''
        }
      })).toJS();
    }

    return this.props.metadata.get('dimensions', List()).toJS();
  },

  getPreferredMetrics(endpoint) {
    return (endpoint === Constants.ENDPOINT_MCF) ? MCF_METRICS : PREFERED_METRICS;
  },

  getPreferredDimensions(endpoint) {
    return (endpoint === Constants.ENDPOINT_MCF) ? MCF_DIMENSIONS : PREFERED_DIMENSTIONS;
  },

  onSelectMetric(metrics) {
    const metricsArray = metrics.map((item) => {return item.value;});
    const newMetrics = fromJS(metricsArray.map((m) => {return {expression: m};}));
    const newQuery = this.props.query.setIn(['query', 'metrics'], newMetrics);
    this.props.onChangeQuery(newQuery);
  },

  getSelectedMetrics() {
    const metrics = this.props.query.getIn(['query', 'metrics'], List());
    return metrics.map((m) => m.get('expression')).toArray();
  },

  onSelectDimension(dimensions) {
    const dimensionsArray = dimensions.map((item) => {return item.value;});
    const newDimensions = fromJS(dimensionsArray.map((m) => {return {name: m};}));
    const newQuery = this.props.query.setIn(['query', 'dimensions'], newDimensions);
    this.props.onChangeQuery(newQuery);
  },

  getSelectedDimensions() {
    const dimensions = this.props.query.getIn(['query', 'dimensions'], List());
    return dimensions.map((m) => m.get('name')).toArray();
  },

  onSelectSegment(segments) {
    const segmentsArray = segments.map((item) => {return item.value;});
    const newSegments = fromJS(segmentsArray.map((m) => {return {segmentId: m};}));
    const newQuery = this.props.query.setIn(['query', 'segments'], newSegments);
    this.props.onChangeQuery(newQuery);
  },

  getSelectedSegments() {
    const segments = this.props.query.getIn(['query', 'segments'], List());
    return segments.map((m) => m.get('segmentId')).toArray();
  },

  onChangePropertyFn(propName, getValueFnParam) {
    let getValueFn = getValueFnParam;
    if (!getValueFn) {
      getValueFn = (value) => value;
    }
    return (event) => {
      const value = getValueFn(event);
      const newQuery = this.props.query.setIn([].concat(propName), value);
      this.props.onChangeQuery(newQuery);
    };
  },

  onChangeTextPropFn(propName) {
    return (ev) => {
      const value = ev.target.value;
      const newQuery = this.props.query.setIn([].concat(propName), value);
      this.props.onChangeQuery(newQuery);
    };
  },

  onSelectEndpoint(selectedEndpoint) {
    if (this.props.query.get('endpoint') !== selectedEndpoint) {
      this.props.onChangeQuery(Map({
        id: this.props.query.get('id'),
        name: this.props.query.get('name'),
        enabled: this.props.query.get('enabled'),
        outputTable: this.props.query.get('outputTable'),
        endpoint: selectedEndpoint,
        query: Map({
          dateRanges: List([Map({
            startDate: '-4 days',
            endDate: 'today'
          })])
        })
      }));
    }
  }
});
