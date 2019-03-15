import React from 'react';
import createReactClass from 'create-react-class';
import ApplicationStore from '../../../../stores/ApplicationStore';
import image from '../../../../../images/transformation-empty-input-small.png';

export default createReactClass({
  imageUrl(img) {
    return ApplicationStore.getScriptsBasePath() + img;
  },

  render() {
    return (
      <span>
        <img src={this.imageUrl(image)}/>
      </span>
    );
  }
});
