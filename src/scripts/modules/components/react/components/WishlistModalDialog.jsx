import React, {PropTypes} from 'react';
import immutableMixin from 'react-immutable-render-mixin';

import { Modal, Form} from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({

  propTypes: {
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func
  },

  mixins: [immutableMixin],

  render() {
    return (
      <Modal
        bsSize="large"
        show={this.props.show}
      >
        <Form inline>
          <Modal.Header closeButton>
            <Modal.Title>Wishlist request</Modal.Title>
          </Modal.Header>
          <Modal.Body />
          <Modal.Footer>
            <ConfirmButtons
              saveButtonType="submit"
              isSaving={false}
              onCancel={this.close}
              onSave={this.onSubmit}
              isDisabled={false}
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }

});
