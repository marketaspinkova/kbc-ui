import PropTypes from 'prop-types';
import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import RunComponentButton from '../../../../components/react/components/RunComponentButton';
import DeleteButton from '../../../../../react/common/DeleteButton';
import TransformationActionCreators from '../../../ActionCreators';
import RoutesStore from '../../../../../stores/RoutesStore';
import Tooltip from '../../../../../react/common/Tooltip';
import descriptionExcerpt from '../../../../../utils/descriptionExcerpt';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    bucket: PropTypes.object.isRequired,
    pendingActions: PropTypes.object.isRequired,
    description: PropTypes.string
  },

  render() {
    return (
      <span className="tr">
        <span className="td col-xs-4">
          <h4>{this.props.bucket.get('name')}</h4>
        </span>
        <span className="td col-xs-5">
          <small>{descriptionExcerpt(this.props.description) || <em>No description</em>}</small>
        </span>
        <span className="td col-xs-3 text-right kbc-no-wrap">{this._renderButtons()}</span>
      </span>
    );
  },

  _renderButtons() {
    const buttons = [];

    buttons.push(
      <DeleteButton
        tooltip="Move to Trash"
        isPending={this.props.pendingActions.get('delete')}
        confirm={{
          title: 'Move Bucket to Trash',
          text: `Are you sure you want to move the bucket ${this.props.bucket.get('name')} to Trash?`,
          onConfirm: this._deleteTransformationBucket,
          buttonLabel: 'Move to Trash'
        }}
        isEnabled={true}
        key="delete-new"
      />
    );

    buttons.push(
      <RunComponentButton
        title={`Run ${this.props.bucket.get('name')}`}
        component="transformation"
        mode="button"
        runParams={() => ({
          configBucketId: this.props.bucket.get('id')
        })}
        key="run"
        tooltip="Run all transformations in bucket"
      >
        {`You are about to run all transformations in the bucket ${this.props.bucket.get('name')}.`}
      </RunComponentButton>
    );

    buttons.push(
      <Tooltip tooltip="Go to Bucket Detail" placement="top" key="bucket-detail">
        <button
          key="bucket"
          className="btn btn-link"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            return RoutesStore.getRouter().transitionTo('transformationBucket', {
              config: this.props.bucket.get('id')
            });
          }}
        >
          <i className="fa fa-fw fa-chevron-right" />
        </button>
      </Tooltip>
    );

    return buttons;
  },

  _deleteTransformationBucket() {
    // if transformation is deleted immediately view is rendered with missing bucket because of store changed
    const bucketId = this.props.bucket.get('id');
    return TransformationActionCreators.deleteTransformationBucket(bucketId);
  }
});
