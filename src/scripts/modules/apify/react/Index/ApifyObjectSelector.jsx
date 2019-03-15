import PropTypes from 'prop-types';
import React from 'react';
import {RefreshIcon} from '@keboola/indigo-ui';
import {List} from 'immutable';
import {InputGroup, FormControl} from 'react-bootstrap';
import Select from 'react-select';

export default React.createClass({
  propTypes: {
    objectName: PropTypes.string.isRequired,
    objectLabelKey: PropTypes.string.isRequired,
    object: PropTypes.object.isRequired,
    selectedValue: PropTypes.string,
    objectIdKey: PropTypes.string,
    onLoadObjectsList: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      objectIdKey: 'id'
    };
  },

  render() {
    const isLoading = this.props.object.get('loading', false);
    const error = this.props.object.get('error');

    return (
      <div className={error ? 'form-group has-error' : 'form-group'}>
        <div className="col-xs-2 control-label">
          {this.capitalizeFirstLetter(this.props.objectName)}
        </div>
        <div className="col-xs-10">
          {isLoading || error ?
            <FormControl.Static>
              {error}
              {' '}
              {this.renderRefresh()}
            </FormControl.Static>
            : this.renderSelectControl()}
        </div>
      </div>
    );
  },

  renderRefresh() {
    const isLoading = this.props.object.get('loading', false);
    return (
      <span>
        {isLoading ? 'Loading list of ' + this.props.objectName + 's... ' : null}
        <RefreshIcon
          isLoading={isLoading}
          onClick={this.props.onLoadObjectsList}/>
      </span>
    );
  },

  renderSelectControl() {
    const value = this.props.selectedValue;
    return (
      <InputGroup>
        <Select
          placeholder={'Select ' + this.props.objectName}
          name="ids"
          key="ids"
          clearable={false}
          multi={false}
          options={this.getOptions()}
          value={value}
          onChange={({value: selectedId}) =>
            this.props.onSelect(selectedId)}/>
        <InputGroup.Addon>{this.renderRefresh()}</InputGroup.Addon>
      </InputGroup>);
  },

  getOptions() {
    const objectsList = this.props.object.get('data', List()) || List();
    const options = objectsList
      .sortBy((c) => c.get(this.props.objectLabelKey).toLowerCase())
      .map((c) => {
        return {value: c.get(this.props.objectIdKey), label: c.get(this.props.objectLabelKey)};
      }).toArray();
    return options;
  },

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
