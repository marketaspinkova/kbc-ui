import React, { PropTypes } from 'react';
import {
  Col,
  Checkbox,
  Modal,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  ButtonToolbar,
  Button
} from 'react-bootstrap';
import Select from 'react-select';

const INITIAL_STATE = {
  file: null,
  public: false,
  permanent: false,
  tags: [],
  error: null
};

export default React.createClass({
  propTypes: {
    uploading: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal onHide={this.props.onHide} show={true}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Upload a new file</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                File
              </Col>
              <Col sm={9}>
                <FormControl type="file" onChange={this.handleFile} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={9} smOffset={3}>
                <Checkbox checked={this.state.public} onChange={this.handlePublic}>
                  Make file public
                </Checkbox>
                <HelpBlock>File URL will be permanent and publicly accessible.</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={9} smOffset={3}>
                <Checkbox checked={this.state.permanent} onChange={this.handlePermanent}>
                  Store permanently
                </Checkbox>
                <HelpBlock>
                  File will be deleted after <strong>180 days</strong> otherwise.
                </HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Tags
              </Col>
              <Col sm={9}>
                <Select.Creatable
                  multi
                  backspaceRemoves={false}
                  deleteRemoves={false}
                  placeholder="Enter tags"
                  noResultsText=""
                  promptTextCreator={() => 'Add tag'}
                  value={this.state.tags.map(tag => ({ label: tag, value: tag }))}
                  onChange={this.handleTags}
                  options={[]}
                />
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button onClick={this.props.onHide} bsStyle="link">
                Cancel
              </Button>
              <Button onClick={this.handleSubmit} disabled={this.props.uploading} bsStyle="primary">
                {this.props.uploading ? 'Uploading...' : 'Start upload'}
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  handleFile(event) {
    this.setState({ file: event.target.files[0] });
  },

  handlePublic() {
    this.setState({ public: !this.state.public });
  },

  handlePermanent() {
    this.setState({ permanent: !this.state.permanent });
  },

  handleTags(tags) {
    this.setState({
      tags: tags.map(tag => tag.value)
    });
  },

  handleSubmit(event) {
    event.preventDefault();

    this.props.onConfirm();
  }
});
