import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal} from 'react-bootstrap';
import ChangedSinceInput from './ChangedSinceFilterInput';
import DataFilterRow from './DataFilterRow';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool,
    onOk: PropTypes.func,
    onSetMapping: PropTypes.func,
    onResetAndHide: PropTypes.func,
    value: PropTypes.object.isRequired,
    allTables: PropTypes.object,
    saveStyle: PropTypes.string,
    setLabel: PropTypes.string,
    isSaving: PropTypes.bool
  },

  getDefaultProps() {
    return {
      saveStyle: 'primary',
      isSaving: false,
      setLabel: 'Set'
    };
  },

  getInitialState() {
    return {
      mapping: this.props.value
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({mapping: nextProps.value});
  },

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onResetAndHide}
        bsSize="large"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Table Data Filter
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="form-horizontal clearfix">
            <ChangedSinceInput
              mapping={this.props.value}
              disabled={false}
              onChange={this.onChangeMapping}
            />
            <DataFilterRow
              value={this.props.value}
              allTables={this.props.allTables}
              disabled={false}
              onChange={this.onChangeMapping}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <ConfirmButtons
            saveStyle={this.props.saveStyle}
            saveLabel={this.props.setLabel}
            onSave={this.handleSave}
            onCancel={this.props.onResetAndHide}
            isSaving={this.props.isSaving}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  handleSave() {
    this.props.onOk();
  },

  onChangeMapping(newMapping) {
    this.props.onSetMapping(newMapping);
  }


});
