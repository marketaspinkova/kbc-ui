import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import HeaderColumnsMultiSelect from './HeaderColumnsMultiSelect';

export default createReactClass({

  propTypes: {
    headerRowValue: PropTypes.number.isRequired,
    onChangeHeaderRow: PropTypes.func.isRequired,

    headerColumnNamesValue: PropTypes.object.isRequired,
    onChangeHeaderColumnNames: PropTypes.func.isRequired,

    transposeHeaderRowValue: PropTypes.number.isRequired,
    onChangeTransposeHeaderRow: PropTypes.func.isRequired,

    transposedHeaderColumnNameValue: PropTypes.string.isRequired,
    onChangeTransposedHeaderColumnName: PropTypes.func.isRequired,

    transposeFromValue: PropTypes.number.isRequired,
    onChangeTransposeFrom: PropTypes.func.isRequired
  },

  render() {
    return (
      <div>
        <div className="form-group">
          <label className="control-label col-sm-4">
            Number of header rows
          </label>
          <div className="col-sm-2">
            <div className="input-group">
              <input
                onChange={this.props.onChangeHeaderRow}
                value={this.props.headerRowValue}
                type="number"
                className="form-control form-control-sm"
              />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-sm-4">
            Header column names
          </label>
          <div className="col-sm-4">
            <HeaderColumnsMultiSelect
              value={this.props.headerColumnNamesValue}
              onChange={this.props.onChangeHeaderColumnNames}
            />
          </div>
          <div className="col-sm-4">
            <span className="help-block">Overrides header</span>
          </div>
        </div>

        {this.renderInput(
          'number',
          'Transpose header row number',
          this.props.transposeHeaderRowValue,
          this.props.onChangeTransposeHeaderRow,
          'Which row of the header will be transposed. 0 = disabled.'
        )}

        {this.renderInput(
          'text',
          'Transposed header column name',
          this.props.transposedHeaderColumnNameValue,
          this.props.onChangeTransposedHeaderColumnName,
          'Column name of the transposed header row.'
        )}

        {this.renderInput(
          'number',
          'Transpose from column',
          this.props.transposeFromValue,
          this.props.onChangeTransposeFrom,
          'Transposition will occur from this column. 0 = disabled.'
        )}
      </div>
    );
  },

  renderInput(type, name, value, onChangeFn, hint = '') {
    return (
      <div className="form-group">
        <label className="control-label col-sm-4">
          {name}
        </label>
        <div className="col-sm-2">
          <div className="input-group">
            <input
              onChange={onChangeFn}
              value={value}
              type={type}
              className="form-control form-control-sm"
            />
          </div>
        </div>
        <div className="col-sm-4">
          <span className="help-block">{hint}</span>
        </div>
      </div>
    );
  }
});
