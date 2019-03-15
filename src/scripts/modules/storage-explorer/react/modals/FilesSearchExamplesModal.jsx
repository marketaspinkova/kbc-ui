import PropTypes from 'prop-types';
import React from 'react';
import { Modal, Button, Label, Well } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onSelectExample: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      examples: [
        {
          query: 'token.name:john.doe@company.com',
          description: 'Files uploaded by John Doe'
        },
        {
          query: 'name:devel',
          description: 'Files with a name that contains "devel"'
        },
        {
          query: 'isPublic',
          description: 'Public files only'
        },
        {
          query: '-isPublic',
          description: 'Everything except public files'
        },
        {
          query: 'created:>2018-01-31',
          description: 'Files created after 2018-01-31'
        },
        {
          query: 'sizeBytes:>10000',
          description: 'Files bigger than 10kB'
        },
        {
          query: 'tags:table-export',
          description: 'Files tagged "table-export"'
        }
      ]
    };
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Search syntax &amp; Examples</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.examples.map((example, index) => {
            return (
              <Well bsSize="sm" key={index}>
                <Label bsStyle="info">Search</Label>
                <Button bsStyle="link" className="btn-link-inline" onClick={() => this.selectExample(example)}>
                  {example.query}
                </Button>
                <br />
                <Label bsStyle="warning">Shows</Label>
                <span>{example.description}</span>
              </Well>
            );
          })}
          <p>
            <ExternalLink href="http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax">
              Read full syntax guide
            </ExternalLink>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide} bsStyle="link">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },

  selectExample(example) {
    this.props.onSelectExample(example.query);
    this.props.onHide();
  }
});
