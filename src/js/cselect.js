import './polyfill';
import Util from './utiils';

class CSelect {
  constructor(el, options) {
    if (!(el instanceof Node)) {
      throw new Error('el must be a Node');
    }

    this.mainSelect = el;
    this.activeClass = 'is-active';
    this.selectClass = 'cs';
    this.isFocus = false;
    this.currentIndex = 0;

    // default options
    this.settings = Object.assign({
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

    this._init();
  }

  _init() {
    // Create custom select wrapper
    this.slWrap = document.createElement('div');
    this.slWrap.className = this.selectClass;

    // Add focus for accessibility
    this.slWrap.setAttribute('tabindex', 0);

    // if isset custom class
    if (this.settings.customClass) {
      this.slWrap.classList.add(this.settings.customClass);
    }

    //  Create select name
    this.slTitle = document.createElement('div');
    this.slTitle.className = `${this.selectClass}-label`;

    //  Create custom option list
    this.slList = document.createElement('ul');
    this.slList.className = `${this.selectClass}-list`;

    //  Get select options
    this.options = Array.prototype.slice.call(
      this.mainSelect.querySelectorAll('option')
    );

    // bind methods
    this._positionHandler = Util.throttle(this._positionHandler.bind(this), 250);
    this._toggleHandler   = this._toggleHandler.bind(this);
    this._clickHandler    = this._clickHandler.bind(this);
    this._keyboardHandler  = this._keyboardHandler.bind(this);
    this._closeHandler    = this._closeHandler.bind(this);
    this._focusHandler    = this._focusHandler.bind(this);

    // create custom select
    this._createSelect();

    // bind events
    this._bindEvents();
  }

  _bindEvents() {
    this.slList.addEventListener('click', this._clickHandler);
    this.slWrap.addEventListener('click', this._toggleHandler);
    this.slWrap.addEventListener('keydown', this._keyboardHandler);
    // Capturing event focus|blur
    this.slWrap.addEventListener('focus', this._focusHandler, true);
    this.slWrap.addEventListener('blur', this._focusHandler, true);
    window.addEventListener('resize', this._positionHandler);
    window.addEventListener('scroll', this._positionHandler);
    document.documentElement.addEventListener('click', this._closeHandler);
  }

  _unbindEvents() {
    this.slList.removeEventListener('click', this._clickHandler);
    this.slWrap.removeEventListener('click', this._toggleHandler);
    this.slWrap.removeEventListener('keydown', this._keyboardHandler);
    // Capturing event focus|blur
    this.slWrap.removeEventListener('focus', this._focusHandler, true);
    this.slWrap.removeEventListener('blur', this._focusHandler, true);
    window.removeEventListener('resize', this._positionHandler);
    window.removeEventListener('scroll', this._positionHandler);
    document.documentElement.removeEventListener('click', this._closeHandler);
  }

  // Create custom select
  _createSelect() {
    this.slWrap.appendChild(this.slTitle);
    this.slWrap.appendChild(this.slList);
    this._genList();

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
      const selectHeight = this.slTitle.offsetHeight;
      const itemsLen = this.slItems.length;
      if (this.settings.showMaxOptions <= itemsLen) {
        const height = selectHeight * this.settings.showMaxOptions;
        this.slList.style.maxHeight = height + 'px';
      }
    }

    this._position();

    if (this.settings.animation) {
      this.slList.classList.add(this.settings.animation);
    }

    // added hidden attribyte select
    this.mainSelect.setAttribute('hidden', 'hidden');
  }

  // generate default options
  _genOptions(options) {

    this.options = Array.prototype.slice.call(
      this.mainSelect.querySelectorAll('option, optgroup')
    );

    const frag = document.createDocumentFragment();

    this.options.forEach(function (option, index) {

      const isDisabled = option.hasAttribute('disabled');
      const isGroup = option.matches('optgroup');
      const optgroup = option.closest('optgroup');


      var elItem = document.createElement('li');
      elItem.classList.add(`${this.selectClass}-item`);

      // Get selected index
      if (index === this.mainSelect.selectedIndex) {
        // elItem.dataset.selected = true;
        elItem.setAttribute('data-selected', true);
      }

      if (isDisabled) {
        // elItem.dataset.disabled = isDisabled;
        elItem.setAttribute('data-disabled', isDisabled);
        elItem.classList.add(`${this.selectClass}-item--disabled`);
      }

      if (isGroup) {
        // elItem.dataset.optgroup = isGroup;
        elItem.setAttribute('data-optgroup', isGroup);
        elItem.classList.add(`${this.selectClass}-item--group`);
        elItem.textContent = option.getAttribute('for');
      } else {
        // elItem.dataset.selected = isSelected;

        if (optgroup) {
          if (optgroup.hasAttribute('disabled')) {
            // elItem.dataset.disabled = isDisabled;
            elItem.setAttribute('data-disabled', true);
            elItem.classList.add(`${this.selectClass}-item--disabled`);
          }
          elItem.classList.add(`${this.selectClass}-item--groupchild`);
        }
        // elItem.dataset.value = option.value;
        elItem.setAttribute('data-value', option.value);
        elItem.textContent = option.textContent;
      }

      frag.appendChild(elItem);
    }.bind(this));

    return frag;
  }

  // generate custom list
  _genList() {

    this.slList.appendChild(this._genOptions());

    this.slItems = Array.prototype.slice.call(
      this.slWrap.querySelectorAll(`.${this.selectClass}-item`)
    );

    this.slItems.forEach(item => {
        if (item.getAttribute('data-selected') === 'true') {
          this.slTitle.textContent = item.textContent;
          item.classList.add(this.activeClass);
          return;
        }
      }
    );

    // Store total items
    this.listLength = this.slItems.length;
  }

  // Get position
  _position(evt) {
    const windowHeight = window.innerHeight;
    const selectHeight = this.slTitle.offsetHeight;
    const offsetTop = this.slWrap.getBoundingClientRect().top;
    const offsetBottom = windowHeight - offsetTop - selectHeight;

    // set position list from select block
    if (offsetBottom <= offsetTop) {
      this.slList.classList.remove('below')
      this.slList.classList.add('above');

      Object.assign(this.slList.style, {
        top: '',
        bottom: `${selectHeight}px`,
        'border-bottom': 0,
        'border-top': ''
      });

    } else {
      this.slList.classList.remove('above')
      this.slList.classList.add('below');

      Object.assign(this.slList.style, {
        top: `${selectHeight}px`,
        bottom: '',
        'border-bottom': '',
        'border-top': 0
      })
    }

    if (this.settings.maxWidth) {
      Object.assign(this.slList.style, {
        'max-width': `${this.mainSelectWidth}px`,
        width: '100%'
      })
    } else {
      this.slList.style.width = this.mainSelectWidth + 'px';
    }
  }

  // close item list
  _close() {
    if (this.isOpen) {
      this.slWrap.classList.remove('is-open');
      this.isOpen = false;
    }
  }

  //= Handlers =//

  // Check position with scroll
  _positionHandler() {
    if (!this.isOpen) return;
    this._position();
  }

  // Show & hide
  _toggleHandler() {
    if (!this.isOpen) this._position();

    this.slWrap.classList.toggle('is-open');
    this.isOpen = !this.isOpen;
  }

  // Handler methods
  _focusHandler(evt) {
    // Check focus state
    const type = evt.type;
    this.isFocus = type === 'focus' ? true : false;

    // When pressing a TAB key, save focus if the customselect is opened
    if (type === 'blur' && this.isOpen) {
      // If IE check activeElement
      if (document.activeElement !== this.slWrap) {
        this._close();
      }
    }
  }

  // Click item option
  _clickHandler(evt) {
    const target = evt.target.closest('li');

    if (!target) return;
    if (target.hasAttribute('data-disabled') || target.hasAttribute('data-optgroup')) {
      evt.stopPropagation();
      return;
    }

    this.currentIndex = Util.index(target, this.slItems);

    this._selection();
    this._get(evt);
  }

  // keyboard event
  _keyboardHandler(evt) {
    if (this.isFocus) {
      if (evt.which === this.KEYS.ENTER) {
        evt.preventDefault();
        if (this.isOpen) this._get(evt);
      }
      if (evt.which === this.KEYS.SPACE) {
        evt.preventDefault();
        this._toggleHandler();
      }
      if (evt.which === this.KEYS.ESC) {
        this._close();
      }
      if (evt.which === this.KEYS.UP || evt.which === this.KEYS.DOWN) {
        evt.preventDefault();
        this._move(evt.which);
        this._get(evt);
      }
    }
  }

  // event click document close select list
  _closeHandler(evt) {
    if (!this.isOpen) return;
    if (evt.target.classList.contains(`${this.selectClass}-label`)) return;

    this._close();
  }


  _move(key) {
    const target = this.slList.querySelector('.' + this.activeClass);
    this.currentIndex = Util.index(target, this.slItems);

    if (key === this.KEYS.DOWN) {
      this._moveDown();
    }
    if (key === this.KEYS.UP) {
      this._moveUp();
    }

    this._selection();
    this._scroll();
  }

   // Move direction
   _moveDown() {
    // var self = this;
    this.currentIndex += 1;

    let skip = false;
    const currentEl = this.slItems[this.currentIndex];
    const nextEnabled = Util.nextAll(currentEl).some(el => {
      if (el.hasAttribute('data-disabled') || el.hasAttribute('data-optgroup')) return false;
      else return true;
    });

    if (currentEl) {
      if (currentEl.hasAttribute('data-disabled') || currentEl.hasAttribute('data-optgroup')) {
        skip = true;
      }
    }
    if (this.currentIndex === this.listLength) {
      this.currentIndex -= 1;
    } else if (skip && nextEnabled) {
      return this._moveDown();
    }
    if (skip && !nextEnabled) {
      this.currentIndex -= 1;
    }
  }

  _moveUp() {
    // const self = this;
    this.currentIndex -= 1;

    let skip = false;
    const currentEl = this.slItems[this.currentIndex];
    const prevEnabled = Util.prevAll(currentEl).some(el => {
      if (el.hasAttribute('data-disabled') || el.hasAttribute('data-optgroup')) return false;
      else return true;
    });

    if (currentEl) {
      if (currentEl.hasAttribute('data-disabled') || currentEl.hasAttribute('data-optgroup')) {
        skip = true;
      }
    }
    if (this.currentIndex === -1) {
      this.currentIndex += 1;
    } else if (skip && prevEnabled) {
      return this._moveUp();
    }
    if (skip && !prevEnabled) {
      this.currentIndex += 1;
    }
  }

  // Selection item
  _selection() {
    const item = this.slItems[this.currentIndex];

    // highlighting the selected item
    this.slList
      .querySelector(`.${this.activeClass}`)
      .classList.remove(this.activeClass);

    item.classList.add(this.activeClass);

    // Change of text label
    this.slTitle.textContent = item.textContent;
  }

  _get(evt) {
    const getItem = this.slList.querySelector(`.${this.activeClass}`);

    if (getItem.hasAttribute('data-disabled')) return;

    this.settings.onChange(evt, getItem.getAttribute('data-value'), getItem.textContent, this.currentIndex);
    this.options.forEach(option => {
      option.removeAttribute('selected');
    });
    this.options[this.currentIndex].setAttribute('selected', true);

    if (evt.type === 'keydown' && evt.which !== this.KEYS.ENTER) return;
    this._close();
  }

  // moving scroll
  _scroll() {
    const slList = this.slList.getBoundingClientRect();
    const slOption = this.slItems[this.currentIndex].getBoundingClientRect();

    if (slList.top > slOption.top) {
      this.slList.scrollTop = this.slList.scrollTop - slList.top + slOption.top;
    } else if (slList.bottom < slOption.bottom) {
      this.slList.scrollTop = this.slList.scrollTop - slList.bottom + slOption.bottom;
    }
  }

  update() {
    // Clear all list
    this.slList.innerHTML = '';

    // Generate options list
    this._genList();
  }

  destroy() {
    this._unbindEvents();

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

export default CSelect;
