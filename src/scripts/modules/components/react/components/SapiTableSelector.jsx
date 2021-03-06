import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Select from 'react-select';
import TableUsagesLabel from '../../../transformations/react/components/TableUsagesLabel';
import storageActionCreators from '../../StorageActionCreators';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import storageTablesStore from '../../stores/StorageTablesStore';

export default createReactClass({
  mixins: [createStoreMixin(storageTablesStore)],

  propTypes: {
    onSelectTableFn: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    value: PropTypes.string,
    excludeTableFn: PropTypes.func,
    allowedBuckets: PropTypes.array,
    disabled: PropTypes.bool,
    clearable: PropTypes.bool,
    autoFocus: PropTypes.bool,
    tablesUsages: PropTypes.bool
  },

  getDefaultProps() {
    return {
      excludeTableFn: () => false,
      allowedBuckets: ['in', 'out'],
      disabled: false,
      autoFocus: false,
      clearable: false,
      tablesUsages: false
    };
  },

  getStateFromStores() {
    return {
      isTablesLoading: storageTablesStore.getIsLoading(),
      tables: storageTablesStore.getAll(),
      tablesUsages: storageTablesStore.getAllUsages(),
    };
  },

  componentDidMount() {
    setTimeout(() => storageActionCreators.loadTables());
  },

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.value !== this.props.value || 
      nextState.isTablesLoading !== this.state.isTablesLoading ||
      !nextState.tablesUsages.equals(this.state.tablesUsages)
    );
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
        let label = table.get('id');

        if (this.props.tablesUsages) {
          label = <span><TableUsagesLabel usages={this.state.tablesUsages.get(table.get('id'))} /> {label}</span>;
        }

        return { label, value: table.get('id') };
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
