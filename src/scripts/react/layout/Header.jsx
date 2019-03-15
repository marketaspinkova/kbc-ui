import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Map, List } from 'immutable';
import { Link } from 'react-router';
import createStoreMixin from '../mixins/createStoreMixin';
import RoutesStore from '../../stores/RoutesStore';
import ApplicationStore from '../../stores/ApplicationStore';
import ComponentsStore from '../../modules/components/stores/ComponentsStore';
import ComponentNameEdit from '../../modules/components/react/components/ComponentName';
import ConfiguratinRowName from '../../modules/configurations/react/components/ConfigurationRowName';
import NotificationsAccess from '../common/NotificationsAccess';
import ComponentIcon from '../common/ComponentIcon';
import RoutePendingIndicator from './RoutePendingIndicator';

export default createReactClass({
  mixins: [ImmutableRenderMixin, createStoreMixin(RoutesStore, ApplicationStore, ComponentsStore)],

  propTypes: {
    homeUrl: PropTypes.string.isRequired,
    notifications: PropTypes.object.isRequired
  },

  getStateFromStores() {
    const componentId = RoutesStore.getCurrentRouteComponentId();

    return {
      breadcrumbs: RoutesStore.getBreadcrumbs(),
      currentRouteConfig: RoutesStore.getCurrentRouteConfig(),
      isRoutePending: RoutesStore.getIsPending(),
      component: ComponentsStore.getComponent(componentId),
      currentRouteParams: RoutesStore.getRouterState().get('params'),
      currentRouteQuery: RoutesStore.getRouterState().get('query'),
      lookerPreview: ApplicationStore.hasLookerPreview()
    };
  },

  render() {
    return (
      <nav className="navbar navbar-fixed-top kbc-navbar" role="navigation">
        <div className="col-xs-3 kbc-logo">
          <a href={this.props.homeUrl}>
            {this.state.lookerPreview ? (
              this._renderLookerLogo()
            ) : (
              <span className="kbc-icon-keboola-logo" />
            )}
          </a>
          {this._renderNotifications()}
        </div>
        <div className="col-xs-9 col-xs-offset-3 kbc-main-header-container">
          <div className="kbc-main-header kbc-header">
            <div className="kbc-title">
              {!this.state.lookerPreview && this._renderComponentIcon()}
              {this._renderBreadcrumbs()}{' '}
              {this.state.isRoutePending ? <RoutePendingIndicator /> : this._renderReloader()}
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
        return breadcrumbs.push(
          <span className="kbc-icon-arrow-right" key={`arrow-${part.get('name')}`} />
        );
      } else if (
        this.state.component &&
        part.getIn(['link', 'to']) === this.state.component.get('id')
      ) {
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
      } else if (
        this.state.component &&
        part.getIn(['link', 'to']) === this.state.component.get('id') + '-row'
      ) {
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
    if (
      !(this.state.currentRouteConfig && this.state.currentRouteConfig.get('headerButtonsHandler'))
    ) {
      return null;
    }

    return React.createElement(this.state.currentRouteConfig.get('headerButtonsHandler'));
  },

  _renderLookerLogo() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="78" height="30" viewBox="0 0 78 30">
        <path
          d="M14.153,23a7.919,7.919,0,0,1-5.719-2.4,8.215,8.215,0,0,1-2.32-5.772,8.361,8.361,0,0,1,2.32-5.843,7.875,7.875,0,0,1,5.719-2.424,8.065,8.065,0,0,1,8.033,8.267A8.226,8.226,0,0,1,19.878,20.6,7.909,7.909,0,0,1,14.153,23Zm0-13.978A5.609,5.609,0,0,0,8.78,14.829a5.539,5.539,0,0,0,5.372,5.68,5.549,5.549,0,0,0,5.394-5.68A5.618,5.618,0,0,0,14.153,9.023ZM60.966,22.969A8.092,8.092,0,0,1,52.779,14.8a8.146,8.146,0,0,1,8.034-8.235A7.908,7.908,0,0,1,66.374,8.9a8.931,8.931,0,0,1,2.5,6.568H55.445a5.572,5.572,0,0,0,5.521,5.166,4.919,4.919,0,0,0,4.746-2.888h2.794a7.412,7.412,0,0,1-2.8,3.866A8.15,8.15,0,0,1,60.966,22.969ZM60.813,8.9a5.248,5.248,0,0,0-3.177,1.124A5.692,5.692,0,0,0,55.6,13.157H65.963A5.449,5.449,0,0,0,60.813,8.9ZM5.409,22.658C2.073,22.658,0,20.449,0,16.893V0H2.606V16.8c0,2.244,1.145,3.382,3.4,3.382.1,0,.2,0,.324-.007V22.6A8.36,8.36,0,0,1,5.409,22.658Zm37.472-.052H40.243V0h2.639V13.978l7.291-7.019h3.877l-6.175,5.862L54.6,22.6l-3.193,0-5.461-7.963-3.07,2.921V22.6Zm30,0H70.243V6.96h2.545V8.722a5.629,5.629,0,0,1,4.537-2.166A5.8,5.8,0,0,1,78,6.6V9.146c-.126-.007-.257-.011-.391-.011-2.286,0-4.728,1.16-4.728,4.414V22.6Z"
          transform="translate(0 7)"
          fill="#fff"
        />
        <path
          d="M10.931,29a8.048,8.048,0,0,1-5.742-2.35A7.946,7.946,0,0,1,2.861,21,8.035,8.035,0,0,1,6.1,14.487L7.76,16.415A5.818,5.818,0,0,0,5.54,21a5.486,5.486,0,0,0,5.392,5.564A5.5,5.5,0,0,0,16.354,21a5.567,5.567,0,0,0-5.423-5.689,5.068,5.068,0,0,0-1.6.264L7.633,13.595A8.086,8.086,0,0,1,19,21a7.95,7.95,0,0,1-2.318,5.654A8.043,8.043,0,0,1,10.931,29ZM4.143,14.032A4.056,4.056,0,0,1,0,10.079,4.056,4.056,0,0,1,4.143,6.126a4.249,4.249,0,0,1,2.641.914L5.372,8.2a2.4,2.4,0,0,0-1.229-.338A2.275,2.275,0,0,0,1.82,10.079,2.275,2.275,0,0,0,4.143,12.3a2.747,2.747,0,0,0,.38-.031l1.243,1.45A4.27,4.27,0,0,1,4.143,14.032Zm2.749-1.009h0L5.742,11.68a2.164,2.164,0,0,0,.723-1.6A2.126,2.126,0,0,0,6.107,8.9L7.493,7.763a3.816,3.816,0,0,1,.788,2.316,3.874,3.874,0,0,1-1.388,2.944Zm4.5-5.59a3.172,3.172,0,0,1-2.3-.985l1.03-.852a1.753,1.753,0,0,0,1.272.535,1.706,1.706,0,0,0,1.741-1.664A1.706,1.706,0,0,0,11.39,2.8a1.793,1.793,0,0,0-1.12.4L8.923,2.678A3.127,3.127,0,0,1,11.39,1.5,3.042,3.042,0,0,1,14.5,4.466,3.042,3.042,0,0,1,11.39,7.433ZM8.656,5.867h0a2.83,2.83,0,0,1-.051-2.7l1.272.5a1.577,1.577,0,0,0-.226.806,1.614,1.614,0,0,0,.09.509l-1.083.892ZM4.883,3.954A2.029,2.029,0,0,1,2.81,1.977,2.029,2.029,0,0,1,4.883,0,2.1,2.1,0,0,1,6.345.58a1.919,1.919,0,0,1,.606,1.4,1.794,1.794,0,0,1-.037.325l-.872-.339a1.163,1.163,0,0,0-2.322.014,1.138,1.138,0,0,0,1.163,1.11,1.157,1.157,0,0,0,1.1-.767l.84.326A2.069,2.069,0,0,1,4.883,3.954Z"
          transform="translate(20)"
          fill="#7f5dff"
        />
      </svg>
    );
  }
});
