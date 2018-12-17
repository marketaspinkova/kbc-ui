import React from 'react';
import filesize from 'filesize';
import { ExternalLink } from '@keboola/indigo-ui';
import ModalHandler from '../sliced-files-downloader/ModalHandler';

export default React.createClass({
  propTypes: {
    file: React.PropTypes.object,
    showFilesize: React.PropTypes.bool,
    children: React.PropTypes.any
  },

  getDefaultProps() {
    return {
      showFilesize: true
    };
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
        <span>
          {this.renderBody()} {this.renderFilesize()}
        </span>
      </ModalHandler>
    );
  },

  renderSimpleDownloadLink() {
    return (
      <ExternalLink href={this.props.file.get('url')}>
        {this.renderBody()} {this.renderFilesize()}
      </ExternalLink>
    );
  },

  renderBody() {
    return this.props.children || this.props.file.get('name');
  },

  renderFilesize() {
    if (!this.props.showFilesize) {
      return null;
    }

    return <span>({filesize(this.props.file.get('sizeBytes'))})</span>;
  }
});
