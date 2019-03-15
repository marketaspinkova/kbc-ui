import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import { Col, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      awsAccessKeyId: PropTypes.string.isRequired,
      awsSecretAccessKey: PropTypes.string.isRequired,
      bucket: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col xs={4} componentClass={ControlLabel}>
            Access Key Id
          </Col>
          <Col xs={8}>
            <FormControl
              type="text"
              value={this.props.value.awsAccessKeyId}
              onChange={(e) => {
                this.props.onChange({awsAccessKeyId: e.target.value});
              }}
              placeholder="MYAWSACCESSKEYID123"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              <span>
                Make sure that this AWS Access Key ID has correct permissions. Required permissions are
                <ul>
                  <li><code>s3:PutObject</code> to upload files</li>
                  <li><code>s3:GetBucketLocation</code> to determine the bucket region</li>
                </ul>
              </span>
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={4} componentClass={ControlLabel}>
            Secret Access Key
          </Col>
          <Col xs={8}>
            <FormControl
              type="password"
              value={this.props.value.awsSecretAccessKey}
              onChange={(e) => {
                this.props.onChange({awsSecretAccessKey: e.target.value});
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              The AWS Secret Access Key will be encrypted.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col xs={4} componentClass={ControlLabel}>
            S3 Bucket
          </Col>
          <Col xs={8}>
            <FormControl
              type="text"
              placeholder="mybucket"
              value={this.props.value.bucket}
              onChange={(e) => {
                this.props.onChange({bucket: e.target.value});
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Name of the target AWS S3 bucket.
            </HelpBlock>
          </Col>
        </FormGroup>
      </div>
    );
  }
});
