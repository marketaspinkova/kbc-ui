import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Table, Button } from 'react-bootstrap';
import { format } from '../../../../utils/date';
import Clipboard from '../../../../react/common/Clipboard';
import FileSize from '../../../../react/common/FileSize';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    files: PropTypes.object.isRequired,
    onSearchById: PropTypes.func.isRequired,
    onSearchByTag: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      fileDetail: null
    };
  },

  render() {
    if (!this.props.files.count()) {
      return null;
    }

    return (
      <div>
        <Table responsive stripped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Uploaded</th>
              <th>Name</th>
              <th>Size</th>
              <th>Public</th>
              <th>Encrypted</th>
              <th>Permanent</th>
              <th>Creator</th>
              <th>Tags</th>
              <th />
            </tr>
          </thead>
          <tbody>{this.props.files.map(this.renderRow).toArray()}</tbody>
        </Table>
      </div>
    );
  },

  renderRow(file) {
    return (
      <tr key={file.get('id')} className="kbc-cursor-pointer">
        <td>
          <Button className="btn btn-link" onClick={() => this.props.onSearchById(file.get('id'))}>
            {file.get('id')}
          </Button>
        </td>
        <td>{format(file.get('created'))}</td>
        <td>{file.get('name')}</td>
        <td>
          <FileSize size={file.get('sizeBytes')} />
        </td>
        <td>{file.get('isPublic') ? <i className="fa fa-check" /> : <i className="fa fa-times" />}</td>
        <td>{file.get('isEncrypted') ? <i className="fa fa-check" /> : <i className="fa fa-times" />}</td>
        <td>{this.expiration(file)}</td>
        <td>
          <span>{file.getIn(['creatorToken', 'description'])}</span>
        </td>
        <td>
          {file.get('tags').map((tag, index) => (
            <Button key={index} bsSize="sm" onClick={() => this.props.onSearchByTag(tag)}>
              {tag}
            </Button>
          ))}
        </td>
        <td>
          <Clipboard text={file.get('url')} tooltipPlacement="top" />
        </td>
      </tr>
    );
  },

  expiration() {
    return 'N/A';
  }
});
