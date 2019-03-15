import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Remarkable from 'react-remarkable';
import { PanelWithDetails } from '@keboola/indigo-ui';

export default createReactClass({
  propTypes: {
    source: PropTypes.string,
    size: PropTypes.string,
    collapsible: PropTypes.bool
  },

  getDefaultProps() {
    return {
      source: '',
      size: 'normal',
      collapsible: true
    };
  },

  getInitialState() {
    return {
      ellipseContent: false
    };
  },

  componentDidMount() {
    /* eslint react/no-did-mount-set-state: 0 */
    const height = this.refs.container.offsetHeight;
    if (this.props.size === 'normal' && height < 300 || this.props.size === 'small' && height < 150) {
      this.setState({ellipseContent: false});
    } else {
      this.setState({ellipseContent: true});
    }
  },

  render() {
    return (
      <div className="kbc-markdown" ref="container">
        {this.props.collapsible && this.state.ellipseContent ? (
          <PanelWithDetails
            placement="bottom"
            preview={this.props.size}
            labelCollapse="Show less"
            labelOpen="Show more">
            <Remarkable source={this.props.source}/>
          </PanelWithDetails>
        ) : (
          <Remarkable source={this.props.source}/>
        )}
      </div>
    );
  }
});
