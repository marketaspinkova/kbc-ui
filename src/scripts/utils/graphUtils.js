import RoutesStore from '../stores/RoutesStore';
import { parse as parseTable } from './tableIdParser';

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
          let tableData = parseTable(nodes[i].object.table);

          nodes[i].link = router.makeHref('storage-explorer-table', {
            bucketId: `${tableData.parts.stage}.${tableData.parts.bucket}`,
            tableName: tableData.parts.table
          });
        }
      }
    }

    return nodes;
  },

  styles() {
    return {
      'g.edgePath': {
        fill: 'none',
        stroke: 'grey',
        'stroke-width': '1.5px'
      },
      'g.edgePath.alias': {
        'stroke-dasharray': '5, 5'
      },
      'g.node text': {
        color: '#ffffff',
        fill: '#ffffff',
        display: 'inline-block',
        padding: '2px 4px',
        'font-size': '12px',
        'font-weight': 'bold',
        'line-height': '14px',
        'text-shadow': '0 -1px 0 rgba(0, 0, 0, 0.25)',
        'white-space': 'nowrap',
        'vertical-align': 'baseline'
      },
      '.node.transformation rect': {
        fill: '#363636'
      },
      '.node.remote-transformation rect': {
        fill: '#999999'
      },
      '.node.writer rect': {
        fill: '#faa732'
      },
      '.node.input rect': {
        fill: '#468847'
      },
      '.node.output rect': {
        fill: '#3a87ad'
      }
    };
  }
};
