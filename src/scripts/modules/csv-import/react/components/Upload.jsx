import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import {ProgressBar} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    onStartUpload: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    isValid: PropTypes.bool.isRequired,
    isFileTooBig: PropTypes.bool.isRequired,
    isFileInvalidFormat: PropTypes.bool.isRequired,
    isUploading: PropTypes.bool.isRequired,
    uploadingMessage: PropTypes.string.isRequired,
    uploadingProgress: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  onChange(e) {
    this.props.onChange(e.target.files[0]);
  },

  uploadStatus() {
    if (!this.props.isUploading) {
      return null;
    }
    return (
      <div className="form-group">
        <div className="col-xs-8 col-xs-offset-4">
          <div className="form-control-static">
            {this.props.uploadingMessage}
            <ProgressBar
              active
              now={this.props.uploadingProgress}
            />
          </div>
        </div>
      </div>
    );
  },

  fileInputHelp() {
    if (this.props.isFileInvalidFormat) {
      return (
        <div className="help-block">
          <small>
            Only <code>.csv</code>, <code>.tsv</code> and <code>.gz</code> (gzipped CSV or TSV) files are supported.
          </small>
        </div>
      );
    }
    if (this.props.isFileTooBig) {
      return (
        <div className="help-block">
          <small>The CSV file is larger than 100MB, your upload may not be successful.
            Please refer to <a
            href="https://developers.keboola.com/integrate/storage/api/importer/">documentation</a>
          {' '}to perform a manual import using command line or other tools.
          </small>
        </div>
      );
    }
    return null;
  },

  uploadButtonCaption() {
    if (this.props.isUploading) {
      return (<Loader />);
    }
    return 'Upload';
  },

  render() {
    return (
      <div className="form-horizontal">
        <div className="form-group">
          <label className="control-label col-xs-4">
            <span>Select file</span>
          </label>
          <div className="col-xs-4">
            <input
              className="form-control-static"
              type="file"
              label="Select file"
              onChange={this.onChange}
              disabled={this.props.isUploading}
            />
            {this.fileInputHelp()}
          </div>
          <div className="col-xs-4">
            <button
              className="btn btn-success pull-right"
              onClick={this.props.onStartUpload}
              disabled={!this.props.isValid || this.props.disabled || this.props.isUploading}
            >
              {this.uploadButtonCaption()}
            </button>
          </div>
        </div>
        {this.uploadStatus()}
      </div>
    );
  }
});
