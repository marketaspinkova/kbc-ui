import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Form, Radio, HelpBlock, FormGroup, ControlLabel, Col, Alert} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';
import Select from 'react-select';
import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';
import changedSinceConstants from '../../../../react/common/changedSinceConstants';
import AdaptiveInputMappingLastLoaded from '../../../../react/common/AdaptiveInputMappingLastLoaded';

export default createReactClass({
  propTypes: {
    value: PropTypes.shape({
      changedSince: PropTypes.string.isRequired,
      grainColumns: PropTypes.array.isRequired,
      hasConnectionPoint: PropTypes.bool.isRequired,
      tableId: PropTypes.string.isRequired,
      grain: PropTypes.array
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const {value, onChange, disabled} = this.props;
    const isIncremental = !!value.changedSince;
    const isGrainInvalid = value.grain && value.grain.length === 1;
    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={4} componentClass={ControlLabel}>
            Load type
          </Col>
          <Col sm={8}>
            <Radio
              type="radio"
              title="Full Load"
              disabled={disabled}
              onChange={() => onChange({grain: [], changedSince: ''})}
              checked={!isIncremental}>
              Full Load
            </Radio>
            <HelpBlock>
              All data in the GoodData dataset will be replaced by the current Storage table data.
            </HelpBlock>
            <Radio
              type="radio"
              title="Automatic Incremental Load"
              disabled={disabled}
              onChange={() => onChange({changedSince: changedSinceConstants.ADAPTIVE_VALUE})}
              checked={isIncremental && this.props.value.changedSince === changedSinceConstants.ADAPTIVE_VALUE}>
              Automatic Incremental Load
            </Radio>
            <HelpBlock>
              Only data changed since the last successful run will be appended to the dataset.
              <br />
              <AdaptiveInputMappingLastLoaded
                tableId={this.props.value.tableId}
              />
            </HelpBlock>
            <Radio
              type="radio"
              title="Manual Incremental Load"
              disabled={disabled}
              onChange={() => onChange({changedSince: '-1 days'})}
              checked={isIncremental && this.props.value.changedSince !== changedSinceConstants.ADAPTIVE_VALUE}>
              Manual Incremental Load
            </Radio>
            <HelpBlock>
              Selected data will be appended to the dataset.
            </HelpBlock>
          </Col>
        </FormGroup>
        {isIncremental && this.props.value.changedSince !== changedSinceConstants.ADAPTIVE_VALUE &&
         <FormGroup>
           <Col componentClass={ControlLabel} sm={4}>
             Changed In Last
           </Col>
           <Col sm={8}>
             <ChangedSinceInput
               value={value.changedSince}
               onChange={(newValue) => this.props.onChange({changedSince: newValue})}
               disabled={disabled}
               tableId={value.tableId}
               allowAdaptive
             />
           </Col>
         </FormGroup>
        }
        {isIncremental &&
         <FormGroup>
           <Col sm={4} componentClass={ControlLabel}>
             Fact Grain
           </Col>
           <Col sm={8}>
             <Select
               placeholder="Select at least 2 columns"
               multi={true}
               disabled={disabled || value.hasConnectionPoint}
               options={value.grainColumns.map(column => ({value: column, label: column}))}
               value={value.grain}
               onChange={newColumns => onChange({grain: newColumns.map(column => column.value)})}
             />
             <HelpBlock>
               {isGrainInvalid &&
                 <Alert bsStyle="danger">
                   <i className="fa fa-warning" /> Please specify a second attribute, reference, or date type columns.
                 </Alert>
               }
               <ExternalLink href="https://developer.gooddata.com/article/set-fact-table-grain">
                 Fact grain
               </ExternalLink>
               {' '} columns help to avoid duplicate records in the GoodData dataset without a connection point. <strong> Specify at least 2 </strong> attributes, reference or date type columns.
             </HelpBlock>
           </Col>
         </FormGroup>
        }
      </Form>
    );
  }
});
