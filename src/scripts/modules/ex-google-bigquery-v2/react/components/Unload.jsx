import React, {PropTypes} from 'react';
import {Form, FormControl, FormGroup, ControlLabel, Col, HelpBlock} from 'react-bootstrap';
import Select from 'react-select';

import {DatasetLocations} from "../../helpers/constants";

const locationOptions = [
  {
    'label': 'United States',
    'value': DatasetLocations.MULTI_REGION_US
  },
  {
    'label': 'European Union',
    'value': DatasetLocations.MULTI_REGION_EU
  },
];

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      storage: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const {value, onChange, disabled} = this.props;
    return (
      <Form horizontal>
        <FormGroup>
        <Col componentClass={ControlLabel} sm={4}>
          Cloud Storage Bucket
        </Col>
        <Col sm={8}>
          <FormControl
            type="text"
            disabled={disabled}
            onChange={e => onChange({storage: e.target.value})}
            value={value.storage}
            placeholder="gs://"
          />
          <HelpBlock>
            Existing Google Cloud Storage bucket. There will be data temporarily exported,
            before load to KBC.
          </HelpBlock>
        </Col>
      </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Dataset Location
          </Col>
          <Col sm={8}>
            <Select
              key="location"
              name="location"
              clearable={false}
              searchable={false}
              value={value.location}
              onChange={(location) => onChange({location: location.value})}
              options={locationOptions}/>
            <HelpBlock>
              The geographic location where source data exists.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
