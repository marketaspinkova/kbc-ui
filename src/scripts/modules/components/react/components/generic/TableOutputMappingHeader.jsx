import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import Immutable from 'immutable';
import DeleteButton from '../../../../../react/common/DeleteButton';
import TableSizeLabel from '../../../../transformations/react/components/TableSizeLabel';
import TableOutputMappingModal from './TableOutputMappingModal';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired,
    editingValue: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    mappingIndex: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    pendingActions: PropTypes.object.isRequired,
    onEditStart: PropTypes.func.isRequired,
    definition: PropTypes.object
  },

  getDefaultProps() {
    return { definition: Immutable.Map() };
  },

  render() {
    return (
      <span className="table kbc-break-all kbc-break-word">
        <span className="tbody">
          <span className="tr">
            {this.props.definition.get('label')
              ? [
                <span className="td col-xs-4" key="label">
                  {this.props.definition.get('label')}
                </span>,
                <span className="td col-xs-1" key="arrow">
                  <span className="fa fa-chevron-right fa-fw" />
                </span>,
                <span className="td col-xs-6" key="destination">
                  <TableSizeLabel
                    size={this.props.tables.getIn([this.props.value.get('destination'), 'dataSizeBytes'])}
                  />{' '}
                  {this.props.value.get('destination') !== '' ? this.props.value.get('destination') : 'Not set'}
                </span>
              ]
              : [
                <span className="td col-xs-4" key="source">
                  {`out/tables/${this.props.value.get('source')}`}
                </span>,
                <span className="td col-xs-1" key="arrow">
                  <span className="fa fa-chevron-right fa-fw" />
                </span>,
                <span className="td col-xs-3" key="icons">
                  <TableSizeLabel
                    size={this.props.tables.getIn([this.props.value.get('destination'), 'dataSizeBytes'])}
                  />{' '}
                </span>,
                <span className="td col-xs-3" key="destination">
                  {this.props.value.get('destination')}
                </span>
              ]}
            <span className="td col-xs-1 text-right kbc-no-wrap">
              {this.props.value.get('destination') !== '' && (
                <DeleteButton
                  tooltip="Delete Output"
                  isPending={this.props.pendingActions.getIn(
                    ['output', 'tables', this.props.mappingIndex, 'delete'],
                    false
                  )}
                  confirm={{
                    title: 'Delete Output',
                    text: (
                      <span>
                        {'Do you really want to delete the output mapping for '}
                        <code>{this.props.value.get('destination')}</code>?
                      </span>
                    ),
                    onConfirm: this.props.onDelete
                  }}
                />
              )}
              <TableOutputMappingModal
                mode="edit"
                tables={this.props.tables}
                buckets={this.props.buckets}
                mapping={this.props.editingValue}
                onChange={this.props.onChange}
                onCancel={this.props.onCancel}
                onSave={this.props.onSave}
                definition={this.props.definition}
                onEditStart={this.props.onEditStart}
              />
            </span>
          </span>
        </span>
      </span>
    );
  }
});
