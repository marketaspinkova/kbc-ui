import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import DeleteButton from '../../../../react/common/DeleteButton';
import { Finished } from '@keboola/indigo-ui';
import Tooltip from '../../../../react/common/Tooltip';
import RestoreConfigurationButton from '../../../../react/common/RestoreConfigurationButton';
import InstalledComponentsActionCreators from '../../../components/InstalledComponentsActionCreators';
import descriptionExcerpt from '../../../../utils/descriptionExcerpt';
import { isObsoleteComponent } from '../../utils';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default createReactClass({
  mixins: [PureRenderMixin],

  propTypes: {
    config: PropTypes.object.isRequired,
    component: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired,
    isDeleteEnabled: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    isRestoring: PropTypes.bool.isRequired
  },

  render() {
    return (
      <span className="tr">
        <span className="td">
          <strong>{this.props.config.get('name', '---')}</strong>
          {this.description()}
        </span>
        <span className="td text-right kbc-component-buttons">
          <span className="kbc-component-author">
            Removed by <strong>{this.props.config.getIn(['currentVersion', 'creatorToken', 'description'])}</strong>{' '}
            <Finished endTime={this.props.config.getIn(['currentVersion', 'created'])} />
          </span>
          <span>
            {this.restoreButton()}
            {this.deleteButton()}
          </span>
        </span>
      </span>
    );
  },

  restoreButton() {
    if (isObsoleteComponent(this.props.componentId)) {
      return (
        <Tooltip
          placement="top"
          tooltip="Configuration restore is not supported by component"
        >
          <span className="btn btn-link">
            <i className="fa fa-exclamation-triangle" />
          </span>
        </Tooltip>
      );
    }

    return (
      <RestoreConfigurationButton
        tooltip="Restore"
        isPending={this.props.isRestoring}
        confirm={this.restoreConfirmProps()}
      />
    );
  },

  deleteButton() {
    if (!this.props.isDeleteEnabled) {
      return null;
    }

    return (
      <DeleteButton
        tooltip="Delete Forever"
        icon="fa-times"
        isPending={this.props.isDeleting}
        confirm={this.deleteConfirmProps()}
      />
    );
  },

  description() {
    if (!this.props.config.get('description')) {
      return null;
    }
    return (
      <div>
        <small>{descriptionExcerpt(this.props.config.get('description'))}</small>
      </div>
    );
  },

  deleteConfirmMessage() {
    return <span>Are you sure you want to permanently delete the configuration {this.props.config.get('name')}?</span>;
  },

  restoreConfirmMessage() {
    return <span>Are you sure you want to restore the configuration {this.props.config.get('name')}?</span>;
  },

  deleteConfirmProps() {
    return {
      title: 'Delete Forever',
      text: this.deleteConfirmMessage(),
      onConfirm: this.handleDelete
    };
  },

  restoreConfirmProps() {
    return {
      title: 'Restore configuration',
      buttonType: 'success',
      text: this.restoreConfirmMessage(),
      onConfirm: this.handleRestore
    };
  },

  handleDelete() {
    InstalledComponentsActionCreators.deleteConfigurationPermanently(
      this.props.componentId,
      this.props.config.get('id'),
      false
    );
  },

  handleRestore() {
    InstalledComponentsActionCreators.restoreConfiguration(this.props.component, this.props.config, false);
  }
});
