import PropTypes from 'prop-types';
import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import immutableMixin from 'react-immutable-render-mixin';
import ConfigurationsStore  from '../../ConfigurationsStore';
import RowsStore  from '../../ConfigurationRowsStore';
import date from '../../../../utils/date';

export default React.createClass({
  mixins: [createStoreMixin(RowsStore, ConfigurationsStore), immutableMixin],
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configurationId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired
  },
  getStateFromStores: function() {
    return {
      row: RowsStore.get(this.props.componentId, this.props.configurationId, this.props.rowId)
    };
  },
  render: function() {
    return (
      <div>
        <div>
          Created by
          {' '}
          <strong>{this.state.row.getIn(['creatorToken', 'description'])}</strong>
          {' '}
          <small>on <strong>{date.format(this.state.row.get('created'))}</strong></small>
        </div>

      </div>
    );
  }
});
