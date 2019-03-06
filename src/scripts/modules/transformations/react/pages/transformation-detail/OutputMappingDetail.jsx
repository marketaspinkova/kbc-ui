import React from 'react';
import { List } from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import WhereOperator from '../../../../../react/common/WhereOperator';
import TableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import { Check } from '@keboola/indigo-ui';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    outputMapping: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup>
        <ListGroupItem className="row" key="destination">
          <strong className="col-md-4">Destination table</strong>
          <span className="col-md-6">
            <TableLinkEx tableId={this.props.outputMapping.get('destination')} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row" key="primaryKey">
          <strong className="col-md-4">Primary key</strong>
          <span className="col-md-6">
            {this.props.outputMapping.get('primaryKey', List()).count()
              ? this.props.outputMapping.get('primaryKey').join(', ')
              : 'N/A'}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row" key="incremental">
          <strong className="col-md-4">Incremental</strong>
          <span className="col-md-6">
            <Check isChecked={this.props.outputMapping.get('incremental')} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row" key="deleteWhere">
          <strong className="col-md-4">Delete rows</strong>
          <span className="col-md-6">
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
