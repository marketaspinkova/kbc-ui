import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import RoutesStore from '../../../../stores/RoutesStore';
import ComponentsStore from '../../stores/ComponentsStore';
import { Routes } from '../../Constants';

/*
  Creates link depending on component type
  - Link to current SPA page if UI is present
  - Link to legacy UI page
  - Disabled link if UI is not prepared at all
*/
export default React.createClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    className: PropTypes.string,
    children: PropTypes.any
  },

  render() {
    if (this.props.componentId === 'transformation') {
      return (
        <Link
          className={this.props.className}
          to="transformationBucket"
          params={{
            config: this.props.configId
          }}
        >
          {this.props.children}
        </Link>
      );
    }

    if (this.props.componentId === 'orchestrator') {
      return (
        <Link
          className={this.props.className}
          to="orchestration"
          params={{
            orchestrationId: this.props.configId
          }}
        >
          {this.props.children}
        </Link>
      );
    }

    if (RoutesStore.hasRoute(this.props.componentId)) {
      return (
        <Link
          className={this.props.className}
          to={this.props.componentId}
          params={{
            config: this.props.configId
          }}
        >
          {this.props.children}
        </Link>
      );
    }

    if (ComponentsStore.hasComponentLegacyUI(this.props.componentId)) {
      return (
        <a
          href={ComponentsStore.getComponentDetailLegacyUrl(this.props.componentId, this.props.configId)}
          className={this.props.className}
        >
          {this.props.children}
        </a>
      );
    }

    if (this.getComponentType() !== 'other') {
      return (
        <Link
          className={this.props.className}
          to={Routes.GENERIC_DETAIL_PREFIX + this.getComponentType() + '-config'}
          params={{
            config: this.props.configId,
            component: this.props.componentId
          }}
        >
          {this.props.children}
        </Link>
      );
    }

    return <span className={this.props.className}>{this.props.children}</span>;
  },

  getComponentType() {
    const component = ComponentsStore.getComponent(this.props.componentId);

    if (!component) {
      return 'extractor';
    }

    return component.get('type');
  }
});
