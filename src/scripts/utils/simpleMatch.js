export default function(query, test) {
  return test.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) >= 0;
}
