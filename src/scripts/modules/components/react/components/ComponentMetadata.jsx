import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';
import date from '../../../../utils/date';

export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentsStore), PureRenderMixin],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired
  },

  getStateFromStores() {
    return { config: InstalledComponentsStore.getConfig(this.props.componentId, this.props.configId) };
  },

  render() {
    return (
      <div>
        <div>
          {'Created by '}
          <strong>{this.state.config.getIn(['creatorToken', 'description'])}</strong>
        </div>
        <div>
          <small>
            {'on '}
            <strong>{date.format(this.state.config.get('created'))}</strong>
          </small>
        </div>
      </div>
    );
  }
});
