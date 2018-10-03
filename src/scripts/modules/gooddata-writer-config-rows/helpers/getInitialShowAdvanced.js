export default function getInitialShowAdvanced(columns) {
  return !!columns.find(column => {
    return !!(column.identifier ||
              column.identifierLabel ||
              column.identifierSortLabel);
  });
}
