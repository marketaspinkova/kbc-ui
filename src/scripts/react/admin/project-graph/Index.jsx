import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, fromJS } from 'immutable';
import { Loader } from '@keboola/indigo-ui';
import { getLineageInOrganization } from './GraphApi';

export default createReactClass({
  propTypes: {
    appData: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      lineageData: Map(),
      isLoading: false
    };
  },

  componentDidMount() {
    this.getLineageInOrganization();
  },

  render() {
    if (this.state.isLoading) {
      return (
        <p>
          <Loader /> Loading data...
        </p>
      );
    }
    console.log(this.state.lineageData.toJS()); // eslint-disable-line
    return <code>{JSON.stringify(this.state.lineageData)}</code>;
  },

  getLineageInOrganization() {
    this.setState({ isLoading: true });
    getLineageInOrganization(
      this.props.appData.get('services').find((service) => {
        return service.get('id') === 'graph'
      }).get('url'),
      this.props.appData.getIn(['sapi', 'token', 'token'])
    )
      .then((data) => {
        this.setState({
          lineageData: fromJS(data)
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }
});
