import React from 'react';
import Select from 'react-select';
import {ConfirmButtons} from '@keboola/indigo-ui';
import {Modal} from 'react-bootstrap';

export default React.createClass({

  propTypes: {
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
    dropboxFiles: React.PropTypes.array,
    canSaveConfig: React.PropTypes.func,
    saveConfig: React.PropTypes.func,
    cancelConfig: React.PropTypes.func,
    isSaving: React.PropTypes.bool,
    selectedCsvFiles: React.PropTypes.func,
    selectedInputBucket: React.PropTypes.func,
    handleCsvSelectChange: React.PropTypes.func,
    handleBucketChange: React.PropTypes.func,
    keboolaBuckets: React.PropTypes.array
  },

  handleCancelFunction() {
    this.props.cancelConfig();
    this.props.onHide();
  },

  handleSaveFunction() {
    this.props.saveConfig().then(() => this.props.onHide());
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Dropbox file selector</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="section well">
            <h3 className="section-heading">1.Please specify CSV files you want to upload to Keboola Storage.</h3>

            <Select
              multi
              placeholder="Select CSV files from Dropbox"
              options={this.props.dropboxFiles}
              value={this.props.selectedCsvFiles()}
              onChange={this.onSelectFile}
            />
          </div>
          <div className="section well">
            <h3 className="section-heading">2. Please specify a KBC Bucket where the files will be uploaded.</h3>
            <Select
              ref="stateSelect"
              options={this.props.keboolaBuckets}
              value={this.props.selectedInputBucket()}
              placeholder="Select a Bucket from the Keboola Storage"
              onChange={this.onSelectBucket}
              searchalble={true}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Save"
            isSaving={this.props.isSaving}
            onCancel={this.handleCancelFunction}
            onSave={this.handleSaveFunction}
            isDisabled={this.props.canSaveConfig()}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  onSelectBucket(selected) {
    this.props.handleBucketChange(selected ? selected.value : '');
  },

  onSelectFile(values) {
    this.props.handleCsvSelectChange(values ? values.map(v => v.value) : []);
  }
});
