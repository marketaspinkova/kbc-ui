import React, {PropTypes} from 'react';
import {fromJS, List} from 'immutable';
import {sanitizeTableName} from '../../../common';
import ProfileSelector from './ProfileSelector';
import GaMultiSelect from './GaMultiSelect';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import QuerySample from './QuerySample';

const DIMENSIONS = [
  'mcf:basicChannelGroupingPath',
  'mcf:sourcePath',
  'mcf:mediumPath',
  'mcf:sourceMediumPath',
  'mcf:campaignPath',
  'mcf:keywordPath',
  'mcf:adwordsAdContentPath',
  'mcf:adwordsAdGroupIDPath',
  'mcf:adwordsAdGroupPath',
  'mcf:adwordsCampaignIDPath',
  'mcf:adwordsCampaignPath',
  'mcf:adwordsCreativeIDPath',
  'mcf:adwordsCriteriaIDPath',
  'mcf:adwordsCustomerIDPath',
  'mcf:adwordsDestinationUrlPath',
  'mcf:adwordsDisplayUrlPath',
  'mcf:adwordsKeywordPath',
  'mcf:adwordsMatchedSearchQueryPath',
  'mcf:adwordsPlacementDomainPath',
  'mcf:adwordsPlacementUrlPath',
  'mcf:conversionDate',
  'mcf:conversionGoalNumber',
  'mcf:conversionType',
  'mcf:dcmAd',
  'mcf:dcmAdPath',
  'mcf:dcmAdType',
  'mcf:dcmAdvertiser',
  'mcf:dcmAdvertiserPath',
  'mcf:dcmCampaign',
  'mcf:dcmCampaignPath',
  'mcf:dcmCreative',
  'mcf:dcmCreativePath',
  'mcf:dcmCreativeVersion',
  'mcf:dcmCreativeVersionPath',
  'mcf:dcmNetwork',
  'mcf:dcmPlacement',
  'mcf:dcmPlacementPath',
  'mcf:dcmSite',
  'mcf:dcmSitePath',
  'mcf:pathLengthInInteractionsHistogram',
  'mcf:timeLagInDaysHistogram',
  'mcf:basicChannelGrouping',
  'mcf:source',
  'mcf:medium',
  'mcf:sourceMedium',
  'mcf:campaignName',
  'mcf:keyword',
  'mcf:transactionId',
  'mcf:adwordsAdContent',
  'mcf:adwordsAdGroup',
  'mcf:adwordsAdGroupID',
  'mcf:adwordsAdNetworkType',
  'mcf:adwordsCampaign',
  'mcf:adwordsCampaignID',
  'mcf:adwordsCreativeID',
  'mcf:adwordsCriteriaID',
  'mcf:adwordsCustomerID',
  'mcf:adwordsDestinationUrl',
  'mcf:adwordsDisplayUrl',
  'mcf:adwordsKeyword',
  'mcf:adwordsMatchedSearchQuery',
  'mcf:adwordsMatchType',
  'mcf:adwordsPlacementDomain',
  'mcf:adwordsPlacementType',
  'mcf:adwordsPlacementUrl',
  'mcf:adwordsTargetingType',
  'mcf:nthDay',
];

const METRICS = [
  'mcf:firstImpressionConversions',
  'mcf:firstImpressionValue',
  'mcf:impressionAssistedConversions',
  'mcf:impressionAssistedValue',
  'mcf:totalConversions',
  'mcf:totalConversionValue',
  'mcf:assistedConversions',
  'mcf:assistedValue',
  'mcf:firstInteractionConversions',
  'mcf:firstInteractionValue',
  'mcf:lastInteractionConversions',
  'mcf:lastInteractionValue',
];

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
    isEditing: PropTypes.bool.isRequired,
    sampleDataInfo: PropTypes.object.isRequired,
    isQueryValidFn: PropTypes.func
  },

  render() {
    const {query, isEditing} = this.props;
    const outTableId = this.props.outputBucket + '.' + query.get('outputTable');
    return (
      <div className="row">
        <div className="form-horizontal">
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
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">
              Output Table
            </label>
            <div className="col-md-8">
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
            isLoadingMetadata={false}
            metadata={fromJS(METRICS).map((item) => ({
              id: item,
              attributes: {
                group: 'MCF',
                uiName: item,
                description: ''
              }
            })).toJS()}
            isEditing={isEditing}
            name="Metrics"
            preferedOrderIds={METRICS}
            onSelectValue={this.onSelectMetric}
            selectedValues={this.getSelectedMetrics()}
          />
          <GaMultiSelect
            isLoadingMetadata={false}
            metadata={fromJS(DIMENSIONS).map((item) => ({
              id: item,
              attributes: {
                group: 'MCF',
                uiName: item,
                description: ''
              }
            })).toJS()}
            name="Dimensions"
            preferedOrderIds={DIMENSIONS}
            onSelectValue={this.onSelectDimension}
            selectedValues={this.getSelectedDimensions()}
            isEditing={isEditing}
          />
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

          <div className="form-group">
            <label className="col-md-2 control-label">
              Date since
            </label>
            <div className="col-md-10">
              {isEditing ?
                <input
                  type="text"
                  placeholder="-4 Days"
                  className="form-control"
                  value={query.getIn(['query', 'mcfDateSince'])}
                  onChange={this.onChangeTextPropFn(['query', 'mcfDateSince'])}
                />
                :
                <p className="form-control-static">
                  {query.getIn(['query', 'mcfDateSince']) || 'N/A'}
                </p>
              }
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">
              Date until
            </label>
            <div className="col-md-10">
              {isEditing ?
                <input
                  type="text"
                  placeholder="-1 Day"
                  className="form-control"
                  value={query.getIn(['query', 'mcfDateUntil'])}
                  onChange={this.onChangeTextPropFn(['query', 'mcfDateUntil'])}
                />
                :
                <p className="form-control-static">
                  {query.getIn(['query', 'mcfDateUntil']) || 'N/A'}
                </p>
              }
            </div>
          </div>

        </div>
        <QuerySample
          onRunQuery={() => this.props.onRunQuery(this.props.query)}
          isQueryValid={this.props.isQueryValidFn(this.props.query)}
          sampleDataInfo={this.props.sampleDataInfo}
        />
      </div>
    );
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
  }
});
