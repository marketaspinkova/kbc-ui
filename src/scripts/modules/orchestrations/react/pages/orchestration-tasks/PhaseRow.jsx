import PropTypes from 'prop-types';
import React from 'react';

export default React.createClass({
  propTypes: {
    phase: PropTypes.object.isRequired,
    toggleHide: PropTypes.func.isRequired,
    isPhaseHidden: PropTypes.bool.isRequired,
    color: PropTypes.string
  },

  render() {
    let style = {
      'backgroundColor': this.props.color
    };
    if (this.props.isPhaseHidden) {
      style.borderBottom = '2px groove';
    }

    return (
      <tr
        style={style}
        onClick={this.props.toggleHide}>
        <td colSpan="6" className="kbc-cursor-pointer text-center">
          <div>
            <strong>
              {this.props.phase.get('id')}
            </strong>
          </div>
        </td>
      </tr>
    );
  }

});
