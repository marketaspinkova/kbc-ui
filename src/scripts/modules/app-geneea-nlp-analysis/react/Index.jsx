import React from 'react';
import createReactClass from 'create-react-class';
import {List, Map} from 'immutable';
import _ from 'underscore';
import {Check} from '@keboola/indigo-ui';
import Select from 'react-select';

import classnames from 'classnames';

import Tooltip from '../../../react/common/Tooltip';
import SapiTableLinkEx from '../../components/react/components/StorageApiTableLinkEx';
import SapiTableSelector from '../../components/react/components/SapiTableSelector';

import FiltersDescription from '../../components/react/components/generic/FiltersDescription';

import TablesFilterModal from '../../components/react/components/generic/TableFiltersOnlyModal';

import {ControlLabel, FormControl, FormGroup} from 'react-bootstrap';
import {params,
  getInTable,
  updateLocalState,
  isOutputValid,
  updateEditingValue,
  updateEditingMapping,
  getInputMapping,
  startEditing,
  resetEditingMapping,
  getEditingValue} from '../actions';

import createStoreMixin from '../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../stores/RoutesStore';
import InstalledComponentStore from '../../components/stores/InstalledComponentsStore';
import storageTablesStore from '../../components/stores/StorageTablesStore';

import ComponentDescription from '../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../components/react/components/ComponentMetadata';
import RunComponentButton from '../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';
import ScheduleConfigurationButton from '../../components/react/components/ScheduleConfigurationButton';
import SidebarJobsContainer from '../../components/react/components/SidebarJobsContainer';
import LatestVersions from '../../components/react/components/SidebarVersionsWrapper';

import {analysisTypes, languageOptions} from './templates';

const componentId = 'geneea-nlp-analysis';

const domainOptions = [
  {
    label: 'News Articles',
    value: 'news'

  },
  {
    label: 'Hospitality Customer Care',
    value: 'hcc'

  },
  {
    label: 'Transportation Customer Care',
    value: 'tcc'

  }
];

export default createReactClass({
  mixins: [createStoreMixin(storageTablesStore, InstalledComponentStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const localState = InstalledComponentStore.getLocalState(componentId, configId);
    const configData = InstalledComponentStore.getConfigData(componentId, configId);

    const intable = getInTable(configId);
    const parameters = configData.get('parameters', Map());
    const allSapiTables = storageTablesStore.getAll();
    // console.log(allSapiTables.toJS());

    return {
      configId: configId,
      localState: localState,
      configData: configData,
      intable: intable,
      parameters: parameters,
      editing: !!localState.get('editing'),
      allTables: allSapiTables

    };
  },

  componentDidMount() {
    let data = this.state.configData;
    if (data) {
      data = data.toJS();
    }

    if (_.isEmpty(data)) {
      startEditing(this.state.configId);
    }
  },

  parameter(key, defaultValue) {
    return this.state.parameters.get(key, defaultValue);
  },

  render() {
    return (
      <div className="container-fluid">
        {this.renderTableFiltersModal()}
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
            <ComponentDescription
              componentId={componentId}
              configId={this.state.configId}
            />
          </div>
          <div className="kbc-inner-padding">
            <form className="form-horizontal">
              { this.state.editing ? this.renderEditing() : this.renderStatic()}
            </form>
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <div className="kbc-buttons kbc-text-light">
            <ComponentMetadata
              componentId={componentId}
              configId={this.state.configId}
            />
          </div>
          <ul className="nav nav-stacked">
            <li className={classnames({disabled: this.state.editing})}>
              <RunComponentButton
                title="Run Analysis"
                component={componentId}
                mode="link"
                runParams={ () => ({config: this.state.configId}) }
                disabledReason="Configuration is not saved."
                disabled={this.state.editing}
              >
                You are about to run the analysis job of selected task(s).
              </RunComponentButton>
            </li>
            <li>
              <DeleteConfigurationButton
                componentId={componentId}
                configId={this.state.configId}
              />
            </li>
            <li>
              <ScheduleConfigurationButton
                componentId={componentId}
                configId={this.state.configId}
              />
            </li>
          </ul>
          <SidebarJobsContainer
            componentId={componentId}
            configId={this.state.configId}
            limit={3}
          />
          <LatestVersions
            limit={3}
            componentId={componentId}
          />
        </div>
      </div>
    );
  },

  renderEditing() {
    const intableChange = (value) => {
      this.updateEditingValue('intable', value);
      resetEditingMapping(this.state.configId, value);
      this.updateEditingValue(params.DATACOLUMN, '');
      this.updateEditingValue(params.PRIMARYKEY, '');
    };
    const outputValid = isOutputValid(this.getEditingValue(params.OUTPUT));
    return (
      <div>
        {this.renderFormElement('Input Table',
          <SapiTableSelector
            placeholder="Select..."
            value={this.getEditingValue('intable')}
            onSelectTableFn= {intableChange}
            excludeTableFn= { () => false}/>)
        }
        {this.renderFormElement(this.renderFilterLabel(), this.renderDataFilter(), 'Input table data filtered by specified rules, the filtered columns must be indexed.')}
        {this.renderColumnSelect('Data Column', params.DATACOLUMN, 'Column of the input table containing text to analyze.')}
        {this.renderColumnSelect('Primary Key', params.PRIMARYKEY, 'Column of the input table uniquely identifying a row in the table.')}
        {this.renderFormElement('Output Table Prefix',
          <input
            className="form-control"
            value={this.getEditingValue(params.OUTPUT)}
            onChange= {(event) => this.updateEditingValue(params.OUTPUT, event.target.value)}
            placeholder="e.g. out.c-main.result"/>,
          'Prefix of the output table id, if is only a bucket id then it must end with dot \'.\'', !outputValid)
        }
        {this.renderDomainSelect('The source domain from which the document originates.')}
        {this.renderFormElement('Language',
          <Select
            key="language"
            name="language"
            clearable={false}
            value={this.getEditingValue(params.LANGUAGE)}
            onChange= {({value: newValue}) => this.updateEditingValue(params.LANGUAGE, newValue)}
            options= {languageOptions}/>, 'Language of the text of the data column.')
        }
        {this.renderAnalysisTypesSelect()}
        {this.renderUseBetaEdit()}
      </div>
    );
  },

  renderUseBetaEdit() {
    return (
      <div className="form-group">
        <div className="checkbox col-sm-3">
          <label>
            <input
              type="checkbox"
              checked={this.getEditingValue(params.BETA)}
              onChange= {(event) => this.updateEditingValue(params.BETA, event.target.checked)}/>
          Use BETA Version
          </label>
        </div>
      </div>
    );
  },

  renderTableFiltersModal() {
    return (
      <TablesFilterModal
        show={!!this.getEditingValue('showFilterModal')}
        onOk={() => this.updateEditingValue('showFilterModal', false)}
        value={getInputMapping(this.state.configId, this.state.editing)}
        allTables={this.state.allTables}
        onSetMapping={(newMapping) =>  updateEditingMapping(this.state.configId, newMapping)}
        onResetAndHide={() => {
          const savedMapping = this.getEditingValue('backupedMapping');
          updateEditingMapping(this.state.configId, savedMapping);
          this.updateEditingValue('showFilterModal', false);
        }}
      />
    );
  },

  renderFilterLabel() {
    const isEditing = this.state.editing;
    const mapping = getInputMapping(this.state.configId, isEditing);
    const modalButton = (
      <button
        style={{padding: '0px 10px 0px 10px'}}
        className="btn btn-link"
        type="button"
        onClick={() => {
          this.updateEditingValue('showFilterModal', true);
          this.updateEditingValue('backupedMapping', mapping);
        }}
      >
        <span className="kbc-icon-pencil"/>
      </button>);
    return (
      <span>
        Data Filter
        {(isEditing ? modalButton : null)}
      </span>
    );
  },

  renderDataFilter() {
    const isEditing = this.state.editing;
    const mapping = getInputMapping(this.state.configId, isEditing);

    return (
      <span>
        <FiltersDescription
          value={mapping}
          rootClassName=""/>
      </span>
    );
  },

  renderAnalysisTypesSelect() {
    const selectedTypes = this.getEditingValue(params.ANALYSIS);
    const options = _.map( _.keys(analysisTypes), (value) => {
      const checked = (selectedTypes.contains(value));
      const onChange = (e) => {
        const isChecked = e.target.checked;
        const newSelected = isChecked ? selectedTypes.push(value) : selectedTypes.filter( (t) => t !== value);
        this.updateEditingValue(params.ANALYSIS, newSelected);
      };
      const info = analysisTypes[value];
      return (
        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              checked={checked}
              onChange={onChange}/>
            <span>
              {info.name}
            </span>
            <p className="help-block">{info.description}</p>
          </label>
        </div>
      );
    }
    );

    return this.renderFormElement('Analysis tasks', options);
  },

  renderFormElement(label, element, description = '', hasError = false) {
    let errorClass = 'form-group';
    if (hasError) {
      errorClass = 'form-group has-error';
    }

    return (
      <div className={errorClass}>
        <label className="control-label col-sm-3">
          {label}
        </label>
        <div className="col-sm-9">
          {element}
          <span className="help-block">{description}</span>
        </div>
      </div>
    );
  },

  renderDomainSelect(description) {
    const predefinedColumns = domainOptions;
    const prop = params.DOMAIN;
    const currentValue = this.getEditingValue(prop);
    const hasValueOption = predefinedColumns.find(({value}) => value === currentValue);
    const allOptions = !!hasValueOption ? predefinedColumns : predefinedColumns.concat({label: currentValue, value: currentValue});
    const result = this.renderFormElement(
      'Domain',
      <Select.Creatable
        placeholder="Select or type new..."
        clearable={true}
        key="domain"
        name="domain"
        value={currentValue}
        onChange= {(newValue) => this.updateEditingValue(prop, newValue ? newValue.value : '')}
        options= {allOptions}
      />
      , description);
    return result;
  },

  renderColumnSelect(label, column, description) {
    const result = this.renderFormElement(label,
      <Select
        clearable={false}
        key={column}
        name={column}
        value={this.getEditingValue(column)}
        onChange= {({value: newValue}) => this.updateEditingValue(column, newValue)}
        options= {this.getColumns()}
      />
      , description);
    return result;
  },
  findDomainNameByValue(value) {
    const result = domainOptions.find((c) => c.value === value);
    return !!result ? result.label : value;
  },
  renderStatic() {
    return (
      <div>
        {this.renderIntableStatic()}
        {this.RenderStaticInput('Data Filter', this.renderDataFilter() )}
        {this.RenderStaticInput('Data Column', this.parameter(params.DATACOLUMN) )}

        {this.RenderStaticInput('Primary Key', this.parameter(params.PRIMARYKEY ))}
        {this.RenderStaticInput('Output Table Prefix', this.parameter(params.OUTPUT) )}
        {this.RenderStaticInput('Language', this.parameter(params.LANGUAGE))}
        {this.RenderStaticInput('Domain', this.findDomainNameByValue(this.parameter(params.DOMAIN)) )}

        {this.RenderStaticInput('Analysis tasks', this.renderStaticTasks())}
        {this.RenderStaticInput('Use beta', this.parameter(params.BETA), true)}
      </div>
    );
  },

  renderStaticTasks() {
    const tasks = this.parameter(params.ANALYSIS, List());
    const outParam = this.parameter(params.OUTPUT, '');
    let renderedTasks = tasks.map((task, index) => {
      const info = analysisTypes[task];
      const outTableId = outParam ? `${outParam}${task}` : '';
      return (
        <li key={index}>
          <div className="row">
            <Tooltip tooltip={info.description} placement="top">
              <div className="col-sm-4" style={{paddingLeft: 0}}>
                <strong className="text-left">
                  {info.name}
                </strong>
              </div>
            </Tooltip>
            <i style={{paddingLeft: 0}} className="kbc-icon-arrow-right col-sm-1"/>
            <SapiTableLinkEx className="col-sm-6" tableId={outTableId}/>
          </div>
        </li>
      );
    }).toArray();
    return (<ul className="list-unstyled">{renderedTasks}</ul>);
  },

  renderIntableStatic() {
    const tableId = this.state.intable;
    const link = (<p
      label="Input Table"
      className="form-control-static">
      <SapiTableLinkEx
        tableId={tableId}/></p>
    );
    return this.renderFormElement((<span>Input Table</span>), link);
  },

  RenderStaticInput(label, value, isBetaCheckobx = false) {
    return (
      <FormGroup>
        <ControlLabel className="col-sm-3">{label}</ControlLabel>
        <FormControl.Static className="col-sm-9" componentClass="div">
          {isBetaCheckobx ? <Check
            isChecked={value}/> : value || 'n/a'}
        </FormControl.Static>
      </FormGroup>
    );
  },

  getColumns() {
    const tableId = this.getEditingValue('intable');
    const tables = storageTablesStore.getAll();

    if (!tableId || !tables) {
      return [];
    }

    const table = tables.find((ptable) => {
      return ptable.get('id') === tableId;
    });

    if (!table) {
      return [];
    }
    return table.get('columns').map( (column) => {
      return {
        'label': column,
        'value': column
      };
    }).toList().toJS();
  },

  updateEditingValue(prop, value) {
    updateEditingValue(this.state.configId, prop, value);
  },

  getEditingValue(prop) {
    return getEditingValue(this.state.configId, prop);
  },

  updateLocalState(path, data) {
    updateLocalState(this.state.configId, path, data);
  }

});
