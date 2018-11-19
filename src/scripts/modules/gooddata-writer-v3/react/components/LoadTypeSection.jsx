import React, {PropTypes} from 'react';
import {Form, Radio, HelpBlock, FormGroup, ControlLabel, Col} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';
import Select from 'react-select';
import ChangedSinceInput from '../../../../react/common/ChangedSinceInput';

export default React.createClass({
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
              All Data in GoodData dataset will be replaced by current Storage table data.
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
               <ExternalLink href="https://developer.gooddata.com/article/set-fact-table-grain">
                 Fact grain
               </ExternalLink>
               {' '} columns help to avoid of duplicates records in GoodData dataset without connection point. Specify at least two attribute, reference or date type columns.
             </HelpBlock>
           </Col>
         </FormGroup>
        }
      </Form>
    );
  }
});
