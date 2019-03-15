import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import {Form, FormControl, FormGroup, ControlLabel, Col, HelpBlock} from 'react-bootstrap';
import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';
import {PanelWithDetails} from '@keboola/indigo-ui';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      source: PropTypes.string.isRequired,
      changedSince: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const panelExpanded = this.props.value.changedSince !== '';
    return (
      <Form horizontal>
        <h3>Source</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Table Name
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.source}
              onChange={(e) => {
                this.props.onChange({source: e.target.value});
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Table name in the source project. If the table ID is <code>in.c-main.mytable</code> use only the table name, <code>mytable</code>.
            </HelpBlock>
          </Col>
        </FormGroup>
        <PanelWithDetails
          defaultExpanded={panelExpanded}
          placement="bottom"
          labelCollapse="Hide Advanced Options"
          labelOpen="Show Advanced Options"
        >
          <FormGroup>
            <Col componentClass={ControlLabel} sm={4}>
              Changed In Last
            </Col>
            <Col sm={8}>
              <ChangedSinceInput
                value={this.props.value.changedSince}
                onChange={(value) => {
                  this.props.onChange({changedSince: value});
                }}
                disabled={this.props.disabled}
              />
            </Col>
          </FormGroup>
        </PanelWithDetails>
      </Form>
    );
  }
});
