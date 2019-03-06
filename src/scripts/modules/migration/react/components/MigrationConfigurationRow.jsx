import React, { PropTypes } from 'react';
import descriptionExcerpt from '../../../../utils/descriptionExcerpt';
import ComponentConfigurationLink from '../../../components/react/components/ComponentConfigurationLink';
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
      <ComponentConfigurationLink
        componentId={this.props.componentId}
        configId={this.props.config.get('id')}
        className="tr"
      >
        <span className="td">
          <strong>{this.props.config.get('name', '---')}</strong>
          {this.description()}
        </span>
      </ComponentConfigurationLink>
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
