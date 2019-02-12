import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import Edit from './QueriesEdit';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButton from '../../components/SaveButton';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    bucketId: PropTypes.string.isRequired,
    transformation: PropTypes.object.isRequired,
    queries: PropTypes.string.isRequired,
    splitQueries: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isQueriesProcessing: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
    changeDescription: PropTypes.string.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired,
    highlightQueryNumber: PropTypes.number,
    highlightingQueryDisabled: PropTypes.bool,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  render() {
    return (
      <div>
        <h2 style={{ lineHeight: '32px' }}>
          Queries
          <small>
            <Clipboard text={this.props.queries} />
          </small>
          {this.renderButtons()}
        </h2>
        {this.queries()}
      </div>
    );
  },

  renderButtons() {
    return (
      <span className="pull-right">
        <SaveButton
          isSaving={this.props.isSaving}
          isChanged={this.props.isChanged}
          onReset={this.props.onEditCancel}
          onSave={this.props.onEditSubmit}
          disabled={!!(this.props.isQueriesProcessing || this.props.disabled)}
          onDescriptionChange={this.props.onDescriptionChange}
          changeDescription={this.props.changeDescription}
        />
      </span>
    );
  },

  queries() {
    return (
      <Edit
        transformation={this.props.transformation}
        queries={this.props.queries}
        splitQueries={this.props.splitQueries}
        backend={this.props.transformation.get('backend')}
        disabled={this.props.isSaving || this.props.disabled}
        onChange={this.props.onEditChange}
        highlightQueryNumber={this.props.highlightQueryNumber}
        highlightingQueryDisabled={this.props.highlightingQueryDisabled}
      />
    );
  }
});
