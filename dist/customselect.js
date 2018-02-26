/***Autor Zveerko; GitHub (https://github.com/Zveromag/)***/

// matchesSelector Polyfill https://gist.github.com/jonathantneal/3062955
this.Element && function (ElementPrototype) {
  ElementPrototype.matches = ElementPrototype.matches ||
    ElementPrototype.matchesSelector ||
    ElementPrototype.webkitMatchesSelector ||
    ElementPrototype.msMatchesSelector ||
    function (selector) {
      var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
      while (nodes[++i] && nodes[i] != node);
      return !!nodes[i];
    }
}(Element.prototype);

// closest polyfill
this.Element && function (ElementPrototype) {
  ElementPrototype.closest = ElementPrototype.closest ||
    function (selector) {
      var el = this;
      while (el.matches && !el.matches(selector)) el = el.parentNode;
      return el.matches ? el : null;
    }
}(Element.prototype);

(function (window) {
  'use strict';

  function throttle(func, ms) {

    var isThrottled = false,
      savedArgs,
      savedThis;

    function wrapper() {

      if (isThrottled) {
        savedArgs = arguments;
        savedThis = this;
        return;
      }

      func.apply(this, arguments);

      isThrottled = true;

      setTimeout(function () {
        isThrottled = false;
        if (savedArgs) {
          wrapper.apply(savedThis, savedArgs);
          savedArgs = savedThis = null;
        }
      }, ms);
    }

    return wrapper;
  }

  function extend(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];

      if (!obj) continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object')
            out[key] = extend(out[key], obj[key]);
          else out[key] = obj[key];
        }
      }
    }

    return out;
  }
  function indexElement(el, arr) {
    return arr.indexOf(el);
  }
  function nextAll(el) {
    var matched = [];

    if (!el) return matched;

    while ((el = el.nextSibling)) {
      if (el.nodeType === 1) {
        matched.push(el);
      }
    }

    return matched;
  }
  function prevAll(el) {
    var matched = [];

    if (!el) return matched;

    while ((el = el.previousSibling)) {
      if (el.nodeType === 1) {
        matched.push(el);
      }
    }

    return matched;
  }

  function Select(el, options) {
    if (!(el instanceof Node)) {
      throw new Error('el must be a Node');
    }

    this.mainSelect = el;

    this.activeClass = 'is-active';
    this.isFocus = false;
    this.currentIndex = 0;

    // default options
    this.settings = extend({
      maxWidth: 0,
      customClass: '',
      animation: null,
      showMaxOptions: null,
      onChange: function () { }
    }, options);

    // Keybord shortcuts
    this.KEYS = {
      ENTER: 13,
      SPACE: 32,
      DOWN: 40,
      ESC: 27,
      UP: 38
    };

    // Create custom select wrapper
    this.slWrap = document.createElement('div');
    this.slWrap.className = 'cs';
    // this.slWrap.className = 'select-js__box';
    // Add focus for accessibility
    this.slWrap.setAttribute('tabindex', 0);

    // if isset custom class
    if (this.settings.customClass) {
      this.slWrap.classList.add(this.settings.customClass);
    }

    //  Create select name
    this.slTitle = document.createElement('div');
    // this.slTitle.className = 'select-js__name';
    this.slTitle.className = 'cs-label';

    //  Create custom option list
    this.slList = document.createElement('ul');
    this.slList.className = 'cs-list';

    //  Get select options
    this.options = Array.prototype.slice.call(
      this.mainSelect.querySelectorAll('option')
    );

    // bind methods
    this.rePosition = throttle(this.positionHandler.bind(this), 250);
    this.toggleEvent = this.toggle.bind(this);
    this.listEvent = this.clickItem.bind(this);
    this.keybordEvent = this.keydown.bind(this);
    this.closeEvent = this.clickDocument.bind(this);
    this.hasFocus = this.focusState.bind(this);

    // create custom select
    this.createSelect();

    // Bind events
    this.slList.addEventListener('click', this.listEvent);
    this.slWrap.addEventListener('click', this.toggleEvent);
    this.slWrap.addEventListener('keydown', this.keybordEvent);
    // Capturing event focus|blur
    this.slWrap.addEventListener('focus', this.hasFocus, true);
    this.slWrap.addEventListener('blur', this.hasFocus, true);
    window.addEventListener('resize', this.rePosition);
    window.addEventListener('scroll', this.rePosition);
    document.documentElement.addEventListener('click', this.closeEvent);
  }

  Select.prototype = {

    // generate default options
    genOptions: function (options) {

      this.options = Array.prototype.slice.call(
        this.mainSelect.querySelectorAll('option, optgroup')
      );

      var frag = document.createDocumentFragment();

      this.options.forEach(function (option, index) {

        var isDisabled = option.hasAttribute('disabled');
        var isGroup = option.matches('optgroup');
        var optgroup = option.closest('optgroup');


        var elItem = document.createElement('li');
        elItem.classList.add('cs-item');

        // Get selected index
        if (index === this.mainSelect.selectedIndex) {
          elItem.dataset.selected = true;
        }

        if (isDisabled) {
          elItem.dataset.disabled = isDisabled;
          elItem.classList.add('cs-item--disabled');
        }

        if (isGroup) {
          elItem.dataset.optgroup = isGroup;
          elItem.classList.add('cs-item--group');
          elItem.textContent = option.getAttribute('for');
        } else {
          // elItem.dataset.selected = isSelected;

          if (optgroup) {
            if (optgroup.hasAttribute('disabled')) {
              elItem.dataset.disabled = isDisabled;
              elItem.classList.add('cs-item--disabled');
            }
            elItem.classList.add('cs-item--groupchild');
          }
          elItem.dataset.value = option.value;
          elItem.textContent = option.textContent;
        }

        frag.appendChild(elItem);
      }.bind(this));

      return frag;
    },

    // generate custom list
    genList: function () {

      this.slList.appendChild(this.genOptions());

      this.slItems = Array.prototype.slice.call(
        this.slWrap.querySelectorAll('.cs-item')
      );

      this.slItems.forEach(
        function (item) {
          if (item.dataset.selected === 'true') {
            this.slTitle.textContent = item.textContent;
            item.classList.add(this.activeClass);
            return;
          }
        }.bind(this)
      );

      // Store total items
      this.listLength = this.slItems.length;
    },

    // Create custom select
    createSelect: function () {
      this.slWrap.appendChild(this.slTitle);
      this.slWrap.appendChild(this.slList);
      this.genList();

      this.mainSelect.parentNode.insertBefore(
        this.slWrap,
        this.mainSelect.nextSibling
      );

      this.listHeight = this.slList.offsetHeight;

      this.mainSelectWidth =
        parseInt(this.settings.maxWidth) <= this.mainSelect.offsetWidth
          ? this.mainSelect.offsetWidth
          : parseInt(this.settings.maxWidth);


      // initial started main block select max width
      if (this.settings.maxWidth) {
        this.slWrap.style.width = '100%';
        this.slWrap.style.maxWidth = this.settings.maxWidth + 'px';
      } else {
        this.slWrap.style.width = this.mainSelectWidth + 'px';
      }

      // Max height
      if (this.settings.showMaxOptions) {
        var selectHeight = this.slTitle.offsetHeight;
        var itemsLen = this.slItems.length;
        if (this.settings.showMaxOptions <= itemsLen) {
          var height = selectHeight * this.settings.showMaxOptions;
          this.slList.style.maxHeight = height + 'px';
        }
      }

      this.position();

      if (this.settings.animation) {
        this.slList.classList.add(this.settings.animation);
      }

      // added hidden attribyte tarvalue select
      this.mainSelect.setAttribute('hidden', 'hidden');
    },

    // Show & hide
    toggle: function () {
      if (!this.isOpen) this.position();

      this.slWrap.classList.toggle('is-open');
      this.isOpen = !this.isOpen;
    },

    // close item list
    close: function (evt) {
      if (this.isOpen) {
        this.slWrap.classList.remove('is-open');
        this.isOpen = false;
      }
    },

    // Get position
    position: function (evt) {
      var windowHeight = window.innerHeight;
      var selectHeight = this.slTitle.offsetHeight;
      var offsetTop = this.slWrap.offsetTop - window.pageYOffset;
      var offsetBottom = windowHeight - offsetTop - selectHeight;

      // set position list from select block
      if (offsetBottom <= offsetTop) {
        this.slList.classList.remove('below')
        this.slList.classList.add('above');

        extend(this.slList.style, {
          top: '',
          bottom: selectHeight + 'px',
          'border-bottom': 0,
          'border-top': ''
        });
      } else {
        this.slList.classList.remove('above')
        this.slList.classList.add('below');

        extend(this.slList.style, {
          top: selectHeight + 'px',
          bottom: '',
          'border-bottom': '',
          'border-top': 0
        });
      }

      if (this.settings.maxWidth) {
        extend(this.slList.style, {
          width: '100%',
          'max-width': this.settings.maxWidth + 'px'
        });
      } else {
        this.slList.style.width = this.mainSelectWidth + 'px';
      }
    },

    // Handler methods
    focusState: function (evt) {
      // Check focus state
      var type = evt.type;
      this.isFocus = type === 'focus' ? true : false;

      // When pressing a TAB key, save focus if the customselect is opened
      if (type === 'blur' && this.isOpen) {
        // If IE check activeElement
        if (document.activeElement !== this.slWrap) {
          this.close();
        }
      }
    },

    // Check position with scroll
    positionHandler: function (evt) {
      if (!this.isOpen) return;
      this.position();
    },

    // this.currentIndex = indexElement(target, this.slItems);
    move: function (key) {
      var target = this.slList.querySelector('.' + this.activeClass);
      this.currentIndex = indexElement(target, this.slItems);

      if (key === this.KEYS.DOWN) {
        this.moveDown();
      }
      if (key === this.KEYS.UP) {
        this.moveUp();
      }

      this.selection();
      this.scroll();
    },

    // Move direction
    moveDown: function () {
      var self = this;
      self.currentIndex += 1;

      var skip = false;
      var currentEl = self.slItems[self.currentIndex];
      var nextEnabled = nextAll(currentEl).some(function (el) {
        if (el.dataset.disabled || el.dataset.optgroup) return false;
        else return true;
      });

      if (currentEl) {
        if (currentEl.dataset.disabled || currentEl.dataset.optgroup) {
          skip = true;
        }
      }
      if (self.currentIndex === self.listLength) {
        self.currentIndex -= 1;
      } else if (skip && nextEnabled) {
        return self.moveDown();
      }
      if (skip && !nextEnabled) {
        self.currentIndex -= 1;
      }
    },

    moveUp: function () {
      var self = this;
      self.currentIndex -= 1;

      var skip = false;
      var currentEl = self.slItems[self.currentIndex];

      var prevEnabled = prevAll(currentEl).some(function (
        el
      ) {
        if (el.dataset.disabled || el.dataset.optgroup) return false;
        else return true;
      });

      if (currentEl) {

        if (currentEl.dataset.disabled || currentEl.dataset.optgroup) {
          skip = true;
        }
      }
      if (self.currentIndex === -1) {
        self.currentIndex += 1;
      } else if (skip && prevEnabled) {
        return self.moveUp();
      }
      if (skip && !prevEnabled) {
        self.currentIndex += 1;
      }
    },


    // Selection item
    selection: function () {
      var item = this.slItems[this.currentIndex];

      // highlighting the selected item
      this.slList
        .querySelector('.' + this.activeClass)
        .classList.remove(this.activeClass);

      item.classList.add(this.activeClass);

      // Change of text label
      this.slTitle.textContent = item.textContent;
    },

    get: function (evt) {
      var getItem = this.slList.querySelector('.' + this.activeClass);
      if (getItem.dataset.disabled) return;

      this.settings.onChange(evt, getItem.dataset.value, getItem.textContent, this.currentIndex);
      this.options.forEach(function (option) {
        option.removeAttribute('selected');
      });
      this.options[this.currentIndex].setAttribute('selected', true);

      if (evt.type === 'keydown' && evt.which !== this.KEYS.ENTER) return;
      this.close();
    },

    // moving scroll
    scroll: function () {
      var slList = this.slList.getBoundingClientRect();
      var slOption = this.slItems[this.currentIndex].getBoundingClientRect();

      if (slList.top > slOption.top) {
        this.slList.scrollTop = this.slList.scrollTop - slList.top + slOption.top;
      } else if (slList.bottom < slOption.bottom) {
        this.slList.scrollTop = this.slList.scrollTop - slList.bottom + slOption.bottom;
      }
    },

    // Click item option
    clickItem: function (evt) {
      var target = evt.target.closest('li');

      if (!target) return;
      if (target.dataset.disabled || target.dataset.optgroup) {
        evt.stopPropagation();
        return;
      }

      this.currentIndex = indexElement(target, this.slItems);

      this.selection();
      this.get(evt);
    },

    // keyboard event
    keydown: function (evt) {
      if (this.isFocus) {
        if (evt.which === this.KEYS.ENTER) {
          evt.preventDefault();
          if (this.isOpen) this.get(evt);
        }
        if (evt.which === this.KEYS.SPACE) {
          evt.preventDefault();
          this.toggle();
        }
        if (evt.which === this.KEYS.ESC) {
          this.close();
        }
        if (evt.which === this.KEYS.UP || evt.which === this.KEYS.DOWN) {
          evt.preventDefault();
          this.move(evt.which);
          this.get(evt);
        }
      }
    },

    // event click document close select list
    clickDocument: function (evt) {
      if (!this.isOpen) return;
      if (evt.target.classList.contains('cs-label')) return;

      this.close();
    },

    update: function () {
      // Clear all list
      this.slList.innerHTML = '';

      // Generate options list
      this.genList();
    },

    // destroy select
    destroy: function () {
      this.slList.removeEventListener('click', this.listEvent);
      this.slWrap.removeEventListener('click', this.toggleEvent);
      this.slWrap.removeEventListener('keydown', this.keybordEvent);
      this.slWrap.removeEventListener('focus', this.hasFocus, true);
      this.slWrap.removeEventListener('blur', this.hasFocus, true);
      window.removeEventListener('resize', this.rePosition);
      window.removeEventListener('scroll', this.rePosition);
      document.documentElement.removeEventListener('click', this.closeEvent);

      this.slWrap.removeChild(this.slList);
      this.slWrap.removeChild(this.slTitle);
      this.slWrap.parentNode.removeChild(this.slWrap);
      this.mainSelect.removeAttribute('hidden');

      // clear object
      for (var name in this) {
        delete this[name];
      }
    }
  }

  window.Select = Select;

})(this);
