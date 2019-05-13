import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Check } from '@keboola/indigo-ui';
import TableLinkEx from '../StorageApiTableLinkEx';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem className="row">
          <strong className="col-md-4">Destination table</strong>
          <span className="col-md-8">
            {this.props.value.get('destination') ? (
              <TableLinkEx tableId={this.props.value.get('destination')} />
            ) : (
              'Not set'
            )}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Incremental</strong>
          <span className="col-md-8">
            <Check isChecked={this.props.value.get('incremental', false)} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Primary key</strong>
          <span className="col-md-8">
            {this.props.value.get('primary_key', List()).count()
              ? this.props.value.get('primary_key').join(', ')
              : 'N/A'}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Delete rows</strong>
          <span className="col-md-8">
            {this.props.value.get('delete_where_column') && this.props.value.get('delete_where_values') ? (
              <span>
                {'Where '}
                <strong>{this.props.value.get('delete_where_column')}</strong>{' '}
                {this.props.value.get('delete_where_operator')}{' '}
                <strong>
                  {this.props.value.get('delete_where_values') &&
                    this.props.value
                      .get('delete_where_values')
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
            ) : (
              'N/A'
            )}
          </span>
        </ListGroupItem>
      </ListGroup>
    );
  }
});
