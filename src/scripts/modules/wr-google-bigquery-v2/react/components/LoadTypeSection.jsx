import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Form, Radio, HelpBlock, FormGroup, ControlLabel, Col} from 'react-bootstrap';

import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';
import loadType from '../../adapters/loadType';
import AutomaticLoadTypeLastUpdated from '../../../../react/common/AutomaticLoadTypeLastUpdated';

export default createReactClass({
  propTypes: {
    value: PropTypes.shape({
      loadType: PropTypes.oneOf([loadType.constants.FULL, loadType.constants.INCREMENTAL, loadType.constants.INCREMENTAL]),
      changedSince: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  renderChangedInLast() {
    if (this.props.value.loadType === loadType.constants.INCREMENTAL) {
      return (
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Changed In Last
          </Col>
          <Col sm={8}>
            <ChangedSinceInput
              value={this.props.value.changedSince}
              onChange={(newValue) => this.props.onChange({changedSince: newValue})}
              disabled={this.props.disabled}
              tableId={this.props.value.source}
            />
          </Col>
        </FormGroup>
      );
    }
  },

  render() {
    const {value, onChange, disabled} = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Load Type
          </Col>
          <Col sm={8}>
            <Radio
              type="radio"
              title="Full Load"
              disabled={disabled}
              onChange={() => onChange({loadType: loadType.constants.FULL, changedSince: ''})}
              checked={value.loadType === loadType.constants.FULL}>
              Full Load
            </Radio>
            <HelpBlock>
              Replace all existing rows in the destination table.
            </HelpBlock>
            <Radio
              type="radio"
              title="Automatic Incremental Load"
              disabled={disabled}
              onChange={() => onChange({loadType: loadType.constants.ADAPTIVE, changedSince: ''})}
              checked={value.loadType === loadType.constants.ADAPTIVE}>
              Automatic Incremental Load
            </Radio>
            <HelpBlock>
              Append all data that has been added or changed since the last successful run.
            </HelpBlock>
            <AutomaticLoadTypeLastUpdated
              tableId={this.props.value.source}
            />
            <Radio
              type="radio"
              title="Manual Incremental Load"
              disabled={disabled}
              onChange={() => onChange({loadType: loadType.constants.INCREMENTAL})}
              checked={value.loadType === loadType.constants.INCREMENTAL}>
              Manual Incremental Load
            </Radio>
            <HelpBlock>
              Append all selected data.
            </HelpBlock>
          </Col>
        </FormGroup>
        {this.renderChangedInLast()}
      </Form>
    );
  }
});
