import randomNumber from './randomNumber';

export default function(ids = []) {
  let newId = randomNumber();

  while (ids.indexOf(newId) >= 0) {
    newId = randomNumber();
  }

  return newId;
}
