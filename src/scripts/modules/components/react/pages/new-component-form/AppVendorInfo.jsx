import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import { Input } from '../../../../../react/common/KbcBootstrap';

export default React.createClass({
  propTypes: {
    component: React.PropTypes.object.isRequired,
    licenseAgreed: React.PropTypes.bool.isRequired,
    handleAgreedLicense: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div className="form-group">
        <div className="col-xs-9 col-xs-offset-3">
          <Input
            type="checkbox"
            label={this._renderCheckboxLabel()}
            checked={this.props.licenseAgreed}
            onChange={event => {
              return this.props.handleAgreedLicense(event.target.checked);
            }}
          />
        </div>
      </div>
    );
  },

  _renderCheckboxLabel() {
    const licenseUrl = this.props.component.getIn(['data', 'vendor', 'licenseUrl'], null);
    const msg = 'I agree with ';

    if (!licenseUrl) {
      return `${msg}vendor license terms and conditions`;
    }

    return (
      <span>
        {`${msg}`}
        <ExternalLink href={licenseUrl}>vendor license terms and conditions</ExternalLink>.
      </span>
    );
  }
});
