import React, {PropTypes} from 'react';
import {Form, FormControl, FormGroup, ControlLabel, Col} from 'react-bootstrap';
import Modal from './ServiceAccountModal';

export default React.createClass({
  propTypes: {
    value: PropTypes.shape({
      type: PropTypes.string.isRequired,
      projectId: PropTypes.string.isRequired,
      privateKeyId: PropTypes.string.isRequired,
      privateKey: PropTypes.string.isRequired,
      clientEmail: PropTypes.string.isRequired,
      clientId: PropTypes.string.isRequired,
      authUri: PropTypes.string.isRequired,
      tokenUri: PropTypes.string.isRequired,
      authProviderX509CertUrl: PropTypes.string.isRequired,
      clientX509CertUrl: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      showModal: true
    };
  },

  showJsonInput() {
    return (this.props.value.privateKey === '')
  },

  renderForm() {
    const {value} = this.props;
    return (
      <span>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Project
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {value.projectId}
            </FormControl.Static>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Email
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {value.clientEmail}
            </FormControl.Static>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Key Id
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {value.privateKeyId}
            </FormControl.Static>
          </Col>
        </FormGroup>
      </span>
    );
  },

  render() {
    return (
      <Form horizontal>
        <h3>Service Account</h3>
        <Modal
          show={this.state.showModal}
          onHide={() => this.setState({showModal: false})}
          onSubmit={() => this.setState({showModal: false})}
        />
        NEW CREDENTIALS BUTTON
        {!this.showJsonInput() && this.renderForm()}
      </Form>
    );
  }
});

