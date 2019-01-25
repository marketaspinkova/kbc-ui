import React, {PropTypes} from 'react';
import {Modal, Button} from 'react-bootstrap';
import Tooltip from './../../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import Editor from './TableInputMappingEditor';
import {resolveTableInputShowDetails} from './resolveInputShowDetails';
import { Map } from 'immutable';

const MODE_CREATE = 'create', MODE_EDIT = 'edit';

export default React.createClass({
  propTypes: {
    mode: PropTypes.oneOf([MODE_CREATE, MODE_EDIT]).isRequired,
    mapping: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onEditStart: PropTypes.func,
    title: PropTypes.string,
    otherDestinations: PropTypes.object.isRequired,
    showFileHint: PropTypes.bool,
    definition: PropTypes.object,

    buttonBsStyle: PropTypes.string,
    buttonLabel: PropTypes.string,
    tooltipText: PropTypes.string
  },

  getDefaultProps() {
    return {
      showFileHint: true,
      definition: Map()
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
    let title = 'Input Mapping';
    if (this.props.definition.get('label')) {
      title = this.props.definition.get('label');
    }
    return (
      <span>
        { this.renderOpenButton() }
        <Modal onHide={this.handleCancel} show={this.state.showModal} bsSize="large">
          <Modal.Header closeButton={true}>
            <Modal.Title>
              {title}
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
      const tooltipText = this.props.tooltipText ? this.props.tooltipText : 'Edit Input';
      return (
        <Tooltip tooltip={tooltipText} placement="top">
          <Button bsStyle="link" onClick={this.handleEditButtonClick}>
            <span className="fa fa-pencil" />
          </Button>
        </Tooltip>
      );
    } else {
      let buttonBsStyle = this.props.buttonBsStyle ? this.props.buttonBsStyle : 'success';
      let buttonLabel = this.props.buttonLabel ? this.props.buttonLabel : 'New Table Input';
      return (
        <Button bsStyle={buttonBsStyle} onClick={this.open}>
          <i className="kbc-icon-plus" />{buttonLabel}
        </Button>
      );
    }
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
