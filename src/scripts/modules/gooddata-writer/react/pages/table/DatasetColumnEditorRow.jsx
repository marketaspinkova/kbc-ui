import React from 'react';
import { Map, fromJS } from 'immutable';
import keyMirror from 'fbjs/lib/keyMirror';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { FormControl, InputGroup, FormGroup } from 'react-bootstrap';
import ColumnDataPreview from '../../../../components/react/components/ColumnDataPreview';
import { ColumnTypes, DataTypes, SortOrderOptions } from '../../../constants';
import DateDimensionModal from './DateDimensionSelectModal';
import DateFormatHint from './DateFormatHint';

const visibleParts = keyMirror({
  DATA_TYPE: null,
  SORT_LABEL: null,
  DATE: null,
  REFERENCE: null,
  SCHEMA_REFERENCE: null,
  IDENTIFIER_LABEL: null,
  IDENTIFIER_TIME: null
});

export default React.createClass({
  mixins: [ImmutableRenderMixin],
  propTypes: {
    column: React.PropTypes.object.isRequired,
    referenceableColumns: React.PropTypes.object.isRequired,
    referenceableTables: React.PropTypes.object.isRequired,
    sortLabelColumns: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    isEditing: React.PropTypes.bool.isRequired,
    isValid: React.PropTypes.bool.isRequired,
    isSaving: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func.isRequired,
    dataPreview: React.PropTypes.object,
    showIdentifier: React.PropTypes.bool.isRequired,
    isExported: React.PropTypes.bool.isRequired
  },

  render() {
    const { column } = this.props;
    const rowClassName = this.props.isValid ? '' : 'danger';
    return (
      <tr className={rowClassName}>
        <td className="kbc-static-cell">{column.get('name')}</td>
        <td>
          {!this._isIgnoreType() &&
          ![ColumnTypes.DATE, ColumnTypes.REFERENCE].includes(this.props.column.get('type')) &&
          this._createInput({
            type: 'text',
            value: column.get('title'),
            disabled: this.props.isSaving,
            onChange: this._handleInputChange.bind(this, 'title')
          })}
        </td>
        <td>
          {this._createInput(
            {
              type: 'select',
              value: column.get('type'),
              disabled: this.props.isSaving,
              onChange: this._handleInputChange.bind(this, 'type')
            },
            this._selectOptions(fromJS(ColumnTypes))
          )}
        </td>
        <td>
          {this._renderSchemaReferenceSelect()}
          {this._renderReferenceSelect()}
          {this._renderDateSelect()}
        </td>
        <td>{!this._isIgnoreType() && this._renderSortLabelSelect()}</td>
        <td>{!this._isIgnoreType() && this._renderSortOrderSelect()}</td>
        <td>{!this._isIgnoreType() && this._renderDataTypeSelect()}</td>
        {this.props.showIdentifier && (
          <td>
            {!this._isIgnoreType() &&
            this._createInput({
              type: 'text',
              value: column.get('identifier'),
              disabled: this.props.isExported || this.props.isSaving,
              onChange: this._handleInputChange.bind(this, 'identifier')
            })}
          </td>
        )}
        {this.props.showIdentifier && (
          <td>
            {!this._isIgnoreType() && (
              <span>
                {this._renderIdentifierLabel()}
                {this._renderIdentifierTime()}
              </span>
            )}
          </td>
        )}
        <td>
          <ColumnDataPreview
            columnName={this.props.column.get('name')}
            tableData={this.props.dataPreview}
          />
        </td>
      </tr>
    );
  },

  _renderSchemaReferenceSelect() {
    if (this._shouldRenderPart(visibleParts.SCHEMA_REFERENCE)) {
      return this._createInput(
        {
          type: 'select',
          value: this.props.column.get('schemaReference', ''),
          disabled: this.props.isSaving,
          onChange: this._handleInputChange.bind(this, 'schemaReference')
        },
        this._selectOptions(this.props.referenceableTables.set('', ''))
      );
    }
  },

  _renderIdentifierLabel() {
    if (this._shouldRenderPart(visibleParts.IDENTIFIER_LABEL)) {
      return this._createInput({
        type: 'text',
        value: this.props.column.get('identifierLabel'),
        disabled: this.props.isExported || this.props.isSaving,
        onChange: this._handleInputChange.bind(this, 'identifierLabel')
      });
    }
  },

  _renderIdentifierTime() {
    if (this._shouldRenderPart(visibleParts.IDENTIFIER_TIME)) {
      return this._createInput({
        type: 'text',
        value: this.props.column.get('identifierTime'),
        disabled: this.props.isExported || this.props.isSaving,
        onChange: this._handleInputChange.bind(this, 'identifierTime')
      });
    }
  },

  _renderReferenceSelect() {
    if (this._shouldRenderPart(visibleParts.REFERENCE)) {
      return this._createInput(
        {
          type: 'select',
          disabled: this.props.isSaving,
          value: this.props.column.get('reference'),
          onChange: this._handleInputChange.bind(this, 'reference')
        },
        this._selectOptions(this.props.referenceableColumns.set('', ''))
      );
    }
  },

  _renderSortLabelSelect() {
    if (!this._shouldRenderPart(visibleParts.SORT_LABEL)) {
      return;
    }
    if (!this.props.sortLabelColumns.count() && this.props.isEditing) {
      return;
    }
    return this._createInput(
      {
        type: 'select',
        value: this.props.column.get('sortLabel'),
        disabled: this.props.isSaving,
        onChange: this._handleInputChange.bind(this, 'sortLabel')
      },
      this._selectOptions(this.props.sortLabelColumns.set('', ''))
    );
  },

  _renderSortOrderSelect() {
    if (!this._shouldRenderPart(visibleParts.SORT_LABEL)) {
      return;
    }
    if (!this.props.sortLabelColumns.count() && this.props.isEditing) {
      return;
    }
    return this._createInput(
      {
        type: 'select',
        value: this.props.column.get('sortOrder'),
        disable: this.props.isSaving,
        onChange: this._handleInputChange.bind(this, 'sortOrder')
      },
      this._selectOptions(Map(SortOrderOptions).set('', ''))
    );
  },

  _renderDataTypeSelect() {
    if (this._shouldRenderPart(visibleParts.DATA_TYPE)) {
      return (
        <span>
          {this._createInput(
            {
              type: 'select',
              value: this.props.column.get('dataType'),
              disabled: this.props.isSaving,
              onChange: this._handleInputChange.bind(this, 'dataType')
            },
            this._selectOptions(fromJS(DataTypes).set('', ''))
          )}
          {[DataTypes.VARCHAR, DataTypes.DECIMAL].indexOf(this.props.column.get('dataType')) >= 0 &&
          this._createInput({
            style: { width: '3vw' },
            type: 'text',
            value: this.props.column.get('dataTypeSize'),
            disabled: this.props.isSaving,
            onChange: this._handleInputChange.bind(this, 'dataTypeSize')
          })}
        </span>
      );
    }
  },

  _renderDateSelect() {
    if (!this._shouldRenderPart(visibleParts.DATE)) {
      return;
    }
    return (
      <div style={{ width: '15vw' }}>
        {this._createInput({
          type: 'text',
          value: this.props.column.get('format'),
          disabled: this.props.isSaving,
          onChange: this._handleInputChange.bind(this, 'format'),
          addonAfter: this.props.isEditing && <DateFormatHint />
        })}
        <div className="kbc-form-control-info">
          {'Dimension: '}
          <strong>{this.props.column.get('dateDimension')}</strong>{' '}
          {this.props.isEditing && (
            <DateDimensionModal
              column={this.props.column}
              configurationId={this.props.configurationId}
              onSelect={this._handleDateDimensionSelect}
            />
          )}
        </div>
      </div>
    );
  },

  _handleDateDimensionSelect(data) {
    return this.props.onChange(this.props.column.set('dateDimension', data.selectedDimension));
  },

  _handleInputChange(propName, e) {
    return this.props.onChange(this.props.column.set(propName, e.target.value));
  },

  _createInput(props, body) {
    if (this.props.isEditing) {
      if (!props.addonAfter) {
        if (props.type === 'select') {
          return (
            <FormGroup>
              <FormControl
                componentClass="select"
                value={props.value}
                disabled={props.disabled}
                onChange={props.onChange}
              >
                {body}
              </FormControl>
            </FormGroup>
          )
        }

        return (
          <FormGroup>
            <FormControl
              type="text"
              value={props.value}
              disabled={props.disabled}
              onChange={props.onChange}
            />
          </FormGroup>
        )
      }

      return (
        <FormGroup>
          <InputGroup>
            <FormControl
              type="text"
              value={props.value}
              disabled={props.disabled}
              onChange={props.onChange}
            />
            <InputGroup.Addon>{props.addonAfter}</InputGroup.Addon>
          </InputGroup>
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <FormControl.Static>
          {props.value}
        </FormControl.Static>
      </FormGroup>
    )
  },

  _shouldRenderPart(partName) {
    const allowedPartsForType = (() => {
      switch (this.props.column.get('type')) {
        case ColumnTypes.ATTRIBUTE:
          return [visibleParts.DATA_TYPE, visibleParts.SORT_LABEL, visibleParts.IDENTIFIER_LABEL];
        case ColumnTypes.IGNORE:
          return [];
        case ColumnTypes.CONNECTION_POINT:
          return [visibleParts.DATA_TYPE, visibleParts.SORT_LABEL, visibleParts.IDENTIFIER_LABEL];
        case ColumnTypes.DATE:
          return [visibleParts.DATE, visibleParts.IDENTIFIER_TIME];
        case ColumnTypes.FACT:
          return [visibleParts.DATA_TYPE];
        case ColumnTypes.HYPERLINK:
          return [visibleParts.REFERENCE];
        case ColumnTypes.LABEL:
          return [visibleParts.REFERENCE, visibleParts.DATA_TYPE];
        case ColumnTypes.REFERENCE:
          return [visibleParts.SCHEMA_REFERENCE];
        default:
          return [];
      }
    })();

    return allowedPartsForType.indexOf(partName) >= 0;
  },

  _selectOptions(options) {
    return options
      .sort()
      .map((value, key) => (
        <option key={key} value={key}>
          {value}
        </option>
      ))
      .toArray();
  },

  _isIgnoreType() {
    return this.props.column.get('type') === ColumnTypes.IGNORE;
  }
});
