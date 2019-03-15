import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { ExternalLink } from '@keboola/indigo-ui';
import { ControlLabel, FormControl, Col, HelpBlock, FormGroup} from 'react-bootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      awsAccessKeyId: PropTypes.string.isRequired,
      awsSecretAccessKey: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="form-horizontal">
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Access Key Id</Col>
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
              Make sure that this AWS Access Key ID has correct permissions. Required permissions are
              <ul>
                <li><code>s3:GetObject</code> for the given key/wildcard</li>
                <li><code>s3:ListBucket</code> to access all wildcard files</li>
                <li><code>s3:GetBucketLocation</code> to determine the bucket region</li>
              </ul>
              More information is available in the{' '}
              <ExternalLink href="https://help.keboola.com/extractors/storage/aws-s3/">documentation</ExternalLink>.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} xs={4}>Secret Access Key</Col>
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
      </div>
    );
  }
});
