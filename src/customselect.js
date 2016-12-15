(function($) {

  'use strict';

  $.fn.select = function(options) {

    var active = 'is-active';
    var defaults = $.extend({
      animations : '',
      maxWidth : 0,
      onChange : function(){}
    }, options);

    var KEYS = {
      ENTER: 13,
      DOWN: 40,
      ESC: 27,
      UP: 38
    };
    var template = '<div class="select-js__box">'+
                      '<div class="select-js__name"></div>' +
                      '<ul class="select-js__list">'+
                        '{list}'+
                      '</ul>'+
                    '</div>';

    return this.each(function() {
      var $select = $(this);
      var $options = $select.find('option');
      var liArr = [];

      $options.each(function(){
        var $this = $(this);
        var isSelected = !!$this.prop('selected');
        liArr.push('<li class="select-js__item" data-selected="'+(isSelected)+'" data-get="'+$this.val()+'">'+$this.text()+'</li>');
      });

      $select.after( template.replace( '{list}', liArr.join('') ) ).attr('hidden', 'hidden');

      var $selectWrap = $select.next('.select-js__box');
      var $selectName = $selectWrap.find('.select-js__name');
      var $selectItem = $selectWrap.find('.select-js__item');
      var $selectList = $selectWrap.find('.select-js__list');
      var listHeight = $selectList.outerHeight();
      var lengthList = $selectItem.length;
      var selectWidth = (~~defaults.maxWidth <= $select.outerWidth()) ? $select.outerWidth() : ~~defaults.maxWidth;
      var isOpen = false;

      function position() {
        var $window = $(window);
        var winHeight = $window.height();
        var selectHeight = $selectName.outerHeight();
      	var offsetTop = $selectWrap.offset().top - window.pageYOffset;
        var offsetBottom = winHeight - offsetTop - selectHeight;
        if(offsetBottom <= offsetTop) {
          $selectList.css({
          	'top' : '',
            'bottom' : selectHeight,
            'border-bottom' : 0,
            'border-top' : ''
          });
        } else {
                  	$selectList.css({
          	'top' : selectHeight,
            'bottom' : '',
            'border-top' : 0,
            'border-bottom' : ''
          });

        }

      }

      $selectList.css('max-width',selectWidth).addClass(defaults.animations);

      if(defaults.maxWidth) {
        $selectWrap.css({
          'width' : '100%',
          'max-width' : defaults.maxWidth
        });
      }
      else {
        $selectWrap.css('width', $select.outerWidth());
      }

      $selectItem.each(function(){
        var $this = $(this);
        if ($this.data('selected') === true) {
            $selectName.text($this.text());
            $this.addClass(active);
        }
      })

      $(window).on('resize', position);
      $selectName.on('click', toggle);
      $selectItem.on('click', function(evt){
        var index = $(this).index();
        highlight(index);
        activated(index);
        get();
      });
      $(document)
        .on('click', function(evt) {
          if($(evt.target).hasClass('select-js__name')) return;
          isOpen && close();
        })
        .on('keydown', function(evt) {
          if(isOpen) {
            if(evt.which === KEYS.ESC || evt.which === KEYS.ENTER) {
              get();
            }
            if(evt.which === KEYS.UP  || evt.which === KEYS.DOWN) {
              evt.preventDefault();
              move(evt.which);
            }
          }
        })

      function move(key) {
        var highlightIndex = $selectList.find('.'+active).index();

        if(!(highlightIndex >= 0)) return;

        if(key === KEYS.UP) {
          highlightIndex -= 1;
        }

        if(key === KEYS.DOWN) {
          highlightIndex += 1;
        }

        if(highlightIndex < 0 || highlightIndex >= lengthList ) {
          return;
        }

        highlight(highlightIndex);
        activated(highlightIndex);
        scroll(highlightIndex);
      }

      function highlight(highlightIndex) {
        $selectList.find('.'+active).removeClass(active);
        $selectItem.eq(highlightIndex).addClass(active);
      }

      function activated(highlightIndex) {
        var $item = $selectItem.eq(highlightIndex);
        $selectName.text($item.text());
      }

      function get() {
        var $getItem = $selectList.find('.' + active);
        defaults.onChange($getItem.data('get'));
        $options
          .attr('selected', false)
          .eq($getItem.index())
          .attr('selected', true);
        close();
      }

      function scroll(highlightIndex) {
        var listScroll = $selectList[0].scrollHeight;
        var listScrollTop = $selectList.scrollTop();

        if(listScroll > listHeight) {
          var itemOffset = $selectItem.eq(highlightIndex).offset().top;
          var listOffset = $selectList.offset().top;
          $selectList.scrollTop(itemOffset - (listOffset-listScrollTop));
        }
      }

      function toggle() {
        if(!isOpen) position();
        $selectName.toggleClass('is-open');
        $selectList.toggleClass('is-open');
        isOpen = (isOpen) ? false : true;
      }

      function close() {
        $selectName.removeClass('is-open');
        $selectList.removeClass('is-open');
        isOpen = false;
      }

    })
  };

})(jQuery);