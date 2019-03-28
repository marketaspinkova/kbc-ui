import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Link} from 'react-router';
import {Label} from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    isEditing: PropTypes.bool.isRequired
  },
  render() {
    return (
      <Link
        className="list-group-item"
        to={`ex-db-generic-${this.props.componentId}-query`}
        params={this.linkParams()}
      >
        {this.renderName()}
      </Link>
    );
  },

  renderName() {
    if (this.props.query.get('name') === '') {
      return (
        <span className="text-muted">
          [Untitled]
          {this.props.isEditing && ' *'}
        </span>
      );
    }
    return (
      <span>
        <strong>
          {this.props.query.get('name')}
          {this.props.isEditing && ' *'}
        </strong>
        Source:{' '}
        {this.props.query.get('table') ? (
          <span>
            {`${this.props.query.getIn(['table', 'schema'])}.${this.props.query.getIn(['table', 'tableName'])}`}
          </span>
        ) : (
          <Label>SQL</Label>
        )}
      </span>
    );
  },

  linkParams() {
    return {
      config: this.props.configurationId,
      query: this.props.query.get('id')
    };
  }
});
