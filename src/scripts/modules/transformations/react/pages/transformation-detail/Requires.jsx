import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import Select from 'react-select';
import {fromJS} from 'immutable';
import RoutesStore from '../../../../../stores/RoutesStore';
import ApplicationStore from '../../../../../stores/ApplicationStore';

const allowedMixedBackends = ['docker', 'snowflake'];
const allowedMixedBackendTypes = ['simple', 'python', 'r'];

export default React.createClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    transformations: PropTypes.object.isRequired,
    requires: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditChange: PropTypes.func.isRequired,
    bucketId: PropTypes.string.isRequired,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  onValueClick: function(value) {
    const props = this.props;
    return RoutesStore.getRouter().transitionTo('transformationDetail', {
      config: props.bucketId,
      row: value.value
    });
  },

  render() {
    return (
      <div>
        <h2 style={{lineHeight: '32px'}}>
          Requires
        </h2>
        <div className="form-group">
          <Select
            name="requires"
            value={this.props.requires.toArray()}
            options={this.getSelectOptions(this.props.transformations, this.props.transformation)}
            multi={true}
            disabled={this.props.isSaving || this.props.disabled}
            onChange={this.handleValueChange}
            placeholder="Add required transformation..."
            isLoading={this.props.isSaving}
            noResultsText="No transformations found"
            onValueClick={this.onValueClick}
          />
          <span className="help-block">
            These transformations are processed before this transformation starts.
          </span>
        </div>
      </div>
    );
  },

  allowInterbackendDependencies(current, compared) {
    if (!ApplicationStore.hasCurrentProjectFeature('transformations-mixed-backends')) {
      return false;
    }
    if (!allowedMixedBackends.includes(current.get('backend'))) {
      return false;
    }
    if (!allowedMixedBackends.includes(compared.get('backend'))) {
      return false;
    }
    if (!allowedMixedBackendTypes.includes(current.get('type'))) {
      return false;
    }
    if (!allowedMixedBackendTypes.includes(compared.get('type'))) {
      return false;
    }
    return true;
  },

  getSelectOptions: function(transformations, currentTransformation) {
    const component = this;
    let options = _.sortBy(_.map(_.filter(transformations.toArray(), function(transformation) {
      return (
        parseInt(transformation.get('phase'), 10) === parseInt(currentTransformation.get('phase'), 10)
        && (
          transformation.get('backend') === currentTransformation.get('backend')
          || component.allowInterbackendDependencies(currentTransformation, transformation)
        )
        && transformation.get('id') !== currentTransformation.get('id')
        || currentTransformation.get('requires').contains(transformation.get('id'))
      );
    }), function(transformation) {
      if (parseInt(transformation.get('phase'), 10) !== parseInt(currentTransformation.get('phase'), 10)) {
        return {
          label: transformation.get('name', transformation.get('id')) + ' (phase mismatch)',
          value: transformation.get('id')
        };
      }
      return {
        label: transformation.get('name', transformation.get('id')),
        value: transformation.get('id')
      };
    }), function(option) {
      return option.label.toLowerCase();
    });

    // identify deleted required transformations
    const missing = _.filter(currentTransformation.get('requires').toArray(), function(possiblyMissingTransformationId) {
      if (_.find(options, function(option) {
        return option.value === possiblyMissingTransformationId;
      })) {
        return false;
      }
      return true;
    });
    // add them to options
    return options.concat(missing.map(function(missingItem) {
      return {
        label: missingItem + ' (deleted)',
        value: missingItem
      };
    }));
  },

  handleValueChange(newArray) {
    const values = fromJS(newArray).map((item) => item.get('value'));
    this.props.onEditChange(values);
  }

});
