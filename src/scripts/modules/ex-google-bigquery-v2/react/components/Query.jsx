import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {Form, FormGroup, ControlLabel, Col, HelpBlock, Checkbox} from 'react-bootstrap';
import CodeEditor from './../../../../react/common/CodeEditor';
import editorMode from "../../../ex-db-generic/templates/editorMode";

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      useLegacySql: PropTypes.bool.isRequired,
      query: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;
    return (
      <Form horizontal>
        <h3>Query</h3>
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <Checkbox
              checked={this.props.value.useLegacySql}
              onChange={function(e) {
                props.onChange({useLegacySql: e.target.checked});
              }}
            >Use Legacy SQL</Checkbox>
            <HelpBlock>
              By default, BigQuery runs queries using legacy SQL. <br /> Uncheck this to run queries using BigQuery&apos;s
              updated SQL dialect with improved standards compliance.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            SQL Query
          </Col>
          <Col sm={8}>
            <CodeEditor
              readOnly={false}
              placeholder="e.g. SELECT `id`, `name` FROM `myTable`"
              value={this.props.value.query}
              mode={editorMode('keboola.ex-google-bigquery-v2')}
              onChange={function(e) {
                props.onChange({query: e.value});
              }}
              style={{width: '100%'}}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
