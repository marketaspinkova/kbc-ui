import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {OverlayTrigger, Popover, Button} from 'react-bootstrap';
import { Icon, ExternalLink, SearchBar } from '@keboola/indigo-ui';
import ApplicationStore from '../../../../../stores/ApplicationStore';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    onSearch: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      query: this.props.query,
      currentUserEmail: ApplicationStore.getCurrentAdmin().get('email')
    };
  },

  render() {
    const predefinedSearches = [
      {
        name: 'My jobs',
        query: 'token.description:' + this.state.currentUserEmail
      },
      {
        name: 'My failed jobs',
        query: 'status:error AND token.description:' +  this.state.currentUserEmail
      },
      {
        name: 'My failed jobs in last 7 days',
        query: 'status:error AND startTime:>now-7d AND token.description:' +  this.state.currentUserEmail
      },
      {
        name: 'All long running jobs',
        query: 'durationSeconds:>7200'
      }
    ];
    return (
      <div className="row-searchbar">
        <SearchBar
          query={this.state.query}
          onChange={(query) => {
            this.setState({
              query: query
            });
          }}
          onSubmit={() => {
            this.props.onSearch(this.state.query);
          }}
          inputRef={(input) => {
            this.searchInput = input;
          }}
          placeholder="Search by name or attributes"
          additionalActions={this.renderAdditionalActions()}
        />
        <div className="predefined-search-list">
          Predefined searches:{' '}
          {predefinedSearches.map((link, index) => (
            <button
              key={index}
              type="button"
              className="btn btn-link btn-link-inline predefined-search-link"
              onClick={() => {
                this.setState({
                  query: link.query
                });
                this.props.onSearch(link.query);
                this.searchInput.focus();
              }}
            >
              {link.name}
            </button>
          ))}
        </div>
      </div>
    );
  },

  renderAdditionalActions() {
    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        overlay={this.renderQuickHelp()}
      >
        <Button bsStyle="link" title="Show Quick help">
          <Icon.Help className={'icon-size-20'}/>
        </Button>
      </OverlayTrigger>
    );
  },

  renderQuickHelp() {
    return (
      <Popover
        title="Quick help"
        id="job-search-popover"
        className="popover-wide"
        placement="bottom"
      >
        <h3>Search attributes</h3>
        <dl>
          <dt>
            Job status
          </dt>
          <dd>
            <code>status:success</code>
          </dd>
          <dt>
            User who created the job
          </dt>
          <dd>
            <code>token.description:john.doe@company.com</code>
          </dd>
          <dt>
            Component name
          </dt>
          <dd>
            <code>params.component:keboola.ex-http</code>
          </dd>
          <dt>
            Config ID
          </dt>
          <dd>
            <code>params.config:351711187</code>
          </dd>
          <dt>
            Duration
          </dt>
          <dd>
            <code>durationSeconds:&gt;120</code>
          </dd>
          <dt>
            Time started
          </dt>
          <dd>
            <code>startTime:[2018-06-21 TO 2018-07-01]</code>
          </dd>
          <dt>
            Time finished
          </dt>
          <dd>
            <code>endTime:[2018-06-21 TO 2018-07-01]</code>
          </dd>
          <h3>Modifiers and combining queries</h3>

          <dt>
            Exclude some results
          </dt>
          <dd>
            <code>-status:success</code><br /> Note the minus sign before the query
          </dd>

          <dt>
            Combine queries
          </dt>
          <dd>
            <code>+params.component:keboola.ex-http +status:error</code>
          </dd>
          <dt>
            Combine queries with more possible values
          </dt>
          <dd>
            <code>+params.component:(keboola.ex-http OR keboola.wr-google-sheets)</code><br />
            Jobs from either HTTP or Google Sheets extractor
          </dd>
          <dt>
            Complex query
          </dt>
          <dd>
            <code>+params.component:(keboola.ex-http OR keboola.wr-google-sheets) AND -status:success</code>
          </dd>
          <dt>
            Open ended time query
          </dt>
          <dd>
            <code>endTime:[2018-06-21 TO *]</code>
          </dd>
        </dl>
        <p>
          You can <ExternalLink href="https://help.keboola.com/management/jobs/#searching-the-jobs-log">find more complex examples in documentation</ExternalLink>
        </p>
      </Popover>
    );
  }

});
