import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {List} from 'immutable';
import {Loader} from '@keboola/indigo-ui';

import TablesList from './TablesList';
import JobMetrics from './JobMetrics';
import IntlMessageFormat from 'intl-messageformat';

const MESSAGES = {
  TOTAL_IMPORTS: '{totalCount, plural, ' +
    '=1 {one import total}' +
    'other {# imports total}}',
  TOTAL_EXPORTS: '{totalCount, plural, ' +
    '=1 {one export total}' +
    'other {# exports total}}',
  TOTAL_FILES: '{totalCount, plural, ' +
    '=1 {one files total}' +
    'other {# files total}}'
};

const MODE_TRANSFORMATION = 'transformation';
const MODE_DEFAULT = 'default';

function message(id, params) {
  return new IntlMessageFormat(MESSAGES[id]).format(params);
}

export default React.createClass({
  propTypes: {
    stats: React.PropTypes.object.isRequired,
    isLoading: React.PropTypes.bool.isRequired,
    mode: React.PropTypes.oneOf([MODE_DEFAULT, MODE_TRANSFORMATION]),
    jobMetrics: React.PropTypes.object.isRequired
  },
  mixins: [PureRenderMixin],

  loader() {
    return this.props.isLoading ? <Loader/> : '';
  },

  render() {
    const importedIds = this.extractTableIds('import');
    const exportedIds = this.extractTableIds('export');
    const allTablesIds = importedIds.concat(exportedIds);

    return (
      <div className="clearfix">
        <div className="col-md-4">
          <h4>
            Input {this.exportsTotal()} {this.loader()}
          </h4>
          <TablesList allTablesIds={allTablesIds} tables={this.props.stats.getIn(['tables', 'export'])} />
        </div>
        <div className="col-md-4">
          <h4>Output {this.importsTotal()}</h4>
          <TablesList allTablesIds={allTablesIds} tables={this.props.stats.getIn(['tables', 'import'])} />
        </div>
        <div className="col-md-4">
          <JobMetrics metrics={this.props.jobMetrics} />
        </div>
      </div>
    );
  },

  importsTotal() {
    if (this.props.mode === MODE_TRANSFORMATION) {
      return null;
    }
    const total = this.props.stats.getIn(['tables', 'import', 'totalCount']);
    return total > 0 ? <small>{message('TOTAL_IMPORTS', {totalCount: total})}</small> : null;
  },

  exportsTotal() {
    if (this.props.mode === MODE_TRANSFORMATION) {
      return null;
    }
    const total = this.props.stats.getIn(['tables', 'export', 'totalCount']);
    return total > 0 ? <small>{message('TOTAL_EXPORTS', {totalCount: total})}</small> : null;
  },

  extractTableIds(tablesType) {
    return this.props.stats.getIn(['tables', tablesType, 'tables'], List()).map((t) => t.get('id'));
  }

});
