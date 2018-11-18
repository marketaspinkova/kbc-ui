import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ComponentConfigurationRowLink from '../ComponentConfigurationRowLink';

export default (bucketId, transformation, errors, onClick) => {
  return React.createClass({
    mixins: [PureRenderMixin],

    propTypes: {
      onClick: React.PropTypes.func.isRequired
    },

    render() {
      return (
        <span>
          SQL Validation found {errors} error
          {errors > 1 ? 's' : ''} in transformation {transformation.get('name')}.
          <br />
          <ComponentConfigurationRowLink
            componentId="transformation"
            configId={bucketId}
            rowId={transformation.get('id')}
            onClick={() => {
              this.props.onClick();
              onClick();
            }}
          >
            <b>Show errors</b>
          </ComponentConfigurationRowLink>
        </span>
      );
    }
  });
};
