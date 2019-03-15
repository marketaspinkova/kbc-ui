/*
   TableSelector
 */
import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import AutoSuggestWrapper from '../../modules/transformations/react/components/mapping/AutoSuggestWrapper';


export default createReactClass({

  propTypes: {
    onChange: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired,
    bucket: PropTypes.string,
    help: PropTypes.string,
    disabled: PropTypes.bool.isRequired
  },


  onChange(value) {
    if (this.props.bucket) {
      this.props.onChange(this.props.bucket + '.' + value);
    } else {
      this.props.onChange(value);
    }
  },

  renderBucket() {
    if (this.props.bucket) {
      return (
        <div className="input-group-addon">
          <small>{this.props.bucket}</small>.
        </div>
      );
    }
  },

  getValue() {
    if (!this.props.bucket) {
      return this.props.value;
    }
    return this.props.value.substring(this.props.bucket.length + 1);
  },

  renderHelp() {
    if (this.props.help) {
      return (<span className="help-block">{this.props.help}</span>);
    }
    return null;
  },

  filterSuggestions(input, value) {
    const {props} = this;
    var searchName = value.get('name').toLowerCase();
    var searchId = value.get('id').toLowerCase();
    if (props.bucket) {
      if (value.get('id').indexOf(props.bucket + '.') !== 0) {
        return false;
      }
      searchName = searchName.substring(props.bucket.length + 1);
      searchId = searchId.substring(props.bucket.length + 1);
    }
    if (searchId.indexOf(input.toLowerCase()) >= 0) {
      return true;
    }
    if (searchName.indexOf(input.toLowerCase()) >= 0) {
      return true;
    }
    return false;
  },

  mapSuggestions(item) {
    const {props} = this;
    if (props.bucket) {
      return item.get('id').substring(props.bucket.length + 1);
    } else {
      return item.get('id');
    }
  },

  render() {
    return (
      <div>
        <div className={this.props.bucket ? 'input-group' : null}>
          {this.renderBucket()}
          <AutoSuggestWrapper
            suggestions={this.props.options}
            mapSuggestionsFn={this.mapSuggestions}
            filterSuggestionsFn={this.filterSuggestions}
            sortSuggestionsByFn={item => item.get('id').toLowerCase()}
            value={this.getValue()}
            onChange={this.onChange}
            placeholder="Table name"
            id="tableSelector"
            name="tableSelector"
            disabled={this.props.disabled}
          />
        </div>
        {this.renderHelp()}
      </div>
    );
  }
});
