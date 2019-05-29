import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ComponentIcon from '../../../../../react/common/ComponentIcon';
import ComponentName from '../../../../../react/common/ComponentName';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="row kbc-header">
        <div className="kbc-title">
          <ComponentIcon component={this.props.component} className="pull-left" />
          <h2>
            <ComponentName component={this.props.component} />
          </h2>
          <p>{this.props.component.get('description')}</p>
        </div>
      </div>
    );
  }
});
