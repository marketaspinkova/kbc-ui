import React from 'react';
import { Link } from 'react-router';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import TransformationTypeLabel from './TransformationTypeLabel';
import DeleteButton from '../../../../react/common/DeleteButton';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import CreateSandboxButton from './CreateSandboxButton';
import TransformationsActionCreators from '../../ActionCreators';
import descriptionExcerpt from '../../../../utils/descriptionExcerpt';
import TransformationStore from '../../stores/TransformationsStore';
import * as sandboxUtils from '../../utils/sandboxUtils';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    transformation: React.PropTypes.object,
    latestVersionId: React.PropTypes.number,
    bucket: React.PropTypes.object,
    pendingActions: React.PropTypes.object,
    hideButtons: React.PropTypes.bool
  },

  buttons() {
    const buttons = [];

    buttons.push(
      <DeleteButton
        key="delete"
        tooltip="Delete Transformation"
        isPending={this.props.pendingActions.get('delete')}
        confirm={{
          title: 'Delete Transformation',
          text: `Do you really want to delete transformation ${this.props.transformation.get('name')}?`,
          onConfirm: this._deleteTransformation
        }}
      />
    );

    if (sandboxUtils.hasSandbox(this.props.transformation.get('backend'), this.props.transformation.get('type'))) {
      buttons.push(
        <CreateSandboxButton
          key="create-sandbox"
          transformationType={this.props.transformation.get('type')}
          backend={this.props.transformation.get('backend')}
          mode="button"
          runParams={sandboxUtils.generateRunParameters(
            this.props.transformation,
            this.props.bucket.get('id'),
            this.props.latestVersionId
          )}
        />
      );
    }

    buttons.push(
      <RunComponentButton
        key="run"
        title={`Run ${this.props.transformation.get('name')}`}
        component="transformation"
        mode="button"
        runParams={() => ({
          configBucketId: this.props.bucket.get('id'),
          transformations: [this.props.transformation.get('id')]
        })}
      >
        {`You are about to run the transformation ${this.props.transformation.get('name')}.`}
      </RunComponentButton>
    );

    buttons.push(
      <ActivateDeactivateButton
        key="active"
        activateTooltip="Enable Transformation"
        deactivateTooltip="Disable Transformation"
        isActive={!this.props.transformation.get('disabled')}
        isPending={this.props.pendingActions.has('save-disabled')}
        onChange={this._handleActiveChange}
      />
    );

    return buttons;
  },

  render() {
    // TODO - no detail for unsupported transformations! (remote, db/snapshot, ...)
    return (
      <Link
        className="tr"
        to="transformationDetail"
        params={{ row: this.props.transformation.get('id'), config: this.props.bucket.get('id') }}
      >
        {this.props.hideButtons ? this._renderHideButtons() : this._renderNormalButtons()}
      </Link>
    );
  },

  _deleteTransformation() {
    // if transformation is deleted immediately view is rendered with missing bucket because of store changed
    const transformationId = this.props.transformation.get('id');
    const bucketId = this.props.bucket.get('id');
    return setTimeout(() => TransformationsActionCreators.deleteTransformation(bucketId, transformationId));
  },

  _handleActiveChange(newValue) {
    let changeDescription;
    const transformationId = this.props.transformation.get('id');
    const bucketId = this.props.bucket.get('id');
    if (newValue) {
      changeDescription = `Transformation ${this.props.transformation.get('name')} enabled`;
    } else {
      changeDescription = `Transformation ${this.props.transformation.get('name')} disabled`;
    }
    return TransformationsActionCreators.changeTransformationProperty(
      bucketId,
      transformationId,
      'disabled',
      !newValue,
      changeDescription
    );
  },

  _renderHideButtons() {
    return [
      <span className="td col-xs-3" key="col1">
        <h4>
          <span className="label kbc-label-rounded-small label-default pull-left">
            {this.props.transformation.get('phase') || 1}
          </span>{' '}
          {TransformationStore.getTransformationName(this.props.bucket.get('id'), this.props.transformation.get('id'))}
        </h4>
      </span>,
      <span className="td col-xs-1" key="col2">
        <TransformationTypeLabel
          backend={this.props.transformation.get('backend')}
          type={this.props.transformation.get('type')}
        />
      </span>,
      <span className="td col-xs-8" key="col3">
        <small>
          {descriptionExcerpt(
            TransformationStore.getTransformationDescription(
              this.props.bucket.get('id'),
              this.props.transformation.get('id')
            )
          ) || <em>No description</em>}
        </small>
      </span>
    ];
  },

  _renderNormalButtons() {
    return [
      <span className="td col-xs-3" key="col1">
        <h4>
          <span className="label kbc-label-rounded-small label-default pull-left">
            {this.props.transformation.get('phase') || 1}
          </span>{' '}
          {TransformationStore.getTransformationName(this.props.bucket.get('id'), this.props.transformation.get('id'))}
        </h4>
      </span>,
      <span className="td col-xs-1" key="col2">
        <TransformationTypeLabel
          backend={this.props.transformation.get('backend')}
          type={this.props.transformation.get('type')}
        />
      </span>,
      <span className="td col-xs-4" key="col3">
        <small>
          {descriptionExcerpt(
            TransformationStore.getTransformationDescription(
              this.props.bucket.get('id'),
              this.props.transformation.get('id')
            )
          ) || <em>No description</em>}
        </small>
      </span>,
      <span className="td text-right col-xs-4" key="col4">
        {this.buttons()}
      </span>
    ];
  }
});
