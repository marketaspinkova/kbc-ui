import PropTypes from 'prop-types';
import React from 'react';
import {OrderedMap} from 'immutable';
import {Button, Col, Checkbox, FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    parameters: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    isValid: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    savedMessage: PropTypes.object
  },

  render() {
    return (
      <div className="form-horizontal">
        {this.input('AWS Access Key ID', 'awsAccessKeyId', '', 'text', true)}
        {this.input('AWS Secret Access Key', '#awsSecretAccessKey', '', 'password')}
        <FormGroup>
          <Col xs={4} componentClass={ControlLabel}>
            S3 Region
          </Col>
          <Col xs={8}>
            <FormControl
              componentClass="select"
              value={this.props.parameters.get('s3region')}
              onChange={this.handleChange.bind(this, 's3region')}
            >
              {this.regionOptions()}
            </FormControl>
          </Col>
        </FormGroup>
        {this.input('S3 Bucket', 's3bucket', 'my-bucket')}
        {this.input('S3 Path', 's3path', 'Optional path in S3')}
        <FormGroup>
          <Col xs={8} xsOffset={4}>
            <Checkbox
              checked={this.props.parameters.get('onlyStructure')}
              onChange={this.handleOnlyStructureChange}
            >
              Export project structure only
            </Checkbox>
            <HelpBlock>
              Only bucket and table metadata and component configurations will be exported.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={8} xsOffset={4}>
            <HelpBlock>
              Data wil be exported to <strong>{this.s3Path()}</strong>
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={8} xsOffset={4}>
            <Button bsStyle="success" onClick={this.props.onRun} disabled={!this.props.isValid || this.props.isSaving}>
              Run Export
            </Button> {this.loader()} {this.props.savedMessage}
          </Col>
        </FormGroup>
      </div>
    );
  },

  input(label, field, placeholder, type = 'text', autoFocus = false) {
    return (
      <FormGroup>
        <Col xs={4} componentClass={ControlLabel}>
          {label}
        </Col>
        <Col xs={8}>
          <FormControl
            type={type}
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={this.props.parameters.get(field)}
            onChange={this.handleChange.bind(this, field)}
          />
        </Col>
      </FormGroup>
    );
  },

  s3Path() {
    const s3path = `s3://${this.props.parameters.get('s3bucket')}`;
    const path = this.props.parameters.get('s3path');

    if (!this.props.parameters.get('s3bucket')) {
      return s3path;
    }

    if (!path) {
      return s3path + '/';
    }
    
    return s3path + (path[0] === '/' ? path : `/${path}`);
  },

  regionOptions() {
    const regions = OrderedMap({
      'us-east-1': 'US East (N. Virginia)',
      'us-east-2': 'US East (Ohio)',
      'us-west-2': 'US West (Oregon)',
      'us-west-1': 'US West (N. California)',
      'ca-central-1': 'Canada (Central)',
      'eu-west-1': 'EU (Ireland)',
      'eu-west-2': 'EU (London)',
      'eu-central-1': 'EU (Frankfurt)',
      'ap-south-1': 'Asia Pacific (Mumbai)',
      'ap-southeast-1': 'Asia Pacific (Singapore)',
      'ap-southeast-2': 'Asia Pacific (Sydney)',
      'ap-northeast-1': 'Asia Pacific (Tokyo)',
      'ap-northeast-2': 'Asia Pacific (Seoul)',
      'sa-east-1': 'South America (Sao Paulo)'
    });

    return regions.map((regionName, regionValue) => {
      return <option value={regionValue} key={regionValue}>{regionName}</option>;
    });
  },

  loader() {
    return this.props.isSaving ? <Loader /> : null;
  },

  handleChange(field, event) {
    this.props.onChange(this.props.parameters.set(field, event.target.value));
  },

  handleOnlyStructureChange(event) {
    this.props.onChange(this.props.parameters.set('onlyStructure', event.target.checked));
  }
});
