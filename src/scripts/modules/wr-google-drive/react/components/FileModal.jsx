import React, {PropTypes} from 'react';
import {Map} from 'immutable';
import {Modal, Tab, Tabs, Alert} from 'react-bootstrap';
import WizardButtons from '../../../components/react/components/WizardButtons';
import InputTab from './InputTab';
import FileTab from './FileTab';
import ActionTab from './ActionTab';
import StorageTablesStore from '../../../components/stores/StorageTablesStore';
import SyncActionError from '../../../../utils/errors/SyncActionError';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    isSavingFn: PropTypes.func.isRequired,
    onHideFn: PropTypes.func,
    onSaveFn: PropTypes.func.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    prepareLocalState: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      saveErrorMessage: null
    }
  },

  render() {
    const step = this.localState(['step'], 1);
    const storageTables = StorageTablesStore.getAll();

    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.handleHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {this.localState(['cleanFile', 'title'], false) ? 'Edit File' : 'Add File'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs id="google-drive-file-modal-tabs" className="tabs-inside-modal" activeKey={step} animation={false} onSelect={() => {return true;}}>
            <Tab title="Source" eventKey={1} disabled={step !== 1}>
              <InputTab
                mapping={this.localState(['mapping'], Map())}
                tables={storageTables}
                onChange={this.onChangeInputMapping}
                exclude={this.localState(['exclude'], Map())}
                disabled={this.props.isSavingFn(this.file('id'))}
              />
            </Tab>
            <Tab title="Action" eventKey={2} disabled={step !== 3}>
              <ActionTab
                onChangeAction={(value) => this.onChangeAction(value)}
                valueAction={this.file('action', 'update')}
              />
            </Tab>
            <Tab title="Destination" eventKey={3} disabled={step !== 3}>
              <FileTab
                onSelectExisting={(data) => {
                  this.updateLocalState(['file'].concat('fileId'), data[0].id);
                  this.updateLocalState(['file'].concat('title'), data[0].name);
                }}
                onSelectFolder={(data) => {
                  this.updateLocalState(['file'].concat(['folder', 'id']), data[0].id);
                  this.updateLocalState(['file'].concat(['folder', 'title']), data[0].name);
                }}
                onChangeTitle={(e) => this.updateLocalState(['file'].concat('title'), e.target.value)}
                onToggleConvert={(e) => this.updateLocalState(['file'].concat('convert'), e.target.checked)}
                onSwitchType={this.onSwitchType}
                valueTitle={this.file('title', '')}
                valueFolder={this.file(['folder', 'title'], '/')}
                valueAction={this.file('action')}
                valueConvert={this.file('convert', false)}
                type={this.localState('uploadType', 'new')}
              />
              {this.renderSaveError()}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <WizardButtons
            onNext={this.handleNext}
            onPrevious={this.handlePrevious}
            onSave={this.handleSave}
            onCancel={this.handleHide}
            isSaving={this.props.isSavingFn(this.file('id'))}
            isNextDisabled={this.isStepValid(step)}
            isSaveDisabled={this.isSavingDisabled()}
            isPreviousDisabled={step === 1}
            showNext={step < 3}
            showSave={step === 3}
            savingMessage={this.localState('savingMessage')}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  handleHide() {
    this.setState({
      saveErrorMessage: null
    }, this.props.onHideFn)
  },

  renderSaveError() {
    if (this.state.saveErrorMessage === null) {
      return null;
    }
    return (
      <Alert bsStyle="danger">
        <p>
          {this.state.saveErrorMessage.indexOf('invalid_grant') !== -1
            ? 'Try to reset authorization'
            : 'Error while saving file'}
        </p>
        <p className="small">{this.state.saveErrorMessage}</p>
      </Alert>
    );
  },

  isStepValid(step) {
    const tableIdEmpty = !!this.file(['tableId']);
    const action = !!this.file(['action']);

    if (step === 1) {
      return !tableIdEmpty;
    }
    if (step === 2) {
      return !tableIdEmpty || !action;
    }
    return false;
  },

  isSavingDisabled() {
    const mapping = this.localState(['mapping'], Map());
    const mappingChanged = !mapping.equals(this.localState('cleanMapping'));
    const fileChanged = !this.file(null, Map()).equals(this.localState('cleanFile'));
    const title = this.file('title');
    return ((!fileChanged && !mappingChanged) || !title);
  },

  localState(path, defaultVal) {
    return this.props.localState.getIn([].concat(path), defaultVal);
  },

  file(path, defaultValue) {
    if (path) {
      return this.localState(['file'].concat(path), defaultValue);
    }
    return this.localState(['file'], defaultValue);
  },

  onChangeInputMapping(value) {
    const tableId = value.get('source');
    const title = tableId.substr(tableId.lastIndexOf('.') + 1);
    this.updateLocalState(['mapping'], value);
    this.updateLocalState(['file', 'tableId'], tableId);
    this.updateLocalState(['file', 'title'], title);
  },

  onChangeAction(value) {
    this.updateLocalState(['file', 'action'], value);
    // if action == 'create' uploadType is always 'new'
    if (value === 'create') {
      this.updateLocalState(['uploadType'], 'new');
    }
  },

  onSwitchType(type) {
    let title = '';
    if (type === 'new') {
      const tableId = this.file('tableId');
      title = tableId.substr(tableId.lastIndexOf('.') + 1);
    }

    this.updateLocalState(
      'file',
      this.file()
        .set('title', title)
        .set('fileId', '')
    );
    this.updateLocalState(['uploadType'], type);
  },

  updateLocalState(path, newValue) {
    return this.props.updateLocalState([].concat(path), newValue);
  },

  handleSave() {
    this.setState({
      saveErrorMessage: null,
    });
    const file = this.file();
    const mapping = this.localState('mapping');
    this.props.onSaveFn(file, mapping)
      .then(
        () => this.handleHide()
      )
      .catch(SyncActionError, (error) => {
        this.setState({
          saveErrorMessage: error.message,
        })
      });
  },

  handleNext() {
    const step = this.localState(['step']);
    const nextStep = (step >= 3) ? 3 : step + 1;
    this.updateLocalState(['step'], nextStep);
  },

  handlePrevious() {
    const step = this.localState(['step']);
    const nextStep = (step <= 1) ? 1 : step - 1;
    this.updateLocalState(['step'], nextStep);
  },

  switchType() {
    const currentType = this.localState(['modalType']);
    let nextModalType = 'sheetInNew';
    if (currentType === 'sheetInNew') {
      nextModalType = 'sheetInExisting';
    }
    this.updateLocalState(['modalType'], nextModalType);
  }
});
