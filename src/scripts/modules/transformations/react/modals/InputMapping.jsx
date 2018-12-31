import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Map, List } from 'immutable';
import {Button, Modal} from 'react-bootstrap';
import Tooltip from './../../../../react/common/Tooltip';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import InputMappingRowDockerEditor from '../components/mapping/InputMappingRowDockerEditor';
import InputMappingRowRedshiftEditor from '../components/mapping/InputMappingRowRedshiftEditor';
import InputMappingRowSnowflakeEditor from '../components/mapping/InputMappingRowSnowflakeEditor';
import resolveInputShowDetails from './resolveInputShowDetails';

const MODE_CREATE = 'create', MODE_EDIT = 'edit';

export default createReactClass({
  propTypes: {
    mode: PropTypes.oneOf([MODE_CREATE, MODE_EDIT]).isRequired,
    mapping: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    backend: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    otherDestinations: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    definition: PropTypes.object,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      definition: Map(),
      disabled: false
    };
  },

  isValid() {
    return !!this.props.mapping.get('source') &&
      !this.isDestinationDuplicate();
  },

  getInitialState() {
    return {
      isSaving: false,
      showModal: false
    };
  },

  componentDidUpdate() {
    this.checkValidColumns();
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
    return this.props.otherDestinations.contains(this.props.mapping.get('destination', '').toLowerCase());
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
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.editor()}
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              saveLabel={this.props.mode === MODE_CREATE ? 'Create Input' : 'Save'}
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
        <Tooltip tooltip="Edit Input" placement="top">
          <Button bsStyle="link" onClick={this.handleOpenButtonLink} disabled={this.props.disabled}>
            <span className="fa fa-pencil" />
          </Button>
        </Tooltip>
      );
    } else {
      return (
        <Button bsStyle="success" onClick={this.open}>
          <i className="kbc-icon-plus" />New Input
        </Button>
      );
    }
  },

  handleOpenButtonLink(e) {
    e.preventDefault();
    e.stopPropagation();
    this.open();
  },

  editor() {
    const props = {
      value: this.props.mapping,
      tables: this.props.tables,
      disabled: this.state.isSaving,
      onChange: this.props.onChange,
      initialShowDetails: resolveInputShowDetails(this.props.backend, this.props.type, this.props.mapping, this.props.tables),
      isDestinationDuplicate: this.isDestinationDuplicate(),
      definition: this.props.definition
    };
    if (this.props.backend === 'redshift' && this.props.type === 'simple') {
      return <InputMappingRowRedshiftEditor {...props} />;
    } else if (this.props.backend === 'snowflake' && this.props.type === 'simple') {
      return <InputMappingRowSnowflakeEditor {...props} />;
    } else if (this.props.backend === 'docker') {
      return <InputMappingRowDockerEditor {...props} />;
    }
    return null;
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
  },

  checkValidColumns() {
    const { mode, tables, mapping, onChange } = this.props;

    if (mode === MODE_EDIT && this.state.showModal && tables.count() && mapping.has('datatypes')) {
      const columns = tables.find(table => table.id === mapping.source).get('columns', List());
      const updatedValue = mapping.update('datatypes', datatypes => {
        return datatypes.filter(type => columns.indexOf(type.get('column')) !== -1);
      });

      if (!updatedValue.get('datatypes').equals(mapping.get('datatypes'))) {
        onChange(updatedValue);
      }
    }
  }
});
