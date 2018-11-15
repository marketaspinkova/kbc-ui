import React, {PropTypes} from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { Input } from './../../../../react/common/KbcBootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      path: PropTypes.string.isRequired,
      onlyNewFiles: PropTypes.bool.isRequired
    }),
    onChange: PropTypes.func.isRequired
  },
  render() {
    const props = this.props;
    return (
      <div className="form-horizontal">
        <h3>Path settings</h3>
        <Input
          type="text"
          label="Path"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.path}
          onChange={function(e) {
            props.onChange({path: e.target.value});
          }}
          placeholder="folder/*.csv"
          help={(<span>Exact path to file or glob syntax. Use absolute path for FTP(s) connection and relative for SFTP connection.<br/>
            - <code>**/*.csv</code> will download all CSV files in all subdirectories <br/>
            - <code>files/*.csv</code> will download all CSV files in files/ directory <br/>
            - <code>files/directory/file.txt</code> will download exact TXT file</span>)}
        />
        <h3>Download settings</h3>
        <Input
          type="checkbox"
          label="Only new files"
          wrapperClassName="col-xs-8 col-xs-offset-4"
          checked={this.props.value.onlyNewFiles}
          onChange={function(e) {
            props.onChange({onlyNewFiles: e.target.checked});
          }}
          help={(<span>Every job stores the timestamp of the last downloaded file and a subsequent job can pick up from there.</span>)}
        />
      </div>
    );
  }
});
