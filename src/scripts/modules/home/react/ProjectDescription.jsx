import React from 'react';

import InlineEditArea from '../../../react/common/InlineEditArea';
import { editProjectDescription } from '../actions';

export default React.createClass({
  propTypes: {
    description: React.PropTypes.string
  },

  getInitialState() {
    return {
      isEditing: false,
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
          isEditing: false,
          isSaving: false
        });
      });
  },

  render() {
    return (
      <div className="kbc-inner-padding kbc-inner-padding-with-bottom-border">
        <InlineEditArea
          placeholder="Click to edit project description"
          isEditing={this.state.isEditing}
          onEditStart={this.handleEditStart}
          onEditCancel={this.handleEditCancel}
          onEditChange={this.handleChange}
          onEditSubmit={this.handleSubmit}
          text={this.state.description}
        />
      </div>
    );
  }
});
