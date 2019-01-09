import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Table } from 'react-bootstrap';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    jobs: PropTypes.object.isRequired
  },

  render() {
    if (!this.props.jobs.count()) {
      return null;
    }

    return (
      <div>
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>{this.props.jobs.map(this.renderRow).toArray()}</tbody>
        </Table>
      </div>
    );
  },

  renderRow(file) {
    return (
      <tr key={file.get('id')}>
        <td>{file.get('id')}</td>
      </tr>
    );
  }
});
