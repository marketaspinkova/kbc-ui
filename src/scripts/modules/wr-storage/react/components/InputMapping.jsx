import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {Form, FormControl, FormGroup, ControlLabel, Col} from 'react-bootstrap';
import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';
import StorageApiLink from '../../../components/react/components/StorageApiTableLinkEx';
import {PanelWithDetails} from '@keboola/indigo-ui';

export default React.createClass({
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
    const props = this.props;
    const panelExpanded = this.props.value.changedSince !== '';
    return (
      <Form horizontal>
        <h3>Source</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Table
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              <StorageApiLink
                tableId={this.props.value.source}
              >
                {this.props.value.source}
              </StorageApiLink>
            </FormControl.Static>
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
                onChange={function(value) {
                  props.onChange({changedSince: value});
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
