import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { fromJS, List } from 'immutable';
import { Alert, Button, Col, Modal, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';

const ANALYTICS_BASE_URL = 'https://ga-dev-tools.appspot.com/query-explorer/?';

export default createReactClass({
  propTypes: {
    onCancel: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      errors: []
    };
  },

  render() {
    const parsedQuery = this.props.localState.get('parsed');

    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Form onSubmit={this.setAndClose} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>
              Parse Url and Set Query
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Create a query via{' '}
              <ExternalLink href="https://ga-dev-tools.appspot.com/query-explorer/">
                Google Analytics Query Explorer
              </ExternalLink>{' '}
              and paste the result url to reconstruct the query.
            </p>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Url
              </Col>
              <Col sm={9}>
                <FormControl type="text" value={this.props.localState.get('url', '')} onChange={this.onUrlChange} />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Parsed Query
              </Col>
              <Col sm={9} className={classnames({ 'pre-scrollable': parsedQuery })}>
                {parsedQuery ? this.renderParsedQuery() : <FormControl.Static>N/A</FormControl.Static>}
              </Col>
            </FormGroup>
            {this.renderErrors()}
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="link" onClick={this.props.onCancel}>
              Cancel
            </Button>
            <Button type="submit" bsStyle="primary" disabled={this.isDisabled()}>
              Set
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  parseArray(name, item) {
    return (
      <li>
        <strong>{name}:</strong> {item ? item.join(', ') : 'n/a'}
      </li>
    );
  },

  renderParsedQuery() {
    const parsedQuery = this.props.localState.get('parsed');
    const dates = parsedQuery.get('dateRanges').first();
    return (
      <div>
        <ul>
          {this.parseArray('Metrics', parsedQuery.get('metrics'))}
          {this.parseArray('Dimensions', parsedQuery.get('dimensions'))}
          {this.parseArray('Segments', parsedQuery.get('segments'))}
          <li>
            <strong>Filter:</strong> {parsedQuery.get('filtersExpression') || 'n/a'}
          </li>
          <li>
            <strong>Date Ranges:</strong>
            <ul>
              <li>Start Date: {dates.get('startDate') || 'n/a'}</li>
              <li>End Date: {dates.get('endDate') || 'n/a'}</li>
            </ul>
          </li>
        </ul>
      </div>
    );
  },

  renderErrors() {
    if (!this.state.errors.length) {
      return null;
    }

    return (
      <Alert bsStyle="danger">
        {this.state.errors.map((error, index) => (
          <p key={index}>{error}</p>
        ))}
      </Alert>
    );
  },

  onUrlChange(e) {
    const newUrl = e.target.value;
    this.props.updateLocalState('url', newUrl);
    this.props.updateLocalState('parsed', this.parseUrl(newUrl.trim()));
  },

  parseUrl(url) {
    if (url.indexOf(ANALYTICS_BASE_URL) !== 0) {
      this.setState({
        errors: url ? ['The URL is not a valid direct link to a report from Google Analytics Query Explorer.'] : []
      });
      return null;
    }

    const params = url
      .trim()
      .substr(ANALYTICS_BASE_URL.length)
      .split('&');
    const paramsMap = params.reduce((total, value) => {
      if (!value || value.indexOf('=') === -1) {
        return total;
      }
      const pair = value.split('=');
      total[pair[0]] = decodeURIComponent(pair[1]);
      return total;
    }, {});

    return this.prepareQuery(paramsMap);
  },

  prepareQuery(parsedParams) {
    const errors = [];
    const metrics = this.safeSplit(parsedParams.metrics);
    const dimensions = this.safeSplit(parsedParams.dimensions);

    if (!metrics || !metrics.length) {
      errors.push('Missing required attribute "metrics".');
    }

    if (!dimensions || !dimensions.length) {
      errors.push('Missing required attribute "dimensions".');
    }

    this.setState({
      errors
    });

    return fromJS({
      metrics,
      dimensions,
      segments: parsedParams.segment ? [parsedParams.segment] : [],
      filtersExpression: parsedParams.filters,
      dateRanges: [
        {
          startDate: parsedParams['start-date'],
          endDate: parsedParams['end-date']
        }
      ]
    });
  },

  safeSplit(value) {
    if (!value) return null;
    return value.split(',');
  },

  setAndClose(e) {
    e.preventDefault();
    let q = this.props.localState.get('parsed');
    q = q.set('metrics', q.get('metrics').map(m => fromJS({ expression: m })));
    q = q.set('dimensions', q.get('dimensions').map(m => fromJS({ name: m })));
    q = q.set('segments', q.get('segments').map(m => fromJS({ segmentId: m })));
    this.props.onSave(q);
    this.props.onCancel();
  },

  isDisabled() {
    const parsedQuery = this.props.localState.get('parsed');

    if (!parsedQuery) {
      return true;
    }

    const metrics = parsedQuery.get('metrics') || List();
    const dimensions = parsedQuery.get('dimensions') || List();

    return !metrics.count() || !dimensions.count();
  }
});
