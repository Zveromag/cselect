export default {

  throttle(fn, ms) {
    let isThrottled = false,
      savedArgs,
      savedThis;

    function wrapper() {
      if (isThrottled) {
        savedArgs = arguments;
        savedThis = this;
        return;
      }

      fn.apply(this, arguments);

      isThrottled = true;

      setTimeout(() => {
        isThrottled = false;
        if (savedArgs) {
          wrapper.apply(savedThis, savedArgs);
          savedArgs = savedThis = null;
        }
      }, ms);
    }
    return wrapper;
  },

  index(needle, arr) {
    return arr.indexOf(needle);
  },

  nextAll(el) {
    let matched = [];

    if (!el) return matched;

    while ((el = el.nextSibling)) {
      if (el.nodeType === 1) {
        matched.push(el);
      }
    }
    return matched;
  },

  prevAll(el) {
    let matched = [];

    if (!el) return matched;

    while ((el = el.previousSibling)) {
      if (el.nodeType === 1) {
        matched.push(el);
      }
    }
    return matched;
  },

  isMobile: (() => {
    const ua = navigator.userAgent;
    const mobileRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

    return mobileRE.test(ua);
  })()

}
