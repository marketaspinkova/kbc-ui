import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({

  propTypes: {
    previousTable: PropTypes.string.isRequired,
    nextTable: PropTypes.string.isRequired,
    onChangeTable: PropTypes.func.isRequired
  },

  render() {
    const {nextTable, previousTable} = this.props;
    return (
      <div>
        {previousTable &&
         <span className="btn btn-link pull-left" role="button"
           onClick={() => this.props.onChangeTable(previousTable)}>
           {'<<'} {previousTable}
         </span>
        }

        {nextTable &&
         <span className="btn btn-link pull-right" role="button"
           onClick={() => this.props.onChangeTable(nextTable)}>
           {nextTable} {'>>'}
         </span>
        }
      </div>
    );
  }
});
