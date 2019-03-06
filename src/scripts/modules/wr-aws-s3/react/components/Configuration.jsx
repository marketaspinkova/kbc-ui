import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Form, FormControl, FormGroup, ControlLabel, Col, HelpBlock} from 'react-bootstrap';
import StorageApiLink from '../../../components/react/components/StorageApiTableLinkEx';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: PropTypes.shape({
      source: PropTypes.string.isRequired,
      destination: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;
    return (
      <Form horizontal>
        <h3>Source</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Table
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              <StorageApiLink
                tableId={this.props.value.source}
              >
                {this.props.value.source}
              </StorageApiLink>
            </FormControl.Static>
          </Col>
        </FormGroup>
        <h3>Destination</h3>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Path
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.destination}
              onChange={function(e) {
                props.onChange({destination: e.target.value.trim()});
              }}
              placeholder="myfolder/file.csv"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Destination path including filename, eg. <code>myfolder/file.csv</code>.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
