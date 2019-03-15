import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ConfigurationLink from '../components/ComponentConfigurationLink';
import RunConfigurationButton from '../components/RunComponentButton';
import DeleteButton from '../../../../react/common/DeleteButton';
import DeleteConfigurationButtonNoConfirm from '../../../../react/common/DeleteConfigurationButtonNoConfirm';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import descriptionExcerpt from '../../../../utils/descriptionExcerpt';
import {isObsoleteComponent} from '../../../../modules/trash/utils';
import CreatedWithIcon from '../../../../react/common/CreatedWithIcon';
import componentNameAsString from '../../../../react/common/componentNameAsString';

export default React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    config: PropTypes.object.isRequired,
    component: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired,
    isDeleting: PropTypes.bool.isRequired
  },

  render() {
    return (
      <ConfigurationLink
        componentId={this.props.componentId}
        configId={this.props.config.get('id')}
        className="tr"
      >
        <span className="td">
          <strong>
            {this.props.config.get('name', '---')}
          </strong>
          {this.description()}
        </span>
        <span className="td text-right kbc-component-buttons">
          <span className="kbc-component-author">
            Created by <strong>{this.props.config.getIn(['creatorToken', 'description'])}</strong>
            {' '}
            <CreatedWithIcon
              createdTime={this.props.config.get('created')}
            />
          </span>
          {isObsoleteComponent(this.props.componentId) ? (
            <DeleteButton
              tooltip="Move to Trash"
              isPending={this.props.isDeleting}
              confirm={this.deleteConfirmProps()}
            />
          ) : (
            <DeleteConfigurationButtonNoConfirm
              tooltip="Move to Trash"
              isPending={this.props.isDeleting}
              onDeleteFn={this.handleDelete}
            />
          )}
          {this.renderRunButton()}
        </span>
      </ConfigurationLink>
    );
  },

  renderRunButton() {
    const flags = this.props.component.get('flags');

    if (flags.includes('excludeRun')) {
      return <button className="btn btn-link" />;
    }

    return (
      <RunConfigurationButton
        title="Run component configuration"
        component={this.props.componentId}
        runParams={this.runParams()}
      >
        You are about to run the {componentNameAsString(this.props.component)} configuration <strong>{this.props.config.get('name')}</strong>.
      </RunConfigurationButton>
    );
  },

  description() {
    if (!this.props.config.get('description')) {
      return null;
    }
    return (
      <div><small>{descriptionExcerpt(this.props.config.get('description'))}</small></div>
    );
  },

  deleteConfirmProps() {
    return {
      title: 'Move Configuration to Trash',
      text: this.getDeleteConfirmText(),
      onConfirm: this.handleDelete,
      buttonLabel: 'Move to Trash'
    };
  },

  getDeleteConfirmText() {
    let texts = [
      <p key="question">Are you sure you want to move the configuration {this.props.config.get('name')} to Trash?</p>
    ];
    if (isObsoleteComponent(this.props.componentId)) {
      texts.push(
        <p key="warning"><i className="fa fa-exclamation-triangle" /> This configuration can&apos;t be restored.</p>
      );
    }
    return texts;
  },

  runParams() {
    return () => ({config: this.props.config.get('id')});
  },

  handleDelete() {
    InstalledComponentsActionCreators
      .deleteConfiguration(this.props.componentId, this.props.config.get('id'), false);
  }
});
