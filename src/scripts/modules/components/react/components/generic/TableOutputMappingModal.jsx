import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import Tooltip from '../../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import Editor from './TableOutputMappingEditor';
import resolveOutputShowDetails from './resolveOutputShowDetails';
const MODE_CREATE = 'create', MODE_EDIT = 'edit';
import validateStorageTableId from '../../../../../utils/validateStorageTableId';
import Immutable from 'immutable';

export default React.createClass({
  propTypes: {
    mode: PropTypes.oneOf([MODE_CREATE, MODE_EDIT]),
    mapping: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onEditStart: PropTypes.func,
    definition: PropTypes.object
  },


  getDefaultProps: function() {
    return {
      definition: Immutable.Map(),
      onEditStart: () => {}
    };
  },

  isValid() {
    return (this.props.definition.has('source') || !!this.props.mapping.get('source')) &&
      !!this.props.mapping.get('destination') &&
      validateStorageTableId(this.props.mapping.get('destination', ''));
  },

  getInitialState() {
    return {
      isSaving: false,
      show: false
    };
  },

  render() {
    var title = 'Output Mapping';
    if (this.props.definition.get('label')) {
      title = this.props.definition.get('label');
    }
    return (
      <span>
        {this.renderOpenButton()}
        <Modal
          bsSize="large" 
          show={this.state.show}
          onHide={this.handleCancel}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.editor()}
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              saveLabel={this.props.mode === MODE_CREATE ? 'Create Table Output' : 'Save'}
              isSaving={this.state.isSaving}
              onCancel={this.handleCancel}
              onSave={this.handleSave}
              isDisabled={!this.isValid()}
            />
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  editor() {
    return (
      <Editor
        backend="docker"
        value={this.props.mapping}
        tables={this.props.tables}
        buckets={this.props.buckets}
        disabled={this.state.isSaving}
        onChange={this.props.onChange}
        definition={this.props.definition}
        initialShowDetails={resolveOutputShowDetails(this.props.mapping)}
      />
    );
  },

  handleCancel() {
    this.props.onCancel();
    this.closeModal();
  },

  handleEditButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.openModal();
    this.props.onEditStart();
  },

  openModal() {
    this.setState({show: true});
  },

  closeModal() {
    this.setState({
      show: false,
      isSaving: false
    });
  },


  renderOpenButton() {
    if (this.props.mode === MODE_EDIT) {
      return (
        <Tooltip placement="top" tooltip="Edit Output">
          <button className="btn btn-link"
            onClick={this.handleEditButtonClick}>
            <span className="fa fa-pencil" />
          </button>
        </Tooltip>
      );
    } else {
      return (
        <button className="btn btn-success" onClick={this.openModal}>
          <i className="kbc-icon-plus" />New Table Output
        </button>
      );
    }
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
        this.closeModal();
      })
      .catch((e) => {
        this.setState({
          isSaving: false
        });
        throw e;
      });
  }

});
