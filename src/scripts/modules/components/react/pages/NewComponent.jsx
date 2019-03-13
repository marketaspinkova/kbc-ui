import PropTypes from 'prop-types';
import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import ApplicationStore from '../../../../stores/ApplicationStore';
import ComponentsStore from '../../stores/ComponentsStore';
import NewComponentSelection from '../components/NewComponentSelection';
import { lookerPreviewHideComponents } from '../../../../constants/KbcConstants';

export default React.createClass({
  mixins: [createStoreMixin(ComponentsStore)],
  propTypes: {
    type: PropTypes.string.isRequired
  },

  getStateFromStores() {
    const components = ComponentsStore
      .getFilteredForType(this.props.type)
      .filter((component) => {
        if (component.get('flags').includes('excludeFromNewList')) {
          return false;
        }

        if (ApplicationStore.hasLookerPreview() && lookerPreviewHideComponents.includes(component.get('id'))) {
          return false;
        }

        return true;
      });

    return {
      components: components,
      componentFilter: ComponentsStore.getComponentFilter(this.props.type)
    };
  },

  componentWillReceiveProps() {
    this.setState(this.getStateFromStores());
  },

  render() {
    return (
      <div className="container-fluid">
        <NewComponentSelection
          className="kbc-main-content"
          components={this.state.components}
          filter={this.state.componentFilter}
          componentType={this.props.type}
        />
      </div>
    );
  }
});
