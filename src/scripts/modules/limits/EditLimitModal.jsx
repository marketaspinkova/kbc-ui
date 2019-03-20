import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Col, FormControl, FormGroup, HelpBlock, ControlLabel } from 'react-bootstrap';
import ApplicationStore from '../../stores/ApplicationStore';
import { Button, ButtonToolbar, Modal } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    limit: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    redirectTo: PropTypes.string
  },

  getInitialState() {
    return {
      isSaving: false,
      limitValue: this.props.limit.get('limitValue'),
      projectId: ApplicationStore.getCurrentProjectId(),
      actionUrl: ApplicationStore.getUrlTemplates().get('editProjectLimit'),
      xsrf: ApplicationStore.getXsrfToken()
    };
  },

  render() {
    const { limit, isOpen, onHide, redirectTo } = this.props;

    return (
      <Modal show={isOpen} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Limit change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal" ref="limitEditForm" method="post" action={this.state.actionUrl}>
            <p>You can change the limit because you are a superadmin. This feature is hidden for all other users.</p>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={4}>{limit.get('name')}</Col>
              <Col sm={8}>
                <FormControl
                  type="number"
                  name="limitValue"
                  autoFocus
                  value={this.state.limitValue}
                  onChange={this.handleChange}
                />
                <HelpBlock>
                  {limit.get('id')}
                </HelpBlock>
              </Col>
            </FormGroup>
            <input type="hidden" name="limitName" value={limit.get('id')} />
            <input type="hidden" name="projectId" value={this.state.projectId} />
            <input type="hidden" name="xsrf" value={this.state.xsrf} />
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button onClick={this.props.onHide} bsStyle="link">
              Cancel
            </Button>
            <Button bsStyle="primary" onClick={this.handleSave} disabled={this.state.isSaving}>
              Save Limit
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  handleChange(e) {
    this.setState({
      limitValue: e.target.value
    });
  },

  handleSave() {
    this.setState({
      isSaving: true
    });
    this.refs.limitEditForm.submit();
  }
});
