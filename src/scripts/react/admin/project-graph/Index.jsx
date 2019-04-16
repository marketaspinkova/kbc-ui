import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Promise from 'bluebird';
import { Map, fromJS } from 'immutable';
import { Loader } from '@keboola/indigo-ui';
import { Button, Row, Col, Nav, NavItem, Tab } from 'react-bootstrap';
import FastFade from '../../common/FastFade';
import {
  getLineageInOrganization,
  getOrganizationReliability,
  getProjectReliability
} from './GraphApi';
import Overview from './Overview';
import Lineage from './Lineage';
import Graph from './Graph';

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
              <NavItem eventKey="Graph" disabled={!this.state.data.count()}>
                Graph
              </NavItem>
              <NavItem eventKey="Lineage" disabled={!this.state.data.count()}>
                Lineage
              </NavItem>
              <NavItem eventKey="Overview" disabled={!this.state.data.count()}>
                Detail
              </NavItem>
            </Nav>
          </Col>
          <Col xs={12}>{this.renderContent()}</Col>
        </Row>
      </Tab.Container>
    );
  },

  renderContent() {
    const projectId = this.props.token.getIn(['owner', 'id']);

    if (this.state.isLoading) {
      return this.renderLoading();
    }

    if (!this.state.data.count()) {
      return this.renderErrorMessage();
    }

    return (
      <Tab.Content animation={FastFade}>
        <Tab.Pane eventKey="Graph" mountOnEnter unmountOnExit>
          <Graph
            nodes={this.state.data.getIn(['lineage', 'nodes'])}
            links={this.state.data.getIn(['lineage', 'links'])}
            urlTemplates={this.props.urlTemplates} 
          />
        </Tab.Pane>
        <Tab.Pane eventKey="Lineage" mountOnEnter>
          <Lineage
            lineage={this.state.data.getIn(['lineage', 'lineage'])}
            reability={this.state.data.get('organizationReliability')}
            urlTemplates={this.props.urlTemplates} 
          />
        </Tab.Pane>
        <Tab.Pane eventKey="Overview">
          <Overview
            nodes={this.state.data.getIn(['lineage', 'nodes'])}
            links={this.state.data.getIn(['lineage', 'links'])}
            reability={this.state.data.getIn(['organizationReliability', projectId], Map())}
            issues={this.state.data.get('projectReliability')}
            projectId={projectId}
            urlTemplates={this.props.urlTemplates}
          />
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

  handleSelectTab(tab) {
    this.setState({ activeTab: tab });
  },

  getLineageInOrganization() {
    const token = this.props.token.getIn(['token'])
    const graphServiceUrl = this.props.services.find((service) => {
      return service.get('id') === 'graph';
    }).get('url');

    this.setState({ isLoading: true });
    this.loadingPromise = Promise.all([
      getLineageInOrganization(graphServiceUrl, token),
      getOrganizationReliability(graphServiceUrl, token),
      getProjectReliability(graphServiceUrl, token)
    ])
      .spread((lineage, organizationReliability, projectReliability) => {
        this.setState({
          data: fromJS({
            lineage,
            organizationReliability,
            projectReliability
          }).update('organizationReliability', (reliability) => {
            return reliability.toMap().mapKeys((key, row) => row.get('project'));
          }),
          activeTab: 'Overview'
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }
});
