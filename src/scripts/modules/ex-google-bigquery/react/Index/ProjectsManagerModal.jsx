import React, {PropTypes} from 'react';
import {Input} from './../../../../react/common/KbcBootstrap';
import {Modal} from 'react-bootstrap';
import Select from 'react-select';

import {Loader} from '@keboola/indigo-ui';

import ConfirmButtons from '../../../../react/common/ConfirmButtons';

import EmptyState from '../../../components/react/components/ComponentEmptyState';

export default React.createClass({

  propTypes: {
    authorizedEmail: PropTypes.string,
    google: PropTypes.object.isRequired,
    projects: PropTypes.object.isRequired,
    isPendingFn: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func,
    saveFn: PropTypes.func.isRequired,
    onChangeFn: PropTypes.func.isRequired
  },

  renderProjects(projects) {
    if (projects && projects.count() > 0) {
      const projectOptions = projects.map((project) => {
        return {
          'label': project.get('name'),
          'value': project.get('id')
        };
      }).toList().toJS();
      return (
        <div className="form-horizontal clearfix">
          <div className="row col-md-12">
            <div className="form-group">
              <label className="col-xs-3 control-label">Select billable project</label>
              <div className="col-xs-9">
                <Select
                  key="projectId"
                  name="projectId"
                  clearable={false}
                  disabled={false}
                  value={this.props.google.get('projectId', '').toString()}
                  onChange= {({value: newValue}) => this.updateEditingValue('projectId', newValue)}
                  options= {projectOptions}/>
              </div>
            </div>
            <div className="form-group">
              <label className="col-xs-3 control-label">Cloud storage bucket</label>
              <div className="col-xs-9">
                <Input
                  type="text"
                  className="form-control"
                  value={this.props.google.get('storage', '')}
                  placeholder="gs://"
                  onChange= {(e) => this.updateEditingValue('storage', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <EmptyState>The account has no projects</EmptyState>
      );
    }
  },

  renderProjectSelect() {
    if (this.props.isPendingFn('projects')) {
      return (
        <div
          className="form-group">
          <Loader/>
        </div>
      );
    } else {
      const projects = this.props.projects;
      if (projects && projects.count() > 0) {
        const projectOptions = projects.map((project) => {
          return {
            'label': project.get('name'),
            'value': project.get('id')
          };
        }).toList().toJS();
        return (
          <Select
            key="projectId"
            name="projectId"
            clearable={false}
            disabled={false}
            value={this.props.google.get('projectId', '').toString()}
            onChange= {({value: newValue}) => this.updateEditingValue('projectId', newValue)}
            options= {projectOptions}/>
        );
      } else {
        return (
          <div
            className="form-control">
            <em>The account has no projects</em>
          </div>
        );
      }
    }
  },

  renderForm() {
    return (
      <div className="form-horizontal clearfix">
        <div className="row col-md-12">
          <div className="form-group">
            <label className="col-xs-3 control-label">Select billable project</label>
            <div className="col-xs-9">
              { this.renderProjectSelect() }
              <div className="help-block">BigQuery charges for data storage, streaming inserts, and for querying data.</div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-xs-3 control-label">Cloud Storage bucket</label>
            <div className="col-xs-9">
              <Input
                type="text"
                className="form-control"
                value={this.props.google.get('storage', '')}
                placeholder="gs://some-bucket-name"
                onChange= {(e) => this.updateEditingValue('storage', e.target.value)}
              />
              <div className="help-block">Existing Google Cloud Storage bucket. There will be data temporarily exported, before load to KBC.</div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHideFn}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Google configuration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { this.renderForm() }
          <div className="row">
            <div className="table kbc-table-border-vertical kbc-detail-table" style={{borderBottom: 0}}>
              <div className="tr">
                <div className="td" />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isPendingFn('projectId')}
            isDisabled={!this.isGoogleValid(this.props.google)}
            onSave={this.handleSave}
            onCancel={this.props.onHideFn}
            saveLabel="Save Changes"
          />

        </Modal.Footer>
      </Modal>
    );
  },

  isGoogleValid(google) {
    return google && !!google.get('projectId') && !!google.get('storage');
  },

  updateEditingValue(item, newValue) {
    const newGoogle = this.props.google.set(item, newValue);
    this.props.onChangeFn(newGoogle);
  },

  handleSave() {
    this.props.saveFn(this.props.google);
  }
});
