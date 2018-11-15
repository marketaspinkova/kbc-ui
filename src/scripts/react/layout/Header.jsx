import React from 'react';
import createStoreMixin from '../mixins/createStoreMixin';
import { Map, List } from 'immutable';

import RoutesStore from '../../stores/RoutesStore';
import ComponentsStore from '../../modules/components/stores/ComponentsStore';
import immutableMixin from 'react-immutable-render-mixin';

import { Link } from 'react-router';
import RoutePendingIndicator from './RoutePendingIndicator';
import ComponentIcon from '../common/ComponentIcon';
import ComponentNameEdit from '../../modules/components/react/components/ComponentName';
import ConfiguratinRowName from '../../modules/configurations/react/components/ConfigurationRowName';
import NotificationsAccess from '../common/NotificationsAccess';

export default React.createClass({
  mixins: [createStoreMixin(RoutesStore), immutableMixin],

  propTypes: {
    homeUrl: React.PropTypes.string.isRequired,
    notifications: React.PropTypes.object.isRequired
  },

  getStateFromStores() {
    const componentId = RoutesStore.getCurrentRouteComponentId();

    return {
      breadcrumbs: RoutesStore.getBreadcrumbs(),
      currentRouteConfig: RoutesStore.getCurrentRouteConfig(),
      isRoutePending: RoutesStore.getIsPending(),
      component: ComponentsStore.getComponent(componentId),
      currentRouteParams: RoutesStore.getRouterState().get('params'),
      currentRouteQuery: RoutesStore.getRouterState().get('query')
    };
  },

  render() {
    return (
      <nav className="navbar navbar-fixed-top kbc-navbar" role="navigation">
        <div className="col-xs-3 kbc-logo">
          <a href={this.props.homeUrl}>
            <span className="kbc-icon-keboola-logo">{null}</span>
          </a>
          {this._renderNotifications()}
        </div>
        <div className="col-xs-9 col-xs-offset-3 kbc-main-header-container">
          <div className="kbc-main-header kbc-header">
            <div className="kbc-title">
              {this._renderComponentIcon()}
              {this._renderBreadcrumbs()} {this._renderReloader()}{' '}
              {this.state.isRoutePending && <RoutePendingIndicator />}
            </div>
            <div className="kbc-buttons">{this._renderButtons()}</div>
          </div>
        </div>
      </nav>
    );
  },

  _renderNotifications() {
    if (!this.props.notifications.get('isEnabled')) {
      return null;
    }

    return <NotificationsAccess notifications={this.props.notifications} />;
  },

  _renderComponentIcon() {
    if (!this.state.component) {
      return null;
    }

    return (
      <span>
        <ComponentIcon component={this.state.component} />{' '}
      </span>
    );
  },

  _getCurrentRouteQueryParams() {
    const persistQueryParams = this.state.currentRouteConfig.get('persistQueryParams', List());
    const { currentRouteQuery } = this.state;

    const queryParams = persistQueryParams.reduce((result, item) => {
      let res = result;
      if (currentRouteQuery.has(item) && currentRouteQuery.get(item, '') !== '') {
        res = res.set(item, currentRouteQuery.get(item));
      }
      return res;
    }, Map());

    return queryParams.toJS();
  },

  _renderBreadcrumbs() {
    const breadcrumbs = [];
    this.state.breadcrumbs.forEach((part, i) => {
      let partElement;
      if (i !== this.state.breadcrumbs.size - 1) {
        // all breadcrumbs except last one - these are links
        partElement = ( // persist chosen query params
          <Link
            key={part.get('name')}
            to={part.getIn(['link', 'to'])}
            params={part.getIn(['link', 'params']).toJS()}
            query={this._getCurrentRouteQueryParams()}
          >
            {part.get('title')}
          </Link>
        );
        breadcrumbs.push(partElement);
        return breadcrumbs.push(<span className="kbc-icon-arrow-right" key={`arrow-${part.get('name')}`} />);
      } else if (this.state.component && part.getIn(['link', 'to']) === this.state.component.get('id')) {
        // last breadcrumb in case it is a configuration
        // configuration name edit is enabled
        return breadcrumbs.push(
          <span key={part.get('name')}>
            <ComponentNameEdit
              componentId={this.state.component.get('id')}
              configId={this.state.currentRouteParams.get('config')}
            />
          </span>
        );
      } else if (this.state.component && part.getIn(['link', 'to']) === this.state.component.get('id') + '-row') {
        // last breadcrumb in case it is a component configuration row detail
        // configuration row name edit is enabled
        return breadcrumbs.push(
          <span key={part.get('name')}>
            <ConfiguratinRowName
              componentId={this.state.component.get('id')}
              configId={this.state.currentRouteParams.get('config')}
              rowId={this.state.currentRouteParams.get('row')}
            />
          </span>
        );
      } else if (this.state.currentRouteConfig && this.state.currentRouteConfig.get('nameEdit')) {
        const nameEdit = (
          <span key="name-edit-wrapper">
            {this.state.currentRouteConfig.get('nameEdit')(this.state.currentRouteParams.toJS())}
          </span>
        );
        return breadcrumbs.push(nameEdit);
      } else {
        // last breadcrumb in all other cases
        // just h1 element with text
        partElement = <h1 key={part.get('name')}>{part.get('title')}</h1>;
        return breadcrumbs.push(partElement);
      }
    });
    return breadcrumbs;
  },

  _renderReloader() {
    if (!(this.state.currentRouteConfig && this.state.currentRouteConfig.get('reloaderHandler'))) {
      return null;
    }

    return React.createElement(this.state.currentRouteConfig.get('reloaderHandler'));
  },

  _renderButtons() {
    if (!(this.state.currentRouteConfig && this.state.currentRouteConfig.get('headerButtonsHandler'))) {
      return null;
    }

    return React.createElement(this.state.currentRouteConfig.get('headerButtonsHandler'));
  }
});
