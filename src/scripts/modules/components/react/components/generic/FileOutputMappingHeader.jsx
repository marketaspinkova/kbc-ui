import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import DeleteButton from '../../../../../react/common/DeleteButton';
import FileOutputMappingModal from './FileOutputMappingModal';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired,
    editingValue: PropTypes.object.isRequired,
    mappingIndex: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    pendingActions: PropTypes.object.isRequired,
    onEditStart: PropTypes.func.isRequired
  },

  render() {
    return (
      <span className="table kbc-break-all kbc-break-word">
        <span className="tbody">
          <span className="tr">
            <span className="td col-xs-4">
              out/files/
              {this.props.value.get('source')}
            </span>
            <span className="td col-xs-1">
              <span className="fa fa-chevron-right fa-fw" />
            </span>
            <span className="td col-xs-6">{this.renderTags()}</span>
            <span className="td col-xs-1 text-right kbc-no-wrap">
              <DeleteButton
                tooltip="Delete Output"
                isPending={this.props.pendingActions.getIn(
                  ['output', 'files', this.props.mappingIndex, 'delete'],
                  false
                )}
                confirm={{
                  title: 'Delete Output',
                  text: (
                    <span>
                      Do you really want to delete the output mapping for out/files/
                      {this.props.value.get('source')}?
                    </span>
                  ),
                  onConfirm: this.props.onDelete
                }}
              />
              <FileOutputMappingModal
                mode="edit"
                onEditStart={this.props.onEditStart}
                mapping={this.props.editingValue}
                onChange={this.props.onChange}
                onCancel={this.props.onCancel}
                onSave={this.props.onSave}
              />
            </span>
          </span>
        </span>
      </span>
    );
  },

  renderTags() {
    if (!this.props.value.get('tags').count()) {
      return 'N/A';
    }

    return this.props.value
      .get('tags')
      .map(this.renderTag)
      .toArray();
  },

  renderTag(tag) {
    return (
      <span className="label kbc-label-rounded-small label-default" key={tag}>
        {tag}
      </span>
    );
  }
});
