import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { InlineEditInput } from '@keboola/indigo-ui';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import immutableMixin from 'react-immutable-render-mixin';
import OrchestrationsStore from '../../stores/OrchestrationsStore';
import actionCreators from '../../ActionCreators';

const FIELD = 'name';

export default createReactClass({
  mixins: [createStoreMixin(OrchestrationsStore), immutableMixin],

  propTypes: {
    orchestrationId: PropTypes.number.isRequired
  },

  getStateFromStores() {
    return this.getStateForOrchestration(this.props.orchestrationId);
  },

  getStateForOrchestration(orchestrationId) {
    return {
      value: OrchestrationsStore.get(orchestrationId).get(FIELD),
      editValue: OrchestrationsStore.getEditingValue(orchestrationId, FIELD),
      isEditing: OrchestrationsStore.isEditing(orchestrationId, FIELD),
      isSaving: OrchestrationsStore.isSaving(orchestrationId, FIELD),
      isValid: true
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.orchestrationId !== this.props.orchestrationId) {
      return this.setState(this.getStateForOrchestration(nextProps.orchestrationId));
    }
  },

  _handleEditStart() {
    return actionCreators.startOrchestrationFieldEdit(this.props.orchestrationId, FIELD);
  },

  _handleEditCancel() {
    return actionCreators.cancelOrchestrationFieldEdit(this.props.orchestrationId, FIELD);
  },

  _handleEditChange(newValue) {
    return actionCreators.updateOrchestrationFieldEdit(this.props.orchestrationId, FIELD, newValue);
  },

  _handleEditSubmit() {
    return actionCreators.saveOrchestrationField(this.props.orchestrationId, FIELD);
  },

  render() {
    return (
      <InlineEditInput
        text={this.state.isEditing ? this.state.editValue : this.state.value}
        placeholder="Name the component ..."
        tooltipPlacement="bottom"
        isSaving={this.state.isSaving}
        isEditing={this.state.isEditing}
        isValid={!!(this.state.editValue && this.state.editValue.trim() !== '')}
        onEditStart={this._handleEditStart}
        onEditCancel={this._handleEditCancel}
        onEditChange={this._handleEditChange}
        onEditSubmit={this._handleEditSubmit}
      />
    );
  }
});
