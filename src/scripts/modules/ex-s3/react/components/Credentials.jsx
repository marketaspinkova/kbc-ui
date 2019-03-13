import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { Col, FormGroup, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    awsAccessKeyId: PropTypes.string.isRequired,
    awsSecretAccessKey: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  onChangeAwsAccessKeyId(e) {
    this.props.onChange('awsAccessKeyId', e.target.value);
  },

  onChangeAwsSecretAccessKey(e) {
    this.props.onChange('awsSecretAccessKey', e.target.value);
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
              value={this.props.awsAccessKeyId}
              onChange={this.onChangeAwsAccessKeyId}
              placeholder="MYAWSACCESSKEYID123"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              <span>
                Make sure that this AWS Access Key ID has correct permissions. Required permissions are
                <ul>
                  <li><code>s3:GetObject</code> for the given key/wildcard</li>
                  <li><code>s3:ListBucket</code> to access all wildcard files</li>
                  <li><code>s3:GetBucketLocation</code> to determine bucket region</li>
                </ul>
                More information is available in the <ExternalLink href="https://help.keboola.com/extractors/storage/simple-aws-s3/">documentation</ExternalLink>.
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
              value={this.props.awsSecretAccessKey}
              onChange={this.onChangeAwsSecretAccessKey}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              The AWS Secret Access Key will be encrypted.
            </HelpBlock>
          </Col>
        </FormGroup>
      </div>
    );
  }
});
