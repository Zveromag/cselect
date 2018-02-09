/***Autor Zveerko; GitHub (https://github.com/Zveromag/)***/
(function(window) {
  "use strict";

  function extend(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];

      if (!obj) continue;

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "object")
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
      throw new Error("el must be a Node");
    }

    this.mainSelect = el;

    this.activeClass = "is-active";
    this.isFocus = false;
    this.currentIndex = 0;

    // default options
    this.settings = extend(
      {
        animations: "",
        maxWidth: 0,
        onChange: function() {}
      },
      options
    );

    // Keybord shortcuts
    this.KEYS = {
      ENTER: 13,
      SPACE: 32,
      DOWN: 40,
      ESC: 27,
      UP: 38
    };

    // Create custom select wrapper
    this.slWrap = document.createElement("div");
    this.slWrap.className = "select-js__box";

    //  Create select name
    this.slTitle = document.createElement("div");
    this.slTitle.className = "select-js__name";
    // Add focus for accessibility
    this.slTitle.setAttribute("tabindex", 0);

    //  Create custom option list
    this.slList = document.createElement("ul");
    this.slList.className = "select-js__list";

    //  Get select options
    this.options = Array.prototype.slice.call(
      this.mainSelect.querySelectorAll("option")
    );

    // bind methods
    this.resizeEvent = this.position.bind(this);
    this.toggleEvent = this.toggle.bind(this);
    this.listEvent = this.clickItem.bind(this);
    this.nameEvent = this.clickName.bind(this);
    this.keybordEvent = this.keydown.bind(this);
    this.closeEvent = this.clickDocument.bind(this);
    this.hasFocus = this.focusState.bind(this);

    // create custom select
    this.createSelect();

    // Bind events
    this.slWrap.addEventListener("click", this.nameEvent);
    this.slList.addEventListener("click", this.listEvent);
    this.slTitle.addEventListener("click", this.toggleEvent);
    this.slTitle.addEventListener("keydown", this.keybordEvent);
    this.slTitle.addEventListener("focus", this.hasFocus);
    this.slTitle.addEventListener("blur", this.hasFocus);
    window.addEventListener("resize", this.resizeEvent);
    document.documentElement.addEventListener("click", this.closeEvent);
  }

  Select.prototype.focusState = function(evt) {
    // Check focus state
    var type = evt.type;
    this.isFocus = type === "focus" ? true : false;

    // When pressing a TAB key, save focus if the customselect is opened
    if (type === "blur" && this.isOpen) {
      this.close();
      this.slTitle.focus();
    }
  };

  // generate default options
  Select.prototype.genOptions = function(options) {
    var frag = document.createDocumentFragment();
    this.options.forEach(function(option) {
      var isSelected = option.hasAttribute("selected");
      var isDisabled = option.hasAttribute("disabled");
      var elItem = document.createElement("li");
      elItem.className = "select-js__item";
      elItem.dataset.selected = isSelected;
      if (isDisabled) {
        elItem.dataset.disabled = isDisabled;
        elItem.className = "select-js__item select-js__item--disabled";
      }
      elItem.dataset.get = option.value;
      elItem.textContent = option.textContent;

      frag.appendChild(elItem);
    });

    return frag;
  };
  // create new select
  Select.prototype.createSelect = function() {
    // this.slListExt.appendChild(this.genOptions());
    this.slList.appendChild(this.genOptions());
    // this.slWrap.appendChild(this.slListExt);
    this.slWrap.appendChild(this.slTitle);
    this.slWrap.appendChild(this.slList);
    this.mainSelect.parentNode.insertBefore(
      this.slWrap,
      this.mainSelect.nextSibling
    );

    // this.slTitle = this.slWrap.querySelector('.select-js__name');
    // this.slList = this.slWrap.querySelector('.select-js__list');
    this.slItems = Array.prototype.slice.call(
      this.slWrap.querySelectorAll(".select-js__item")
    );
    this.listHeight = this.slList.offsetHeight;
    this.listLength = this.slItems.length;
    this.mainSelectWidth =
      parseInt(this.settings.maxWidth) <= this.mainSelect.offsetWidth
        ? this.mainSelect.offsetWidth
        : parseInt(this.settings.maxWidth);
    this.isOpen = false;

    this.position();

    if (this.settings.animations.length > 0) {
      this.slList.classList.add(this.settings.animations);
    }

    // change selected el from new select
    this.slItems.forEach(
      function(item) {
        if (item.dataset.selected === "true") {
          this.slTitle.textContent = item.textContent;
          item.classList.add(this.activeClass);
        }
      }.bind(this)
    );

    // added hidden attribyte old select
    this.mainSelect.setAttribute("hidden", "hidden");
  };
  // set begins position select and set position on resize window
  Select.prototype.position = function() {
    var windowHeight = window.innerHeight;
    var selectHeight = this.slTitle.offsetHeight;
    var offsetTop = this.slWrap.offsetTop - window.pageYOffset;
    var offsetBottom = windowHeight - offsetTop - selectHeight;

    // initial started main block select max width
    if (this.settings.maxWidth) {
      this.slWrap.style.width = "100%";
      this.slWrap.style.maxWidth = this.settings.maxWidth + "px";
    } else {
      this.slWrap.style.width = this.mainSelectWidth + "px";
    }

    // set position list from select block
    if (offsetBottom <= offsetTop) {
      extend(this.slList.style, {
        top: "auto",
        bottom: selectHeight + "px",
        "border-bottom": 0,
        "border-top": ""
      });
    } else {
      extend(this.slList.style, {
        top: selectHeight + "px",
        bottom: "auto",
        "border-bottom": "",
        "border-top": 0
      });
    }

    if (this.settings.maxWidth) {
      extend(this.slList.style, {
        width: "100%",
        "max-width": this.settings.maxWidth + "px"
      });
    } else {
      this.slList.style.width = this.mainSelectWidth + "px";
    }
  };
  // moving activ item from list items
  Select.prototype.move = function(key) {
    var target = this.slList.querySelector("." + this.activeClass);
    this.currentIndex = indexElement(target, this.slItems);

    if (key === this.KEYS.DOWN) {
      this.moveDown();
    }
    if (key === this.KEYS.UP) {
      this.moveUp();
    }

    this.highlight(this.currentIndex);
    this.activated(this.currentIndex);
    this.scroll(this.currentIndex);
  };
  Select.prototype.moveDown = function() {
    var self = this;
    self.currentIndex += 1;
    var disabled = false;
    var nextEnabled = nextAll(self.slItems[self.currentIndex]).some(function(
      el
    ) {
      if (el.dataset.disabled) return false;
      else return true;
    });

    if (self.slItems[self.currentIndex]) {
      if (self.slItems[self.currentIndex].dataset.disabled) {
        disabled = true;
      }
    }
    if (self.currentIndex === self.listLength) {
      self.currentIndex -= 1;
    } else if (disabled && nextEnabled) {
      return self.moveDown();
    }
    if (disabled && !nextEnabled) {
      self.currentIndex -= 1;
    }
  };
  Select.prototype.moveUp = function() {
    var self = this;
    self.currentIndex -= 1;
    var disabled = false;
    var prevEnabled = prevAll(self.slItems[self.currentIndex]).some(function(
      el
    ) {
      if (el.dataset.disabled) return false;
      else return true;
    });

    if (self.slItems[self.currentIndex]) {
      if (self.slItems[self.currentIndex].dataset.disabled) {
        disabled = true;
      }
    }
    if (self.currentIndex === -1) {
      self.currentIndex += 1;
    } else if (disabled && prevEnabled) {
      return self.moveUp();
    }
    if (disabled && !prevEnabled) {
      self.currentIndex += 1;
    }
  };
  // activated focused item
  Select.prototype.highlight = function(highlightIndex) {
    this.slList
      .querySelector("." + this.activeClass)
      .classList.remove(this.activeClass);
    this.slItems[highlightIndex].classList.add(this.activeClass);
  };
  // updated first name from select
  Select.prototype.activated = function(highlightIndex) {
    var item = this.slItems[highlightIndex];
    this.slTitle.textContent = item.textContent;
  };
  // activated selected item and activated item from old hidden select
  Select.prototype.get = function() {
    var getItem = this.slList.querySelector("." + this.activeClass);
    if (getItem.dataset.disabled) return;

    var index = indexElement(getItem, this.slItems);

    this.settings.onChange(getItem.dataset.get, getItem.textContent, index);
    this.options.forEach(function(option) {
      option.removeAttribute("selected");
    });
    this.options[index].setAttribute("selected", true);

    this.close();
  };
  // moving scroll
  Select.prototype.scroll = function(highlightIndex) {
    var slList = this.slList.getBoundingClientRect();
    var slOption = this.slItems[highlightIndex].getBoundingClientRect();

    if (slList.top > slOption.top) {
      this.slList.scrollTop = this.slList.scrollTop - slList.top + slOption.top;
    } else if (slList.bottom < slOption.bottom) {
      this.slList.scrollTop =
        this.slList.scrollTop - slList.bottom + slOption.bottom;
    }
  };
  // added and removing active class in the list item
  Select.prototype.toggle = function() {
    if (!this.isOpen) this.position();

    this.slTitle.classList.toggle("is-open");
    this.slList.classList.toggle("is-open");
    this.isOpen = !this.isOpen;
  };
  // close item list
  Select.prototype.close = function(evt) {
    if (this.isOpen) {
      this.slTitle.classList.remove("is-open");
      this.slList.classList.remove("is-open");
      this.isOpen = false;
    }
  };
  // event clicked item
  Select.prototype.clickItem = function(evt) {
    var target = evt.target.closest("li");

    if (!target) return;
    if (target.dataset.disabled) return;

    var index = indexElement(target, this.slItems);
    this.highlight(index);
    this.activated(index);
    this.get(index);
  };
  // event clicked name main select
  Select.prototype.clickName = function(evt) {
    if (evt.target.closest(".select-js__name")) return;

    this.isOpen && this.close();
  };
  // event keybord key
  Select.prototype.keydown = function(evt) {
    // if (this.isOpen) {
    if (this.isFocus) {
      if (evt.which === this.KEYS.ENTER) {
        this.get();
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
      }
    }
  };
  // event click document close select list
  Select.prototype.clickDocument = function(evt) {
    if (evt.target.classList.contains("select-js__name")) return;
    this.close();
  };
  // destroy plugins
  Select.prototype.destroy = function() {
    this.slList.removeEventListener("click", this.listEvent);

    this.slTitle.removeEventListener("click", this.toggleEvent);
    this.slTitle.removeEventListener("keydown", this.keybordEvent);
    this.slTitle.removeEventListener("focus", this.hasFocus);
    this.slTitle.removeEventListener("blur", this.hasFocus);

    this.slWrap.removeEventListener("click", this.nameEvent);
    window.removeEventListener("resize", this.resizeEvent);
    document.documentElement.removeEventListener("click", this.closeEvent);

    this.slWrap.removeChild(this.slList);
    this.slWrap.removeChild(this.slTitle);
    this.slWrap.parentNode.removeChild(this.slWrap);
    this.mainSelect.removeAttribute("hidden");

    // clear object
    for (var name in this) {
      delete this[name];
    }
  };

  window.Select = Select;
})(this);
