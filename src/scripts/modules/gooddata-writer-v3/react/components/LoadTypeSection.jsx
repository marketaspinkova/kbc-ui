import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Form, Radio, HelpBlock, FormGroup, ControlLabel, Col, Alert} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';
import Select from 'react-select';
import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';

export default createReactClass({
  propTypes: {
    value: PropTypes.shape({
      changedSince: PropTypes.string.isRequired,
      grainColumns: PropTypes.array.isRequired,
      hasConnectionPoint: PropTypes.bool.isRequired,
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
              title="Incremental"
              disabled={disabled}
              onChange={() => onChange({changedSince: '-1 days'})}
              checked={isIncremental}>
              Incremental
            </Radio>
            <HelpBlock>
              Data will be appended to the dataset.
            </HelpBlock>
          </Col>
        </FormGroup>
        {isIncremental &&
         <FormGroup>
           <Col componentClass={ControlLabel} sm={4}>
             Changed In Last
           </Col>
           <Col sm={8}>
             <ChangedSinceInput
               value={value.changedSince}
               onChange={(newValue) => this.props.onChange({changedSince: newValue})}
               disabled={disabled}
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
