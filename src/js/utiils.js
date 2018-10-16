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

  merge(out) {
    out = out || {};

    for (let i = 1; i < arguments.length; i++) {
      const obj = arguments[i];

      if (!obj) continue;

      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object')
            out[key] = extend(out[key], obj[key]);
          else out[key] = obj[key];
        }
      }
    }

    return out;
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
  }

};
