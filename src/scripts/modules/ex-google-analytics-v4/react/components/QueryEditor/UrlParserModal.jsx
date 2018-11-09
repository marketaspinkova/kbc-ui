import React, {PropTypes} from 'react';
import {fromJS} from 'immutable';
import {Button, Modal} from 'react-bootstrap';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    onCancel: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    localState: PropTypes.object.isRequired,
    updateLocalState: PropTypes.func.isRequired
  },

  render() {
    const parsedQuery = this.props.localState.get('parsed');
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>
            Parse Url and Set Query
            <div>
              <small>
                Create a query via <ExternalLink href="https://ga-dev-tools.appspot.com/query-explorer/">Google Analytics Query Explorer</ExternalLink> and paste the result url to reconstruct the query.
              </small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <div className="form-group form-group">
              <label className="col-sm-1 control-label">
                Url
              </label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className="form-control"
                  value={this.props.localState.get('url', '')}
                  onChange={this.onUrlChange}
                />
              </div>
            </div>
            <div className="form-group form-group">
              <label className="col-sm-3 control-label">
                Parsed Query
              </label>
              <div className="col-sm-9  pre-scrollable">
                {parsedQuery ?
                  this.renderParsedQuery()
                  : <p className="form-control-static">n/a</p>
                }
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle="link"
            onClick={this.props.onCancel}>
            Cancel
          </Button>
          <Button
            bsStyle="primary"
            disabled={!parsedQuery}
            onClick={this.setAndClose}>
           Set
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },

  parseArray(name, item) {
    return (
      <li>
        <strong>{name}:</strong>  {item ? item.join(', ') : 'n/a'}
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
          <li><strong>Filter:</strong>  {parsedQuery.get('filtersExpression') || 'n/a'}</li>
          <li><strong>Date Ranges:</strong>
            <ul>
              <li>Start Date: {dates.get('startDate') || 'n/a'}</li>
              <li>End Date: {dates.get('endDate') || 'n/a'}</li>
            </ul>
          </li>
        </ul>
      </div>
    );
  },

  onUrlChange(e) {
    const newUrl = e.target.value;
    this.props.updateLocalState('url', newUrl);
    this.props.updateLocalState('parsed', this.parseUrl(newUrl.trim()));
  },

  parseUrl(url) {
    const prefix = 'https://ga-dev-tools.appspot.com/query-explorer/?';
    if (url.indexOf(prefix) !==  0) return null;
    const params = url.trim().substr(prefix.length).split('&');
    const paramsMap = params.reduce((total, value) => {
      if (!value) return total;
      const pair = value.split('=');
      total[pair[0]] = decodeURIComponent(pair[1]);
      return total;
    }, {});
    // console.log(paramsMap);
    const query = this.prepareQuery(paramsMap);
    return query;
  },

  prepareQuery(parsedParams) {
    const query = fromJS({
      metrics: this.safeSplit(parsedParams.metrics),
      dimensions: this.safeSplit(parsedParams.dimensions),
      segments: parsedParams.segment ? [parsedParams.segment] : [],
      filtersExpression: parsedParams.filters,
      dateRanges: [{
        startDate: parsedParams['start-date'],
        endDate: parsedParams['end-date']
      }]
    });
    return query;
  },

  safeSplit(value) {
    if (!value) return null;
    return value.split(',');
  },

  setAndClose() {
    let q = this.props.localState.get('parsed');
    q = q.set('metrics', q.get('metrics').map((m) => fromJS({expression: m})));
    q = q.set('dimensions', q.get('dimensions').map((m) => fromJS({name: m})));
    q = q.set('segments', q.get('segments').map((m) => fromJS({segmentId: m})));
    this.props.onSave(q);
    this.props.onCancel();
  }

});

/*
   https://ga-dev-tools.appspot.com/query-explorer/?start-date=2016-08-05&end-date=yesterday&metrics=ga%3Agoal17Starts&dimensions=ga%3AuserType%2Cga%3AsessionCount%2Cga%3Abrowser&filters=ga%3Abrowser%3D~%5EFirefox&segment=gaid%3A%3A-1&samplingLevel=faster&max-results=10
 */


/* https://ga-dev-tools.appspot.com/query-explorer/?start-date=2016-08-05&end-date=yesterday&metrics=ga%3Ausers&dimensions=ga%3AuserType%2Cga%3AsessionCount%2Cga%3Abrowser&filters=ga%3Abrowser%3D~%5EFirefox&samplingLevel=faster&max-results=10*/
