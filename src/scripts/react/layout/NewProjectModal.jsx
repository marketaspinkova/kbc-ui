import React, {PropTypes} from 'react';
import {Modal, FormControl, FormGroup, Col, ControlLabel, Radio, HelpBlock} from 'react-bootstrap';
import ConfirmButtons from '../common/ConfirmButtons';
import numeral from 'numeral';

export default React.createClass({
  propTypes: {
    xsrf: PropTypes.string.isRequired,
    organizations: PropTypes.object.isRequired,
    selectedOrganizationId: PropTypes.number,
    urlTemplates: PropTypes.object.isRequired,
    projectTemplates: PropTypes.object.isRequired,
    isOpen: PropTypes.bool,
    showOrganizationsSelect: PropTypes.bool,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      name: '',
      organizationId: this.props.selectedOrganizationId,
      type: 'poc',
      isSaving: false
    };
  },

  getDefaultProps() {
    return {
      showOrganizationsSelect: true
    };
  },

  render() {
    return (
      <Modal show={this.props.isOpen} onHide={this.props.onHide}>
        <Modal.Header>
          <Modal.Title>New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            className="form-horizontal"
            ref="projectCreateForm"
            method="post"
            action={this.props.urlTemplates.get('createProject')}
          >
            <FormGroup>
              <Col componentClass={ControlLabel} sm={4}>Name</Col>
              <Col sm={6}>
                <FormControl
                  name="name"
                  autoFocus
                  value={this.state.name}
                  onChange={this.handleNameChange}
                  placeholder="My Project"
                />
              </Col>
            </FormGroup>
            {this.organization()}
            <FormControl
              type="hidden"
              name="xsrf"
              value={this.props.xsrf}
            />
            {this.typesGroup()}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isDisabled={!this.isValid()}
            isSaving={this.state.isSaving}
            saveLabel="Create Project"
            saveStyle="primary"
            onCancel={this.props.onHide}
            onSave={this.handleCreate}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  organization() {
    if (!this.props.showOrganizationsSelect) {
      return (
        <input
          type="hidden"
          name="organizationId"
          value={this.props.selectedOrganizationId}
        />
      );
    } else {
      return (
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>Organization</Col>
          <Col sm={6}>
            <FormControl
              componentClass="select"
              name="organizationId"
              value={this.state.organizationId}
              onChange={this.handleOrganizationChange}
            >
              {this.organizationOptions()}
            </FormControl>
          </Col>
        </FormGroup>
      );
    }
  },

  organizationOptions() {
    return this.props.organizations.map( (organization) => {
      return (
        <option value={organization.get('id')} key={organization.get('id')}>
          {organization.get('name')}
        </option>
      );
    }).toArray();
  },

  typesGroup() {
    return (
      <div>
        <div className="form-group">
          <label className="control-label col-sm-4">
            Type
          </label>
          <div className="col-sm-6">
            <p className="form-control-static">
              <span className="help-block">
                      Project can be upgraded anytime later.
              </span>
            </p>
          </div>
        </div>
        {this.types()}
      </div>
    );
  },

  types() {
    return this.props.projectTemplates.map((template) => {
      return (
        <FormGroup key={template.get('stringId')}>
          <Col sm={6} smOffset={4}>
            <Radio
              name="type"
              checked={template.get('stringId') === this.state.type}
              value={template.get('stringId')}
              onChange={this.handleTypeChange}
            >
              {template.get('name')}
            </Radio>
            <HelpBlock>
              {this.help(template)}
            </HelpBlock>
          </Col>
        </FormGroup>
      );
    });
  },

  help(template) {
    const price = template.get('billedMonthlyPrice') ?
      <span><br/>{`$${numeral(template.get('billedMonthlyPrice')).format('0,0')} / month`}</span> : null;
    return (
      <span>
        {template.get('description')}

        {price}
      </span>
    );
  },

  handleNameChange(e) {
    this.setState({
      name: e.target.value
    });
  },

  handleOrganizationChange(e) {
    this.setState({
      organizationId: e.target.value
    });
  },

  handleTypeChange(e) {
    this.setState({
      type: e.target.value
    });
  },

  isValid() {
    return this.state.name !== '';
  },

  handleCreate() {
    this.setState({
      isSaving: true
    });
    this.refs.projectCreateForm.submit();
  }
});
