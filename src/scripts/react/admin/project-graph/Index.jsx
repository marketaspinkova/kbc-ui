import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { getLineageInOrganization } from './GraphApi';
import { Map, fromJS } from 'immutable';

export default createReactClass({
  propTypes: {
    appData: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      lineageData: Map()
    }
  },

  componentDidMount() {
    getLineageInOrganization(this.props.appData.getIn(['sapi', 'token', 'token']))
      .then((data) => {
        this.setState({
          lineageData: fromJS(data)
        });
      });
  },

  render() {
    return (
      <div>
        {JSON.stringify(this.state.lineageData)}
      </div>
    );
  }

});
