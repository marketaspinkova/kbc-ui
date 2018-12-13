import React, {PropTypes} from 'react';

import date from '../../../../utils/date';
import moment from 'moment';
import _ from 'underscore';
import {Table} from 'react-bootstrap';
import immutableMixin from 'react-immutable-render-mixin';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import filesize from 'filesize';
import TableUpdatedByComponentInfo from '../../../../react/common/TableUpdatedByComponentInfo';
import formatCardinalNumber from '../../../../utils/formatCardinalNumber';
import {NotAvailable} from '@keboola/indigo-ui';

export default React.createClass({

  propTypes: {
    isLoading: PropTypes.bool,
    table: PropTypes.object,
    tableExists: PropTypes.bool.isRequired
  },

  mixins: [immutableMixin],

  render() {
    if (!this.props.tableExists) {
      let msg = 'Table does not exist.';
      if (this.props.isLoading) {
        msg = 'Loading...';
      }
      return (
        <EmptyState key="emptytable">
          {msg}
        </EmptyState>
      );
    }
    const table = this.props.table;
    const primaryKey = table.get('primaryKey').toJS();
    const backend = table.getIn(['bucket', 'backend']);
    return (
      <div style={{maxHeight: '80vh', overflow: 'auto'}}>
        <Table responsive className="table">
          <thead>
            <tr>
              <td style={{width: '20%'}}>
                ID
              </td>
              <td>
                {table.get('id')}
              </td>
            </tr>
          </thead>
          <tbody>
            {this.renderTableRow('Storage', (<span className="label label-info">{backend}</span>))}
            {this.renderTableRow('Created', this.renderTimefromNow(table.get('created')))}
            {this.renderTableRow('Primary Key', _.isEmpty(primaryKey) ? <NotAvailable/> : primaryKey.join(', '))}
            {this.renderTableRow('Last Import', this.renderTimefromNow(table.get('lastImportDate')))}
            {this.renderTableRow('Last Change', this.renderTimefromNow(table.get('lastChangeDate')))}
            {this.renderTableRow('Last updated by', <TableUpdatedByComponentInfo table={table}/>)}
            {this.renderTableRow('Rows Count', this.renderRowsCount(table.get('rowsCount')))}
            {this.renderTableRow('Data Size', this.renderDataSize(table.get('dataSizeBytes')))}
            {this.renderTableRow('Columns', table.get('columns').count() + ' columns: ' + table.get('columns').join(', '))}
          </tbody>
        </Table>
      </div>
    );
  },

  renderRowsCount(value) {
    return (<span>{formatCardinalNumber(value)} rows</span>);
  },

  renderDataSize(value) {
    if (value === null) {
      return <NotAvailable/>;
    }
    return filesize(value);
  },

  renderTimefromNow(value) {
    if (value === null) {
      return <NotAvailable/>;
    }
    const fromNow = moment(value).fromNow();
    return (
      <span> {date.format(value)}
        <small> {fromNow} </small>
      </span>
    );
  },

  renderTableRow(name, value) {
    return (
      <tr>
        <td>
          {name}
        </td>
        <td>
          {value}
        </td>
      </tr>
    );
  }

});
