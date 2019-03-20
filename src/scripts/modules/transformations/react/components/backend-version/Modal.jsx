import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal } from 'react-bootstrap';
import { RadioGroup } from 'react-radio-group';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import RadioGroupInput from '../../../../../react/common/RadioGroupInput';
import contactSupport from '../../../../../utils/contactSupport';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    availableVersions: PropTypes.array.isRequired,
    imageTag: PropTypes.string
  },

  getInitialState() {
    return {
      imageTag: this.props.imageTag,
      isSaving: false
    };
  },

  render() {
    return (
      <Modal onHide={this.props.onClose} show={this.props.show}>
        <Modal.Header>
          <Modal.Title>Transformation Backend Version</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Most of the time, there&apos;s no need to change versions of the transformation backend.
          </p>
          <p>
            Change versions only if you have problems with the <code>Latest</code> version. And{' '}
            <button
              className="btn btn-link btn-link-inline"
              onClick={contactSupport}
            >
              let us know
            </button> please.
          </p>
          <RadioGroup
            name="imageTag"
            selectedValue={this.state.imageTag}
            onChange={(value) => {
              this.setState({
                imageTag: value
              });
            }}
          >
            {this.props.availableVersions.map((version, index) => {
              return (
                <RadioGroupInput
                  key={`${version.version}-${index}`}
                  label={version.label}
                  value={version.version}
                />
              );
            })}
          </RadioGroup>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveButtonType="submit"
            onCancel={this.props.onClose}
            onSave={this.onSave}
            isSaving={this.state.isSaving}
            isDisabled={this.props.imageTag === this.state.imageTag}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  onSave() {
    this.setState({
      isSaving: true
    });
    this.props.onSave(this.state.imageTag)
      .finally(() => {
        this.setState({
          isSaving: false
        }, this.props.onClose);
      });
  }
});
