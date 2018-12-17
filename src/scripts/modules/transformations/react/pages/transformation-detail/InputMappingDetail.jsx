import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import WhereOperator from '../../../../../react/common/WhereOperator';
import { Check } from '@keboola/indigo-ui';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import TableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import { Map, List } from 'immutable';
import DatatypeLabel from '../../components/mapping/input/DatatypeLabel';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    transformationBackend: React.PropTypes.string.isRequired,
    inputMapping: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    definition: React.PropTypes.object
  },

  getDefaultProps() {
    return { definition: Map() };
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem className="row" key="source">
          <strong className="col-md-4">Source table</strong>
          <span className="col-md-6">
            {this.props.inputMapping.get('source') ? (
              <TableLinkEx tableId={this.props.inputMapping.get('source')} />
            ) : (
              'Not set'
            )}
          </span>
        </ListGroupItem>

        {(this.props.transformationBackend === 'mysql' || this.props.transformationBackend === 'redshift') && (
          <ListGroupItem className="row" key="optional">
            <strong className="col-md-4">Optional</strong>
            <span className="col-md-6">
              <Check isChecked={this.props.inputMapping.get('optional')} />
            </span>
          </ListGroupItem>
        )}

        <ListGroupItem className="row" key="columns">
          <strong className="col-md-4">Columns</strong>
          <span className="col-md-6">
            {this.props.inputMapping.get('columns', List()).count()
              ? this.props.inputMapping.get('columns').join(', ')
              : 'Use all columns'}
          </span>
        </ListGroupItem>

        <ListGroupItem className="row" key="whereColumn">
          <strong className="col-md-4">Filters</strong>
          <span className="col-md-6">
            {this.props.inputMapping.get('whereColumn') &&
              this.props.inputMapping.get('whereValues') && (
              <span>
                {'Where '}
                <strong>{this.props.inputMapping.get('whereColumn')}</strong>{' '}
                <WhereOperator backendOperator={this.props.inputMapping.get('whereOperator')} />{' '}
                <strong>
                  {this.props.inputMapping
                    .get('whereValues')
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
            {(this.props.inputMapping.get('days', 0) !== 0 || this.props.inputMapping.get('changedSince')) &&
              this.props.inputMapping.get('whereColumn') &&
              ' and '}
            {this.props.inputMapping.get('changedSince') && (
              <span>
                {this.props.inputMapping.get('whereColumn') && this.props.inputMapping.get('whereValues')
                  ? 'changed in last '
                  : 'Changed in last '}
                {this.props.inputMapping.get('changedSince').replace('-', '')}
              </span>
            )}
            {this.props.inputMapping.get('days', 0) !== 0 && (
              <span>
                {this.props.inputMapping.get('whereColumn') && this.props.inputMapping.get('whereValues')
                  ? 'changed in last '
                  : 'Changed in last '}
                {this.props.inputMapping.get('days')}
                {' days'}
              </span>
            )}
            {this.props.inputMapping.get('days', 0) === 0 &&
              !this.props.inputMapping.get('changedSince') &&
              !this.props.inputMapping.get('whereColumn') &&
              'N/A'}
          </span>
        </ListGroupItem>

        {this.props.transformationBackend === 'mysql' && (
          <ListGroupItem className="row" key="indexes">
            <strong className="col-md-4">Indexes</strong>
            <span className="col-md-6">
              {this.props.inputMapping.get('indexes', List()).count()
                ? this.props.inputMapping
                  .get('indexes')
                  .map(
                    index => (
                      <span key={index}>
                        <span className="label label-default">{index.toArray().join(', ')}</span>{' '}
                      </span>
                    ),

                    this
                  )
                  .toArray()
                : 'N/A'}
            </span>
          </ListGroupItem>
        )}

        {(this.props.transformationBackend === 'mysql' ||
          this.props.transformationBackend === 'redshift' ||
          this.props.transformationBackend === 'snowflake') && (
          <ListGroupItem className="row" key="datatypes">
            <div className="clearfix">
              <strong className="col-md-4">Data types</strong>
              <span className="col-md-6">
                {this.props.inputMapping.get('datatypes', List()).count() ? (
                  <ul>
                    {this.props.inputMapping
                      .get('datatypes')
                      .sort()
                      .map((definition, column) => (
                        <li key={column}>
                          <DatatypeLabel column={column} datatype={definition} />
                        </li>
                      ))
                      .toArray()}
                  </ul>
                ) : (
                  'No data types set'
                )}
              </span>
            </div>
          </ListGroupItem>
        )}

        {this.props.transformationBackend === 'redshift' && (
          <ListGroupItem className="row" key="sortKey">
            <strong className="col-md-4">Sort key</strong>
            <span className="col-md-6">
              {this.props.inputMapping.get('sortKey')
                ? this.props.inputMapping
                  .get('sortKey')
                  .split(',')
                  .join(', ')
                : 'No sort key set'}
            </span>
          </ListGroupItem>
        )}

        {this.props.transformationBackend === 'redshift' && (
          <ListGroupItem className="row" key="distStyle">
            <strong className="col-md-4">Distribution</strong>
            <span className="col-md-6">
              {this.props.inputMapping.get('distStyle')
                ? this.props.inputMapping.get('distStyle') + ' ' + this.props.inputMapping.get('distKey')
                : 'No distribution set'}
            </span>
          </ListGroupItem>
        )}
      </ListGroup>
    );
  }
});
