import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import ModalHandler from '../../../sapi-events/sliced-files-downloader/ModalHandler';
import Tooltip from '../../../../react/common/Tooltip';

export default React.createClass({
  propTypes: {
    file: PropTypes.object
  },

  render() {
    if (this.props.file.get('isSliced')) {
      return this.renderSlicedFileDownloadModalTrigger();
    }

    return this.renderSimpleDownloadLink();
  },

  renderSlicedFileDownloadModalTrigger() {
    return (
      <ModalHandler file={this.props.file}>
        <Tooltip placement="top" tooltip="Download file">
          <Button bsStyle="link">
            <i className="fa fa-arrow-circle-o-down" />
          </Button>
        </Tooltip>
      </ModalHandler>
    );
  },

  renderSimpleDownloadLink() {
    return (
      <Tooltip placement="top" tooltip="Download file">
        <a className="btn btn-link" href={this.props.file.get('url')}>
          <i className="fa fa-arrow-circle-o-down" />
        </a>
      </Tooltip>
    );
  }
});
