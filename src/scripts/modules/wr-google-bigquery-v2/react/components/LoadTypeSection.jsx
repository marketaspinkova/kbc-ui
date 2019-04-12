import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Form, Radio, HelpBlock, FormGroup, ControlLabel, Col} from 'react-bootstrap';

import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';
import loadType from '../../adapters/loadType';
import AdaptiveInputMappingLastLoaded from '../../../../react/common/AdaptiveInputMappingLastLoaded';

export default createReactClass({
  propTypes: {
    value: PropTypes.shape({
      loadType: PropTypes.oneOf([loadType.loadTypes.FULL, loadType.loadTypes.INCREMENTAL, loadType.loadTypes.INCREMENTAL]),
      changedSince: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  renderChangedInLast() {
    if (this.props.value.loadType === loadType.loadTypes.INCREMENTAL) {
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
              onChange={() => onChange({loadType: loadType.loadTypes.FULL, changedSince: ''})}
              checked={value.loadType === loadType.loadTypes.FULL}>
              Full Load
            </Radio>
            <HelpBlock>
              Data in the target table will be replaced.
            </HelpBlock>
            <Radio
              type="radio"
              title="Adaptive Incremental"
              disabled={disabled}
              onChange={() => onChange({loadType: loadType.loadTypes.ADAPTIVE, changedSince: ''})}
              checked={value.loadType === loadType.loadTypes.ADAPTIVE}>
              Automatic Incremental Load
            </Radio>
            <HelpBlock>
              Loads all data that has been added or changed since the last successful run.
              <br />
              <AdaptiveInputMappingLastLoaded
                tableId={this.props.value.source}
              />
            </HelpBlock>
            <Radio
              type="radio"
              title="Incremental"
              disabled={disabled}
              onChange={() => onChange({loadType: loadType.loadTypes.INCREMENTAL})}
              checked={value.loadType === loadType.loadTypes.INCREMENTAL}>
              Manual Incremental Load
            </Radio>
            <HelpBlock>
              Selected data will be appended to the target table.
            </HelpBlock>
          </Col>
        </FormGroup>
        {this.renderChangedInLast()}
      </Form>
    );
  }
});
