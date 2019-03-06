import React from 'react';
import CreatedWithIcon from '../../../../react/common/CreatedWithIcon';
import RollbackVersionButton from '../../../../react/common/RollbackVersionButton';
import DiffVersionButton from '../../../../react/common/DiffVersionButton';
import CopyVersionButton from '../../../../react/common/CopyVersionButton';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import VersionIcon from './VersionIcon';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    hideRollback: React.PropTypes.bool,
    hideCopy: React.PropTypes.bool,
    version: React.PropTypes.object.isRequired,
    versionConfig: React.PropTypes.object.isRequired,
    previousVersion: React.PropTypes.object.isRequired,
    previousVersionConfig: React.PropTypes.object.isRequired,
    newVersionName: React.PropTypes.string,
    isRollbackPending: React.PropTypes.bool,
    isRollbackDisabled: React.PropTypes.bool,
    isCopyPending: React.PropTypes.bool,
    isCopyDisabled: React.PropTypes.bool,
    isDiffPending: React.PropTypes.bool,
    isDiffDisabled: React.PropTypes.bool,
    onPrepareVersionsDiffData: React.PropTypes.func,
    isLast: React.PropTypes.bool.isRequired,
    onChangeName: React.PropTypes.func,
    onCopy: React.PropTypes.func,
    onRollback: React.PropTypes.func
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
