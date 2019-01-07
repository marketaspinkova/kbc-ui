import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Map } from 'immutable';
import DeleteButton from '../../../../../react/common/DeleteButton';
import TableSizeLabel from '../../../../transformations/react/components/TableSizeLabel';
import TableInputMappingModal from './TableInputMappingModal';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired,
    editingValue: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    mappingIndex: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    pendingActions: React.PropTypes.object.isRequired,
    onEditStart: React.PropTypes.func.isRequired,
    otherDestinations: React.PropTypes.object.isRequired,
    definition: React.PropTypes.object
  },

  getDefaultProps() {
    return { definition: Map() };
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
                <span className="td col-xs-6" key="source">
                  <TableSizeLabel size={this.props.tables.getIn([this.props.value.get('source'), 'dataSizeBytes'])} />{' '}
                  {this.props.value.get('source') !== '' ? this.props.value.get('source') : 'Not set'}
                </span>
              ]
              : [
                <span className="td col-xs-3" key="icons">
                  <TableSizeLabel size={this.props.tables.getIn([this.props.value.get('source'), 'dataSizeBytes'])} />{' '}
                </span>,
                <span className="td col-xs-4" key="source">
                  {this.props.value.get('source')}
                </span>,
                <span className="td col-xs-1" key="arrow">
                  <span className="fa fa-chevron-right fa-fw" />
                </span>,
                <span className="td col-xs-3" key="destination">
                  {`in/tables/${this.props.value.get('destination', this.props.value.get('source'))}`}
                </span>
              ]}
            <span className="td col-xs-1 text-right kbc-no-wrap">
              {this.props.value.get('source') !== '' && (
                <DeleteButton
                  tooltip="Delete Input"
                  isPending={this.props.pendingActions.getIn(
                    ['input', 'tables', this.props.mappingIndex, 'delete'],
                    false
                  )}
                  confirm={{
                    title: 'Delete Input',
                    text: (
                      <span>
                        {'Do you really want to delete the input mapping for '}
                        <code>{this.props.value.get('source')}</code>?
                      </span>
                    ),
                    onConfirm: this.props.onDelete
                  }}
                />
              )}
              <TableInputMappingModal
                mode="edit"
                tables={this.props.tables}
                mapping={this.props.editingValue}
                onChange={this.props.onChange}
                onCancel={this.props.onCancel}
                onSave={this.props.onSave}
                onEditStart={this.props.onEditStart}
                otherDestinations={this.props.otherDestinations}
                definition={this.props.definition}
              />
            </span>
          </span>
        </span>
      </span>
    );
  }
});
