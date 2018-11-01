import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Map, fromJS } from 'immutable';
import JSONEditor from '@json-editor/json-editor';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool.isRequired,
    onValidation: PropTypes.func,
    isChanged: PropTypes.bool,
    disableProperties: PropTypes.bool,
    showErrors: PropTypes.oneOf(['interaction', 'change', 'always', 'never']),
    disableCollapse: PropTypes.bool
  },

  getInitialState() {
    return {
      blockOnChangeOnce: true
    };
  },

  getDefaultProps() {
    return {
      readOnly: false,
      schema: Map(),
      disableProperties: false,
      disableCollapse: false,
      showErrors: 'interaction'
    };
  },

  jsoneditor: null,

  componentWillReceiveProps(nextProps) {
    // workaround to update editor internal value after reset of this.props.value
    const resetValue = this.props.isChanged && !nextProps.isChanged;
    const resetReadOnly = this.props.readOnly !== nextProps.readOnly;
    const nextReadOnly = resetReadOnly ? nextProps.readOnly : this.props.readOnly;
    const nextValue = resetValue ? nextProps.value || this.props.value : this.props.value;

    if (!this.props.schema.equals(nextProps.schema) || resetValue || resetReadOnly) {
      this.setState({ blockOnChangeOnce: true });
      this.initJsonEditor(nextValue, nextReadOnly);
    }
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
      disable_collapse: this.props.disableCollapse,
      disable_edit_json: true,
      disable_properties: this.props.disableProperties,
      object_layout: 'normal',
      show_errors: this.props.showErrors,
      prompt_before_delete: false
    };

    options.custom_validators.push((schema, value, path) => {
      let errors = [];
      if (schema.type === 'string' && schema.template) {
        if (schema.template !== value) {
          errors.push({
            path: path,
            property: 'value',
            message: 'Value does not match schema template'
          });
        }
      }
      return errors;
    });

    if (nextReadOnly) {
      options.disable_array_add = true;
      options.disable_array_delete = true;
      options.disable_collapse = true;
      options.disable_properties = true;
    }

    this.jsoneditor = new JSONEditor(this.refs.jsoneditor, options);

    // When the value of the editor changes, update the JSON output and TODO validation message
    this.jsoneditor.on('change', () => {
      // editor calls onChange after its init causing isChanged = true without any user input. This will prevent calling onChange after editors init
      if (this.state.blockOnChangeOnce) {
        this.setState({ blockOnChangeOnce: false });
      } else {
        const json = this.jsoneditor.getValue();
        this.props.onChange(fromJS(json));
      }

      if (this.props.onValidation) {
        this.props.onValidation(this.jsoneditor.validate());
      }
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

  componentDidMount() {
    this.initJsonEditor(this.props.value, this.props.readOnly);
  },

  getCurrentValue() {
    return fromJS(this.jsoneditor.getValue());
  },

  render() {
    return (
      <form autoComplete="off">
        <div ref="jsoneditor" />
      </form>
    );
  }
});
