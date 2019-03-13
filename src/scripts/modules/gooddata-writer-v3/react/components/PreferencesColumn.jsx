import PropTypes from 'prop-types';
import React from 'react';
import {FormControl, Form, FormGroup, InputGroup, Col, ControlLabel} from 'react-bootstrap';
import makeColumnDefinition from '../../helpers/makeColumnDefinition';
import {DataTypes, Types} from '../../constants';
import DataTypeSizeHint from './DataTypeSizeHint';
import DateFormatHint from './DateFormatHint';

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
        {fields.type.show && this.renderStrictSelectGroup(
          'Type',
          'type',
          Object.keys(Types)
        )}

        {fields.title.show && this.renderInputGroup('Title', 'title')}

        {fields.dataType.show &&
         this.renderSelectGroup(
           'Data Type',
           'dataType',
           Object.keys(DataTypes),
           fields.dataTypeSize.show && this.renderInputWithAddon('dataTypeSize', <DataTypeSizeHint />)
         )}
        {fields.dateDimension.show &&
         this.renderSelectGroup(
           'Date Dimension',
           'dateDimension',
           this.props.context.dimensions
         )}
        {fields.format.show && this.renderInputGroupWithAddon('Date format', 'format', <DateFormatHint />)}
        {fields.schemaReference.show &&
         this.renderSelectGroup(
           'Source Connection Point',
           'schemaReference',
           this.props.context.referencableTables
         )}
        {fields.reference.show &&
         this.renderSelectGroup(
           this.referenceLabel(column),
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
      <FormGroup bsSize="small">
        <Col sm={4} componentClass={ControlLabel}>
          <span className="pull-right text-right">{label}</span>
        </Col>
        <Col sm={8}>
          {
            extraControl ?
              (
                <FormGroup>
                  <Col lg={6} key="control">
                    {control}
                  </Col>
                  <Col lg={6} key="extracontrol">
                    {extraControl}
                  </Col>
                </FormGroup>
              )
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

  renderStrictSelectGroup(label, fieldName, options, extraControl) {
    return this.renderControlGroup(
      label,
      this.renderSelectInput(fieldName, options, {strict: true}),
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

  renderInputWithAddon(fieldName, addon) {
    return (
      <InputGroup>
        {this.renderInput(fieldName)}
        <InputGroup.Addon>{addon}</InputGroup.Addon>
      </InputGroup>
    );
  },

  renderInputGroupWithAddon(label, fieldName, addon) {
    return this.renderControlGroup(
      label,
      this.renderInputWithAddon(fieldName, addon)
    );
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
  },

  referenceLabel(column) {
    if (column.type === Types.LABEL) {
      return 'Source Attribute';
    }

    if (column.type === Types.HYPERLINK) {
      return 'Display Label Attribute';
    }

    return 'Reference';
  }
});
