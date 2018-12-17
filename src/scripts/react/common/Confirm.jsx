import React, { PropTypes } from 'react';
import ConfirmModal from './ConfirmModal';

export default React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    text: PropTypes.node.isRequired,
    onConfirm: PropTypes.func.isRequired,
    buttonLabel: PropTypes.string.isRequired,
    buttonType: PropTypes.string,
    children: PropTypes.any,
    childrenRootElement: PropTypes.any
  },

  getDefaultProps() {
    return {
      buttonType: 'danger',
      childrenRootElement: 'span'
    };
  },

  getInitialState() {
    return {
      showModal: false
    };
  },

  closeModal() {
    this.setState({ showModal: false });
  },

  onWrapperClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ showModal: true });
  },

  render() {
    const Wrapper = this.props.childrenRootElement;

    return (
      <Wrapper onClick={this.onWrapperClick}>
        {this.props.children}
        <ConfirmModal show={this.state.showModal} onHide={this.closeModal} {...this.props} key="modal" />
      </Wrapper>
    );
  }
});
