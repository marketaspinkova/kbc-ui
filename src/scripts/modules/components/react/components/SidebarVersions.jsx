import React from 'react';
import { Map } from 'immutable';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import SidebarVersionsRow from './SidebarVersionsRow';
import { Link } from 'react-router';
import { getPreviousVersion } from '../../../../utils/VersionsDiffUtils';
import DiffVersionButton from '../../../../react/common/DiffVersionButton';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    versions: React.PropTypes.object.isRequired,
    versionsConfigs: React.PropTypes.object.isRequired,
    isLoading: React.PropTypes.bool.isRequired,
    configId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired,
    limit: React.PropTypes.number,
    versionsLinkTo: React.PropTypes.string,
    versionsLinkParams: React.PropTypes.object,
    pendingMultiLoad: React.PropTypes.object,
    isPending: React.PropTypes.bool,
    prepareVersionsDiffData: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      limit: 5
    };
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
  },

  renderVersions() {
    if (this.props.versions.count() || this.props.isLoading) {
      return this.props.versions
        .slice(0, 3)
        .map(version => {
          const isLast = version.get('version') === this.props.versions.first().get('version');

          return (
            <Link
              className="list-group-item"
              to={this.getVersionsLinkTo()}
              params={this.getVersionsLinkParams()}
              key={version.get('version')}
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
    if (this.props.versions.count() === 0) {
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
        .filter(currentVersion => version.get('version') === currentVersion.get('version'))
        .first() || Map();
    const isMultiPending = this.props.pendingMultiLoad.get(version.get('version'), false);

    return (
      <DiffVersionButton
        isDisabled={isMultiPending || this.props.isPending}
        isPending={isMultiPending}
        onLoadVersionConfig={() => this.props.prepareVersionsDiffData(version, previousVersion)}
        version={version}
        tooltipMsg="Compare changes of the most recent update"
        buttonClassName="pull-right"
        isSmall={true}
        buttonAsSpan={true}
        buttonText=" Compare Latest"
        versionConfig={currentVersionConfig}
        previousVersion={previousVersion}
        previousVersionConfig={previousVersionConfig}
      />
    );
  },

  render() {
    return (
      <div>
        <h4>
          Updates
          {this.props.versions.size > 1 && this.renderLatestChangeDiffButton()}
        </h4>
        <div className="kbc-sidebar-versions">
          {this.renderVersions()}
          {this.renderAllVersionsLink()}
        </div>
      </div>
    );
  }
});
