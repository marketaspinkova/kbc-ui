import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import {FormGroup, FormControl} from 'react-bootstrap';
import Markdown from '../../../../react/common/Markdown';
import templateFinder from '../../../components/utils/templateFinder';
import deepEqual from 'deep-equal';

export default createReactClass({

  propTypes: {
    value: PropTypes.object.isRequired,
    templates: PropTypes.object.isRequired,
    readOnly: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  },

  render() {
    return this.jobsSelector();
  },

  jobsSelector() {
    return (
      <div>
        <FormGroup>
          <FormControl
            componentClass="select"
            type="select"
            inputRef={
              (ref) => {
                this.selectedTemplate = ref;
              }
            }
            onChange={this.handleSelectorChange}
            disabled={this.props.readOnly}
            value={this.getSelectedValue()}
          >
            <option
              value={''}
              disabled
            >Select template...</option>
            {this.templatesSelectorOptions()}
          </FormControl>
        </FormGroup>
        {this.templateDescription()}
      </div>
    );
  },

  templateDescription() {
    if (this.props.value) {
      return (
        <Markdown
          source={this.props.value.get('description', '')}
        />
      );
    }
    return null;
  },

  getTemplate(value) {
    return templateFinder(this.props.templates, value.get('data')).first();
  },

  templatesSelectorOptions() {
    return this.props.templates.map(
      function(option) {
        return (
          <option
            value={JSON.stringify(option.toJS())}
            key={option.hashCode()}
          >
            {option.get('name')}
          </option>
        );
      }
      , this);
  },

  getSelectedValue() {
    const value = this.props.templates.find((option) => {
      return deepEqual(option.toJS(), this.props.value.toJS());
    });
    return typeof value !== 'undefined'
      ? JSON.stringify(value.toJS())
      : '';
  },

  handleSelectorChange() {
    const selectedTemplate = Immutable.fromJS(JSON.parse(this.selectedTemplate.value));
    if (selectedTemplate) {
      this.props.onChange(selectedTemplate);
    } else {
      this.props.onChange(Immutable.Map());
    }
  }

});
