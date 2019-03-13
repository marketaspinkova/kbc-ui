import React from 'react';
import CodeMirror from 'react-code-mirror';
import { FormGroup, FormControl, Col, ControlLabel, HelpBlock, Checkbox } from 'react-bootstrap';

import LinkToDocs from './LinkToDocs';

export default React.createClass({
  propTypes: {
    query: React.PropTypes.object.isRequired,
    exports: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    outTableExist: React.PropTypes.bool,
    configId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired,
    component: React.PropTypes.object.isRequired
  },
  handleNameChange(event) {
    return this.props.onChange(this.props.query.set('name', event.target.value));
  },
  handleIncrementalChange(event) {
    return this.props.onChange(this.props.query.set('incremental', event.target.checked));
  },
  handleQueryChange(event) {
    return this.props.onChange(this.props.query.set('query', event.target.value));
  },
  handleSortChange(event) {
    return this.props.onChange(this.props.query.set('sort', event.target.value));
  },
  handleLimitChange(event) {
    return this.props.onChange(this.props.query.set('limit', event.target.value));
  },
  handleMappingChange(event) {
    return this.props.onChange(this.props.query.set('mapping', event.target.value));
  },
  handleCollectionChange(event) {
    return this.props.onChange(this.props.query.set('collection', event.target.value));
  },
  handleModeChange(event) {
    return this.props.onChange(this.props.query.set('mode', event.target.value));
  },
  render() {
    return (
      <div>
        <LinkToDocs documentationUrl={this.props.component.get('documentationUrl')} />
        <div className="form-horizontal">
          <FormGroup controlId="QueryEditor-name">
            <Col componentClass={ControlLabel} md={3}>Name</Col>
            <Col md={9}>
              <FormControl
                autoFocus
                onChange={this.handleNameChange}
                placeholder="e.g. last-100-articles"
                type="text"
                value={this.props.query.get('name')}
              />
              <HelpBlock>
                {this.props.outTableExist && <span className="text-danger">Export with this name already exists.{' '}</span>}
                Names have to be unique across all exports in the current configuration
              </HelpBlock>
            </Col>
          </FormGroup>

          <FormGroup controlId="QueryEditor-collection">
            <Col componentClass={ControlLabel} md={3}>Collection</Col>
            <Col md={9}>
              <FormControl
                onChange={this.handleCollectionChange}
                placeholder="e.g. Article"
                type="text"
                value={this.props.query.get('collection')}
              />
            </Col>
          </FormGroup>

          <FormGroup controlId="QueryEditor-query">
            <Col componentClass={ControlLabel} md={3}>Query</Col>
            <Col md={9}>
              <CodeMirror
                lineNumbers
                lineWrapping
                lint
                mode="application/json"
                onChange={this.handleQueryChange}
                placeholder={'optional, e.g. {"isActive": 1, "isDeleted": 0}'}
                theme="solarized"
                value={this.props.query.has('query') ? this.props.query.get('query') : ''}
              />
              <HelpBlock>Query to filter documents. Has to be valid JSON.</HelpBlock>
            </Col>
          </FormGroup>

          <FormGroup controlId="QueryEditor-sort">
            <Col componentClass={ControlLabel} md={3}>Sort</Col>
            <Col md={9}>
              <CodeMirror
                lineNumbers
                lineWrapping
                lint
                mode="application/json"
                onChange={this.handleSortChange}
                placeholder={'optional, e.g. {"creationDate": -1}'}
                theme="solarized"
                value={this.props.query.has('sort') ? this.props.query.get('sort').toString() : ''}
              />
              <HelpBlock>Sort results by specified keys. Has to be valid JSON.</HelpBlock>
            </Col>
          </FormGroup>

          <FormGroup controlId="QueryEditor-collection">
            <Col componentClass={ControlLabel} md={3}>Limit</Col>
            <Col md={9}>
              <FormControl
                onChange={this.handleLimitChange}
                placeholder="optional, e.g. 100"
                value={this.props.query.get('limit')}
                type="text"
              />
            </Col>
          </FormGroup>

          <FormGroup controlId="QueryEditor-incremental">
            <Col mdOffset={3} md={9}>
              <Checkbox checked={this.props.query.get('incremental')} onChange={this.handleIncrementalChange}>
                Incremental
              </Checkbox>
            </Col>
          </FormGroup>

          <FormGroup controlId="QueryEditor-mode">
            <Col componentClass={ControlLabel} md={3}>Mode</Col>
            <Col md={9}>
              <FormControl
                componentClass="select"
                onChange={this.handleModeChange}
                value={this.props.query.get('mode') ? this.props.query.get('mode') : 'mapping'}
              >
                <option value="mapping">Mapping</option>
                <option value="raw">Raw</option>
              </FormControl>
              <HelpBlock>Mapping mode allows you to define a more precise structure. In raw mode, only JSON objects are exported.</HelpBlock>
            </Col>
          </FormGroup>

          {this.renderMapping()}
        </div>
      </div>
    );
  },

  renderMapping() {
    const { query } = this.props;

    if (!query.has('mode') || query.get('mode') === 'mapping') {
      const mappingValueType = typeof query.get('mapping');
      let mappingValue;
      if (mappingValueType === 'undefined') {
        mappingValue = '';
      } else if (mappingValueType === 'object') {
        mappingValue = JSON.stringify(query.get('mapping'), null, 2);
      } else {
        mappingValue = query.get('mapping').toString();
      }
      return (
        <FormGroup controlId="QueryEditor-mapping">
          <Col componentClass={ControlLabel} md={3}>Mapping</Col>
          <Col md={9}>
            <CodeMirror
              lineNumbers
              lineWrapping
              lint
              mode="application/json"
              onChange={this.handleMappingChange}
              placeholder={'e.g. {"_id.$oid": "id", "name": "name"}'}
              theme="solarized"
              value={mappingValue}
            />
            <HelpBlock>Mapping to define the structure of exported tables. Has to be valid JSON.</HelpBlock>
          </Col>
        </FormGroup>
      );
    }

    return null;
  }
});
