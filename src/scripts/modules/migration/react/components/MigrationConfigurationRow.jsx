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
        <span className="td text-right kbc-component-buttons">
          {console.log(this.props.config.toJS())}

          {(this.props.config.getIn(['authorization', 'oauth_api', 'version']) === 3) ? (
            <span className="label label-success">Migrated to version 3</span>
          ) : (
            <span className="label label-danger">Migration needed</span>
          )}
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
