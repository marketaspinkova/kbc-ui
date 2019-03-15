import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import InlineEditArea from '../../../react/common/InlineEditArea';
import { editProjectDescription } from '../actions';

export default createReactClass({
  propTypes: {
    description: PropTypes.string
  },

  getInitialState() {
    return {
      isEditing: false,
      isSaving: false,
      description: this.props.description
    };
  },

  handleEditStart() {
    this.setState({
      isEditing: true
    });
  },

  handleEditCancel() {
    this.setState({
      isEditing: false,
      description: this.props.description
    });
  },

  handleChange(value) {
    this.setState({
      description: value
    });
  },

  handleSubmit() {
    this.setState({
      isSaving: true
    });

    editProjectDescription(this.state.description)
      .then(() => {
        this.setState({
          isEditing: false
        });
      }, () => {
        this.setState({
          isEditing: true
        });
      })
      .finally(() => {
        this.setState({
          isSaving: false
        });
      });
  },

  render() {
    return (
      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <InlineEditArea
          placeholder="Describe project"
          isEditing={this.state.isEditing}
          isSaving={this.state.isSaving}
          onEditStart={this.handleEditStart}
          onEditCancel={this.handleEditCancel}
          onEditChange={this.handleChange}
          onEditSubmit={this.handleSubmit}
          text={this.state.description}
          collapsible={false}
        />
      </div>
    );
  }
});
