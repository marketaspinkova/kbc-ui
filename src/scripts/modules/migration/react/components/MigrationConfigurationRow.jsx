import React, { PropTypes } from 'react';
import descriptionExcerpt from '../../../../utils/descriptionExcerpt';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ComponentConfigurationLink from '../../../components/react/components/ComponentConfigurationLink';

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
          <ComponentConfigurationLink componentId={this.props.componentId} configId={this.props.config.get('id')}>
            {this.props.config.get('name', '---')}
          </ComponentConfigurationLink>
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
