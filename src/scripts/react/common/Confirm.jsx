import React from 'react';
import ConfirmModal from './ConfirmModal';

export default React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    text: React.PropTypes.node.isRequired,
    onConfirm: React.PropTypes.func.isRequired,
    buttonLabel: React.PropTypes.string.isRequired,
    buttonType: React.PropTypes.string,
    isLoading: React.PropTypes.bool,
    children: React.PropTypes.any,
    childrenRootElement: React.PropTypes.any
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
