import React, {PropTypes} from 'react';
import { capitalize } from 'underscore.string';

const shouldShowType = (component) => {
  return component.get('type') === 'extractor' || component.get('type') === 'writer';
};

export default React.createClass({
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
        {this.props.showType && shouldShowType(this.props.component) && (
          <span>{' '}<small>{this.props.component.get('type')}</small></span>
        )}
      </span>
    );
  },

  componentName() {
    const name = this.props.component.get('name');
    return this.props.capitalize ? capitalize(name) : name;
  }
});
