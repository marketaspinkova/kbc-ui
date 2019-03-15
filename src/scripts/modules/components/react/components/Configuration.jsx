import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { ExternalLink } from '@keboola/indigo-ui';
import Edit from './ConfigurationEdit';
import Immutable from 'immutable';
import Markdown from '../../../../react/common/Markdown';

export default createReactClass({
  propTypes: {
    data: PropTypes.string.isRequired,
    isChanged: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isValid: PropTypes.bool.isRequired,
    headerText: PropTypes.string,
    saveLabel: PropTypes.string,
    help: PropTypes.node,
    schema: PropTypes.object,
    editHelp: PropTypes.string,
    documentationUrl: PropTypes.string,
    showDocumentationLink: PropTypes.bool
  },

  getDefaultProps() {
    return {
      headerText: 'Configuration',
      help: null,
      saveLabel: 'Save configuration',
      schema: Immutable.Map(),
      showDocumentationLink: true
    };
  },

  render() {
    return (
      <div>
        <h2>{this.props.headerText}</h2>
        {this.props.help}
        {this.renderDocumentationUrl()}
        {this.renderHelp()}
        {this.renderEditor()}
      </div>
    );
  },

  renderHelp() {
    if (!this.props.editHelp) {
      return null;
    }
    return (
      <Markdown
        source={this.props.editHelp}
        size="small"
      />
    );
  },

  renderDocumentationUrl() {
    if (!this.props.documentationUrl) {
      return null;
    }
    if (this.props.editHelp) {
      return null;
    }
    if (this.props.schema.count()) {
      return null;
    }
    if (this.props.showDocumentationLink) {
      return (
        <p className="help-block">This component is configured manually. Read the <ExternalLink href={this.props.documentationUrl}>configuration
          documentation</ExternalLink> for more information.</p>
      );
    }
    return null;
  },

  renderEditor() {
    return (
      <Edit
        data={this.props.data}
        schema={this.props.schema}
        isSaving={this.props.isSaving}
        isChanged={this.props.isChanged}
        onSave={this.props.onEditSubmit}
        onChange={this.props.onEditChange}
        onCancel={this.props.onEditCancel}
        isValid={this.props.isValid}
        saveLabel={this.props.saveLabel}
        help={this.props.editHelp}
      />
    );
  }
});
