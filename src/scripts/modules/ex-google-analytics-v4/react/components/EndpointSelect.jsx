import React, {PropTypes} from 'react';
import Select from 'react-select';
import { Constants } from './Constants';
import {FormGroup} from 'react-bootstrap';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import Col from 'react-bootstrap/es/Col';
import HelpBlock from 'react-bootstrap/es/HelpBlock';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    selectedValue: PropTypes.string.isRequired,
    onSelectValue: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired
  },

  render() {
    return (
      <FormGroup>
        <ControlLabel className="col-md-2">
          {this.props.name}
        </ControlLabel>
        <Col md={10}>
          <Select
            value={this.prepareValue(this.props.selectedValue)}
            options={this.getOptions()}
            onChange={this.props.onSelectValue}
            name={name}
            clearable={false}
          />
          <HelpBlock>
            Switch between core &nbsp;
            <ExternalLink href="https://developers.google.com/analytics/devguides/reporting/core/v4/">
              Reporting API
            </ExternalLink>
            &nbsp;and&nbsp;
            <ExternalLink href="https://developers.google.com/analytics/devguides/reporting/mcf/v3/">
              Multi-Channel Funnels API
            </ExternalLink>
          </HelpBlock>
        </Col>
      </FormGroup>
    );
  },

  getOptions() {
    return [
      {
        label: 'Reporting API',
        value: Constants.ENDPOINT_REPORT
      },
      {
        label: 'Multi-Channel Funnels API',
        value: Constants.ENDPOINT_MCF
      },
    ];
  },

  prepareValue(value) {
    return this.getOptions().find(item => item.value === value);
  },
});
