import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Tooltip from '../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';
import Confirm from '../../../../react/common/Confirm';

export default createReactClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    onDeleteFn: PropTypes.func.isRequired,
    isPending: PropTypes.bool
  },

  render() {
    if (this.props.isPending) {
      return <span className="btn btn-link"><Loader/></span>;
    }
    return (
      <Confirm
        title="Delete Query"
        text={`Do you really want to delete query ${this.props.query.get('name')}?`}
        buttonLabel="Delete"
        onConfirm={() => this.props.onDeleteFn(this.props.query)}
      >
        <Tooltip placement="top" tooltip="Delete query">
          <button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </button>
        </Tooltip>
      </Confirm>
    );
  }

});
