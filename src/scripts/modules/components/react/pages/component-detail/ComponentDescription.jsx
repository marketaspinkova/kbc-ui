import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Markdown from '../../../../../react/common/Markdown';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired
  },

  render() {
    const longDescription = this.props.component.get('longDescription');

    if (!longDescription) {
      return null;
    }

    return <Markdown source={longDescription} />;
  }
});
