import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({
  propTypes: {
    badges: PropTypes.array.isRequired
  },

  render() {
    return (
      <div className="badge-component-container badge-component-container-selection">
        {this.props.badges.map((badge, idx) => {
          return (
            <div
              className={'badge badge-component-item badge-component-item-title badge-component-item-' + badge.key}
              title={badge.description}
              key={idx}
            >
              {badge.title}
            </div>
          );
        })}
      </div>
    );
  }
});
