/**
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2015 Simon Bonaventure (V-Technologies) pour le compte de la DISIC
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

 /* global jQuery:false */


 (function ($) {
 	'use strict';

	// Accordion Extension
	// ===============================	
	$.widget( 'ui.accordion', $.ui.accordion, {
		_toggleComplete: function(data) {
			this._super( data );			
			if(
				typeof(data.newHeader[0]) === typeof undefined && 
				typeof(data.oldHeader[0]) !== typeof undefined && 
				typeof($('#'+data.oldHeader[0].id)) !== typeof undefined
				) {
				$('#' + data.oldHeader[0].id).attr('aria-expanded', false);
			}
		}
	}),

	// Dialog Extension
	// ===============================	
	$.widget( 'ui.dialog', $.ui.dialog, {
		open: function() {
			this._super();
			if (this.options.dialogClass !== null && this.options.dialogClass !== '') {
				var elementsFocusable = $('.' + this.options.dialogClass + ' :focusable');
				if (elementsFocusable[0]) {
					elementsFocusable[0].focus();
				}
			}
		}
	}),

	// Progressbar Extension
	// ===============================
	$.widget( 'ui.progressbar', $.ui.progressbar, {
		_create: function( event, index ) {
			// Si une région est défini
			if (typeof(this.options.region !== typeof undefined)) {
				// si la région est défini en string, on recherche le node avec l'id associé
				if(jQuery.type(this.options.region) === 'string') {
					this.options.region = $('#' + this.options.region);
				}
				this.options.region.attr('aria-describedby', this.element[0].id);
			}
			// Si un labelledby est défini
			if (typeof(this.options.labelledby !== typeof undefined)) {
				if(jQuery.type(this.options.labelledby) === 'string') {
					// si la région est défini en string, on ajoute un attr 'title'
					this.element.attr('title', this.options.labelledby);
				}else if(jQuery.type(this.options.labelledby) === 'object'){
					// sinon, on ajout l'id du node associé dans le aria-labelledby
					this.element.attr('aria-labelledby', this.options.labelledby[0].id);
				}
			}
			this._super( event, index );
			if(typeof(this.element.attr('aria-valuemax')) === typeof undefined) {
				this.element.attr('aria-valuemax', this.options.max);
			}
		},
		_destroy: function( event, index ) {
			var attr = this.element.attr('aria-valuetext');
			if (typeof attr !== typeof undefined && attr !== false) {
				this.element.removeAttr( 'aria-valuetext' );
			}
			this._super( event, index );
		},
		_refreshValue: function(event, index ) {
			this._super( event, index );
			// MAj de l'attribut aria-valuetext
			if ( !this.indeterminate ) {
				var valuetext = this.options.value;
				if(typeof(this.options.ariaValuetextPrefix !== typeof undefined)) {
					valuetext = this.options.ariaValuetextPrefix + ' ' + valuetext;
				}
				if(typeof(this.options.ariaValuetextSuffix !== typeof undefined)) {
					valuetext += ' ' + this.options.ariaValuetextSuffix;
				}
				this.element.attr({
					'aria-valuetext': valuetext
				});
			}
			if(typeof(this.options.region !== typeof undefined)) {
				if (this.options.value === this.options.max) {
					// Suppression de l'attribut aria-busy si on est arrivés au bout de la progressbar
					this.options.region.attr('aria-busy', false);
				}else if(!this.indeterminate && this.options.value !== 0){
					this.options.region.attr('aria-busy', true);
				}
			}
		}
	}),


	// Datepicker Extension
	// ===============================
	$( '#datepicker' ).datepicker({
		showOn: 'button',
		buttonText: 'Choisir une date',
		onClose : function(){
			$( '#datepicker' ).focus();
		}
	});

	// Interdiction de la navigation au clavier dans le composant
	$('#datepicker').next().attr('tabindex', '-1');
	// Masquage du composant pour les technologies d'assitance
	$('#ui-datepicker-div').attr('aria-hidden', 'true');
	$('#ui-datepicker-div :focusable').attr('tabindex', '-1');

  // Slider Extension
  // ===============================
  $.widget( 'ui.slider', $.ui.slider, {
    _createHandles: function () {
      this._super();
      var newVal, attrHandle,
      self = this,
      options = this.options;
      this.handles.each(function(index) {
        //Set constant attribut
        attrHandle = {
          'role':'slider',
          'aria-valuemin':options.min,
          'aria-valuemax':options.max,
        };

        if (typeof(options.label[index] !== typeof undefined)) {
          if(jQuery.type(options.label[index]) === 'string') {
            attrHandle.title =  options.label[index];
          }else if(jQuery.type(options.label[index]) === 'object' && options.label[index].length > 0){
            attrHandle['aria-labelledby'] =  options.label[index][0].id;
          }
        }
        $(this).attr(attrHandle);
        //Set live attribut
        if ( options.values && options.values.length ) {
          newVal = self.values( index );
        } else {
          newVal = self.value();
        }
        self._updateHandles(index, newVal);
      });
    },
    _slide: function(event, index, newVal) {
      this._super(event, index, newVal);
      //Set live attribut
      this._updateHandles(index, newVal);
    },
    _updateHandles: function(index, newVal) {
      var options = this.options,
          attrHandle = {};

      if (options.ariaValuetext) {
            attrHandle['aria-valuetext'] =  newVal + ' ' + options.ariaValuetext;
      }

      attrHandle['aria-valuenow'] =  newVal;
      $(this.handles[index]).attr(attrHandle);
    }
  });

}(jQuery));