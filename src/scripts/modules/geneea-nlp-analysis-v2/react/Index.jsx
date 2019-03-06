import React from 'react';
import {List, Map} from 'immutable';
import _ from 'underscore';
import {FormControls} from './../../../react/common/KbcBootstrap';
import {Check} from '@keboola/indigo-ui';
import Select from 'react-select';
import classnames from 'classnames';

import getDefaultBucket from '../../../utils/getDefaultBucket';

import Tooltip from '../../../react/common/Tooltip';
import SapiTableLinkEx from '../../components/react/components/StorageApiTableLinkEx';
import SapiTableSelector from '../../components/react/components/SapiTableSelector';

import FiltersDescription from '../../components/react/components/generic/FiltersDescription';

import TablesFilterModal from '../../components/react/components/generic/TableFiltersOnlyModal';

import ResultsHelpModal from './ResultsHelpModal';
import AdvancedSettings from './AdvancedSettings';

const StaticText = FormControls.Static;
import {params,
  getInTable,
  updateLocalState,
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
import SidebarJobsContainer from '../../components/react/components/SidebarJobsContainer';
import LatestVersions from '../../components/react/components/SidebarVersionsWrapper';

import {analysisTypes, languageOptions} from './templates';

const componentId = 'geneea.nlp-analysis-v2';

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

export default React.createClass({
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
      isSaving: InstalledComponentStore.getSavingConfigData(componentId, configId),
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

  parameterList(key, defaultValue) {
    const val = this.parameter(key, defaultValue);
    return val ? val.join(', ') : val;
  },

  parameter(key, defaultValue) {
    return this.state.parameters.getIn([].concat(key), defaultValue);
  },

  render() {
    return (
      <div className="container-fluid">
        {this.renderResultsHelpModal()}
        {this.renderTableFiltersModal()}
        <div className="col-md-9 kbc-main-content">
          <div className="row kbc-header">
            <ComponentDescription
              componentId={componentId}
              configId={this.state.configId}
            />
          </div>
          <div className="row">
            <div className="form form-horizontal">
              { this.state.editing ? this.renderEditing() : this.renderStatic()}
            </div>
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

  intableChange(value) {
    this.updateEditingValue('intable', value);
    resetEditingMapping(this.state.configId, value);
    const table = this.state.allTables.find((t) => t.get('id') === value);
    this.updateEditingValue(params.DATACOLUMN, List());
    this.updateEditingValue(params.LEAD, List());
    this.updateEditingValue(params.TITLE, List());
    this.updateEditingValue(params.PRIMARYKEY, table ? table.get('primaryKey') : List());
  },

  renderEditing() {
    return (
      <div>
        {this.renderFormElement('Input Table',
          <SapiTableSelector
            placeholder="Select..."
            value={this.getEditingValue('intable')}
            onSelectTableFn= {this.intableChange}
            excludeTableFn= { () => false}/>, 'Table conatining documents to analyze')
        }
        {this.renderFormElement(this.renderFilterLabel(), this.renderDataFilter(), 'Input table data filtered by specified rules, the filtered columns must be indexed.')}
        {this.renderColumnSelect('Id columns', params.PRIMARYKEY, 'Column of the input table uniquely identifying a row in the table.', true)}
        {this.renderColumnSelect('Text Columns', params.DATACOLUMN, 'Main text of the analyzed document', true)}
        {this.renderColumnSelect('Title Columns (optional)', params.TITLE, 'Title of the analyzed document', true)}
        {this.renderColumnSelect('Lead Columns (optional)', params.LEAD, 'Lead or abstract of the analyzed document', true)}

        {this.renderDomainSelect('The source domain from which the document originates.')}
        {this.renderFormElement('Language',
          <Select
            key="language"
            name="language"
            placeholder="autodetect"
            clearable={false}
            value={this.getEditingValue(params.LANGUAGE)}
            valueRenderer={(op) => {
              return op.label;
            }}
            onChange= {({value: newValue}) => this.updateEditingValue(params.LANGUAGE, newValue)}
            options= {languageOptions}/>, 'Language of the text of the data column.')
        }


        {this.renderFormElement('Correction',
          this.renderEnumSelect(params.CORRECTION, ['none', 'basic', 'aggressive']),
          'Indicates whether common typos should be corrected before analysis')}
        {this.renderFormElement('Diacritization',
          this.renderEnumSelect(params.DIACRITIC, ['none', 'auto', 'yes']),
          'Before analysing Czech text where diacritics are missing, add all the wedges and accents. For example, Muj ctyrnohy pritel is changed to Můj čtyřnohý přítel.')}
        {this.renderEditCheckBox(params.BETA, 'Use Beta Version', "Use Geneea's beta server (use only when instructed to do so)")}
        {this.renderAnalysisTypesSelect()}
        {this.renderAdvancedSettings()}
      </div>
    );
  },

  renderAdvancedSettings() {
    let data = this.getEditingValue(params.ADVANCED);
    if (!this.state.editing) {
      const advancedData = this.parameter(params.ADVANCED, Map()).toJS();
      if (_.isEmpty(advancedData)) {
        data = '{}';
      } else {
        data = JSON.stringify(advancedData, null, '  ');
      }
    }
    const element = (
      <AdvancedSettings
        isEditing={!!this.state.editing}
        data={data}
        isSaving={!!this.state.isSaving}
        onChange={this.updateEditingValue.bind(this, params.ADVANCED)}
      />
    );

    return this.renderFormElement('Advanced', element, 'Specifies arbitrary parameters as a JSON object');
  },

  renderEditCheckBox(prop, name, description) {
    return (
      <div className="form-group">
        <div className="checkbox col-sm-3">
          <label>
            <input
              type="checkbox"
              checked={this.getEditingValue(prop)}
              onChange= {(event) => this.updateEditingValue(prop, event.target.checked)}/>
            {name}
          </label>
        </div>
        <p className="help-block">{description}</p>
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
        Input Data Filter
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
        <div className="checkbox" key={value}>
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
        onChange= {(e) => this.updateEditingValue(prop, e ? e.value : '')}
        options= {allOptions}
      />
      , description);
    return result;
  },

  renderEnumSelect(prop, options) {
    const selectOptions = options.map((op) => {
      return {
        label: op,
        value: op
      };
    });
    return (
      <Select
        key={prop}
        clearable={false}
        value={this.getEditingValue(prop)}
        onChange= {({value}) => this.updateEditingValue(prop, value)}
        options= {selectOptions}/>
    );
  },

  renderColumnSelect(label, column, description, isMulti) {
    const value = this.getEditingValue(column);
    const result = this.renderFormElement(label,
      <Select
        multi={isMulti}
        clearable={false}
        key={column}
        value={value ? value.toJS() : ''}
        onChange={(newValue) => {
          this.updateEditingValue(
            column,
            isMulti ? List(newValue.map((val) => val.value)) : List([newValue.value])
          );
        }}
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
    const lang = this.parameter(params.LANGUAGE) || '';
    const langLabel = languageOptions.find((o) => o.value === lang).label;

    return (
      <div>
        {this.renderIntableStatic()}
        {this.RenderStaticInput('Input Data Filter', this.renderDataFilter() )}
        {this.RenderStaticInput('Id column', this.parameterList(params.PRIMARYKEY ))}
        {this.RenderStaticInput('Text Column', this.parameterList(params.DATACOLUMN) )}
        {this.RenderStaticInput('Title Column (optional)', this.parameterList(params.TITLE) )}
        {this.RenderStaticInput('Lead Column (optional)', this.parameterList(params.LEAD) )}

        {this.RenderStaticInput('Domain', this.findDomainNameByValue(this.parameter(params.DOMAIN)) )}
        {this.RenderStaticInput('Language', langLabel)}

        {this.RenderStaticInput('Correction', this.parameter(params.CORRECTION))}
        {this.RenderStaticInput('Diacritization', this.parameter(params.DIACRITIC))}
        {this.RenderStaticInput('Use beta', this.parameter(params.BETA), true)}
        {this.RenderStaticInput('Analysis tasks', this.renderStaticTasks())}
        {this.renderOutput()}
        {this.renderAdvancedSettings()}
      </div>
    );
  },

  renderResultLabel() {
    return (
      <Tooltip tooltip="show results explanation">
        <span>
          Analysis results {' '}
          <span
            onClick={this.showResultsHelpModal}
            className="fa fa-question-circle kbc-cursor-pointer" />
        </span>
      </Tooltip>
    );
  },

  showResultsHelpModal() {
    this.updateLocalState(['showResultsHelpModal'], true);
  },


  renderResultsHelpModal() {
    return (
      <ResultsHelpModal
        show={this.state.localState.get('showResultsHelpModal', false)}
        onClose={() => this.updateLocalState(['showResultsHelpModal'], false)}
      />
    );
  },

  renderOutput() {
    const bucketId = getDefaultBucket('out', componentId, this.state.configId);
    return (
      <div className="form-group">
        <label className="col-sm-3 control-label">
          {this.renderResultLabel()}
        </label>
        <div className="col-sm-9 ">
          <ul className="nav nav-stacked">
            <li>
              <SapiTableLinkEx
                tableId={`${bucketId}.analysis-result-documents`}/>
            </li>
            <li>
              <SapiTableLinkEx
                tableId={`${bucketId}.analysis-result-entities`}/>
            </li>
            <li>
              <SapiTableLinkEx
                tableId={`${bucketId}.analysis-result-relations`}/>
            </li>
          </ul>
        </div>
      </div>
    );
  },

  renderStaticTasks() {
    const tasks = this.parameter(params.ANALYSIS, List());
    let renderedTasks = tasks.map((task, idx) => {
      const info = analysisTypes[task];
      return (
        <Tooltip key={info.name} tooltip={info.description} placement="top">
          <span>
            {idx === 0 ? '' : ', '}
            {info.name}
          </span>
        </Tooltip>
      );
    }).toArray();
    return (<span>{renderedTasks}</span>);
  },

  renderIntableStatic() {
    const tableId = this.state.intable;
    const link = (
      <p label="Input Table"
        className="form-control-static">
        <SapiTableLinkEx
          tableId={tableId}/>
      </p>
    );
    return this.renderFormElement((<span>Input Table</span>), link);
  },

  RenderStaticInput(label, value, isBetaCheckobx = false) {
    return (
      <StaticText
        label={label}
        labelClassName="col-sm-3"
        wrapperClassName="col-sm-9">
        {isBetaCheckobx ? <Check
          isChecked={value}/>
          : value || 'n/a'}
      </StaticText>
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
        'key': column,
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
