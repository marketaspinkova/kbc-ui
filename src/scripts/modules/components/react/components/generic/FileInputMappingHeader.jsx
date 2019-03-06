import React, { PropTypes } from 'react';
import { List } from 'immutable';

import DeleteButton from '../../../../../react/common/DeleteButton';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import FileInputMappingModal from './FileInputMappingModal';

export default React.createClass({

  mixins: [PureRenderMixin],

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
            <span className="td col-xs-3">
              {this.renderTags()}
            </span>
            <span className="td col-xs-4">
              {this.props.value.get('query', '') !== '' && (
                <code>
                  {this.props.value.get('query')}
                </code>
              )}
            </span>
            <span className="td col-xs-1">
              <span className="fa fa-chevron-right fa-fw" />
            </span>
            <span className="td col-xs-3">
              {'in/files/*'}
            </span>
            <span className="td col-xs-1 text-right kbc-no-wrap">
              <DeleteButton
                tooltip="Delete Input"
                isPending={this.props.pendingActions.getIn(['input', 'files', this.props.mappingIndex, 'delete'], false)}
                confirm={{
                  title: 'Delete Input',
                  text: (
                    <span>
                      {'Do you really want to delete the input mapping for '}
                      <code>
                        {'tags: '}
                        {JSON.stringify(this.props.value.get('tags', List()).toJS())}
                      </code>
                      {', '}
                      <code>
                        {'query: '}
                        {this.props.value.get('query')}
                      </code>
                      {'?'}
                    </span>
                  ),
                  onConfirm: this.props.onDelete
                }}
              />
              <FileInputMappingModal
                mode="edit"
                mapping={this.props.editingValue}
                onChange={this.props.onChange}
                onCancel={this.props.onCancel}
                onSave={this.props.onSave}
                onEditStart={this.props.onEditStart}
              />
            </span>
          </span>
        </span>
      </span>
    );
  },

  renderTags() {
    if (this.props.value.get('tags') && this.props.value.get('tags').count()) {
      return this.props.value.get('tags').map((tag) => {
        return (
          <span
            className="label kbc-label-rounded-small label-default"
            key={tag}
          >
            {tag}
          </span>
        );
      });
    } else {
      return 'N/A';
    }
  }
});
