import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { ExternalLink } from '@keboola/indigo-ui';
import { Input } from './../../../../react/common/KbcBootstrap';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: PropTypes.shape({
      awsAccessKeyId: PropTypes.string.isRequired,
      awsSecretAccessKey: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;
    return (
      <div className="form-horizontal">
        <Input
          type="text"
          label="Access Key Id"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.awsAccessKeyId}
          onChange={function(e) {
            props.onChange({awsAccessKeyId: e.target.value});
          }}
          placeholder="MYAWSACCESSKEYID123"
          disabled={this.props.disabled}
          help={(
            <span>
              Make sure that this AWS Access Key ID has correct permissions. Required permissions are
              <ul>
                <li><code>s3:GetObject</code> for the given key/wildcard</li>
                <li><code>s3:ListBucket</code> to access all wildcard files</li>
                <li><code>s3:GetBucketLocation</code> to determine the bucket region</li>
              </ul>
              More information is available in the <ExternalLink href="https://help.keboola.com/extractors/storage/aws-s3/">documentation</ExternalLink>.
            </span>
          )}
        />
        <Input
          type="password"
          label="Secret Access Key"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.awsSecretAccessKey}
          onChange={function(e) {
            props.onChange({awsSecretAccessKey: e.target.value});
          }}
          help={(<span>The AWS Secret Access Key will be encrypted.</span>)}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
});
