//
// Extracted from https://github.com/sitexw/BlockAdBlock, since npm package does
// not work well with webpack
//
export default function() {
  let detected = false;

  let bait = document.createElement('div');
  bait.setAttribute(
    'class',
    'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links'
  );
  bait.setAttribute(
    'style',
    'width: 1px ! important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;'
  );
  window.document.body.appendChild(bait);

  if (
    window.document.body.getAttribute('abp') !== null ||
    bait.offsetParent === null ||
    bait.offsetHeight == 0 ||
    bait.offsetLeft == 0 ||
    bait.offsetTop == 0 ||
    bait.offsetWidth == 0 ||
    bait.clientHeight == 0 ||
    bait.clientWidth == 0
  ) {
    detected = true;
  } else if (window.getComputedStyle !== undefined) {
    let baitTemp = window.getComputedStyle(bait, null);
    if (
      baitTemp &&
      (baitTemp.getPropertyValue('display') == 'none' ||
        baitTemp.getPropertyValue('visibility') == 'hidden')
    ) {
      detected = true;
    }
  }

  window.document.body.removeChild(bait);
  return detected;
}
