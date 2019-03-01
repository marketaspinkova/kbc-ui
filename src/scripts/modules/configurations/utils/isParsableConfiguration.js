import Immutable from 'immutable';

export default function(configuration, parseFunction, createFunction) {
  if (configuration.isEmpty()) {
    return true;
  }
  const parsed = parseFunction(configuration);
  const reconstructed = createFunction(parsed);
  return Immutable.is(configuration, reconstructed);
}
