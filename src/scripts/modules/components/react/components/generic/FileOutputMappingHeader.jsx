import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import DeleteButton from '../../../../../react/common/DeleteButton';
import FileOutputMappingModal from './FileOutputMappingModal';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired,
    editingValue: React.PropTypes.object.isRequired,
    mappingIndex: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    pendingActions: React.PropTypes.object.isRequired,
    onEditStart: React.PropTypes.func.isRequired
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
