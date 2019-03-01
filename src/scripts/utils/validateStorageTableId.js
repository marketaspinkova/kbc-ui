export default function(str) {
  if (str.match(/^(in|out)\.c-[a-zA-z0-9_\-]+\.[a-zA-z0-9_\-]+$/)) {
    return true;
  }
  return false;
}
