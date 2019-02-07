import React from 'react';
import Select from 'react-select';
import storageActionCreators from '../../StorageActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storageTablesStore from '../../stores/StorageTablesStore';

export default React.createClass({
  mixins: [createStoreMixin(storageTablesStore)],

  propTypes: {
    onSelectTableFn: React.PropTypes.func.isRequired,
    placeholder: React.PropTypes.string.isRequired,
    value: React.PropTypes.string,
    excludeTableFn: React.PropTypes.func,
    allowedBuckets: React.PropTypes.array,
    disabled: React.PropTypes.bool,
    clearable: React.PropTypes.bool,
    autoFocus: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      excludeTableFn: () => false,
      allowedBuckets: ['in', 'out'],
      disabled: false,
      autoFocus: false,
      clearable: false
    };
  },

  getStateFromStores() {
    return {
      isTablesLoading: storageTablesStore.getIsLoading(),
      tables: storageTablesStore.getAll()
    };
  },

  componentDidMount() {
    setTimeout(() => storageActionCreators.loadTables());
  },

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.value !== this.props.value || nextState.isTablesLoading !== this.state.isTablesLoading;
  },

  render() {
    return (
      <Select
        disabled={this.props.disabled}
        name="source"
        clearable={this.props.clearable}
        backspaceRemoves={this.props.clearable}
        deleteRemoves={this.props.clearable}
        autoFocus={this.props.autoFocus}
        value={this.props.value}
        isLoading={this.state.isTablesLoading}
        placeholder={this.props.placeholder}
        valueRenderer={this.valueRenderer}
        optionRenderer={this.valueRenderer}
        onChange={selectedOption => {
          const tableId = selectedOption && selectedOption.value;
          const table = this.state.tables.find(t => t.get('id') === tableId);
          this.props.onSelectTableFn(tableId, table);
        }}
        options={this._getTables()}
      />
    );
  },

  tableExist(tableId) {
    return this.state.tables.find(t => tableId === t.get('id'));
  },

  valueRenderer(op) {
    if (this.tableExist(op.value)) {
      return op.label;
    }

    return <span className="text-muted">{op.label}</span>;
  },

  _getTables() {
    const result = this.state.tables
      .filter(table => {
        const stage = table.get('bucket').get('stage');
        const excludeTable = this.props.excludeTableFn(table.get('id'), table);
        return this.props.allowedBuckets.includes(stage) && !excludeTable;
      })
      .sort((a, b) => a.get('id').localeCompare(b.get('id')))
      .map(table => {
        return {
          label: table.get('id'),
          value: table.get('id')
        };
      })
      .toList()
      .toJS();

    const hasValue = result.find(t => t.value === this.props.value);

    if (!!this.props.value && !hasValue) {
      return result.concat({ label: this.props.value, value: this.props.value });
    }

    return result;
  }
});
