import PropTypes from 'prop-types';
import React from 'react';
import { Tabs } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    activeStep: PropTypes.string.isRequired,
    goToStep: PropTypes.func.isRequired,
    children: PropTypes.node
  },
  render() {
    return (
      <Tabs activeKey={this.props.activeStep} onSelect={this.props.goToStep} animation={false}
        id="ex-twitter-react-wizard-common-tabs"
      >
        {this.mapChildren(this.props.children)}
      </Tabs>
    );
  },

  mapChildren(children) {
    const {goToStep} = this.props;
    return React.Children.map(children, (child) => {
      if (!child) {
        return child;
      }
      return React.cloneElement(child, {
        eventKey: child.props.step,
        goToStep: goToStep
      });
    });
  }
});
