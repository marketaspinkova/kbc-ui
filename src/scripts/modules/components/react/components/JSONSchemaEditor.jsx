import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { fromJS } from 'immutable';
import JSONEditor from '@json-editor/json-editor';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool.isRequired,
    isChanged: PropTypes.bool
  },

  jsoneditor: null,

  componentWillReceiveProps(nextProps) {
    // workaround to update editor internal value after reset of this.props.value
    const resetValue = this.props.isChanged && !nextProps.isChanged;
    const resetReadOnly = this.props.readOnly !== nextProps.readOnly;
    const nextReadOnly = resetReadOnly ? nextProps.readOnly : this.props.readOnly;
    const nextValue = resetValue ? nextProps.value || this.props.value : this.props.value;

    if (!this.props.schema.equals(nextProps.schema) || resetValue || resetReadOnly) {
      this.initJsonEditor(nextValue, nextReadOnly);
    }
  },

  componentDidMount() {
    this.initJsonEditor(this.props.value, this.props.readOnly);
  },

  initJsonEditor(nextValue, nextReadOnly) {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }

    let options = {
      schema: this.props.schema.toJS(),
      startval: nextValue.toJS(),
      theme: 'bootstrap3',
      iconlib: 'fontawesome4',
      custom_validators: [],
      disable_array_delete_last_row: true,
      disable_array_reorder: true,
      disable_collapse: true,
      disable_edit_json: true,
      disable_properties: true,
      object_layout: 'normal',
      show_errors: 'always',
      prompt_before_delete: false
    };

    if (nextReadOnly) {
      options.disable_array_add = true;
      options.disable_array_delete = true;
    }

    this.jsoneditor = new JSONEditor(this.refs.jsoneditor, options);

    this.jsoneditor.on('change', () => {
      this.props.onChange(fromJS(this.jsoneditor.getValue()));
    });

    for (let key in this.jsoneditor.editors) {
      if (this.jsoneditor.editors.hasOwnProperty(key) && key !== 'root') {
        const el = this.jsoneditor.getEditor(key);

        if (el && el.input) {
          el.input.addEventListener('input', () => {
            el.refreshValue();
            el.onChange(true);
          });
        }
      }
    }

    if (nextReadOnly) {
      this.jsoneditor.disable();
    }
  },

  render() {
    return (
      <form autoComplete="off">
        <div ref="jsoneditor" />
      </form>
    );
  }
});
