import React from 'react';
import { ExternalLink } from '@keboola/indigo-ui';
import { Checkbox, Col, FormGroup } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    component: React.PropTypes.object.isRequired,
    licenseAgreed: React.PropTypes.bool.isRequired,
    handleAgreedLicense: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <FormGroup>
        <Col xs={9} xsOffset={3}>
          <Checkbox
            checked={this.props.licenseAgreed}
            onChange={event => {
              return this.props.handleAgreedLicense(event.target.checked);
            }}
          >
            {this._renderCheckboxLabel()}
          </Checkbox>
        </Col>
      </FormGroup>
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
