import React, { PropTypes } from 'react';
import _ from 'underscore';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import MetadataActionCreators from '../../MetadataActionCreators';
import MetadataStore from '../../stores/MetadataStore';

export default React.createClass({
  mixins: [PureRenderMixin, createStoreMixin(MetadataStore)],

  propTypes: {
    objectType: PropTypes.oneOf(['bucket', 'table', 'column']).isRequired,
    objectId: PropTypes.string.isRequired,
    metadataKey: PropTypes.string.isRequired,
    editElement: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    tooltipPlacement: PropTypes.string
  },

  getDefaultProps() {
    return {
      placeholder: 'Describe this ...',
      tooltipPlacement: 'top'
    };
  },

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props, prevProps)) {
      this.setState(this.getState(this.props));
    }
  },

  getStateFromStores() {
    return this.getState(this.props);
  },

  getState(props) {
    return {
      value: MetadataStore.getMetadataValue(
        props.objectType,
        props.objectId,
        'user',
        props.metadataKey
      ),
      editValue: MetadataStore.getEditingMetadataValue(
        props.objectType,
        props.objectId,
        props.metadataKey
      ),
      isEditing: MetadataStore.isEditingMetadata(
        props.objectType,
        props.objectId,
        props.metadataKey
      ),
      isSaving: MetadataStore.isSavingMetadata(props.objectType, props.objectId, props.metadataKey)
    };
  },

  render() {
    const EditElement = this.props.editElement;

    return (
      <EditElement
        text={this.state.isEditing ? this.state.editValue : this.state.value}
        placeholder={this.props.placeholder}
        tooltipPlacement={this.props.tooltipPlacement}
        isSaving={this.state.isSaving}
        isEditing={this.state.isEditing}
        isValid={this.state.isValid}
        onEditStart={this.handleEditStart}
        onEditChange={this.handleEditChange}
        onEditSubmit={this.handleEditSubmit}
        onEditCancel={this.handleEditCancel}
      />
    );
  },

  handleEditStart() {
    MetadataActionCreators.startMetadataEdit(
      this.props.objectType,
      this.props.objectId,
      this.props.metadataKey
    );
  },

  handleEditCancel() {
    MetadataActionCreators.cancelMetadataEdit(
      this.props.objectType,
      this.props.objectId,
      this.props.metadataKey
    );
  },

  handleEditChange(newValue) {
    MetadataActionCreators.updateEditingMetadata(
      this.props.objectType,
      this.props.objectId,
      this.props.metadataKey,
      newValue
    );
  },

  handleEditSubmit() {
    MetadataActionCreators.saveMetadata(
      this.props.objectType,
      this.props.objectId,
      this.props.metadataKey
    );
  }
});
