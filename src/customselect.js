(function(window){

  'use strict';

  function extend(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];

      if (!obj)
        continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object')
            out[key] = extend(out[key], obj[key]);
          else
            out[key] = obj[key];
        }
      }
    }

    return out;
  };
  function indexElement(el, arr) {
    return arr.indexOf(el);
  }

  function Select(el, options) {
    if (!(el instanceof Node)) {
      throw new Error('el must be a Node');
    }

    this.mainSelect = el;

    this.activeClass = 'is-active';

    // default options
    this.settings = extend({
      animations : '',
      maxWidth : 0,
      onChange : function(){}
    }, options);

    // Keybord shortcuts
    this.KEYS = {
      ENTER: 13,
      DOWN: 40,
      ESC: 27,
      UP: 38
    };
    this.slWrap = document.createElement('div');
    this.slWrap.className = 'select-js__box';
    this.slWrap.innerHTML = '<div class="select-js__name"></div>';
    this.slListExt = document.createElement('ul');
    this.slListExt.className = 'select-js__list';
    this.options = Array.prototype.slice.call(this.mainSelect.querySelectorAll('option'));

    // cache methods
    this.resizeEvent = this.position.bind(this);
    this.toggleEvent = this.toggle.bind(this);
    this.listEvent = this.clickItem.bind(this);
    this.nameEvent = this.clickName.bind(this);
    this.keybordEvent = this.keydown.bind(this);

    this.createSelect();

		// Bind events
    this.slTitle.addEventListener('click', this.toggleEvent);
    this.slListExt.addEventListener('click', this.listEvent);
    this.slWrap.addEventListener('click', this.nameEvent);
    window.addEventListener('resize', this.resizeEvent);
    document.documentElement.addEventListener('keydown', this.keybordEvent);

  }

	// generate default options
  Select.prototype.genOptions = function(options) {

    var frag = document.createDocumentFragment();
    this.options.forEach(function(option) {
      var isSelected = option.hasAttribute('selected')
      var elItem = document.createElement('li');
      elItem.className = 'select-js__item';
      elItem.dataset.selected = isSelected;
      elItem.dataset.get = option.value;
      elItem.textContent = option.textContent;

      frag.appendChild(elItem);
    });

    return frag;
	}
	// create new select
  Select.prototype.createSelect = function() {
    this.slListExt.appendChild(this.genOptions());
    this.slWrap.appendChild(this.slListExt);
    this.mainSelect.parentNode.insertBefore(this.slWrap, this.mainSelect);

    this.slTitle = this.slWrap.querySelector('.select-js__name');
    this.slList = this.slWrap.querySelector('.select-js__list');
    this.slItems = Array.prototype.slice.call(this.slWrap.querySelectorAll('.select-js__item'));
    this.listHeight = this.slList.offsetHeight;
    this.listLength = this.slItems.length;
    this.mainSelectWidth = (parseInt(this.settings.maxWidth) <= this.mainSelect.offsetWidth) ? this.mainSelect.offsetWidth : parseInt(this.settings.maxWidth);
    this.isOpen = false;

    this.position();

    if (this.settings.animations.length > 0) {
    	this.slList.classList.add(this.settings.animations);
    }

		// change selected el from new select
    this.slItems.forEach(function(item) {
      if (item.dataset.selected === 'true') {
        this.slTitle.textContent = item.textContent;
        item.classList.add(this.activeClass);
      }
    }.bind(this));

		// added hidden attribyte old select
    this.mainSelect.setAttribute('hidden', 'hidden');
	}
	// set begins position select and set position on resize window
  Select.prototype.position = function() {
    var windowHeight = window.innerHeight;
    var selectHeight = this.slTitle.offsetHeight;
    var offsetTop = this.slWrap.offsetTop - window.pageYOffset;
    var offsetBottom = windowHeight - offsetTop -selectHeight;

		// initial started main block select max width
    if (this.settings.maxWidth) {
      this.slWrap.style.width = '100%';
      this.slWrap.style.maxWidth = this.settings.maxWidth + 'px';
    }
    else {
      this.slWrap.style.width = this.mainSelect.offsetWidth + 'px';
    }

		// set position list from select block
    if(offsetBottom <= offsetTop) {
      extend(this.slList.style, {
        'top': 'auto',
        'bottom': selectHeight + 'px',
        'border-bottom': 0,
        'border-top': ''
      });
    }
    else {
      extend(this.slList.style, {
        'top': selectHeight + 'px',
        'bottom': 'auto',
        'border-bottom': '',
        'border-top': 0
      });
    }

    if(this.settings.maxWidth) {
      extend(this.slList.style, {
        'width' : '100%',
        'max-width' : this.settings.maxWidth + 'px'
      });
    }
    else {
      this.slList.style.width = this.mainSelect.offsetWidth + 'px';
    }
	}
	// moving activ item from list items
  Select.prototype.move = function(key) {
    var target = this.slList.querySelector('.' + this.activeClass);
    var highlightIndex = indexElement(target, this.slItems);

    if(!(highlightIndex >= 0)) return;

    if(key === this.KEYS.UP) {
      highlightIndex -= 1;
    }

    if(key === this.KEYS.DOWN) {
      highlightIndex += 1;
    }

    if(highlightIndex < 0 || highlightIndex >= this.listLength ) {
      return;
    }

    this.highlight(highlightIndex);
    this.activated(highlightIndex);
    this.scroll(highlightIndex);
	}
	// activated focused item
  Select.prototype.highlight = function(highlightIndex) {
    this.slList.querySelector('.' + this.activeClass).classList.remove(this.activeClass);
    this.slItems[highlightIndex].classList.add(this.activeClass);
	}
	// updated first name from select
  Select.prototype.activated = function(highlightIndex) {
    var item = this.slItems[highlightIndex];
    this.slTitle.textContent = item.textContent;
	}
	// activated selected item and activated item from old hidden select
  Select.prototype.get = function() {
    var getItem = this.slList.querySelector('.' + this.activeClass);
    var index = indexElement(getItem, this.slItems);

    this.settings.onChange(getItem.dataset.get, getItem.textContent, index);
    this.options.forEach(function(option) {
      option.removeAttribute('selected');
    });
    this.options[index].setAttribute('selected', true);

    this.close();
	}
	// moving scroll
  Select.prototype.scroll = function(highlightIndex) {
    var listScroll = this.slList.scrollHeight;
    var listScrollTop = this.slList.scrollTop;


    if (listScroll > this.listHeight) {
      var itemOffset = this.slItems[highlightIndex].getBoundingClientRect().top + document.body.scrollTop;
      var listOffset = this.slList.getBoundingClientRect().top + document.body.scrollTop;

      this.slList.scrollTop = ( itemOffset - ( listOffset - listScrollTop ) );
    }
	}
	// added and removing active class in the list item
  Select.prototype.toggle = function() {
    if (!this.isOpen) this.position();

    this.slTitle.classList.toggle('is-open');
    this.slList.classList.toggle('is-open');
    this.isOpen = (this.isOpen) ? false : true;
	}
	// close item list
  Select.prototype.close = function() {
    this.slTitle.classList.remove('is-open');
    this.slList.classList.remove('is-open');
    this.isOpen = false;
	}
	// event clicked item
  Select.prototype.clickItem = function(evt) {
  	var target = evt.target.closest('li');

    if (!target) return;

    var index = indexElement(target, this.slItems);
    this.highlight(index);
    this.activated(index);
    this.get(index);
	}
	// event clicked name main select
  Select.prototype.clickName = function(evt) {
  	if (evt.target.closest('.select-js__name')) return;

    this.isOpen && this.close();
	}
	// event keybord key
  Select.prototype.keydown = function(evt) {
  	if (this.isOpen) {
        if (evt.which === this.KEYS.ENTER) {
          this.get();
        }
        if (evt.which === this.KEYS.ESC) {
          this.close();
        }
        if (evt.which === this.KEYS.UP  || evt.which === this.KEYS.DOWN) {
          evt.preventDefault();
          this.move(evt.which);
        }
      }
  }

  window.Select = Select;

})(this);