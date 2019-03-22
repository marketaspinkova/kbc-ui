import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import { Controlled as CodeMirror } from 'react-codemirror2'
import JSONSchemaEditor from './JSONSchemaEditor';
import SaveButtons from '../../../../react/common/SaveButtons';

export default createReactClass({
  propTypes: {
    data: PropTypes.string.isRequired,
    schema: PropTypes.object,
    isSaving: PropTypes.bool.isRequired,
    isValid: PropTypes.bool.isRequired,
    isChanged: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    saveLabel: PropTypes.string
  },

  getDefaultProps() {
    return {
      saveLabel: 'Save configuration',
      schema: Immutable.Map()
    };
  },

  render() {
    return (
      <div className="edit kbc-configuration-editor">
        <div className="text-right">
          <SaveButtons
            isSaving={this.props.isSaving}
            isChanged={this.props.isChanged}
            onSave={this.handleSave}
            disabled={!this.props.isValid}
            onReset={this.props.onCancel} />
        </div>
        {this.renderJSONSchemaEditor()}
        {this.renderCodeMirror()}
      </div>
    );
  },

  renderJSONSchemaEditor() {
    if (this.props.schema.isEmpty()) {
      return null;
    }
    return (
      <JSONSchemaEditor
        ref="paramsEditor"
        schema={this.props.schema}
        value={Immutable.fromJS(JSON.parse(this.props.data))}
        onChange={this.handleParamsChange}
        readOnly={this.props.isSaving}
        isChanged={this.props.isChanged}
        disableCollapse={true}
        disableProperties={true}
      />
    );
  },

  renderCodeMirror() {
    if (!this.props.schema.isEmpty()) {
      return null;
    }
    return (
      <span>
        <p className="help-block small">Properties prefixed with <code>#</code> sign will be encrypted on save. Already encrypted strings will persist.</p>
        <CodeMirror
          value={this.props.data}
          onBeforeChange={this.handleChange}
          options={{
            theme: 'solarized',
            mode: 'application/json',
            lineNumbers: true,
            autofocus: true,
            lineWrapping: true,
            readOnly: this.props.isSaving,
            lint: true,
            gutters: ['CodeMirror-lint-markers']
          }}
        />
      </span>
    );
  },

  handleChange(editor, data, value) {
    this.props.onChange(value);
  },

  handleParamsChange(value) {
    if (!value.equals(Immutable.fromJS(JSON.parse(this.props.data)))) {
      this.props.onChange(JSON.stringify(value));
    }
  },

  handleSave() {
    if (this.refs.paramsEditor) {
      // json-editor doesn't trigger onChange handler on each key stroke
      // so sometimes not actualized data were saved https://github.com/keboola/kbc-ui/issues/501
      this.handleParamsChange(this.refs.paramsEditor.getCurrentValue());
    }
    this.props.onSave();
  }
});
