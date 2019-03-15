import React from 'react';
import createReactClass from 'create-react-class';
import ApplicationStore from '../../../stores/ApplicationStore';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import EditLimitButton from './../../limits/EditLimitButton';
import LimitProgress from './../../limits/LimitProgress';
import {Button} from 'react-bootstrap';
import contactSupport from '../../../utils/contactSupport';
import classnames from 'classnames';
import {numericMetricFormatted} from '../../../utils/numbers';
import MetricsApi from '../MetricsApi';
import {fromJS} from 'immutable';
import Loader from './Loader';
import moment from 'moment';
import {convertToCredits} from '../../../react/common/CreditSize';
import {componentIoSummary} from './Index';

function getDatesForThisMonth() {
  const today = moment();
  const yesterday = moment().subtract(1, 'day');
  return {
    dateFrom: (
      today.format('MM') === yesterday.format('MM')
        ? today.startOf('month').format('YYYY-MM-DD')
        : yesterday.startOf('month').format('YYYY-MM-DD')
    ),
    dateTo: yesterday.format('YYYY-MM-DD')
  };
}

export default createReactClass({

  mixins: [createStoreMixin(ApplicationStore)],

  getInitialState: function() {
    return {
      metricsData: fromJS([]),
      dates: getDatesForThisMonth(),
      showLoader: true
    };
  },

  componentDidMount: function() {
    this.loadMetricsData()
      .then((response) => {
        this.setState({
          metricsData: fromJS(response).reverse(),
          showLoader: false
        });
      });
  },

  getStateFromStores() {
    return {
      sections: ApplicationStore.getLimits(),
      canEdit: ApplicationStore.getKbcVars().get('canEditProjectLimits')
    };
  },

  loadMetricsData: function() {
    return MetricsApi.getProjectMetrics(this.state.dates.dateFrom, this.state.dates.dateTo, 'month');
  },

  render() {
    if (this.state.showLoader) {
      return (
        <Loader />
      );
    } else {
      const connectionLimits = this.state.sections.find(function(val) {
        return val.get('id') === 'connection';
      });
      const projectPowerLimit = connectionLimits.get('limits').find(function(val) {
        return val.get('id') === 'kbc.monthlyProjectPowerLimit';
      });

      const projectPowerLimitUpdated = projectPowerLimit.set('metricValue', parseInt(
        convertToCredits(componentIoSummary(this.state.metricsData.first().get('components'), 'storage'), 0),
        10
      ));

      if (this.state.canEdit || projectPowerLimitUpdated.get('limitValue')) {
        return (
          <div className="tab-content">
            <div className="tab-pane tab-pane-no-padding active">
              <div style={{marginTop: '3em'}}>
                <h3>
                  {projectPowerLimitUpdated.get('name') + ' '}
                  <small>
                    {'from ' + moment(this.state.dates.dateFrom).format('MMM D, YYYY')}
                    {' to ' + moment(this.state.dates.dateTo).format('MMM D, YYYY')}
                  </small>
                </h3>
                <div style={{width: '80%', margin: '0 auto'}}>
                  <div className={classnames('text-center', 'kbc-limit-inner')}>
                    <div style={{position: 'relative'}}>
                      {this.renderProgress(projectPowerLimitUpdated)}
                    </div>
                    <div style={{marginBottom: '1em'}}>
                      {this.renderLimit(projectPowerLimitUpdated)}
                    </div>
                    <div>
                      {this.renderActionButton(projectPowerLimitUpdated)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return null;
      }
    }
  },

  renderProgress(limit) {
    if (limit.get('limitValue') && limit.get('limitValue', 0) !== 0) {
      return (
        <LimitProgress valueMax={limit.get('limitValue')} valueCurrent={limit.get('metricValue')}/>
      );
    } else {
      return null;
    }
  },

  renderLimit(limit) {
    if (limit.get('limitValue') && limit.get('limitValue', 0) !== 0) {
      return (
        <span>
          {'Project consumed '}
          <strong style={{fontSize: '24px'}}>
            {numericMetricFormatted(limit.get('metricValue'), limit.get('unit'))}
          </strong>
          {' of '}
          <strong style={{fontSize: '24px'}}>
            {numericMetricFormatted(limit.get('limitValue'), limit.get('unit'))}
          </strong>
          {' credits this month'}
        </span>
      );
    } else {
      return (
        <span>
          {'Project consumed '}
          <strong style={{fontSize: '24px'}}>
            {numericMetricFormatted(limit.get('metricValue'), limit.get('unit'))}
          </strong>
          {' credits this month'}
        </span>
      );
    }
  },

  renderActionButton(limit) {
    if (this.state.canEdit) {
      return (
        <EditLimitButton limit={limit} redirectTo={'settings-project-power'}/>
      );
    } else {
      return (
        <Button bsStyle="success" onClick={contactSupport}>
          <span className="fa fa-plus"/> Request More
        </Button>
      );
    }
  }

});
