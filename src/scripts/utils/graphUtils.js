import RoutesStore from '../stores/RoutesStore';
import ApplicationStore from '../stores/ApplicationStore';

export default {
  addLinksToNodes(nodes) {
    const router = RoutesStore.getRouter();

    for (let i in nodes) {
      if (nodes.hasOwnProperty(i)) {
        if (nodes[i].object.type === 'transformation') {
          nodes[i].link = router.makeHref('transformationDetail', {
            config: nodes[i].object.bucket,
            row: nodes[i].object.transformation
          });
        }

        if (nodes[i].object.type === 'writer' || nodes[i].object.type === 'dataset') {
          nodes[i].link = router.makeHref('gooddata-writer-table', {
            config: nodes[i].object.config,
            table: nodes[i].object.table
          });
        }

        if (nodes[i].object.type === 'dateDimension') {
          nodes[i].link = router.makeHref('gooddata-writer-date-dimensions', {
            config: nodes[i].object.config
          });
        }

        if (nodes[i].object.type === 'storage') {
          nodes[i].link = ApplicationStore.getSapiTableUrl(nodes[i].object.table);
        }
      }
    }

    return nodes;
  }
};
