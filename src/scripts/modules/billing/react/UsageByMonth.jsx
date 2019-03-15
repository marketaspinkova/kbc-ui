import React from 'react';
import createReactClass from 'create-react-class';
import {fromJS, List} from 'immutable';
import moment from 'moment';
import MetricsApi from '../MetricsApi';
import CreditSize from '../../../react/common/CreditSize';
import ComponentsStore from '../../components/stores/ComponentsStore';
import {Table, Panel} from 'react-bootstrap';
import ComponentName from './../../../react/common/ComponentName';
import ComponentIcon from './../../../react/common/ComponentIcon';
import {componentIoSummary} from './Index';
import Loader from './Loader';
import ApplicationStore from '../../../stores/ApplicationStore';
import { compute as computeDatesForMonthlyUsage } from './datesForMonthlyUsage';

function getProjectCreationDate() {
  const project = ApplicationStore.getCurrentProject();
  return project.get('created', null);
}

function getDatesForMonthlyUsage() {
  return computeDatesForMonthlyUsage(
    moment().subtract(2, 'months').startOf('month'),
    moment(),
    moment(getProjectCreationDate())
  );
}

function sortComponentsByStorageIoDesc(first, second) {
  const firstStorageIo = first.get('storage').get('inBytes') + first.get('storage').get('outBytes');
  const secondStorageIo = second.get('storage').get('inBytes') + second.get('storage').get('outBytes');
  if (firstStorageIo > secondStorageIo) {
    return -1;
  } else if (firstStorageIo < secondStorageIo) {
    return 1;
  } else {
    return 0;
  }
}

export default createReactClass({

  getInitialState: function() {
    return {
      metricsData: fromJS([]),
      dates: getDatesForMonthlyUsage(),
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

  loadMetricsData: function() {
    return MetricsApi.getProjectMetrics(this.state.dates.dateFrom, this.state.dates.dateTo, 'month');
  },

  render() {
    if (this.state.showLoader) {
      return (
        <Loader />
      );
    } else {
      return (
        <div style={{marginBottom: '10em'}}>
          <h3>
            {'Project Power from '}
            {moment(this.state.dates.dateFrom).format('MMM D, YYYY')}
            {' to '}
            {moment(this.state.dates.dateTo).format('MMM D, YYYY')}
          </h3>
          {this.state.metricsData.map((item, index) => {
            if (!item.get('components').isEmpty()) {
              return (
                <Panel collapsible={true}
                  defaultExpanded={index === 0}
                  header={this.daySummary(item)}
                  key={item.get('dateFrom') + '-' + item.get('dateTo')}>
                  <Table fill className="table">
                    <tbody>
                      {List([item.get('components').sort(sortComponentsByStorageIoDesc).map(this.dayComponents)])}
                    </tbody>
                  </Table>
                </Panel>
              );
            } else {
              return (
                <Panel collapsible={true} header={this.daySummary(item)} key={item.get('dateFrom') + '-' + item.get('dateTo')}>
                  N/A
                </Panel>
              );
            }
          })}
        </div>
      );
    }
  },

  daySummary(data) {
    return (
      <div className="row" style={{paddingBottom: '1em'}}>
        <div className="col-sm-8">
          <strong>{moment(data.get('dateFrom')).format('MMM D, YYYY')}</strong>
          {' - '}
          <strong>{moment(data.get('dateTo')).format('MMM D, YYYY')}</strong>
        </div>
        <div className="col-sm-4">
          <strong>
            <CreditSize nanoCredits={componentIoSummary(data.get('components'), 'storage')}/>
          </strong>
        </div>
      </div>
    );
  },

  renderComponentNameAndIcon(componentSlug) {
    const componentFromStore = ComponentsStore.getComponent(componentSlug);

    if (componentFromStore) {
      return (
        <span>
          <ComponentIcon component={componentFromStore} />
          <ComponentName component={componentFromStore} showType />
        </span>
      );
    } else if (componentSlug === 'storage-direct') {
      return (
        <span>
          <span className="kb-sapi-component-icon kbc-icon-storage" style={{fontSize: '32px', verticalAlign: 'middle'}}/>
          <span>Direct Storage access</span>
        </span>
      );
    } else {
      return (
        <span>
          <span>{componentSlug}</span>
        </span>
      );
    }
  },

  dayComponents(component) {
    return (
      <tr>
        <td>
          <div className="row">
            <div className="col-md-8">
              {this.renderComponentNameAndIcon(component.get('name'))}
            </div>
            <div className="col-md-4">
              <span style={{lineHeight: '2em'}}>
                <CreditSize nanoCredits={
                  component.get('storage').get('inBytes') + component.get('storage').get('outBytes')
                }/>
              </span>
            </div>
          </div>
        </td>
      </tr>
    );
  }
});
