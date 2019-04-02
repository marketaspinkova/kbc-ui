import React from 'react';
import PropTypes from 'prop-types';
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
    isChanged: PropTypes.bool
  },

  getInitialState() {
    return {
      blockOnChangeOnce: true
    };
  },

  getDefaultProps() {
    return {
      readOnly: false,
      schema: Map()
    };
  },

  editorRef: null,
  jsoneditor: null,

  componentDidMount() {
    this.initJsonEditor(this.props.value, this.props.readOnly);
    this.patchEditorInputs();
  },

  componentWillReceiveProps(nextProps) {
    this.patchEditorInputs();

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

  render() {
    return (
      <form autoComplete="off">
        <div ref={(editor) => (this.editorRef = editor)} />
      </form>
    );
  },

  initJsonEditor(nextValue, nextReadOnly) {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }

    const options = {
      schema: this.prepareSchema(),
      startval: nextValue.toJS(),
      theme: 'bootstrap3',
      iconlib: 'fontawesome4',
      disable_array_delete_last_row: true,
      disable_array_reorder: true,
      disable_collapse: true,
      disable_edit_json: true,
      disable_properties: true,
      object_layout: 'normal',
      show_errors: 'always',
      prompt_before_delete: false
    };

    this.jsoneditor = new JSONEditor(this.editorRef, options);

    // When the value of the editor changes, update the JSON output and validation message
    this.jsoneditor.on('change', () => {
      // editor calls onChange after its init causing isChanged = true without any user input. This will prevent calling onChange after editors init
      if (this.state.blockOnChangeOnce) {
        this.setState({ blockOnChangeOnce: false });
        return;
      }

      const json = this.jsoneditor.getValue();
      this.props.onChange(fromJS(json));

      if (this.props.onValidation) {
        this.props.onValidation(this.jsoneditor.validate());
      }
    });

    if (nextReadOnly) {
      this.jsoneditor.disable();
    }
  },

  prepareSchema() {
    return this.props.schema.toJS();
  },

  patchEditorInputs() {
    for (let key in this.jsoneditor.editors) {
      if (this.jsoneditor.editors.hasOwnProperty(key) && key !== 'root') {
        const el = this.jsoneditor.getEditor(key);

        if (el && el.input) {
          el.input.addEventListener('input', () => {
            el.refreshValue();
            el.onChange(true);
          }, { once: true });
        }
      }
    }
  }
});
