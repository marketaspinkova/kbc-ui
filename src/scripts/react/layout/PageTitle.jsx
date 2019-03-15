import React from 'react';
import createReactClass from 'create-react-class';
import DocumentTitle from 'react-document-title';
import createStoreMixin from '../mixins/createStoreMixin';
import RoutesStore from '../../stores/RoutesStore';
import ApplicationStore from '../../stores/ApplicationStore';

const flattenBreadcrumbs = breadcrumbs => breadcrumbs.map(page => page.get('title')).join(' / ');

export default createReactClass({
  mixins: [createStoreMixin(RoutesStore)],

  getStateFromStores() {
    return {
      breadcrumbs: RoutesStore.getBreadcrumbs(),
      isPlaying: RoutesStore.getCurrentRouteIsRunning(),
      pageTitle: ApplicationStore.getCurrentProject().get('name')
    };
  },

  render() {
    return <DocumentTitle title={this.pageTitle()} />;
  },

  pageTitle() {
    return `${this.playIcon()} ${this.state.pageTitle} - ${flattenBreadcrumbs(this.state.breadcrumbs)}`;
  },

  playIcon() {
    if (this.state.isPlaying) {
      return '▶ ';
    } else {
      return '';
    }
  }
});
