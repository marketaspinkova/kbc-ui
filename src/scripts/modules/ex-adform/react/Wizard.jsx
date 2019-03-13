import PropTypes from 'prop-types';
import React from 'react';
import {Button, Tabs, Tab} from 'react-bootstrap';
import {Steps} from '../constants';
import Select from 'react-select';
import CredentialsForm from './CredentialsForm';
import {Loader} from '@keboola/indigo-ui';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';

export default React.createClass({
  propTypes: {
    credentials: PropTypes.object.isRequired,
    onCredentialsChange: PropTypes.func.isRequired,
    template: PropTypes.string.isRequired,
    templates: PropTypes.object.isRequired,
    onTemplateChange: PropTypes.func.isRequired,
    step: PropTypes.string.isRequired,
    onStepChange: PropTypes.func.isRequired,
    isSaving: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    componentId: PropTypes.string.isRequired,
    configurationId: PropTypes.string.isRequired
  },

  render() {
    return (
      <Tabs activeKey={this.props.step} onSelect={this.goToStep} animation={false} id="wizardtab">
        <Tab eventKey={Steps.STEP_CREDENTIALS} title="1. Credentials">
          <div className="row">
            <div className="col-sm-8">
              <CredentialsForm
                credentials={this.props.credentials}
                onChange={this.props.onCredentialsChange}
              />
              <div className="text-right">
                <DeleteConfigurationButton
                  componentId={this.props.componentId}
                  configId={this.props.configurationId}
                />
                <Button
                  style={{marginLeft: '20px'}}
                  bsStyle="primary"
                  disabled={!this.isCredentialsValid()}
                  onClick={this.goToTemplate}
                >
                    Next: Select Template
                </Button>
              </div>
            </div>
          </div>
        </Tab>
        <Tab eventKey={Steps.STEP_TEMPLATE} title="2. Template" disabled={!this.isCredentialsValid()}>
          <div className="row">
            <div className="col-sm-8">
              <p>Please select from the predefined templates to initialize the Adform configuration:</p>
              <div className="form-group">
                <Select
                  name="jobTemplates"
                  value={this.props.template}
                  options={this.props.templates}
                  onChange={this.props.onTemplateChange}
                  placeholder="Select template"
                />
                <p className="help-block">
                    You can change or extend it to fetch more or other data later.
                </p>
              </div>
              <div className="text-right">
                {this.props.isSaving ? <Loader/> : null}
                  &nbsp;
                  &nbsp;
                <DeleteConfigurationButton
                  componentId={this.props.componentId}
                  configId={this.props.configurationId}
                />
                <Button
                  bsStyle="link"
                  style={{marginLeft: '10px'}}
                  onClick={this.goToCredentials}
                  disabled={this.props.isSaving}
                >
                    Previous
                </Button>
                <Button
                  bsStyle="success"
                  disabled={!this.props.template || this.props.isSaving}
                  onClick={this.props.onSave}
                >
                    Create Extractor
                </Button>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    );
  },

  isCredentialsValid() {
    return this.props.credentials.get('username').trim().length > 0 &&
      this.props.credentials.get('#password').trim().length > 0;
  },

  goToCredentials() {
    this.goToStep(Steps.STEP_CREDENTIALS);
  },

  goToTemplate() {
    this.goToStep(Steps.STEP_TEMPLATE);
  },

  goToStep(step) {
    this.props.onStepChange(step);
  }
});
