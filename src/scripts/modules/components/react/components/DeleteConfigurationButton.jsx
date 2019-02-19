import React from 'react';
import { Loader } from '@keboola/indigo-ui';
import ApplicationStore from '../../../../stores/ApplicationStore';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';
import Confirm from '../../../../react/common/Confirm';
import { isObsoleteComponent } from '../../../trash/utils.js';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../stores/InstalledComponentsStore';

export default React.createClass({
  mixins: [createStoreMixin(ApplicationStore, InstalledComponentsStore)],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    fieldName: React.PropTypes.string,
    preDeleteFn: React.PropTypes.func,
    postDeleteFn: React.PropTypes.func
  },

  getStateFromStores() {
    return {
      config: InstalledComponentsStore.getConfig(this.props.componentId, this.props.configId),
      isDeleting: InstalledComponentsStore.isDeletingConfig(
        this.props.componentId,
        this.props.configId,
        this.props.fieldName
      ),
      lookerPreview: ApplicationStore.hasLookerPreview()
    };
  },

  _handleDelete() {
    if (this.props.preDeleteFn) {
      this.props.preDeleteFn();
    }

    InstalledComponentsActionCreators.deleteConfiguration(this.props.componentId, this.props.configId, true).then(
      () => {
        if (this.props.postDeleteFn) {
          this.props.postDeleteFn();
        }
      }
    );
  },

  render() {
    if (isObsoleteComponent(this.props.componentId)) {
      const text = (
        <div>
          <p>Are you sure you want to move the configuration {this.state.config.get('name')} to Trash?</p>
          <p>
            <i className="fa fa-exclamation-triangle" /> This configuration can&apos;t be restored.
          </p>
        </div>
      );

      return (
        <Confirm
          title="Move Configuration to Trash"
          text={text}
          buttonLabel="Move to Trash"
          onConfirm={this._handleDelete}
          childrenRootElement={React.DOM.a}
        >
          {this._renderIcon()}
          {' Move to Trash'}
        </Confirm>
      );
    }

    return <a onClick={this._handleDelete}>{this._renderIcon()} Move to Trash</a>;
  },

  _renderIcon() {
    if (this.state.isDeleting) {
      return <Loader />;
    }

    if (this.state.lookerPreview) {
      return <i className="fa fa-trash-o fa-fw" />
    }

    return <i className="kbc-icon-cup fa fa-fw" />;
  }
});
