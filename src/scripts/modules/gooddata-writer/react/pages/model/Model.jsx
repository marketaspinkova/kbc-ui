import React from 'react';
import createReactClass from 'create-react-class';
import { ExternalLink } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../../stores/RoutesStore';

import goodDataWriterStore from '../../../store';

import Graph from './GraphContainer';

export default createReactClass({
  mixins: [createStoreMixin(goodDataWriterStore)],

  getStateFromStores() {
    const configurationId = RoutesStore.getCurrentRouteParam('config');
    return {
      configurationId,
      writer: goodDataWriterStore.getWriter(configurationId)
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <div className="row">
            <p>
              This graph represents the model defined in Keboola Connection.
              {'To see the current model in GoodData, open the '}
              <ExternalLink href={this._gdModelLink()}>GoodData LDM Visualizer</ExternalLink>
            </p>
            <p className="well">
              <span className="label label-success">Dataset</span>{' '}
              <span className="label label-primary">Date Dimension</span>
            </p>
            <Graph configurationId={this.state.configurationId} />
          </div>
        </div>
      </div>
    );
  },

  _gdModelLink() {
    const pid = this.state.writer.getIn(['config', 'project', 'id']);
    return `https://secure.gooddata.com/labs/apps/app_link?pid=${pid}&app=ldm_visualizer`;
  }
});
