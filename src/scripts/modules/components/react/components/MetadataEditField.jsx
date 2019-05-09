import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ImmutableMixin from 'react-immutable-render-mixin';
import { Map } from 'immutable';
import Markdown from '../../../../react/common/Markdown';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import MetadataActionCreators from '../../MetadataActionCreators';
import MetadataStore from '../../stores/MetadataStore';

export default createReactClass({
  mixins: [createStoreMixin(MetadataStore), ImmutableMixin],

  propTypes: {
    objectType: PropTypes.oneOf(['bucket', 'table', 'column']).isRequired,
    objectId: PropTypes.string.isRequired,
    metadata: PropTypes.object.isRequired,
    metadataKey: PropTypes.string.isRequired,
    editElement: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    tooltipPlacement: PropTypes.string,
    readOnly: PropTypes.bool
  },

  getDefaultProps() {
    return {
      placeholder: 'Describe this ...',
      tooltipPlacement: 'top',
      readOnly: false
    };
  },

  getStateFromStores(props) {
    return {
      editValue: MetadataStore.getEditingValue(props.objectType, props.objectId, props.metadataKey),
      isEditing: MetadataStore.isEditing(props.objectType, props.objectId, props.metadataKey),
      isSaving: MetadataStore.isSaving(props.objectType, props.objectId, props.metadataKey)
    };
  },

  render() {
    if (this.props.readOnly) {
      return (
        <Markdown source={this.metadataValue()} collapsible />
      );
    }

    const EditElement = this.props.editElement;

    return (
      <EditElement
        text={this.state.isEditing ? this.state.editValue : this.metadataValue()}
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

  metadataValue() {
    return this.props.metadata
      .find(row => row.get('provider') === 'user' && row.get('key') === this.props.metadataKey, null, Map())
      .get('value', '');
  },

  handleEditStart() {
    this.handleEditChange(this.metadataValue());
  },

  handleEditCancel() {
    MetadataActionCreators.cancelMetadataEdit(this.props.objectType, this.props.objectId, this.props.metadataKey);
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
      this.props.metadataKey,
      this.state.editValue
    );
  }
});
