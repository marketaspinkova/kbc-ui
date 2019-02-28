import React from 'react';
import Markdown from '../../../../../react/common/Markdown';

export default React.createClass({
  propTypes: {
    component: React.PropTypes.object.isRequired
  },

  render() {
    const longDescription = this.props.component.get('longDescription');

    if (!longDescription) {
      return null;
    }

    return <Markdown source={longDescription} />;
  }
});
