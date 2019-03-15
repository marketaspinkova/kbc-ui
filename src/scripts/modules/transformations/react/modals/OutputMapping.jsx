import PropTypes from 'prop-types';
import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import Tooltip from './../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import OutputMappingRowEditor from '../components/mapping/OutputMappingRowEditor';
import resolveOutputShowDetails from './resolveOutputShowDetails';
import validateStorageTableId from '../../../../utils/validateStorageTableId';
import Immutable from 'immutable';

const MODE_CREATE = 'create', MODE_EDIT = 'edit';

export default React.createClass({
  propTypes: {
    transformationBucket: PropTypes.object.isRequired,
    mode: PropTypes.oneOf([MODE_CREATE, MODE_EDIT]).isRequired,
    mapping: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    otherOutputMappings: PropTypes.object.isRequired,
    definition: PropTypes.object,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      definition: Immutable.Map(),
      disabled: false
    };
  },

  isNameAlreadyInUse() {
    if (this.props.backend === 'docker') {
      return this.props.otherOutputMappings.map(function(outputMapping) {
        return outputMapping.get('source');
      }).includes(this.props.mapping.get('source'));
    }
    return false;
  },

  isValid() {
    return !!this.props.mapping.get('source') &&
      !!this.props.mapping.get('destination') &&
      validateStorageTableId(this.props.mapping.get('destination', '')) &&
      !this.isNameAlreadyInUse();
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

  render() {
    let title = 'Output Mapping';
    if (this.props.definition.get('label')) {
      title = this.props.definition.get('label');
    }
    return (
      <span>
        { this.renderOpenButton() }
        <Modal onHide={this.handleCancel} show={this.state.showModal} bsSize="large">
          <Modal.Header closeButton={true}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OutputMappingRowEditor
              transformationBucket={this.props.transformationBucket}
              fill={true}
              value={this.props.mapping}
              tables={this.props.tables}
              buckets={this.props.buckets}
              onChange={this.props.onChange}
              disabled={this.state.isSaving}
              backend={this.props.backend}
              type={this.props.type}
              initialShowDetails={resolveOutputShowDetails(this.props.mapping)}
              definition={this.props.definition}
              isNameAlreadyInUse={this.isNameAlreadyInUse()}
            />
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              saveLabel={this.props.mode === MODE_CREATE ? 'Create Output' : 'Save'}
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

  renderOpenButton() {
    if (this.props.mode === MODE_EDIT) {
      return (
        <Tooltip tooltip="Edit Output" placement="top">
          <Button bsStyle="link" onClick={this.handleOpenButtonLink} disabled={this.props.disabled}>
            <span className="fa fa-pencil" />
          </Button>
        </Tooltip>
      );
    } else {
      return (
        <Button bsStyle="success" onClick={this.open}>
          <i className="kbc-icon-plus" />New Output
        </Button>
      );
    }
  },

  handleOpenButtonLink(e) {
    e.preventDefault();
    e.stopPropagation();
    this.open();
  },

  handleCancel() {
    this.props.onCancel();
    this.close();
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
