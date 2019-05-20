import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import { Map, List, fromJS } from 'immutable';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { ExternalLink } from '@keboola/indigo-ui';
import TransformationsActionCreators from '../../../ActionCreators';
import ApplicationStore from '../../../../../stores/ApplicationStore';
import InputMappingRow from './InputMappingRow';
import InputMappingDetail from './InputMappingDetail';
import OutputMappingRow from './OutputMappingRow';
import OutputMappingDetail from './OutputMappingDetail';
import { Panel } from 'react-bootstrap';
import TransformationTypeAndVersionLabel from '../../components/TransformationTypeAndVersionLabel';
import Requires from './Requires';
import Packages from './Packages';
import SavedFiles from './SavedFiles';
import Queries from './Queries';
import Scripts from './Scripts';
import Phase from './Phase';
import BackendVersionWarning from '../../components/backend-version/Warning';
import DupliciteOutputMappingWarning from '../../components/duplicite-output-mapping/Warning';
import AddOutputMapping from './AddOutputMapping';
import AddInputMapping from './AddInputMapping';
import InlineEditArea from '../../../../../react/common/InlineEditArea';
import TransformationEmptyInputImage from '../../components/TransformationEmptyInputImage';
import TransformationEmptyOutputImage from '../../components/TransformationEmptyOutputImage';
import ConfigurationRowEditField from '../../../../components/react/components/ConfigurationRowEditField';
import contactSupport from '../../../../../utils/contactSupport';
import mappingDefinitions from '../../../../components/utils/mappingDefinitions';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    bucket: PropTypes.object.isRequired,
    transformation: PropTypes.object.isRequired,
    editingFields: PropTypes.object.isRequired,
    isEditingValid: PropTypes.bool.isRequired,
    isQueriesProcessing: PropTypes.bool.isRequired,
    transformations: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tablesUsages: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired,
    transformationId: PropTypes.string.isRequired,
    openInputMappings: PropTypes.object.isRequired,
    openOutputMappings: PropTypes.object.isRequired,
    showDetails: PropTypes.bool.isRequired,
    highlightQueryNumber: PropTypes.number,
    highlightingQueryDisabled: PropTypes.bool
  },

  // TODO move this to component definition UI Options
  openRefine: {
    inputMappingDefinitions: fromJS([
      {
        label: 'Load data from table',
        destination: 'data.csv'
      }
    ]),
    outputMappingDefinitions: fromJS([
      {
        label: 'Save result to table',
        source: 'data.csv'
      }
    ])
  },

  render() {
    return (
      <div>
        {this.props.showDetails ? (
          this._renderDetail()
        ) : (
          <div className="kbc-row">
            <div className="well">This transformation is not supported in the UI.</div>
          </div>
        )}
      </div>
    );
  },

  _isOpenRefineTransformation() {
    return (
      this.props.transformation.get('backend') === 'docker' && this.props.transformation.get('type') === 'openrefine'
    );
  },

  _getInputMappingValue() {
    const value = this.props.transformation.get('input', List());
    if (this._isOpenRefineTransformation()) {
      return mappingDefinitions.getInputMappingValue(this.openRefine.inputMappingDefinitions, value);
    }
    return value;
  },

  _getOutputMappingValue() {
    const value = this.props.transformation.get('output', List());
    if (this._isOpenRefineTransformation()) {
      return mappingDefinitions.getOutputMappingValue(this.openRefine.outputMappingDefinitions, value);
    }
    return value;
  },

  _toggleInputMapping(index) {
    return TransformationsActionCreators.toggleOpenInputMapping(
      this.props.bucketId,
      this.props.transformationId,
      index
    );
  },

  _toggleOutputMapping(index) {
    return TransformationsActionCreators.toggleOpenOutputMapping(
      this.props.bucketId,
      this.props.transformationId,
      index
    );
  },

  _getDependentTransformations() {
    return this.props.transformations.filter(transformation =>
      transformation.get('requires').contains(this.props.transformation.get('id'))
    );
  },

  _inputMappingDestinations(exclude) {
    return this._getInputMappingValue()
      .filter((mapping, key) => key !== exclude)
      .map(mapping => mapping.get('destination').toLowerCase());
  },

  _renderRequires() {
    let dependentTransformations = [];

    if (this._getDependentTransformations().count()) {
      dependentTransformations = [
        <h2
          style={{
            lineHeight: '32px'
          }}
          key="requires-title"
        >
          Dependent transformations
        </h2>,
        <span key="requires-dependents">
          <div>
            {this._getDependentTransformations()
              .map(dependent => {
                return (
                  <Link
                    key={dependent.get('id')}
                    to="transformationDetail"
                    params={{ row: dependent.get('id'), config: this.props.bucket.get('id') }}
                  >
                    <span className="label kbc-label-rounded-small label-default">
                      {dependent.get('phase', 1) !== this.props.transformation.get('phase', 1)
                        ? dependent.get('name') + ' (phase mismatch)'
                        : dependent.get('name')}
                    </span>
                  </Link>
                );
              })
              .toArray()}
          </div>
        </span>,
        <span className="help-block" key="requires-help">
          These transformations are dependent on the current transformation.
        </span>
      ];
    }

    return (
      <span>
        <Requires
          transformation={this.props.transformation}
          transformations={this.props.transformations}
          isSaving={this.props.pendingActions.has('save-requires')}
          disabled={this.isDisabled()}
          requires={this.props.editingFields.get('requires', this.props.transformation.get('requires'))}
          bucketId={this.props.bucketId}
          onEditChange={newValue => {
            TransformationsActionCreators.updateTransformationEditingField(
              this.props.bucketId,
              this.props.transformationId,
              'requires',
              newValue
            );
            return TransformationsActionCreators.saveTransformationEditingField(
              this.props.bucketId,
              this.props.transformationId,
              'requires'
            );
          }}
        />
        {dependentTransformations.length > 0 && dependentTransformations}
      </span>
    );
  },

  _renderDetail() {
    return (
      <span>
        <div className="kbc-row">
          <p className="text-right">
            <Phase
              bucketId={this.props.bucketId}
              transformation={this.props.transformation}
            />{' '}
            <TransformationTypeAndVersionLabel
              transformation={this.props.transformation}
              bucketId={this.props.bucketId}
              showVersion
              showVersionEditButton
            />
          </p>
          {this.props.transformation.has('imageTag') && (
            <BackendVersionWarning />
          )}
          <DupliciteOutputMappingWarning
            transformation={this.props.transformation}
            transformations={this.props.transformations}
            bucketId={this.props.bucketId}
          />
          {this._isOpenRefineTransformation() && [
            <h2 key="header">OpenRefine Beta Warning</h2>,

            <div key="block" className="help-block">
              <span>
                {'OpenRefine transformations are now in public beta. '}
                {'Please be aware that things may change before the transformations make it to production. '}
                {'If you encounter any errors, please '}
                <button className="btn btn-link btn-link-inline" onClick={contactSupport}>
                  contact us
                </button>
                {' or read more in the '}
                <ExternalLink href="https://help.keboola.com/manipulation/transformations/openrefine/">documentation</ExternalLink>.
              </span>
            </div>
          ]}
          <ConfigurationRowEditField
            componentId="transformation"
            configId={this.props.bucketId}
            rowId={this.props.transformationId}
            fieldName="description"
            editElement={InlineEditArea}
            placeholder="Describe transformation"
            fallbackValue={this.props.transformation.get('description')}
          />
        </div>
        {(this.props.transformation.get('backend') !== 'docker' ||
          (ApplicationStore.hasCurrentProjectFeature('transformations-mixed-backends') &&
            this.props.transformation.get('backend') === 'docker' &&
            ['python', 'r'].includes(this.props.transformation.get('type')))) && (
          <div className="kbc-row">{this._renderRequires()}</div>
        )}
        <div className="kbc-row">
          <div className="mapping">
            <h2>
              Input Mapping
              {!this._isOpenRefineTransformation() && (
                <span className="pull-right add-mapping-button">
                  {!this._getInputMappingValue().count() && <small className="empty-label">No input assigned</small>}
                  <AddInputMapping
                    tables={this.props.tables}
                    transformation={this.props.transformation}
                    bucket={this.props.bucket}
                    mapping={this.props.editingFields.get('new-input-mapping', Map())}
                    otherDestinations={this._inputMappingDestinations()}
                  />
                </span>
              )}
            </h2>
            {this._getInputMappingValue().count() ? (
              <div className="mapping-rows">
                {this._getInputMappingValue()
                  .map((input, key) => {
                    let definition;
                    if (this._isOpenRefineTransformation()) {
                      definition = mappingDefinitions.findInputMappingDefinition(this.openRefine.inputMappingDefinitions, input);
                    }
                    return (
                      <Panel
                        className="kbc-panel-heading-with-table"
                        key={key}
                        collapsible={true}
                        eventKey={key}
                        expanded={this.props.openInputMappings.get(key, false)}
                        header={
                          <div onClick={() => this._toggleInputMapping(key)}>
                            <InputMappingRow
                              transformation={this.props.transformation}
                              bucket={this.props.bucket}
                              inputMapping={input}
                              tables={this.props.tables}
                              tablesUsages={this.props.tablesUsages}
                              editingInputMapping={this.props.editingFields.get(`input-${key}`, input)}
                              editingId={`input-${key}`}
                              mappingIndex={key.toString()}
                              pendingActions={this.props.pendingActions}
                              otherDestinations={this._inputMappingDestinations(key)}
                              definition={definition}
                              disabled={this.isDisabled()}
                            />
                          </div>
                        }
                      >
                        <InputMappingDetail
                          transformationBackend={this.props.transformation.get('backend')}
                          inputMapping={input}
                          tables={this.props.tables}
                          definition={definition}
                        />
                      </Panel>
                    );
                  })
                  .toArray()}
              </div>
            ) : (
              <div className="text-center">
                <TransformationEmptyInputImage />
              </div>
            )}
          </div>
        </div>
        <div className="kbc-row">
          <div className="mapping">
            <h2>
              Output Mapping
              {!this._isOpenRefineTransformation() && (
                <span className="pull-right add-mapping-button">
                  {!this._getOutputMappingValue().count() && <small className="empty-label">No output assigned</small>}
                  <AddOutputMapping
                    tables={this.props.tables}
                    buckets={this.props.buckets}
                    transformation={this.props.transformation}
                    bucket={this.props.bucket}
                    mapping={this.props.editingFields.get('new-output-mapping', Map())}
                  />
                </span>
              )}
            </h2>
            {this._getOutputMappingValue().count() ? (
              <div className="mapping-rows">
                {this._getOutputMappingValue()
                  .map(
                    (output, key) => {
                      let definition;
                      if (this._isOpenRefineTransformation()) {
                        definition = mappingDefinitions.findOutputMappingDefinition(this.openRefine.outputMappingDefinitions, output);
                      }
                      return (
                        <Panel
                          className="kbc-panel-heading-with-table"
                          key={key}
                          collapsible={true}
                          eventKey={key}
                          expanded={this.props.openOutputMappings.get(key, false)}
                          header={
                            <div onClick={() => this._toggleOutputMapping(key)}>
                              <OutputMappingRow
                                transformation={this.props.transformation}
                                bucket={this.props.bucket}
                                outputMapping={output}
                                editingOutputMapping={this.props.editingFields.get(`input-${key}`, output)}
                                editingId={`input-${key}`}
                                mappingIndex={key}
                                tables={this.props.tables}
                                pendingActions={this.props.pendingActions}
                                buckets={this.props.buckets}
                                definition={definition}
                                otherOutputMappings={this.props.transformation
                                  .get('output')
                                  .filter((otherOutputMapping, otherOutputMappingKey) => otherOutputMappingKey !== key)}
                                disabled={this.isDisabled()}
                              />
                            </div>
                          }
                        >
                          <OutputMappingDetail outputMapping={output} />
                        </Panel>
                      );
                    },

                    this
                  )
                  .toArray()}
              </div>
            ) : (
              <div className="text-center">
                <TransformationEmptyOutputImage />
              </div>
            )}
          </div>
        </div>
        {this.props.transformation.get('backend') === 'docker' &&
          this.props.transformation.get('type') !== 'openrefine' && (
          <div className="kbc-row">
            <Packages
              transformation={this.props.transformation}
              isSaving={this.props.pendingActions.has('save-packages')}
              disabled={this.isDisabled()}
              packages={this.props.editingFields.get('packages', this.props.transformation.get('packages', List()))}
              onEditChange={newValue => {
                TransformationsActionCreators.updateTransformationEditingField(
                  this.props.bucketId,
                  this.props.transformationId,
                  'packages',
                  newValue
                );
                return TransformationsActionCreators.saveTransformationEditingField(
                  this.props.bucketId,
                  this.props.transformationId,
                  'packages'
                );
              }}
            />
            <div>
              <SavedFiles
                isSaving={this.props.pendingActions.has('save-tags')}
                disabled={this.isDisabled()}
                tags={this.props.editingFields.get('tags', this.props.transformation.get('tags', List()))}
                onEditChange={newValue => {
                  TransformationsActionCreators.updateTransformationEditingField(
                    this.props.bucketId,
                    this.props.transformationId,
                    'tags',
                    newValue
                  );
                  return TransformationsActionCreators.saveTransformationEditingField(
                    this.props.bucketId,
                    this.props.transformationId,
                    'tags'
                  );
                }}
              />
            </div>
          </div>
        )}
        <div className="kbc-row">{this._renderCodeEditor()}</div>
      </span>
    );
  },

  _renderCodeEditor() {
    if (this.props.transformation.get('backend') === 'docker') {
      return (
        <Scripts
          bucketId={this.props.bucket.get('id')}
          transformation={this.props.transformation}
          isEditing={this.props.editingFields.has('queriesString')}
          isSaving={this.props.pendingActions.has('save-queries')}
          disabled={this.isDisabled()}
          scripts={this.props.editingFields.get('queriesString', this.props.transformation.get('queriesString'))}
          isEditingValid={this.props.isEditingValid}
          isChanged={this.props.editingFields.get('queriesChanged', false)}
          changeDescription={this.props.editingFields.get('description', '')}
          onDescriptionChange={description => {
            return TransformationsActionCreators.updateTransformationEditingField(
              this.props.bucketId,
              this.props.transformationId,
              'description',
              description
            );
          }}
          onEditCancel={() => {
            TransformationsActionCreators.cancelTransformationEditingField(
              this.props.bucketId,
              this.props.transformationId,
              'queriesString'
            );
            return TransformationsActionCreators.cancelTransformationEditingField(
              this.props.bucketId,
              this.props.transformationId,
              'queriesChanged'
            );
          }}
          onEditChange={newValue => {
            TransformationsActionCreators.updateTransformationEditingField(
              this.props.bucketId,
              this.props.transformationId,
              'queriesString',
              newValue
            );
            if (!this.props.editingFields.get('queriesChanged', false)) {
              return TransformationsActionCreators.updateTransformationEditingField(
                this.props.bucketId,
                this.props.transformationId,
                'queriesChanged',
                true
              );
            }
          }}
          onEditSubmit={() => {
            return TransformationsActionCreators.saveTransformationScript(
              this.props.bucketId,
              this.props.transformationId
            );
          }}
        />
      );
    }

    return (
      <Queries
        bucketId={this.props.bucket.get('id')}
        transformation={this.props.transformation}
        isEditing={this.props.editingFields.has('queriesString')}
        isSaving={this.props.pendingActions.has('save-queries')}
        disabled={this.isDisabled()}
        queries={this.props.editingFields.get('queriesString', this.props.transformation.get('queriesString'))}
        splitQueries={this.props.editingFields.get('splitQueries', this.props.transformation.get('queries'))}
        isQueriesProcessing={this.props.isQueriesProcessing}
        isChanged={this.props.editingFields.get('queriesChanged', false)}
        highlightQueryNumber={this.props.highlightQueryNumber}
        highlightingQueryDisabled={this.props.highlightingQueryDisabled}
        changeDescription={this.props.editingFields.get('description', '')}
        onDescriptionChange={description => {
          return TransformationsActionCreators.updateTransformationEditingField(
            this.props.bucketId,
            this.props.transformationId,
            'description',
            description
          );
        }}
        onEditCancel={() => {
          TransformationsActionCreators.cancelTransformationEditingField(
            this.props.bucketId,
            this.props.transformationId,
            'splitQueries'
          );
          TransformationsActionCreators.cancelTransformationEditingField(
            this.props.bucketId,
            this.props.transformationId,
            'queriesString'
          );
          return TransformationsActionCreators.cancelTransformationEditingField(
            this.props.bucketId,
            this.props.transformationId,
            'queriesChanged'
          );
        }}
        onEditChange={newValue => {
          TransformationsActionCreators.updateTransformationEditingField(
            this.props.bucketId,
            this.props.transformationId,
            'queriesString',
            newValue
          );
          TransformationsActionCreators.updateTransformationEditingFieldQueriesString(
            this.props.bucketId,
            this.props.transformationId,
            newValue
          );
          if (!this.props.editingFields.get('queriesChanged', false)) {
            return TransformationsActionCreators.updateTransformationEditingField(
              this.props.bucketId,
              this.props.transformationId,
              'queriesChanged',
              true
            );
          }
        }}
        onEditSubmit={() => {
          return TransformationsActionCreators.saveTransformationQueries(
            this.props.bucketId,
            this.props.transformationId
          );
        }}
      />
    );
  },

  isDisabled() {
    const actions = this.props.pendingActions.delete('queries-processing');

    return actions.count() > 0;
  }
});
