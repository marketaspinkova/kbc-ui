import { fromJS } from 'immutable';

export const configDraft = fromJS({
  storage: {
    input: {
      tables: [
        {
          changed_since: ''
        }
      ]
    }
  },
  parameters: {
    mode: 'replace'
  }
});

export function conform(configuration) {
  const incremental = configuration.getIn(['parameters', 'incremental'], false);
  const mode = configuration.getIn(['parameters', 'mode'], incremental ? 'update' : 'replace');
  const updatedConfiguration = configuration
    .setIn(['parameters', 'mode'], mode)
    .deleteIn(['parameters', 'incremental']);

  return configDraft.mergeDeep(updatedConfiguration);
}
