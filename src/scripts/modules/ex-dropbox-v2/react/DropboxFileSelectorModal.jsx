import { first, isEmpty } from 'underscore';
import React from 'react';
import ConfirmButtons from '../../../react/common/ConfirmButtons';
import {Modal, Tabs, Tab} from 'react-bootstrap';
import DropboxChooser from 'react-dropbox-chooser';
import { Button } from 'react-bootstrap';
import {getDestinationName} from '../actions/ApplicationActions.js';

export default React.createClass({
  propTypes: {
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
    canSaveConfig: React.PropTypes.func,
    saveConfig: React.PropTypes.func,
    cancelConfig: React.PropTypes.func,
    isSaving: React.PropTypes.bool,
    handleCsvSelectChange: React.PropTypes.func,
    selectedDropboxFiles: React.PropTypes.array
  },

  getInitialState() {
    return {
      activeTab: 'instant',
      name: '',
      link: ''
    };
  },

  handleCancelFunction() {
    this.props.cancelConfig();
    this.props.onHide();
  },

  handleSaveFunction() {
    if (this.state.activeTab === 'external') {
      const forceData = [{
        link: this.state.link,
        name: this.state.name,
        manualInsert: true
      }];
      return this.props.saveConfig(forceData).then(() => this.props.onHide());
    }
    return this.props.saveConfig().then(() => this.props.onHide());
  },

  goToTab(tab) {
    this.setState({
      activeTab: tab
    });
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Dropbox file selector</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs className="tabs-inside-modal" activeKey={this.state.activeTab} onSelect={this.goToTab} animation={false}
            id="ex-dropbox-v2-dropbox-file-selector-modal-tabs">
            <Tab eventKey="instant" title="Choose From Dropbox">
              <p>Please choose a CSV file you want to extract via Dropbox Chooser. It uses a pop up window, hence disable pop up blocking for this site in the browser settings.</p>
              <DropboxChooser
                appKey={'2is8jmvnwbchcyr'}
                cancel={() => {}}
                success={files => this.onSelectFiles(files)}
                multiselect={false}
                extensions={['.csv']} >
                <Button bsStyle="success">
                  <i className={Array.isArray(this.props.selectedDropboxFiles) && this.props.selectedDropboxFiles.length > 0 ?
                    'fa fa-fw fa-check-circle-o'
                    : 'fa fa-fw fa-dropbox'} />
                  Choose from Dropbox
                </Button>
              </DropboxChooser>
              {Array.isArray(this.props.selectedDropboxFiles) && this.props.selectedDropboxFiles.length > 0 &&
               <div>
                 <br />
                 <div>
                   <h4>Selected: {first(this.props.selectedDropboxFiles).name}</h4>
                 </div>
               </div>
              }
            </Tab>
            <Tab eventKey="external" title="Insert Link Manually">
              {this.renderManualInsert()}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Create file"
            isSaving={this.props.isSaving}
            onCancel={this.handleCancelFunction}
            onSave={this.handleSaveFunction}
            isDisabled={this.canSave()}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  canSave() {
    if (this.state.activeTab === 'external') {
      return isEmpty(this.state.name) || isEmpty(this.state.link);
    }
    return this.props.canSaveConfig();
  },

  onInsertLink(e) {
    const value = e.target.value;
    let name = this.state.name;
    if (isEmpty(name)) {
      name = getDestinationName(value.split('?')[0]);
    }
    this.setState({link: value, name: name});
  },

  renderManualInsert() {
    return (
      <div className="form form-horizontal">
        <div className="form-group">
          <label className="control-label col-xs-3">
            Link
          </label>
          <div className="col-xs-9">
            <input
              className="form-control"
              type="text"
              name="link"
              value={this.state.link}
              onChange={this.onInsertLink}
              autoFocus={true}
            />
            <span className="help-block">
              Link to a CSV file shared by a Dropbox account
            </span>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-3">
            Name
          </label>
          <div className="col-xs-9">
            <input
              className="form-control"
              type="text"
              name="name"
              value={this.state.name}
              onChange={(e) => this.setState({name: e.target.value})}
              autoFocus={true}
            />
            <span className="help-block">
              Name of the CSV file and the output table
            </span>
          </div>
        </div>
      </div>
    );
  },

  onSelectFiles(values = []) {
    this.props.handleCsvSelectChange(values);
  }

});
