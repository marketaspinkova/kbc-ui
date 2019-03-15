import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { List } from 'immutable';
import WhereOperator from '../../../../../react/common/WhereOperator';

export default createReactClass({
  propTypes: {
    value: PropTypes.object.isRequired,
    rootClassName: PropTypes.string
  },

  getDefaultProps() {
    return { rootClassName: 'col-md-6' };
  },

  render() {
    return (
      <span className={this.props.rootClassName}>
        {this.props.value.get('where_column') && this.props.value.get('where_column') && (
          <span>
            {'Where '}
            <strong>{this.props.value.get('where_column')}</strong>{' '}
            <WhereOperator backendOperator={this.props.value.get('where_operator')} />{' '}
            <strong>
              {this.props.value
                .get('where_values', List())
                .map(value => {
                  if (value === '') {
                    return '[empty string]';
                  }
                  if (value === ' ') {
                    return '[space character]';
                  }
                  return value;
                })
                .join(', ')}
            </strong>
          </span>
        )}
        {(this.props.value.get('days', 0) !== 0 || this.props.value.get('changed_since')) &&
          this.props.value.get('where_column') &&
          this.props.value.get('where_column') &&
          ' and '}
        {this.props.value.get('changed_since') && (
          <span>
            {this.props.value.get('where_column') && this.props.value.get('where_values')
              ? 'changed in last '
              : 'Changed in last '}
            {this.props.value.get('changed_since').replace('-', '')}
          </span>
        )}
        {this.props.value.get('days', 0) !== 0 && (
          <span>
            {this.props.value.get('where_column') ? 'changed in last ' : 'Changed in last '}
            {this.props.value.get('days', 0)}
            {' days'}
          </span>
        )}
        {this.props.value.get('days', 0) === 0 &&
          !this.props.value.get('changed_since') &&
          !this.props.value.get('where_column') &&
          'N/A'}
      </span>
    );
  }
});
