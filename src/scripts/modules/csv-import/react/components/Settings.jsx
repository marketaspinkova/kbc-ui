import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Input} from './../../../../react/common/KbcBootstrap';
import Select from '../../../../react/common/Select';
import {List} from 'immutable';
import TableSelectorForm from '../../../../react/common/TableSelectorForm';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    settings: PropTypes.object.isRequired,
    defaultTable: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    tables: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    destinationEditing: PropTypes.bool.isRequired,
    onDestinationEdit: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  onChangeDestination(value) {
    var settings = this.props.settings.set('destination', value);

    // set primary key if table exists
    if (this.props.tables.has(value)) {
      settings = settings.set('primaryKey', this.props.tables.getIn([value, 'primaryKey']));
    } else {
      settings = settings.set('primaryKey', List());
    }
    this.props.onChange(settings);
  },

  onDestinationEdit() {
    const settings = this.props.settings;
    this.props.onChange(settings);
    this.props.onDestinationEdit();
  },

  isExistingTable() {
    const destinationTable = this.props.settings.get('destination');
    if (!destinationTable || destinationTable === '') {
      return false;
    }
    return this.props.tables.has(destinationTable);
  },

  onChangeIncremental() {
    var settings = this.props.settings.set('incremental', !this.props.settings.get('incremental', false));
    this.props.onChange(settings);
  },

  onChangePrimaryKey(value) {
    var settings = this.props.settings.set('primaryKey', value);
    this.props.onChange(settings);
  },

  onChangeDelimiter(e) {
    var settings = this.props.settings.set('delimiter', e.target.value);
    this.props.onChange(settings);
  },

  onChangeEnclosure(e) {
    var settings = this.props.settings.set('enclosure', e.target.value);
    this.props.onChange(settings);
  },

  getDestinationSuggestions() {
    const tables = this.props.tables.map(function(table) {
      return ({
        name: table.get('id')
      });
    });
    return function(value, callback) {
      const inputValue = value.trim().toLowerCase();
      const inputLength = inputValue.length;
      if (inputLength === 0) {
        return callback(null, []);
      }
      const suggestions = tables.filter(function(table) {
        return table.name.toLowerCase().indexOf(inputValue) >= 0;
      }).sortBy(function(table) {
        return table.name;
      }).slice(0, 7).map(function(table) {
        return table.name;
      }).toList().toJS();
      return callback(null, suggestions);
    };
  },

  primaryKeyPlaceholder() {
    if (this.isExistingTable()) {
      return 'Cannot add a column';
    }
    return 'Add a column';
  },

  createGetSuggestions() {
    const tables = this.props.tables.filter(function(item) {
      return item.get('id').substr(0, 3) === 'in.' || item.get('id').substr(0, 4) === 'out.';
    }).sortBy(function(item) {
      return item.get('id');
    }).map(function(item) {
      return item.get('id');
    }).toList();

    return function(input, callback) {
      var suggestions;
      suggestions = tables.filter(function(value) {
        return value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      }).sortBy(function(item) {
        return item;
      }).slice(0, 10).toList();
      return callback(null, suggestions.toJS());
    };
  },

  render() {
    return (
      <div className="form-horizontal">
        <TableSelectorForm
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.settings.get('destination')}
          onChange={this.onChangeDestination}
          disabled={this.props.disabled}
          label="Destination"
          help="Table in Storage, where the CSV file will be imported. If the table or bucket does not exist, it will be created."
          onEdit={this.onDestinationEdit}
          editing={this.props.destinationEditing}
        />
        <Input
          type="checkbox"
          label="Incremental Load"
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.props.settings.get('incremental')}
          onChange={this.onChangeIncremental}
          help={(<span>If incremental load is turned on, table will be updated instead of rewritten. Tables with primary key will update rows, tables without primary key will append rows.</span>)}
          disabled={this.props.disabled}
        />
        <div className="form-group">
          <div className="col-xs-4 control-label">Primary Key</div>
          <div className="col-xs-8">
            <Select
              name="primaryKey"
              value={this.props.settings.get('primaryKey')}
              multi={true}
              allowCreate={true}
              delimiter=","
              placeholder={this.primaryKeyPlaceholder()}
              emptyStrings={false}
              onChange={this.onChangePrimaryKey}
              disabled={this.props.disabled || this.isExistingTable()}
            />
            <div className="help-block">If primary key is set, updates can be done on table by selecting <strong>incremental loads</strong>. Primary key can consist of multiple columns. Primary key of an existing table cannot be changed.</div>
          </div>
        </div>
        <Input
          type="text"
          label="Delimiter"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.settings.get('delimiter')}
          onChange={this.onChangeDelimiter}
          help={(<span>Field delimiter used in CSV file. Default value is <code>,</code>. Use <code>\t</code> for tabulator.</span>)}
          disabled={this.props.disabled}
        />
        <Input
          type="text"
          label="Enclosure"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.settings.get('enclosure')}
          onChange={this.onChangeEnclosure}
          help="Field enclosure used in CSV file."
          disabled={this.props.disabled}
        />
      </div>
    );
  }
});
