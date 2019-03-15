import PropTypes from 'prop-types';
import React from 'react';
import { Constants } from './Constants';
import { Col, ControlLabel, FormGroup, HelpBlock, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';

const availableEndpoints = [
  {
    label: 'Reporting API',
    value: Constants.ENDPOINT_REPORT
  },
  {
    label: 'Multi-Channel Funnels API',
    value: Constants.ENDPOINT_MCF
  },
];

export default React.createClass({
  propTypes: {
    selectedValue: PropTypes.string.isRequired,
    onSelectValue: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <FormGroup>
        <ControlLabel className="col-md-2">
          {this.props.name}
        </ControlLabel>
        <Col md={10}>
          <ToggleButtonGroup
            name="endpoint"
            value={this.props.selectedValue}
            onChange={this.props.onSelectValue}
          >
            {availableEndpoints.map((item) => {
              return (
                <ToggleButton key={`endpoint-${item.value}`} value={item.value} disabled={this.props.disabled}>
                  {item.label}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
          <HelpBlock>
            Switch between core{' '}
            <ExternalLink href="https://developers.google.com/analytics/devguides/reporting/core/v4/">
              Reporting API
            </ExternalLink>
            {' '}and{' '}
            <ExternalLink href="https://developers.google.com/analytics/devguides/reporting/mcf/v3/">
              Multi-Channel Funnels API
            </ExternalLink>
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  }
});
