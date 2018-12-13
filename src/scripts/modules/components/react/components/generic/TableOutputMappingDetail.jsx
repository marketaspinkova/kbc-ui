import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { Check, NotAvailable } from '@keboola/indigo-ui';
import TableLinkEx from '../StorageApiTableLinkEx';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem className="row">
          <strong className="col-md-4">Destination table</strong>
          <span className="col-md-6">
            {this.props.value.get('destination') ? (
              <TableLinkEx tableId={this.props.value.get('destination')} />
            ) : (
              'Not set'
            )}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Incremental</strong>
          <span className="col-md-6">
            <Check isChecked={this.props.value.get('incremental', false)} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Primary key</strong>
          <span className="col-md-6">
            {this.props.value.get('primary_key', List()).count()
              ? this.props.value.get('primary_key').join(', ')
              : <NotAvailable/>}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Delete rows</strong>
          <span className="col-md-6">
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
              <NotAvailable/>
            )}
          </span>
        </ListGroupItem>
      </ListGroup>
    );
  }
});
