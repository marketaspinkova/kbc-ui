import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import TableSizeLabel from '../../components/TableSizeLabel';
import DeleteButton from '../../../../../react/common/DeleteButton';
import OutputMappingModal from '../../modals/OutputMapping';
import actionCreators from '../../../ActionCreators';
import { Map } from 'immutable';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    outputMapping: React.PropTypes.object.isRequired,
    mappingIndex: React.PropTypes.number.isRequired,
    editingOutputMapping: React.PropTypes.object.isRequired,
    editingId: React.PropTypes.string.isRequired,
    transformation: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    buckets: React.PropTypes.object.isRequired,
    bucket: React.PropTypes.object.isRequired,
    pendingActions: React.PropTypes.object.isRequired,
    definition: React.PropTypes.object,
    otherOutputMappings: React.PropTypes.object,
    disabled: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      definition: Map(),
      disabled: false
    };
  },

  render() {
    return (
      <span className="table kbc-break-all kbc-break-word">
        <span className="tbody">
          <span className="tr">
            {this.props.definition.has('label')
              ? [
                <span className="td col-xs-4" key="label">
                  {this.props.definition.get('label')}
                </span>,
                <span className="td col-xs-1" key="arrow">
                  <span className="fa fa-chevron-right fa-fw" />
                </span>,
                <span className="td col-xs-6" key="destination">
                  <TableSizeLabel
                    size={this.props.tables.getIn([this.props.outputMapping.get('destination'), 'dataSizeBytes'])}
                  />{' '}
                  {this.props.outputMapping.get('incremental') && (
                    <span className="label label-default">Incremental</span>
                  )}
                  {this.props.outputMapping.get('destination') !== ''
                    ? this.props.outputMapping.get('destination')
                    : 'Not set'}
                </span>
              ]
              : [
                <span className="td col-xs-4" key="soruce">
                  {this.props.transformation.get('backend') === 'docker'
                    ? `out/tables/${this.props.outputMapping.get('source')}`
                    : this.props.outputMapping.get('source')}
                </span>,
                <span className="td col-xs-1" key="arrow">
                  <span className="fa fa-chevron-right fa-fw" />
                </span>,
                <span className="td col-xs-3" key="buttons">
                  <TableSizeLabel
                    size={this.props.tables.getIn([this.props.outputMapping.get('destination'), 'dataSizeBytes'])}
                  />{' '}
                  {this.props.outputMapping.get('incremental') && (
                    <span className="label label-default">Incremental</span>
                  )}
                </span>,
                <span className="td col-xs-3" key="destination">
                  {this.props.outputMapping.get('destination')}
                </span>
              ]}
            <span className="td col-xs-1 col-xs-1 text-right kbc-no-wrap">
              {this.props.outputMapping.get('destination') !== '' && (
                <DeleteButton
                  tooltip="Delete Output"
                  isPending={this.props.pendingActions.get(`delete-output-${this.props.mappingIndex}`)}
                  isEnabled={!this.props.disabled}
                  confirm={{
                    title: 'Delete Output',
                    text: (
                      <span>
                        {'Do you really want to delete the output mapping for '}
                        <code>{this.props.outputMapping.get('destination')}</code>?
                      </span>
                    ),
                    onConfirm: this._handleDelete
                  }}
                />
              )}
              <OutputMappingModal
                transformationBucket={this.props.bucket}
                mode="edit"
                tables={this.props.tables}
                buckets={this.props.buckets}
                backend={this.props.transformation.get('backend')}
                type={this.props.transformation.get('type')}
                mapping={this.props.editingOutputMapping}
                onChange={this._handleChange}
                onCancel={this._handleCancel}
                onSave={this._handleSave}
                definition={this.props.definition}
                otherOutputMappings={this.props.otherOutputMappings}
                disabled={this.props.disabled}
              />
            </span>
          </span>
        </span>
      </span>
    );
  },

  _handleChange(newMapping) {
    return actionCreators.updateTransformationEditingField(
      this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      this.props.editingId,
      newMapping
    );
  },

  _handleCancel() {
    return actionCreators.cancelTransformationEditingField(
      this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      this.props.editingId
    );
  },

  _handleSave() {
    return actionCreators.saveTransformationMapping(
      this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      'output',
      this.props.editingId,
      this.props.mappingIndex
    );
  },

  _handleDelete() {
    return actionCreators.deleteTransformationMapping(
      this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      'output',
      this.props.mappingIndex
    );
  }
});
