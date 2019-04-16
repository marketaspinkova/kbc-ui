import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map, fromJS } from 'immutable';
import { Loader } from '@keboola/indigo-ui';
import { Button, Row, Col, Nav, NavItem, Tab } from 'react-bootstrap';
import FastFade from '../../common/FastFade';
import { getLineageInOrganization } from './GraphApi';
import Lineage from './Lineage';
import Graph from './Graph';

import '../../../../styles/theme-kbc-graph.less';

export default createReactClass({
  propTypes: {
    token: PropTypes.object.isRequired,
    services: PropTypes.object.isRequired,
    urlTemplates: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      data: Map(),
      activeTab: '',
      isLoading: false
    };
  },

  componentDidMount() {
    this.getLineageInOrganization();
  },

  componentWillUnmount() {
    this.loadingPromise && this.loadingPromise.cancel();
  },

  render() {
    return (
      <div id="lineage">
        {this.renderTabs()}
      </div>
    );
  },

  renderTabs() {
    return (
      <Tab.Container
        activeKey={this.state.activeTab}
        onSelect={this.handleSelectTab}
        id="lineage-graph"
      >
        <Row>
          <Col xs={12}>
            <Nav className="col-xs-12" bsStyle="tabs">
              {this.renderProjectHeader()}
              <NavItem eventKey="Graph" disabled={!this.state.data.count()}>
                Graph
              </NavItem>
              <NavItem eventKey="Lineage" disabled={!this.state.data.count()}>
                Lineage
              </NavItem>
            </Nav>
          </Col>
          <Col xs={12}>{this.renderContent()}</Col>
        </Row>
      </Tab.Container>
    );
  },

  renderContent() {
    if (this.state.isLoading) {
      return this.renderLoading();
    }

    if (!this.state.data.count()) {
      return this.renderErrorMessage();
    }

    return (
      <Tab.Content animation={FastFade}>
        <Tab.Pane eventKey="Graph" mountOnEnter unmountOnExit>
          <Graph data={this.state.data} urlTemplates={this.props.urlTemplates} />
        </Tab.Pane>
        <Tab.Pane eventKey="Lineage">
          <Lineage data={this.state.data} urlTemplates={this.props.urlTemplates} />
        </Tab.Pane>
      </Tab.Content>
    );
  },

  renderLoading() {
    return (
      <p className="text-content">
        <Loader /> Loading data...
      </p>
    );
  },

  renderErrorMessage() {
    return (
      <p className="text-content">
        Loading data failed.{' '}
        <Button bsStyle="link" className="btn-link-inline" onClick={this.getLineageInOrganization}>
          Try again
        </Button>
        .
      </p>
    );
  },

  renderProjectHeader() {
    return <h3>{this.props.token.getIn(['owner', 'name'])}</h3>;
  },

  handleSelectTab(tab) {
    this.setState({ activeTab: tab });
  },

  getLineageInOrganization() {
    this.setState({ isLoading: true });
    this.loadingPromise = getLineageInOrganization(
      this.props.services.find((service) => {
        return service.get('id') === 'graph'
      }).get('url'),
      this.props.token.getIn(['token'])
    )
      .then((data) => {
        this.setState({
          data: fromJS(data),
          activeTab: 'Lineage'
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }
});
