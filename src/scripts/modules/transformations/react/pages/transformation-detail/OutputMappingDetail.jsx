import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { List } from 'immutable';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import WhereOperator from '../../../../../react/common/WhereOperator';
import TableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import { Check } from '@keboola/indigo-ui';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    outputMapping: PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem className="row">
          <strong className="col-md-4">Destination table</strong>
          <span className="col-md-8">
            <TableLinkEx tableId={this.props.outputMapping.get('destination')} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Primary key</strong>
          <span className="col-md-8">
            {this.props.outputMapping.get('primaryKey', List()).count()
              ? this.props.outputMapping.get('primaryKey').join(', ')
              : 'N/A'}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Incremental</strong>
          <span className="col-md-8">
            <Check isChecked={this.props.outputMapping.get('incremental', false)} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Delete rows</strong>
          <span className="col-md-8">
            {this.props.outputMapping.get('deleteWhereColumn') && this.props.outputMapping.get('deleteWhereValues') ? (
              <span>
                {'Where '}
                <strong>{this.props.outputMapping.get('deleteWhereColumn')}</strong>{' '}
                <WhereOperator backendOperator={this.props.outputMapping.get('deleteWhereOperator')} />{' '}
                <strong>
                  {this.props.outputMapping
                    .get('deleteWhereValues')
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
