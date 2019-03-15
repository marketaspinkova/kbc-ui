import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {RadioGroup} from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';

export default createReactClass({
  propTypes: {
    onChangeAction: PropTypes.func.isRequired,
    valueAction: PropTypes.string.isRequired
  },

  render() {
    return (
      <div className="form-horizontal">
        {this.renderActionRadio()}
      </div>
    );
  },

  renderActionRadio() {
    return (
      <div className="form-group">
        <label className="col-md-2 control-label">
          On each run:
        </label>
        <div className="col-md-10">
          <RadioGroup
            name="Action"
            selectedValue={this.props.valueAction}
            onChange={this.props.onChangeAction}
          >
            <div className="form-horizontal">
              <RadioGroupInput
                label="Update file"
                help="Always rewrite the same file"
                wrapperClassName="col-sm-8"
                value="update"
              />
              <RadioGroupInput
                label="Create new file"
                help="Every time create a unique file"
                wrapperClassName="col-sm-8"
                value="create"
              />
            </div>
          </RadioGroup>
        </div>
      </div>
    );
  }
});
