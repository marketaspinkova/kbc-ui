import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { capitalize } from 'underscore.string';

export default createReactClass({
  propTypes: {
    component: PropTypes.object.isRequired,
    showType: PropTypes.bool,
    capitalize: PropTypes.bool
  },

  getDefaultProps() {
    return {
      showType: false,
      capitalize: false
    };
  },

  render() {
    return (
      <span>
        {this.componentName()}
        {this.props.showType && this.renderType()}
      </span>
    );
  },

  renderType() {
    if (!this.shouldShowType()) {
      return null;
    }

    return (
      <span>
        <small> {this.props.component.get('type')}</small>
      </span>
    );
  },

  componentName() {
    const name = this.props.component.get('name');
    return this.props.capitalize ? capitalize(name) : name;
  },

  shouldShowType() {
    return ['extractor', 'writer'].includes(this.props.component.get('type'));
  }
});
