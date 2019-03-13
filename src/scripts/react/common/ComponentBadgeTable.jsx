import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({
  propTypes: {
    badges: PropTypes.array.isRequired
  },

  render() {
    return (
      <div>
        {this.props.badges.map((badge) => {
          return (
            <div className="badge-component-row" key={badge.key}>
              <div className="badge-component-cell badge-component-placeholder">
                <div className={'badge badge-component-item badge-component-item-' + badge.key}>
                  {badge.title}
                </div>
              </div>
              <div className="badge-component-cell badge-component-description">
                {badge.description}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
});
