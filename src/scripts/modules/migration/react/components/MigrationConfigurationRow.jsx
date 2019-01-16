import React, { PropTypes } from 'react';
import descriptionExcerpt from '../../../../utils/descriptionExcerpt';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    config: PropTypes.object.isRequired,
    component: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired,
    isMigrating: PropTypes.bool.isRequired
  },

  render() {
    return (
      <span className="tr">
        <span className="td">
          <strong>{this.props.config.get('name', '---')}</strong>
          {this.description()}
        </span>
      </span>
    );
  },

  description() {
    if (!this.props.config.get('description')) {
      return null;
    }
    return (
      <div>
        <small>{descriptionExcerpt(this.props.config.get('description'))}</small>
      </div>
    );
  }
});
