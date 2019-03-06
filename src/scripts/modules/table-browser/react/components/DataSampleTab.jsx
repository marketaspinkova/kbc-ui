import React, {PropTypes} from 'react';

import PureRenderMixin from 'react-addons-pure-render-mixin';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import StorageTableDataPreviewItem from '../../../../react/common/StorageTableDataPreviewItem';
import {Table} from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    dataPreview: PropTypes.object,
    dataPreviewError: PropTypes.string
  },

  mixins: [PureRenderMixin],

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

    const header = dataPreview.columns.map( (c, idx) => {
      return (
        <th key={idx}>
          {c}
        </th>
      );
    });
    const rows = dataPreview.rows.map((row, ridx) => {
      const cols = row.map((item, index) => {
        return (
          <td key={index}>
            <StorageTableDataPreviewItem item={item} />
          </td>
        );
      });
      return (
        <tr key={ridx}>
          {cols}
        </tr>);
    });

    return (
      <div style={{maxHeight: '80vh', overflow: 'auto'}}>
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
