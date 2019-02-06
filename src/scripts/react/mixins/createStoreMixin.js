const createStoreMixin = (...stores) => {
  const StoreMixin = {
    getInitialState() {
      return this.getStateFromStores(this.props);
    },

    componentDidMount() {
      return stores.forEach(store => {
        return store.addChangeListener(this._handleStoreChanged);
      });
    },

    componentWillUnmount() {
      return stores.forEach(store => {
        return store.removeChangeListener(this._handleStoreChanged);
      });
    },

    _handleStoreChanged() {
      return this.setState(this.getStateFromStores(this.props));
    }
  };

  return StoreMixin;
};

export default createStoreMixin;
