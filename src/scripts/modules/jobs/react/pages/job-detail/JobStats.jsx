import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {List} from 'immutable';
import {Loader} from '@keboola/indigo-ui';

import TablesList from './TablesList';
import JobMetrics from './JobMetrics';

export default createReactClass({
  propTypes: {
    stats: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    jobMetrics: PropTypes.object.isRequired
  },

  mixins: [PureRenderMixin],

  render() {
    const importedIds = this.extractTableIds('import');
    const exportedIds = this.extractTableIds('export');
    const allTablesIds = importedIds.concat(exportedIds);

    return (
      <div className="clearfix">
        <div className="col-md-4">
          <h4>Input {this.props.isLoading && <Loader/>}</h4>
          <TablesList allTablesIds={allTablesIds} tables={this.props.stats.getIn(['tables', 'export'])} />
        </div>
        <div className="col-md-4">
          <h4>Output {this.props.isLoading && <Loader/>}</h4>
          <TablesList allTablesIds={allTablesIds} tables={this.props.stats.getIn(['tables', 'import'])} />
        </div>
        <div className="col-md-4">
          <JobMetrics metrics={this.props.jobMetrics} />
        </div>
      </div>
    );
  },

  extractTableIds(tablesType) {
    return this.props.stats.getIn(['tables', tablesType, 'tables'], List()).map((t) => t.get('id'));
  }
});
