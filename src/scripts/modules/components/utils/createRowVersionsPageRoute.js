import createRowVersionsPage from '../react/pages/RowVersions';

export default function(componentId) {
  return {
    name: `${componentId}-row-versions`,
    path: 'versions',
    title: 'Versions',
    defaultRouteHandler: createRowVersionsPage(componentId)
  };
}
