export const randomNumber = (max = 100000) => Math.floor(Math.random() * max + 1);

export default function(ids = []) {
  let newId = randomNumber();

  while (ids.indexOf(newId) >= 0) {
    newId = randomNumber();
  }

  return newId;
}
