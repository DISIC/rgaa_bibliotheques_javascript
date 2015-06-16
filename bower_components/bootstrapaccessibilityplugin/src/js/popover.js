  // Popover Extension
  // ===============================
  
  var showPopover =   $.fn.popover.Constructor.prototype.setContent
      , hidePopover =   $.fn.popover.Constructor.prototype.hide

    $.fn.popover.Constructor.prototype.setContent = function(){
      showPopover.apply(this, arguments)
      var $tip = this.tip()
        , tooltipID = $tip.attr('id') || uniqueId('ui-tooltip')
      $tip.attr({'role':'alert','id' : tooltipID})
      this.$element.attr('aria-describedby', tooltipID)
      this.$element.focus()
    }
    $.fn.popover.Constructor.prototype.hide =  function(){
        hidePopover.apply(this, arguments)
        removeMultiValAttributes(this.$element, 'aria-describedby', this.tip().attr('id'))
        return this
    }
