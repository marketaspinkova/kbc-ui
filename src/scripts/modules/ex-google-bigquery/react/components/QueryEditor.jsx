import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import CodeMirror from 'react-code-mirror';
import Select from '../../../../react/common/Select';
import AutosuggestWrapper from '../../../transformations/react/components/mapping/AutoSuggestWrapper';
import editorMode from '../../../ex-db-generic/templates/editorMode';

export default createReactClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultOutputTable: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired
  },

  _handleOutputTableChange(newValue) {
    return this.props.onChange(this.props.query.set('outputTable', newValue));
  },

  _handlePrimaryKeyChange(newValue) {
    return this.props.onChange(this.props.query.set('primaryKey', newValue));
  },

  _handleIncrementalChange(event) {
    return this.props.onChange(this.props.query.set('incremental', event.target.checked));
  },

  _handleLegacySqlChange(event) {
    return this.props.onChange(this.props.query.set('useLegacySql', event.target.checked));
  },

  _handleQueryChange(value) {
    return this.props.onChange(this.props.query.set('query', value));
  },

  _handleNameChange(event) {
    return this.props.onChange(this.props.query.set('name', event.target.value));
  },

  _tableNamePlaceholder() {
    return `default: ${this.props.defaultOutputTable}`;
  },

  _tableSelectOptions() {
    return this.props.tables.map(table => table.get('id')).sortBy(val => val);
  },

  render() {
    return (
      <div className="row">
        <div className="form-horizontal">
          <div className="form-group">
            <label className="col-md-2 control-label">Name</label>
            <div className="col-md-4">
              <input
                className="form-control"
                type="text"
                value={this.props.query.get('name')}
                ref="queryName"
                placeholder="e.g. Untitled Query"
                onChange={this._handleNameChange}
                autoFocus={true}
              />
            </div>
            <label className="col-md-2 control-label">Primary key</label>
            <div className="col-md-4">
              <Select
                name="primaryKey"
                value={this.props.query.get('primaryKey')}
                multi={true}
                disabled={false}
                allowCreate={true}
                delimiter=","
                placeholder="No primary key"
                emptyStrings={false}
                onChange={this._handlePrimaryKeyChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">Output table</label>
            <div className="col-md-6">
              <AutosuggestWrapper
                suggestions={this._tableSelectOptions()}
                placeholder={this._tableNamePlaceholder()}
                value={this.props.query.get('outputTable')}
                onChange={this._handleOutputTableChange}
              />
              <div className="help-block">If empty, the default will be used.</div>
            </div>
            <div className="col-md-4 checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.query.get('incremental')}
                  onChange={this._handleIncrementalChange}
                />
                Incremental
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label" />
            <div className="col-md-10 checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.query.get('useLegacySql')}
                  onChange={this._handleLegacySqlChange}
                />
                Use Legacy SQL
              </label>
              <div className="help-block">
                By default, BigQuery runs queries using legacy SQL. <br /> Uncheck this to run queries using BigQuery&apos;s
                updated SQL dialect with improved standards compliance.
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">SQL query</label>
            <div className="col-md-10 ">
              <div className="form-control-static">
                <CodeMirror
                  theme="solarized"
                  mode={editorMode(this.props.componentId)}
                  value={this.props.query.get('query')}
                  onChange={(e) => this._handleQueryChange(e.target.value)}
                  lineNumbers
                  lineWrapping={false}
                  placeholder="e.g. SELECT `id`, `name` FROM `myTable`"
                  style={{width: '100%'}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
