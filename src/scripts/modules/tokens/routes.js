import Index from './react/pages/Index/Index';
import NewPage from './react/pages/New/New';
import DetailPage from './react/pages/Detail/Detail';
import tokensActions from './actionCreators';
import StorageActions from '../components/StorageActionCreators';
import TokensStore from './StorageTokensStore';

export default {
  name: 'tokens',
  title: 'API Tokens',
  defaultRouteHandler: Index,
  requireData: [() => tokensActions.loadTokens(), () => StorageActions.loadBuckets()],
  childRoutes: [
    {
      name: 'tokens-new',
      path: 'new-token',
      handler: NewPage,
      title: 'New Token'
    },
    {
      name: 'tokens-detail',
      path: ':tokenId',
      handler: DetailPage,
      title: routerState => {
        const tokenId = routerState.getIn(['params', 'tokenId']);
        const token = tokenId && TokensStore.getAll().find(t => t.get('id') === tokenId);

        if (!token) {
          return `Unknown token ${tokenId}`;
        }

        return `${token.get('description')} (${token.get('id')})`;
      }
    }
  ]
};
