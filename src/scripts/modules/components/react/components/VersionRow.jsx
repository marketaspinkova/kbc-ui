import PropTypes from 'prop-types';
import React from 'react';
import CreatedWithIcon from '../../../../react/common/CreatedWithIcon';
import RollbackVersionButton from '../../../../react/common/RollbackVersionButton';
import DiffVersionButton from '../../../../react/common/DiffVersionButton';
import CopyVersionButton from '../../../../react/common/CopyVersionButton';
import immutableMixin from 'react-immutable-render-mixin';
import VersionIcon from './VersionIcon';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    hideRollback: PropTypes.bool,
    hideCopy: PropTypes.bool,
    version: PropTypes.object.isRequired,
    versionConfig: PropTypes.object.isRequired,
    previousVersion: PropTypes.object.isRequired,
    previousVersionConfig: PropTypes.object.isRequired,
    newVersionName: PropTypes.string,
    isRollbackPending: PropTypes.bool,
    isRollbackDisabled: PropTypes.bool,
    isCopyPending: PropTypes.bool,
    isCopyDisabled: PropTypes.bool,
    isDiffPending: PropTypes.bool,
    isDiffDisabled: PropTypes.bool,
    onPrepareVersionsDiffData: PropTypes.func,
    isLast: PropTypes.bool.isRequired,
    onChangeName: PropTypes.func,
    onCopy: PropTypes.func,
    onRollback: PropTypes.func
  },

  renderRollbackButton() {
    if (this.props.hideRollback) {
      return null;
    }
    return (
      <RollbackVersionButton
        version={this.props.version}
        onRollback={this.props.onRollback}
        isDisabled={this.props.isRollbackDisabled}
        isPending={this.props.isRollbackPending}
      />
    );
  },

  renderDiffButton() {
    return (
      <DiffVersionButton
        isDisabled={this.props.isDiffDisabled}
        isPending={this.props.isDiffPending}
        onLoadVersionConfig={this.props.onPrepareVersionsDiffData}
        version={this.props.version}
        versionConfig={this.props.versionConfig}
        previousVersion={this.props.previousVersion}
        previousVersionConfig={this.props.previousVersionConfig}
      />
    );
  },

  renderCopyButton() {
    if (this.props.hideCopy) {
      return null;
    }
    return (
      <CopyVersionButton
        version={this.props.version}
        onCopy={this.props.onCopy}
        onChangeName={this.props.onChangeName}
        newVersionName={this.props.newVersionName}
        isDisabled={this.props.isCopyDisabled}
        isPending={this.props.isCopyPending}
      />
    );
  },

  render() {
    return (
      <tr>
        <td>
          {this.props.version.get('version')}
        </td>
        <td>
          <VersionIcon
            isLast={this.props.isLast}
          />
        </td>

        <td>
          {this.props.version.get('changeDescription') ? this.props.version.get('changeDescription') : (<small><em>No description</em></small>)}
        </td>
        <td>
          <CreatedWithIcon
            createdTime={this.props.version.get('created')}
            relative={false}
          />
        </td>
        <td>
          {this.props.version.getIn(['creatorToken', 'description']) ? this.props.version.getIn(['creatorToken', 'description']) : (<small><em>Unknown</em></small>)}
        </td>
        <td className="text-right">
          {this.renderRollbackButton()}
          {this.props.version.get('version') > 1 ? this.renderDiffButton() : null}
          {this.renderCopyButton()}
        </td>
      </tr>
    );
  }
});
