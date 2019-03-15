import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import FileSize from '../../../react/common/FileSize';
import ModalHandler from '../sliced-files-downloader/ModalHandler';

export default createReactClass({
  propTypes: {
    file: PropTypes.object,
    showFilesize: PropTypes.bool,
    linkClass: PropTypes.string,
    children: PropTypes.any
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
        <span className={this.props.linkClass}>
          {this.renderBody()} {this.renderFilesize()}
        </span>
      </ModalHandler>
    );
  },

  renderSimpleDownloadLink() {
    return (
      <a href={this.props.file.get('url')} className={this.props.linkClass}>
        {this.renderBody()} {this.renderFilesize()}
      </a>
    );
  },

  renderBody() {
    return this.props.children || this.props.file.get('name');
  },

  renderFilesize() {
    if (!this.props.showFilesize) {
      return null;
    }

    return <span><FileSize size={this.props.file.get('sizeBytes')} /></span>;
  }
});
