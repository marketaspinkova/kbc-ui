import Index from './react/pages/Index/Index';
import Detail from './react/pages/Detail/Detail';
import tokensActions from './actionCreators';
import StorageActions from '../components/StorageActionCreators';
import TokensStore from './StorageTokensStore';

export default {
  name: 'tokens',
  title: 'API Tokens',
  defaultRouteHandler: Index,
  requireData: [
    () => tokensActions.loadTokens(),
    () => StorageActions.loadBuckets()
  ],
  childRoutes: [
    {
      name: 'tokens-detail',
      path: ':tokenId',
      handler: Detail,
      title: (routerState) => {
        const tokenId = routerState.getIn(['params', 'tokenId']);
        if (tokenId === 'new-token') {
          return 'New Token';
        }
        const token = tokenId && TokensStore.getAll().find(t => t.get('id') === tokenId);
        if (token) {
          return `${token.get('description')} (${token.get('id')})`;
        } else {
          return `Unknown token ${tokenId}`;
        }
      }
    }
  ]
};
