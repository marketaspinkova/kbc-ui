import PropTypes from 'prop-types';
import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';

export default React.createClass({
  propTypes: {
    templates: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    updateQueryFn: PropTypes.func.isRequired
  },

  getInitialState() {
    return {text: 'Select from template'};
  },

  render() {
    return (
      <DropdownButton
        pullRight={true}
        onSelect={this.selectTemplate}
        bsStyle="default"
        title={this.state.text}
        id="modules-ex-facebook-react-index-template-selector-dropdown"
      >
        {this.props.templates.map((t) => {
          return (
            <MenuItem key={t.get('id')} eventKey={t.get('id')}>
              {t.get('name')}
            </MenuItem>
          );
        }).toArray()}
      </DropdownButton>
    );
  },

  selectTemplate(id) {
    // const id = e.target.value;
    const optionValue = this.props.templates.findLast((t) => t.get('id') === id);
    const templateQuery = optionValue.get('template');
    const newQuery = this.props.query.mergeDeep(templateQuery);
    this.props.updateQueryFn(newQuery);
    const newText = optionValue.get('name') + ' template';
    this.setState({text: newText});
  }
});
