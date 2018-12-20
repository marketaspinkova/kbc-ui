import React, {PropTypes} from 'react';

import immutableMixin from 'react-immutable-render-mixin';
import EmptyState from '../../../../components/react/components/ComponentEmptyState';
import {Table} from 'react-bootstrap';
import DataPreviewItem from '../../../../../react/common/DataPreviewItem';

export default React.createClass({
  propTypes: {
    dataPreview: PropTypes.object,
    dataPreviewError: PropTypes.string
  },

  mixins: [immutableMixin],

  render() {
    const {dataPreview, dataPreviewError} = this.props;

    if (dataPreviewError) {
      return (
        <EmptyState>
          {dataPreviewError}
        </EmptyState>
      );
    }

    if (dataPreview === null || dataPreview.rows.length === 0) {
      return (
        <EmptyState>
          No Data.
        </EmptyState>
      );
    }

    const header = dataPreview.columns.map( (c) => {
      return (
        <th>
          {c}
        </th>
      );
    });
    const rows = dataPreview.rows.map( (row) => {
      const cols = row.map( (c) => {
        return (<td> <DataPreviewItem isTruncated={c.isTruncated} value={c.value} /> </td>);
      });

      return (
        <tr>
          {cols}
        </tr>);
    });

    return (
      <div>
        <Table responsive className="table table-striped">
          <thead>
            <tr>
              {header}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  }

});
