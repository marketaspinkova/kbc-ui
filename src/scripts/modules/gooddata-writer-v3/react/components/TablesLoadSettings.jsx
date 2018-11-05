import React, {PropTypes} from 'react';
import {Form, FormGroup, Checkbox, HelpBlock} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    disabled: PropTypes.bool,
    onSave: PropTypes.func,
    value: PropTypes.shape({
      loadOnly: PropTypes.bool,
      multiLoad: PropTypes.bool
    })
  },

  getInitialState() {
    return {
      saving: null
    };
  },

  render() {
    const {saving} = this.state;
    return (
      <Form>
        <FormGroup>
          <Checkbox
            disabled={this.props.disabled}
            checked={this.props.value.loadOnly}
            onChange={() => this.onSave('loadOnly')}>
            Load Data Only {saving === 'loadOnly' && <Loader />}
          </Checkbox>
          <HelpBlock>
            Skips model update and load tables data only
          </HelpBlock>

        </FormGroup>
        <FormGroup>
          <Checkbox
            disabled={this.props.disabled}
            checked={this.props.value.multiLoad}
            onChange={() => this.onSave('multiLoad')}>
            Multi Load {saving === 'multiLoad' && <Loader />}
          </Checkbox>
          <HelpBlock>
            if checked, tables will be integrated all at once otherwise one by one. For more info see {' '}
            <a href="https://help.gooddata.com/display/doc/Multiload+of+CSV+Data" target="_blank noopener noreferrer">
              https://help.gooddata.com/display/doc/Multiload+of+CSV+Data
            </a>
          </HelpBlock>

        </FormGroup>
      </Form>
    );
  },

  onSave(property) {
    this.setState({saving: property});
    const newValue = {[property]: !this.props.value[property]};
    this.props.onSave(newValue).then(() => this.setState({saving: null}));
  }
});
