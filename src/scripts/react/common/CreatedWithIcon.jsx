import React from 'react';
import moment from 'moment';

export default React.createClass({
  displayName: 'CreatedWithIcon',

  propTypes: {
    createdTime: React.PropTypes.string
  },

  render: function() {
    return (
      <span title={this.props.createdTime}>
           <i className="fa fa-fw fa-calendar" />
        {moment(this.props.createdTime).fromNow()}
      </span>
    );
  }
});
