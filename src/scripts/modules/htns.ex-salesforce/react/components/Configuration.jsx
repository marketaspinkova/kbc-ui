import PropTypes from 'prop-types';
import React from 'react';
import {Form, FormControl, FormGroup, ControlLabel, HelpBlock, Col, Checkbox} from 'react-bootstrap';


export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      object: PropTypes.string.isRequired,
      query: PropTypes.string.isRequired,
      incremental: PropTypes.bool.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Object
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.object}
              onChange={(event) => {
                this.props.onChange({object: event.target.value.trim()});
              }}
              placeholder="User"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Salesforce object identifier, eg. Account.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <Checkbox
              checked={this.props.value.incremental}
              onChange={(event) => {
                this.props.onChange({incremental: event.target.checked});
              }}
            >Incremental</Checkbox>
            <HelpBlock>
              Download only new records since the last extraction. The <code>Id</code> column must be included if you use custom query as it will be the primary key.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Custom SOQL Query
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.query}
              onChange={(event) => {
                this.props.onChange({query: event.target.value});
              }}
              placeholder="SELECT Id, Name FROM User"
              disabled={this.props.disabled}
            />
            <HelpBlock>
                Specify the SOQL query for the given object. If the SOQL is not specified, extractor will download all available columns.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
