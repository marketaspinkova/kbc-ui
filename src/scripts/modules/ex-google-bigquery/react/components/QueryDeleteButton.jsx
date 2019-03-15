import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from '../../../../react/common/Tooltip';
import {Loader} from '@keboola/indigo-ui';
import Confirm from '../../../../react/common/Confirm';

export default React.createClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    onDeleteFn: PropTypes.func.isRequired,
    isPending: PropTypes.bool,
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return {
      tooltipPlacement: 'top'
    };
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
        <Tooltip tooltip="Delete query" placement={this.props.tooltipPlacement}>
          <button className="btn btn-link">
            <i className="kbc-icon-cup" />
          </button>
        </Tooltip>
      </Confirm>
    );
  }

});
