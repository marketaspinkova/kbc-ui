import React, {PropTypes} from 'react';
import Select from 'react-select';
import {Alert, Col, ControlLabel, Modal, FormGroup, FormControl, HelpBlock} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import SyncActionError from '../../../../utils/SyncActionError';
import EmptyState from '../../../components/react/components/ComponentEmptyState';
import { DatasetLocations } from '../../constants';

const locationOptions = [
  {
    'label': 'United States',
    'value': DatasetLocations.MULTI_REGION_US
  },
  {
    'label': 'European Union',
    'value': DatasetLocations.MULTI_REGION_EU
  },
];

export default React.createClass({
  propTypes: {
    authorizedEmail: PropTypes.string,
    google: PropTypes.object.isRequired,
    projects: PropTypes.object.isRequired,
    isPendingFn: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onHideFn: PropTypes.func,
    saveFn: PropTypes.func.isRequired,
    loadAccountProjectsFn: PropTypes.func.isRequired,
    onChangeFn: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      errorMessage: null
    }
  },

  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      this.setState({ errorMessage: null });
      this.props.loadAccountProjectsFn().catch(SyncActionError, (error) => {
        this.setState({ errorMessage: error.message })
      })
    }
  },

  renderProjects(projects) {
    if (projects && projects.count() > 0) {
      const projectOptions = projects.map((project) => {
        return {
          'label': project.get('name'),
          'value': project.get('id')
        };
      }).toArray();

      return (
        <div className="form-horizontal">
          <FormGroup>
            <Col xs={3} componentClass={ControlLabel}>Select billable project</Col>
            <Col xs={9}>
              <Select
                key="projectId"
                name="projectId"
                clearable={false}
                value={this.props.google.get('projectId', '').toString()}
                onChange={({value: newValue}) => this.updateEditingValue('projectId', newValue)}
                options={projectOptions}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col xs={3} componentClass={ControlLabel}>Cloud storage bucket</Col>
            <Col xs={9}>
              <FormControl
                type="text"
                value={this.props.google.get('storage', '')}
                placeholder="gs://"
                onChange={(e) => this.updateEditingValue('storage', e.target.value)}
              />
            </Col>
          </FormGroup>
        </div>
      );
    }

    return (
      <EmptyState>The account has no projects</EmptyState>
    );
  },

  renderProjectSelect() {
    if (this.props.isPendingFn('projects')) {
      return (
        <FormGroup>
          <Loader/>
        </FormGroup>
      );
    }

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
          value={this.props.google.get('projectId', '').toString()}
          onChange={({value: newValue}) => this.updateEditingValue('projectId', newValue)}
          options={projectOptions}
        />
      );
    }

    return (
      <div className="form-control">
        <em>The account has no projects</em>
      </div>
    );
  },

  renderLocationSelect() {
    return (
      <Select
        key="location"
        name="location"
        clearable={false}
        searchable={false}
        value={this.props.google.get('location', DatasetLocations.MULTI_REGION_US).toString()}
        onChange={({value: newValue}) => this.updateEditingValue('location', newValue)}
        options={locationOptions}/>
    );
  },

  renderForm() {
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col xs={3} componentClass={ControlLabel}>Select billable project</Col>
          <Col xs={9}>
            {this.renderProjectSelect()}
            <HelpBlock>
              BigQuery charges for data storage, streaming inserts, and for querying data.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={3} componentClass={ControlLabel}>Cloud Storage bucket</Col>
          <Col xs={9}>
            <FormControl
              type="text"
              value={this.props.google.get('storage', '')}
              placeholder="gs://some-bucket-name"
              onChange={(e) => this.updateEditingValue('storage', e.target.value)}
            />
            <HelpBlock>
              Existing Google Cloud Storage bucket. There will be data temporarily exported,
              before load to KBC.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={3} componentClass={ControlLabel}>Dataset location</Col>
          <Col xs={9}>
            {this.renderLocationSelect()}
            <HelpBlock>
              The geographic location where source data exists.
            </HelpBlock>
          </Col>
        </FormGroup>
      </div>
    );
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            Google configuration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderLoadingListError()}
          {this.renderForm()}
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={this.props.isPendingFn('projectId') || false}
            isDisabled={!this.isGoogleValid(this.props.google)}
            onSave={this.handleSave}
            onCancel={this.handleHide}
            saveLabel="Save Changes"
          />
        </Modal.Footer>
      </Modal>
    );
  },

  renderLoadingListError() {
    if (this.state.errorMessage === null) {
      return null;
    }

    return (
      <Alert bsStyle="warning">
        <p><strong>Loading projects list failed</strong></p>
        <p>{this.state.errorMessage}</p>
      </Alert>
    );
  },

  isGoogleValid(google) {
    return google && !!google.get('projectId') && !!google.get('storage');
  },

  updateEditingValue(item, newValue) {
    const newGoogle = this.props.google.set(item, newValue);
    this.props.onChangeFn(newGoogle);
  },

  handleHide() {
    this.setState({
      errorMessage: null
    }, this.props.onHideFn);
  },

  handleSave() {
    this.props.saveFn(this.props.google);
  }
});
