import React, {PropTypes} from 'react';

export default React.createClass({

  propTypes: {
    value: PropTypes.object
  },

  renderToken() {
    let {token} = this.props.value;
    if (['demo', 'production'].includes(token)) {
      token = 'keboola_' + token;
    }
    let caption = '';
    if (token) {
      switch (token) {
        case 'keboola_demo': {
          caption = 'Keboola DEMO';
          break;
        }
        case 'keboola_production': {
          caption = 'Keboola PRODUCTION';
          break;
        }
        default: {
          caption = 'Custom';
        }
      }
    }
    return (
      token &&
      <span>- {' '}{caption === 'Custom' ? token : caption}</span>
    );
  },

  render() {
    return (
      <span>
        GoodData Project {this.renderToken()}
      </span>
    );
  }
});
