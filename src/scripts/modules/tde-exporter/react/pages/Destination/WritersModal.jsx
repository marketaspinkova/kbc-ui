import PropTypes from 'prop-types';
import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import {Button, Modal} from 'react-bootstrap';
import ComponentsStore from '../../../../components/stores/ComponentsStore';
import {Loader} from '@keboola/indigo-ui';
import {OAUTH_V2_WRITERS} from '../../../tdeCommon';
import componentNameAsString from '../../../../../react/common/componentNameAsString';

export default React.createClass({

  propTypes: {
    localState: PropTypes.object.isRequired,
    setLocalState: PropTypes.func,
    onChangeWriterFn: PropTypes.func,
    isSaving: PropTypes.bool
  },

  getInitialState() {
    return {task: ''};
  },

  componentWillReceiveProps(nextProps) {
    if (!nextProps.isSaving) {
      this.setState({task: ''});
    }
  },

  render() {
    return (
      <Modal show={this.props.localState.get('show', false)} onHide={this.close}>
        <Modal.Header>
          <Modal.Title> Choose Destination Type </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderBody()}
        </Modal.Body>
        <Modal.Footer>
          {this.props.isSaving ? <Loader/> : null}
          <Button bsStyle="link" onClick={this.close}>Close</Button>
          <Button bsStyle="primary"
            disabled={this.props.isSaving || this.state.task === ''}
            onClick={() => this.props.onChangeWriterFn(this.state.task)}>Change</Button>
        </Modal.Footer>
      </Modal>
    );
  },

  renderBody() {
    return (
      <div className="form form-horizontal">
        <FormGroup>
          <ControlLabel className="col-sm-4">
            Destination Type
          </ControlLabel>
          <div className="col-sm-8">
            <FormControl
              componentClass="select"
              value={this.state.task}
              onChange={(e) => {
                this.setState({task: e.target.value});
              }}
            >
              <option key="0" value="" disabled={true}>
                Please Select...
              </option>
              {this.generateOption('wr-tableau-server', 'tableauServer')}
              {OAUTH_V2_WRITERS.map(c => this.generateOption(c, c))}
            </FormControl>
          </div>
        </FormGroup>
      </div>
    );
  },

  generateOption(componentId, taskName) {
    const component = ComponentsStore.getComponent(componentId);
    return (
      <option key={taskName} value={taskName}>
        {componentNameAsString(component)}
      </option>
    );
  },

  close() {
    this.props.setLocalState('show', false);
  }

});
