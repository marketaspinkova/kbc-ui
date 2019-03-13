import PropTypes from 'prop-types';
import React from 'react';
// import {Map} from 'immutable';
import { DropdownButton, MenuItem } from 'react-bootstrap';

const TEMPLATES = [
  {
    'name': 'today',
    'until': 'today',
    'since': 'now'
  },
  {
    'name': 'Yesterday',
    'until': 'yesterday',
    'since': 'today'
  },
  {
    'name': 'Last 7 days',
    'until': 'today',
    'since': '7 days ago'
  },
  {
    'name': 'Last 30 days',
    'until': 'today',
    'since': '30 days ago'
  },
  {
    'name': 'This Month',
    'until': 'midnight first day of this month',
    'since': 'midnight last day of this month'
  },
  {
    'name': 'Last Month',
    'until': 'midnight first day of last month',
    'since': 'midnight last day of last month'
  },
  {
    'name': 'This Week',
    'until': 'monday this week',
    'since': 'today'
  },
  {
    'name': 'Last Week',
    'until': 'monday last week',
    'since': 'sunday last week'

  }

];

export default React.createClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    updateQueryFn: PropTypes.func.isRequired
  },

  getInitialState() {
    return {text: 'Sample Date Ranges'};
  },

  render() {
    return (
      <DropdownButton
        pullRight={true}
        onSelect={this.selectTemplate}
        bsStyle="default"
        title={this.state.text}
        id="modules-ex-facebook-react-index-date-range-selector-dropdown"
      >
        {TEMPLATES.map((t) => {
          return (
            <MenuItem key={t.name} eventKey={t.name}>
              {t.name}
            </MenuItem>
          );
        })}
      </DropdownButton>
    );
  },

  selectTemplate(id) {
    // const id = e.target.value;
    const template = TEMPLATES.find((t) => t.name === id);
    const newQuery = this.props.query
      .setIn(['query', 'since'], template.since)
      .setIn(['query', 'until'], template.until);
    this.props.updateQueryFn(newQuery);
    const newText = template.name + ' date range';
    this.setState({text: newText});
  }
});
