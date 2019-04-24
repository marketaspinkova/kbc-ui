import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { ExternalLink } from '@keboola/indigo-ui';
import JSONSchemaEditor from './JSONSchemaEditor';
import { Controlled as CodeMirror } from 'react-codemirror2'
import TemplateSelector from './ConfigurationTemplateSelector';
import SaveButtons from '../../../../react/common/SaveButtons';

export default createReactClass({

  propTypes: {
    isTemplate: PropTypes.bool.isRequired,
    editingTemplate: PropTypes.object.isRequired,
    editingParams: PropTypes.object.isRequired,
    editingString: PropTypes.string.isRequired,
    templates: PropTypes.object.isRequired,
    paramsSchema: PropTypes.object.isRequired,
    isEditingString: PropTypes.bool.isRequired,
    isValid: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isChanged: PropTypes.bool.isRequired,
    onChangeTemplate: PropTypes.func.isRequired,
    onChangeParams: PropTypes.func.isRequired,
    onChangeString: PropTypes.func.isRequired,
    onChangeEditingMode: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    saveLabel: PropTypes.string
  },

  getDefaultProps() {
    return {
      saveLabel: 'Save configuration'
    };
  },

  getInitialState() {
    return {
      showJsonEditor: this.props.isEditingString || !this.props.isTemplate
    };
  },

  renderJSONSchemaEditor() {
    // empty json schema does not render
    if (!this.props.paramsSchema.get('properties') || this.props.paramsSchema.get('properties').count() === 0) {
      return null;
    }
    return (
      <JSONSchemaEditor
        ref="paramsEditor"
        isChanged={this.props.isChanged}
        schema={this.props.paramsSchema}
        value={this.props.editingParams}
        onChange={this.handleParamsChange}
        readOnly={this.props.isSaving}
      />
    );
  },

  render() {
    return (
      <div className="kbc-templated-configuration-edit">
        <div className="edit kbc-configuration-editor">
          <div className="text-right">
            <SaveButtons
              isSaving={this.props.isSaving}
              isChanged={this.props.isChanged}
              onSave={this.handleSave}
              disabled={!this.props.isValid}
              onReset={this.props.onCancel} />
          </div>
          {
            this.state.showJsonEditor ?
              this.renderJsonEditor() :
              this.renderTemplatesEditor()
          }
        </div>
      </div>
    );
  },

  renderJsonEditor() {
    return (
      <span>
        <p className="kbc-template-editor-toggle"><a onClick={this.switchToTemplateEditor}><small>Switch to templates</small></a></p>
        <p>JSON configuration uses <ExternalLink href="https://developers.keboola.com/extend/generic-extractor/">Generic extractor</ExternalLink> format.</p>
        <CodeMirror
          editorDidMount={(editor) => editor.refresh()}
          value={this.props.editingString}
          onBeforeChange={this.handleStringChange}
          options={{
            theme: 'solarized',
            mode: 'application/json',
            lineNumbers: true,
            lineWrapping: true,
            readOnly: this.props.isSaving,
            lint: true,
            gutters: ['CodeMirror-lint-markers'],
            placeholder: '{}'
          }}
        />
      </span>
    );
  },

  renderTemplatesEditor() {
    return (
      <span>
        <p className="kbc-template-editor-toggle"><a onClick={this.switchToJsonEditor}><small>Switch to JSON editor</small></a></p>
        {this.renderJSONSchemaEditor()}
        <h3>Template</h3>
        <TemplateSelector
          templates={this.props.templates}
          value={this.props.editingTemplate}
          onChange={this.handleTemplateChange}
          readOnly={this.props.isSaving}
        />
      </span>
    );
  },

  handleTemplateChange(value) {
    this.props.onChangeTemplate(value);
  },

  handleStringChange(editor, data, value) {
    this.props.onChangeString(value);
  },

  handleParamsChange(value) {
    if (!value.equals(this.props.editingParams.toMap())) {
      this.props.onChangeParams(value);
    }
  },

  switchToJsonEditor() {
    this.setState({showJsonEditor: true});
    this.props.onChangeEditingMode(true);
  },

  switchToTemplateEditor() {
    this.setState({showJsonEditor: false});
    this.props.onChangeEditingMode(false);
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
