import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Loader } from '@keboola/indigo-ui';

import api from '../../../api';
import Graph from './Graph';

export default createReactClass({
  mixins: [PureRenderMixin],
  propTypes: {
    configurationId: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      isLoading: true,
      model: null
    };
  },

  componentDidMount() {
    return api
      .getWriterModel(this.props.configurationId)
      .then(this._handleDataReceive)
      .catch(this._handleReceiveError);
  },

  _handleReceiveError(e) {
    this.setState({
      isLoading: false
    });
    throw e;
  },

  _handleDataReceive(model) {
    this.setState({
      isLoading: false,
      model: Immutable.fromJS(model)
    });
  },

  render() {
    return (
      <div className="kb-graph">
        {this.renderContent()}
      </div>
    );
  },

  renderContent() {
    if (this.state.isLoading) {
      return (
        <div className="well"><Loader /></div>
      );
    }
    if (!this.state.model.get('nodes').count()) {
      return (
        <div className="well">No datasets defined.</div>
      );
    }
    return (
      <Graph model={this.state.model} />
    );
  }
});
