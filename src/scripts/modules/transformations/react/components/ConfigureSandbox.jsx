import React from 'react';
import Select from 'react-select';
import _ from 'underscore';

export default React.createClass({
  propTypes: {
    backend: React.PropTypes.string.isRequired,
    tables: React.PropTypes.object.isRequired,
    buckets: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func
  },

  getInitialState() {
    return {
      preserve: false,
      backend: this.props.backend,
      include: [],
      exclude: [],
      rows: 0
    };
  },

  componentWillUnmount() {
    if (this.props.onHide) {
      this.props.onHide();
    }
  },

  render() {
    return (
      <form className="form-horizontal">
        <div className="form-group">
          <label className="col-sm-3 control-label">Backend</label>
          <div className="col-sm-9">
            <p className="form-control-static">{this.state.backend}</p>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-3 control-label">Data</label>
          <div className="col-sm-9">
            <Select
              name="include"
              value={this.state.include}
              multi={true}
              options={this._bucketsAndTables()}
              delimiter=","
              onChange={this._setInclude}
              placeholder="Select buckets and tables..."
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-3 control-label">Sample rows</label>
          <div className="col-sm-9">
            <input
              type="number"
              placeholder="Number of rows"
              className="form-control"
              value={this.state.rows}
              onChange={this._setRows}
              ref="exclude"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-3 control-label" />
          <div className="col-sm-9">
            <label className="control-label">
              <input type="checkbox" onChange={this._setPreserve} ref="preserve" />
              {' Preserve existing data'}
            </label>
          </div>
        </div>
      </form>
    );
  },

  _setInclude(array) {
    const values = _.map(array, item => item.value);
    return this.setState({ include: values }, () => this.props.onChange(this.state));
  },

  _setRows(e) {
    const rows = e.target.value.trim();
    return this.setState({ rows }, () => this.props.onChange(this.state));
  },

  _setPreserve(e) {
    const preserve = e.target.checked;
    return this.setState({ preserve }, () => this.props.onChange(this.state));
  },

  _bucketsAndTables() {
    return _.sortBy(
      _.union(
        _.map(
          _.filter(
            this.props.buckets.toArray(),
            bucket => bucket.get('id').substr(0, 3) === 'in.' || bucket.get('id').substr(0, 4) === 'out.'
          ),
          bucket => ({
            label: bucket.get('id'),
            value: bucket.get('id')
          })
        ),
        _.map(
          _.filter(
            this.props.tables.toArray(),
            table => table.get('id').substr(0, 3) === 'in.' || table.get('id').substr(0, 4) === 'out.'
          ),
          table => ({
            label: table.get('id'),
            value: table.get('id')
          })
        )
      ),
      option => option.label
    );
  }
});
