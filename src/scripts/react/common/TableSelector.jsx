/*
   TableSelector
 */
import PropTypes from 'prop-types';

import React from 'react';
import Immutable from 'immutable';
import TableLink from '../../modules/components/react/components/StorageApiTableLinkEx';
import TableSelectorInput from './TableSelectorInput';
import StorageTablesStore from '../../modules/components/stores/StorageTablesStore';
import {Button} from 'react-bootstrap';

export default React.createClass({

  propTypes: {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    bucket: PropTypes.string,
    help: PropTypes.string,
    onEdit: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      value: '',
      disabled: false
    };
  },

  getInitialState() {
    return {
      tables: StorageTablesStore.getAll().map(function(table) {
        return Immutable.fromJS({
          id: table.get('id'),
          name: table.get('id')
        });
      }).toList()
    };
  },

  onChange(value) {
    this.props.onChange(value);
  },

  renderPencil() {
    return (
      <Button
        bsStyle="link"
        onClick={this.props.onEdit}
        title="Rename table"
        disabled={this.props.disabled}
      >
        <span className="kbc-icon-pencil"/>
      </Button>
    );
  },

  render() {
    if (this.props.editing) {
      return (
        <span>
          <TableSelectorInput
            options={this.state.tables}
            onChange={this.onChange}
            value={this.props.value}
            bucket={this.props.bucket}
            help={this.props.help}
            disabled={this.props.disabled}
          />
        </span>
      );
    } else {
      return (
        <span>
          <TableLink tableId={this.props.value}>
            {this.props.value}
          </TableLink>
          {this.renderPencil()}
          <span className="help-block">{this.props.help}</span>
        </span>
      );
    }
  }
});
