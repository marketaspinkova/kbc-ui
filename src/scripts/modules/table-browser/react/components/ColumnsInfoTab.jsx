import React, {PropTypes} from 'react';
import _ from 'underscore';

import EmptyState from '../../../components/react/components/ComponentEmptyState';
import immutableMixin from 'react-immutable-render-mixin';

import Tooltip from '../../../../react/common/Tooltip';
import StorageTableDataPreviewItem from '../../../../react/common/StorageTableDataPreviewItem';
import enhancedColumnsTemplate from './EnhancedAnalysis/EnhancedComlumnsTemplate';
import EnhancedAnalysisRunControl from './EnhancedAnalysis/EnhancedAnalysisRunControl';
import {Table} from 'react-bootstrap';


export default React.createClass({
  propTypes: {
    tableExists: PropTypes.bool.isRequired,
    table: PropTypes.object,
    dataPreview: PropTypes.object,
    dataPreviewError: PropTypes.string,
    enhancedAnalysis: PropTypes.object,
    isRedshift: PropTypes.bool,
    onRunAnalysis: PropTypes.func,
    isCallingRunAnalysis: PropTypes.bool,
    loadingProfilerData: PropTypes.bool

  },

  mixins: [immutableMixin],

  render() {
    if (this.props.dataPreviewError) {
      return (
        <EmptyState>
          {this.props.dataPreviewError}
        </EmptyState>
      );
    }

    if (!this.props.tableExists || !this.isDataPreview()) {
      return (
        <EmptyState>
          No Data.
        </EmptyState>
      );
    }

    const columns = this.props.dataPreview.columns;
    const headerRow = this.renderHeaderRow();

    const columnsRows = columns.map((c, idx) => {
      const values = this.getColumnValues(c);
      let result = values.filter((item) => item.value !== '');
      return this.renderBodyRow(c, this.renderNameColumnCell(c), result, idx);
    });

    return (
      <div style={{maxHeight: '80vh', overflow: 'auto'}}>
        <Table responsive className="table table-striped">
          {headerRow}
          <tbody>
            {columnsRows}
          </tbody>
        </Table>
      </div>
    );
  },

  renderNameColumnCell(column) {
    const {table} = this.props,
      primary = table.get('primaryKey');
    return (
      <span>
        {column}
        <div>
          {primary.indexOf(column) > -1 ? ( <small><span className="label label-info">PK</span></small>) : '' }
        </div>
      </span>
    );
  },

  renderHeaderRow() {
    const simpleHeader = (
      <thead>
        <tr>
          <th>
            Column
          </th>
          <th>
            Sample Values
          </th>
        </tr>
      </thead>
    );

    if (!this.props.isRedshift) {
      return simpleHeader;
    }

    const enhancedHeader = this.getEnahncedHeader().filter(h => !h.skip).map((header, idx) => {
      return (
        <th key={idx}>
          {header.label}
          <Tooltip
            tooltip={header.desc}
            placement="top">
            <i className="fa fa-fw fa-question-circle" />
          </Tooltip>
        </th>
      );
    });

    return (
      <thead>
        <tr>
          <th />
          <th />
          <td colSpan="4">
            <EnhancedAnalysisRunControl
              enhancedAnalysis={this.props.enhancedAnalysis}
              table={this.props.table}
              onRunAnalysis={this.props.onRunAnalysis}
              isCallingRunAnalysis={this.props.isCallingRunAnalysis}
              loadingProfilerData={this.props.loadingProfilerData}
            />

          </td>
        </tr>
        <tr>
          <th>
            Column
          </th>
          <th>
            Sample Values
          </th>
          {enhancedHeader}
        </tr>
      </thead>
    );
  },

  getEnahncedHeader() {
    let dataHeader = null;
    if (this.hasEnhancedData()) {
      dataHeader = this.props.enhancedAnalysis.get('data').first();
    }
    return _.map(_.keys(enhancedColumnsTemplate), (key) => {
      const h = enhancedColumnsTemplate[key];
      return {
        name: key,
        label: h.name,
        desc: h.desc,
        idx: dataHeader ? dataHeader.indexOf(key) : 0,
        formatFn: h.formatFn,
        skip: h.skip
      };
    });
  },


  renderBodyRow(columnName, columnNameCell, values, idx) {
    let enhancedCells = null;
    if (this.props.isRedshift) {
      if (this.hasEnhancedData()) {
        const varNameIndex = this.props.enhancedAnalysis.get('data').first().indexOf('var_name');
        const header = this.getEnahncedHeader();
        const rows = this.props.enhancedAnalysis.get('data').rest();
        const rowToRender = rows.find((row) => {
          return row.get(varNameIndex).toUpperCase() === columnName.toUpperCase();
        });
        if (!rowToRender) {
          return (
            <tr>
              <td>
                {columnNameCell}
              </td>
              <td>
                {values.map( (item, key) => <span>{key !== 0 && ', '}<StorageTableDataPreviewItem item={item}/></span>)}
              </td>
            </tr>
          );
        }
        const rowValuesMap = header.map(h => {
          h.value = rowToRender.get(h.idx);
          return h;
        });

        enhancedCells = header.filter(h => !h.skip).map((h, hidx) => {
          let cellValue = h.value;
          if (h.formatFn) {
            cellValue = h.formatFn(cellValue, rowValuesMap);
          }
          return (
            <td key={hidx}>
              {cellValue}
            </td>
          );
        });
      } else {
        const header = this.getEnahncedHeader();
        enhancedCells = header.filter(h => !h.skip).map(() => {
          return (
            <td>
              -
            </td>
          );
        });
      }
    }

    return (
      <tr key={idx}>
        <td>
          {columnNameCell}
        </td>
        <td>
          {values.map( (item, key) => <span>{key !== 0 && ', '}<StorageTableDataPreviewItem item={item}/></span>)}
        </td>
        {enhancedCells}
      </tr>
    );
  },

  getColumnValues(columnName) {
    const data = this.props.dataPreview;
    const columnIndex = data.columns.indexOf(columnName);
    const result = data.rows
      .map( (row) => {
        return row[columnIndex];
      });
    return result;
  },


  isDataPreview() {
    return !_.isEmpty(this.props.dataPreview);
  },

  hasEnhancedAnalysis() {
    return this.props.enhancedAnalysis &&
           !_.isEmpty(this.props.enhancedAnalysis.toJS());
  },

  hasEnhancedData() {
    return this.hasEnhancedAnalysis() && !_.isEmpty(this.props.enhancedAnalysis.toJS().data);
  }

});
