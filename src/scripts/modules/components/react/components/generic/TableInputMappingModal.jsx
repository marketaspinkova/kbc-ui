import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import {Modal, Button} from 'react-bootstrap';
import Tooltip from './../../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import { resolveTableInputShowDetails } from './resolveInputShowDetails';
import Editor from './TableInputMappingEditor';

const MODE_CREATE = 'create', MODE_EDIT = 'edit';

export default createReactClass({
  propTypes: {
    mode: PropTypes.oneOf([MODE_CREATE, MODE_EDIT]).isRequired,
    mapping: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    otherDestinations: PropTypes.object.isRequired,
    componentType: PropTypes.string.isRequired,
    onEditStart: PropTypes.func,
    definition: PropTypes.object,
    showFileHint: PropTypes.bool,
    buttonBsStyle: PropTypes.string,
    buttonLabel: PropTypes.string,
    tooltipText: PropTypes.string
  },

  getDefaultProps() {
    return {
      showFileHint: true,
      definition: Map(),
      buttonBsStyle: 'success',
      buttonLabel: 'New Table Input',
      tooltipText: 'Edit Input'
    };
  },

  isValid() {
    return !!this.props.mapping.get('source')
      && (this.props.definition.has('destination') || !!this.props.mapping.get('destination'))
      && !this.isDestinationDuplicate();
  },

  getInitialState() {
    return {
      isSaving: false,
      showModal: false
    };
  },

  open() {
    this.setState({
      showModal: true
    });
  },

  close() {
    this.setState({
      showModal: false
    });
  },

  isDestinationDuplicate() {
    if (this.props.otherDestinations) {
      return this.props.otherDestinations.contains(this.props.mapping.get('destination', '').toLowerCase());
    } else {
      return false;
    }
  },

  render() {
    return (
      <span>
        { this.renderOpenButton() }
        <Modal onHide={this.handleCancel} show={this.state.showModal} bsSize="large">
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.definition.get('label') || 'Input Mapping'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.editor()}
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              saveLabel={this.props.mode === MODE_CREATE ? 'Create Table Input' : 'Save'}
              isSaving={this.state.isSaving}
              onCancel={this.handleCancel}
              onSave={this.handleSave}
              isDisabled={!this.isValid() || this.editingNonExistentTable()}
            />
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  renderOpenButton() {
    if (this.props.mode === MODE_EDIT) {
      return (
        <Tooltip tooltip={this.props.tooltipText} placement="top">
          <Button bsStyle="link" onClick={this.handleEditButtonClick}>
            <span className="fa fa-pencil" />
          </Button>
        </Tooltip>
      );
    }

    return (
      <Button bsStyle={this.props.buttonBsStyle} onClick={this.open}>
        <i className="kbc-icon-plus" />{this.props.buttonLabel}
      </Button>
    );
  },

  handleEditButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.open();
    if (this.props.onEditStart) {
      this.props.onEditStart();
    }
  },

  editor() {
    return (
      <Editor
        value={this.props.mapping}
        tables={this.props.tables}
        disabled={this.state.isSaving || this.editingNonExistentTable()}
        onChange={this.props.onChange}
        initialShowDetails={resolveTableInputShowDetails(this.props.mapping)}
        isDestinationDuplicate={this.isDestinationDuplicate()}
        showFileHint={this.props.showFileHint}
        definition={this.props.definition}
        editingNonExistentTable={this.editingNonExistentTable()}
        componentType={this.props.componentType}
      />
    );
  },

  editingNonExistentTable() {
    return this.props.mode === MODE_EDIT
      && this.props.tables.get(this.props.mapping.get('source'), Map()).count() === 0;
  },

  handleCancel() {
    this.close();
    this.props.onCancel();
  },

  handleSave() {
    this.setState({
      isSaving: true
    });
    this.props
      .onSave()
      .then(() => {
        this.setState({
          isSaving: false
        });
        this.close();
      })
      .catch((e) => {
        this.setState({
          isSaving: false
        });
        throw e;
      });
  }
});
