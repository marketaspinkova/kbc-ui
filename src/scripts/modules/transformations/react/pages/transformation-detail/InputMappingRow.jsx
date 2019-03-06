import React from 'react';
import DeleteButton from '../../../../../react/common/DeleteButton';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import TableSizeLabel from '../../components/TableSizeLabel';
import TransformationTableTypeLabel from '../../components/TransformationTableTypeLabel';
import InputMappingModal from '../../modals/InputMapping';
import actionCreators from '../../../ActionCreators';
import { Map } from 'immutable';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    inputMapping: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    transformation: React.PropTypes.object.isRequired,
    bucket: React.PropTypes.object.isRequired,
    editingId: React.PropTypes.string.isRequired,
    mappingIndex: React.PropTypes.string.isRequired,
    otherDestinations: React.PropTypes.object.isRequired,
    editingInputMapping: React.PropTypes.object,
    pendingActions: React.PropTypes.object,
    definition: React.PropTypes.object,
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
                    size={this.props.tables.getIn([this.props.inputMapping.get('source'), 'dataSizeBytes'])}
                  />{' '}
                  {this.props.inputMapping.get('source') !== '' ? this.props.inputMapping.get('source') : 'Not set'}
                </span>
              ]
              : [
                <span className="td col-xs-3" key="icons">
                  <TableSizeLabel
                    size={this.props.tables.getIn([this.props.inputMapping.get('source'), 'dataSizeBytes'])}
                  />{' '}
                </span>,
                <span className="td col-xs-4" key="source">
                  {this.props.inputMapping.get('source', 'Not set')}
                </span>,
                <span className="td col-xs-1" key="arrow">
                  <span className="fa fa-chevron-right fa-fw" />
                </span>,
                <span className="td col-xs-3" key="destination">
                  <TransformationTableTypeLabel
                    backend={this.props.transformation.get('backend')}
                    type={this.props.inputMapping.get('type')}
                  />{' '}
                  {this.props.transformation.get('backend') === 'docker'
                    ? `in/tables/${this.props.inputMapping.get('destination')}`
                    : this.props.inputMapping.get('destination')}
                </span>
              ]}
            <span className="td col-xs-1 text-right kbc-no-wrap">
              {this.props.inputMapping.get('source') !== '' && (
                <DeleteButton
                  tooltip="Delete Input"
                  isPending={this.props.pendingActions.get(`delete-input-${this.props.mappingIndex}`)}
                  isEnabled={!this.props.disabled}
                  confirm={{
                    title: 'Delete Input',
                    text: (
                      <span>
                        {'Do you really want to delete the input mapping for '}
                        <code>{this.props.inputMapping.get('source')}</code>?
                      </span>
                    ),
                    onConfirm: this._handleDelete
                  }}
                />
              )}
              <InputMappingModal
                mode="edit"
                tables={this.props.tables}
                backend={this.props.transformation.get('backend')}
                type={this.props.transformation.get('type')}
                mapping={this.props.editingInputMapping}
                otherDestinations={this.props.otherDestinations}
                onChange={this._handleChange}
                onCancel={this._handleCancel}
                onSave={this._handleSave}
                definition={this.props.definition}
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
      'input',
      this.props.editingId,
      this.props.mappingIndex
    );
  },

  _handleDelete() {
    return actionCreators.deleteTransformationMapping(
      this.props.bucket.get('id'),
      this.props.transformation.get('id'),
      'input',
      this.props.mappingIndex
    );
  }
});
