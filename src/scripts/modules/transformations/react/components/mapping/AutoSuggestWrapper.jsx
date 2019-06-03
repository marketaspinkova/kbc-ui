import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import AutoSuggest from 'react-autosuggest';
import { List } from 'immutable';

function sortSuggestionsByGeneric(item) {
  return item;
}

function mapSuggestionsGeneric(item) {
  return item;
}

function filterSuggestionsGeneric(input, value) {
  return value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}

export default createReactClass({
  propTypes: {
    suggestions: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    filterSuggestionsFn: PropTypes.func,
    sortSuggestionsByFn: PropTypes.func,
    mapSuggestionsFn: PropTypes.func,
    value: PropTypes.string.isRequired,
    id: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string.isRequired,
    inputClassName: PropTypes.string,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      inputClassName: 'form-control',
      disabled: false,
      filterSuggestionsFn: filterSuggestionsGeneric,
      sortSuggestionsByFn: sortSuggestionsByGeneric,
      mapSuggestionsFn: mapSuggestionsGeneric
    };
  },

  getInitialState() {
    return {
      suggestions: List(),
      value: this.props.value
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  },

  fetchSuggestions(options) {
    const input = options.value;
    const suggestions = this.props.suggestions
      .filter((item) => this.props.filterSuggestionsFn(input, item))
      .sortBy(this.props.sortSuggestionsByFn)
      .slice(0, 10)
      .map(this.props.mapSuggestionsFn)
      .toList();

    this.setState({suggestions: suggestions});
  },

  renderSuggestion(suggestion) {
    return (<span>{suggestion}</span>);
  },

  render() {
    return (
      <AutoSuggest
        suggestions={this.state.suggestions.toJS()}
        onSuggestionsClearRequested={() => this.setState({suggestions: List()})}
        onSuggestionsFetchRequested={this.fetchSuggestions}
        renderSuggestion={this.renderSuggestion}
        getSuggestionValue={(val) => val}
        inputProps={{
          onChange: this.handleChange,
          value: this.state.value,
          className: this.props.inputClassName,
          placeholder: this.props.placeholder,
          disabled: this.props.disabled
        }}
      />);
  },

  handleChange(e, options) {
    const value = options.newValue.trim();
    this.setState({ value });
    this.props.onChange(value);
  }
});
