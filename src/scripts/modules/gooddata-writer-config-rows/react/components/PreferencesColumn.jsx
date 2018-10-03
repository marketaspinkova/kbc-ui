import React, {PropTypes} from 'react';
import {FormControl, Form, FormGroup, Col, ControlLabel} from 'react-bootstrap';
import makeColumnDefinition from '../../helpers/makeColumnDefinition';
import {DataTypes, Types} from '../../helpers/Constants';

// import ReactSelect from 'react-select';

export default React.createClass({
  propTypes: {
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    column: PropTypes.object.isRequired,
    context: PropTypes.object.isRequired,
    showAdvanced: PropTypes.bool
  },

  render() {
    const {column} = this.props;
    const {fields} = makeColumnDefinition(column);

    return (
      <Form horizontal>
        {fields.type.show && this.renderSelectGroup(
          'Type',
          'type',
          Object.keys(Types)
        )}

        {fields.title.show && this.renderInputGroup('Title', 'title')}

        {fields.dataType.show && this.renderSelectGroup(
          'Data Type',
          'dataType',
          Object.keys(DataTypes),
          fields.dataTypeSize.show && this.renderInput('dataTypeSize')
        )}
        {fields.dateDimension.show &&
         this.renderSelectGroup(
           'Date Dimensions',
           'dateDimension',
           this.props.context.dimensions
         )}
        {fields.format.show && this.renderInputGroup('Date format', 'format')}
        {fields.schemaReference.show && this.renderSelectGroup(
          'Reference',
          'schemaReference',
          this.props.context.referencableTables
        )}
        {fields.reference.show && this.renderSelectGroup(
          'Reference',
          'reference',
          this.props.context.referencableColumns
        )}
        {fields.sortLabel.show && this.props.context.sortLabelsColumns[column.id] &&
         this.renderSelectGroup(
           'Sort Label',
           'sortLabel',
           this.props.context.sortLabelsColumns[column.id],
           this.renderSelectInput('sortOrder', ['ASC', 'DESC'], {strict: true})
         )}
        {this.renderIdentifiers(fields)}
      </Form>
    );
  },

  renderIdentifiers(fields) {
    if (this.props.showAdvanced) {
      return (
        <span>
          {fields.identifier.show && this.renderInputGroup('Identifier', 'identifier')}
          {fields.identifierLabel.show && this.renderInputGroup('Identifier Label', 'identifierLabel')}
          {fields.identifierSortLabel.show && this.renderInputGroup('Identifier Sort Label', 'identifierSortLabel')}
        </span>
      );
    }
  },

  renderControlGroup(label, control, extraControl) {
    return (
      <FormGroup  bsSize="small" className="col-sm-12">
        <Col sm={4} componentClass={ControlLabel}>
          <span className="pull-right">{label}</span>
        </Col>
        <Col sm={8}>
          {
            extraControl ?
              [
                <Col sm={8} key="control" style={{padding: '0'}}>
                  {control}
                </Col>,
                <Col sm={4} key="extracontrol" style={{paddingRight: '0'}}>
                  {extraControl}
                </Col>
              ]
              : control
          }
        </Col>
      </FormGroup>
    );
  },

  renderSelectGroup(label, fieldName, options, extraControl) {
    return this.renderControlGroup(
      label,
      this.renderSelectInput(fieldName, options),
      extraControl
    );
  },

  renderSelectInput(fieldName, options, settings = {}) {
    const {disabled, column} = this.props;
    return (
      <FormControl
        componentClass="select"
        type="select"
        autosize={false}
        clearable={false}
        value={column[fieldName]}
        options={options}
        onChange={e => this.onChangeColumn(fieldName, e.target.value)}
        disabled={disabled}>
        {!settings.strict && <option value=""/>}
        {options.map(op => <option value={op} key={op}>{op}</option>)}
      </FormControl>
    );
  },

  renderInput(fieldName) {
    const {disabled, column} = this.props;
    return (
      <FormControl
        type="text"
        disabled={disabled}
        onChange={e => this.onChangeColumn(fieldName, e.target.value)}
        value={column[fieldName]}
      />);
  },

  renderInputGroup(label, fieldName) {
    return this.renderControlGroup(
      label,
      this.renderInput(fieldName)
    );
  },

  onChangeColumn(property, value) {
    const newColumn = makeColumnDefinition(this.props.column)
      .updateColumn(property, value)
      .column;
    this.props.onChange(newColumn);
  }
});
