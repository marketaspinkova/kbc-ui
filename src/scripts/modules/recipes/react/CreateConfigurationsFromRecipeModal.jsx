import React from 'react';
import { Modal } from 'react-bootstrap';
import ConfirmButtons from '../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    show: React.PropTypes.bool.isRequired,
    recipe: React.PropTypes.object.isRequired,
    onHide: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      deleteProject: false
    };
  },

  render() {
    const { recipe } = this.props;
    return (
      <Modal onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header closeButton>
          <Modal.Title>
            {recipe.get('name')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            You are about to create {recipe.get('configurations').count()} configurations.
          </p>
          <ul className="">
            {recipe.get('configurations').map((recipeConfig) => {
              return (
                <li key={recipeConfig.get('id')}>
                  {recipeConfig.get('component')}
                </li>
              );
            })}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Create configurations"
            onCancel={this.props.onHide}
            saveButtonType="submit"
            onSave={this.props.onSave}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});
