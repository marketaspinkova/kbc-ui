import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import DeleteButton from '../../../../../react/common/DeleteButton';
import TableSizeLabel from '../../../../transformations/react/components/TableSizeLabel';
import TableInputMappingModal from './TableInputMappingModal';

export default createReactClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    editingValue: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    mappingIndex: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    pendingActions: PropTypes.object.isRequired,
    onEditStart: PropTypes.func.isRequired,
    otherDestinations: PropTypes.object.isRequired,
    componentType: PropTypes.string.isRequired,
    definition: PropTypes.object
  },

  getDefaultProps() {
    return { definition: Map() };
  },

  render() {
    const sourceTable = this.props.tables.get(this.props.value.get('source'), Map());

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
                  {sourceTable.count() > 0 && <TableSizeLabel size={sourceTable.get('dataSizeBytes')} />}
                  {this.props.value.get('source') || 'Not set'}
                </span>
              ]
              : [
                <span className="td col-xs-3" key="icons">
                  {sourceTable.count() > 0 && <TableSizeLabel size={sourceTable.get('dataSizeBytes')} />}
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
                componentType={this.props.componentType}
              />
            </span>
          </span>
        </span>
      </span>
    );
  }
});
