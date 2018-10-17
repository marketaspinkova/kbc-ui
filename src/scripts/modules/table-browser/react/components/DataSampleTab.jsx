import React, {PropTypes} from 'react';

import immutableMixin from 'react-immutable-render-mixin';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import {Table} from 'react-bootstrap';

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

    if (dataPreview.count() === 0) {
      return (
        <EmptyState>
          No Data.
        </EmptyState>
      );
    }

    const header = dataPreview.first().map( (c, idx) => {
      return (
        <th key={idx}>
          {c}
        </th>
      );
    }).toArray();
    const rows = dataPreview.rest().map( (row, ridx) => {
      const cols = row.map( (c, cidx) => {
        return (<td key={cidx}> {c} </td>);
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
