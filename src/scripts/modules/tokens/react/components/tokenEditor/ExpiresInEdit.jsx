import React, {PropTypes} from 'react';
import Select from 'react-select';

const NEVER_EXPIRES = -2;
const CUSTOM_VALUE = -1;
const DEFAULT_CUSTOM_VALUE = 0;
export default React.createClass({

  propTypes: {
    value: PropTypes.number,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  },

  selectOptions: [
    {label: 'Never',    value: NEVER_EXPIRES},
    {label: '1 hour',   value: 1 * 3600},
    {label: '2 hours',  value: 2 * 3600},
    {label: '12 hours', value: 12 * 3600},
    {label: '24 hours', value: 24 * 3600},
    {label: '48 hours', value: 48 * 3600},
    {label: 'Custom',   value: CUSTOM_VALUE}
  ],

  getInitialState() {
    return this.getStateFromProps(this.props);
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps));
  },

  getStateFromProps(props) {
    const hasSelectValue = props.value === null || this.selectOptions.reduce((memo, option) => memo || option.value === props.value, false);
    const initSelectValue = props.value === null ? NEVER_EXPIRES : props.value;
    const selectValue = this.state ? this.state.selectValue : initSelectValue;

    return {
      selectValue: hasSelectValue ? selectValue : CUSTOM_VALUE
    };
  },

  render() {
    return (
      <div>
        <Select
          className="col-sm-4"
          disabled={this.props.disabled}
          clearable={false}
          searchable={false}
          options={this.selectOptions}
          value={this.state.selectValue}
          onChange={this.handleSelectChange}
        />
        {this.state.selectValue === CUSTOM_VALUE &&
         <span className="col-sm-3">
           <div className="input-group">
             <input
               disabled={this.props.disabled}
               type="number"
               min="1"
               value={this.props.value / 3600}
               onChange={(e) => this.props.onChange(e.target.value * 3600)}
               className="form-control"
             />
             <span className="input-group-addon">
               hours
             </span>
           </div>
         </span>
        }
      </div>
    );
  },

  handleSelectChange({value}) {
    this.setState({selectValue: value}, () => {
      if (value !== CUSTOM_VALUE) {
        this.props.onChange(value === NEVER_EXPIRES ? null : value );
      } else if (!this.props.value) {
        this.props.onChange(DEFAULT_CUSTOM_VALUE);
      }
    });
  }
});
