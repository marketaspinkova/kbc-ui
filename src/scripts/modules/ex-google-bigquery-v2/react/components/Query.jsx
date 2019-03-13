import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import {Form, FormGroup, ControlLabel, Col, HelpBlock, Checkbox} from 'react-bootstrap';
import CodeMirror from 'react-code-mirror';

import editorMode from "../../../ex-db-generic/templates/editorMode";

import {ExGoogleBigQueryV2ComponentId} from "../../helpers/constants";

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      query: PropTypes.string.isRequired,
      useLegacySql: PropTypes.bool.isRequired
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
              checked={props.value.useLegacySql}
              disabled={props.disabled}
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
            <CodeMirror
              theme="solarized"
              mode={editorMode(ExGoogleBigQueryV2ComponentId)}
              value={props.value.query}
              onChange={(e) => props.onChange({query: e.target.value})}
              lineNumbers
              lineWrapping={false}
              placeholder="e.g. SELECT `id`, `name` FROM `myTable`"
              style={{ width: '100%' }}
              readOnly={props.disabled}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
