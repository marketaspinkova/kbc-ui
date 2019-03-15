/*
   TableSelector
 */
import PropTypes from 'prop-types';

import React from 'react';
import TableSelector from './TableSelector';

export default React.createClass({

  propTypes: {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    bucket: PropTypes.string,
    help: PropTypes.string,
    onEdit: PropTypes.func.isRequired,
    editing: PropTypes.bool.isRequired,
    wrapperClassName: PropTypes.string,
    labelClassName: PropTypes.string
  },

  getDefaultProps() {
    return {
      labelClassName: 'col-xs-4',
      wrapperClassName: 'col-xs-8'
    };
  },

  render() {
    return (
      <div className="form-group">
        <div className={this.props.labelClassName + ' control-label'}>{this.props.label}</div>
        <div className={this.props.wrapperClassName}>
          <TableSelector
            value={this.props.value}
            disabled={this.props.disabled}
            onChange={this.props.onChange}
            bucket={this.props.bucket}
            help={this.props.help}
            onEdit={this.props.onEdit}
            editing={this.props.editing}
          />
        </div>
      </div>
    );
  }
});
