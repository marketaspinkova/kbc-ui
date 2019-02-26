import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ImmutableMixin from 'react-immutable-render-mixin';
import moment from 'moment';
import { Map } from 'immutable';
import { Link } from 'react-router';
import { Alert } from 'react-bootstrap';
import ApplicationStore from '../../../../stores/ApplicationStore';
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
    configurationVersions: PropTypes.object,
    isReloading: PropTypes.bool,
    limit: PropTypes.number,
    versionsLinkTo: PropTypes.string,
    versionsLinkParams: PropTypes.object,
    pendingMultiLoad: PropTypes.object,
    isPending: PropTypes.bool,
    prepareVersionsDiffData: PropTypes.func
  },

  getDefaultProps() {
    return {
      limit: 5,
      configurationVersions: Map(),
      isReloading: false
    };
  },

  getInitialState() {
    return {
      versionsWarning: false
    };
  },

  componentDidUpdate(prevProps) {
    if (this.props.isReloading && !this.props.configurationVersions.equals(prevProps.configurationVersions)) {
      this.setState({ versionsWarning: true });
    }
  },

  render() {
    return (
      <div>
        <h4>
          Updates
          {this.props.versions.count() > 1 && this.renderLatestChangeDiffButton()}
        </h4>
        {this.renderVersionWarning()}
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

  renderVersionWarning() {
    if (!this.state.versionsWarning) {
      return null;
    }

    const latestVersion = this.props.configurationVersions.first();
    const creatorId = latestVersion.getIn(['creatorToken', 'id']);
    const currentAdminId = ApplicationStore.getCurrentAdmin().get('id');
    const createdByCurrentAdmin = parseInt(creatorId, 10) === parseInt(currentAdminId, 10);

    return (
      <Alert bsStyle="danger" onDismiss={this.handleDismissWarning} closeLabel="Close warning">
        <p>
          {'New configuration created by '}
          <b>
            {createdByCurrentAdmin ? 'you' : latestVersion.getIn(['creatorToken', 'description'])}{' '} 
            {moment(latestVersion.get('created')).fromNow()}
          </b>
          {' was detected.'}
        </p>
        <p>
          {'Editing same configuration'}
          {createdByCurrentAdmin ? ' from multiple places ' : ' by several users '}
          {'is not supported. If you save the current configuration you may overwrite the latest changes.'}
        </p>
      </Alert>
    );
  },

  handleDismissWarning() {
    this.setState({ versionsWarning: false });
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
