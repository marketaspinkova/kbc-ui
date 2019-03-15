import React from 'react';
import createReactClass from 'create-react-class';
import Confirm from '../../../../react/common/Confirm';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsStore from '../../../components/stores/InstalledComponentsStore';
import InstaledComponentsActions from '../../../components/InstalledComponentsActionCreators';

export default createReactClass({
  mixins: [createStoreMixin(InstalledComponentsStore)],

  getStateFromStores() {
    return {
      installedFilteredComponents: InstalledComponentsStore.getAllDeletedFiltered(),
      deletingConfigurations: InstalledComponentsStore.getDeletingConfigurations()
    };
  },

  render() {
    return (
      <Confirm
        title="Empty Trash"
        text={this.deleteConfirmMessage()}
        buttonLabel="Empty Trash"
        onConfirm={this.handleDelete}
      >
        <button
          className={'btn btn-link ' + (this.state.installedFilteredComponents.count() ? '' : 'btn-hide')}
          type="button"
        >
          <i className="fa fa-times fa-fw" /> Empty Trash
        </button>
      </Confirm>
    );
  },

  deleteConfirmMessage() {
    return <span>Are you sure you want to permanently delete all configurations in Trash?</span>;
  },

  handleDelete() {
    InstaledComponentsActions.deleteAllConfigurationsPermanently();
  }
});
