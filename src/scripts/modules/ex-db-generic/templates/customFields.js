
const defaultCustomFields = [];

const mssqlCustomFields = [
  {
    'label': 'WITH NO LOCK',
    'name': 'nolock',
    'type': 'checkbox',
    'protected': false,
    'required': false,
    'help': 'Use WITH(NOLOCK) for query execution'
  }
];

const CUSTOM_FIELDS = {
  'keboola.ex-db-mssql': mssqlCustomFields
};


export default function getCustomFields(componentId) {
  if (CUSTOM_FIELDS[componentId]) {
    return CUSTOM_FIELDS[componentId];
  } else {
    return defaultCustomFields;
  }
}
