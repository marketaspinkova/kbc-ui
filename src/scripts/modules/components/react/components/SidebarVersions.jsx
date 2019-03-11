import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ImmutableMixin from 'react-immutable-render-mixin';
import { Map } from 'immutable';
import { Link } from 'react-router';
import { getPreviousVersion } from '../../../../utils/VersionsDiffUtils';
import DiffVersionButton from '../../../../react/common/DiffVersionButton';
import SidebarVersionsRow from './SidebarVersionsRow';

export default createReactClass({
  mixins: [ImmutableMixin],

  propTypes: {
    versions: PropTypes.object.isRequired,
    versionsConfigs: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    configId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    limit: PropTypes.number,
    versionsLinkTo: PropTypes.string,
    versionsLinkParams: PropTypes.object,
    pendingMultiLoad: PropTypes.object,
    isPending: PropTypes.bool,
    prepareVersionsDiffData: PropTypes.func
  },

  getDefaultProps() {
    return {
      limit: 5
    };
  },

  render() {
    return (
      <div>
        <h4>
          Updates
          {this.props.versions.count() > 1 && this.renderLatestChangeDiffButton()}
        </h4>
        <div className="kbc-sidebar-versions">
          {this.renderVersions()}
          {this.renderAllVersionsLink()}
        </div>
      </div>
    );
  },

  renderVersions() {
    if (this.props.versions.count() || this.props.isLoading) {
      return this.props.versions
        .slice(0, 3)
        .map((version) => {
          const isLast = version.get('version') === this.props.versions.first().get('version');

          return (
            <Link
              key={version.get('version')}
              className="list-group-item"
              to={this.getVersionsLinkTo()}
              params={this.getVersionsLinkParams()}
            >
              <SidebarVersionsRow version={version} isLast={isLast} />
            </Link>
          );
        })
        .toArray();
    }

    return (
      <div>
        <small className="text-muted">No versions found</small>
      </div>
    );
  },

  renderAllVersionsLink() {
    if (!this.props.versions.count()) {
      return null;
    }

    return (
      <div className="versions-link">
        <Link to={this.getVersionsLinkTo()} params={this.getVersionsLinkParams()}>
          Show all versions
        </Link>
      </div>
    );
  },

  renderLatestChangeDiffButton() {
    const version = this.props.versions.first();
    const previousVersion = getPreviousVersion(this.props.versions, version);
    const previousVersionConfig = getPreviousVersion(this.props.versionsConfigs, version) || Map();
    const currentVersionConfig =
      this.props.versionsConfigs
        .filter((currentVersion) => {
          return version.get('version') === currentVersion.get('version');
        })
        .first() || Map();
    const isMultiPending = this.props.pendingMultiLoad.get(version.get('version'), false);

    return (
      <DiffVersionButton
        isSmall
        buttonAsSpan
        isDisabled={isMultiPending || this.props.isPending}
        isPending={isMultiPending}
        onLoadVersionConfig={() => this.props.prepareVersionsDiffData(version, previousVersion)}
        version={version}
        tooltipMsg="Compare changes of the most recent update"
        buttonClassName="pull-right"
        buttonText=" Compare Latest"
        versionConfig={currentVersionConfig}
        previousVersion={previousVersion}
        previousVersionConfig={previousVersionConfig}
      />
    );
  },

  getVersionsLinkParams() {
    if (this.props.versionsLinkParams) {
      return this.props.versionsLinkParams;
    }

    return {
      component: this.props.componentId,
      config: this.props.configId
    };
  },

  getVersionsLinkTo() {
    if (this.props.versionsLinkTo) {
      return this.props.versionsLinkTo;
    }

    return this.props.componentId + '-versions';
  }
});
