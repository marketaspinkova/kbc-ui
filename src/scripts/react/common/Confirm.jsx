import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ConfirmModal from './ConfirmModal';

export default createReactClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    text: PropTypes.node.isRequired,
    onConfirm: PropTypes.func.isRequired,
    buttonLabel: PropTypes.string.isRequired,
    buttonType: PropTypes.string,
    isLoading: PropTypes.bool,
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
    this.setState({showModal: false});
  },

  onButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({showModal: true});
  },

  render() {
    const Wrapper = this.props.childrenRootElement;

    return (
      <Wrapper onClick={this.onButtonClick}>
        {this.props.children}
        <ConfirmModal 
          show={this.state.showModal} 
          onHide={this.closeModal}
          title={this.props.title}
          text={this.props.text}
          isLoading={this.props.isLoading}
          onConfirm={this.props.onConfirm}
          buttonLabel={this.props.buttonLabel}
          buttonType={this.props.buttonType}
        />
      </Wrapper>
    )
  }
});
