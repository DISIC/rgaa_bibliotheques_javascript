/**
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2015 Jérôme Botineau (V-Technologies) pour le compte de la DISIC
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
/*global angular:false */
'use strict';

angular.module('a11yBootstrap', ['ui.bootstrap'])


.factory('getUID', function(){
  return function(prefix){
    do {
      prefix += Math.floor(Math.random() * 1000000);
    } while (document.getElementById(prefix));
    return prefix;
  };
})
.directive('uniqueId',  ['getUID',function(getUID){
  return {
    restrict:'A',
    link: function(scope, element, attrs) {
      var uniqueId = getUID(attrs.uniqueId+'-');
      scope.uniqueId = uniqueId;
    }
  };
}])


.directive('enforceFocus', ['$document', '$timeout',function($document, $timeout){
  return {
    link: function($scope, iElm) {
      //Save current focus
      var modalOpener = $document[0].activeElement;
      $timeout(function(){
        iElm[0].focus();
      });

      //enforceFocus inside modal
      function enforceFocus(evt) {
        if (iElm[0] !== evt.target && !iElm[0].contains(evt.target)) {
          iElm[0].focus();
        }
      }
      $document[0].addEventListener('focus', enforceFocus, true);


      $scope.$on('$destroy',function() {
        //back to first focus
        modalOpener.focus();
        //Remove event listener
        $document[0].removeEventListener('focus', enforceFocus, true);
      });

      var tababbleSelector = 'a[href], area[href], input:not([disabled]), button:not([disabled]),select:not([disabled]), textarea:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]';
      //return lastFocusable element inside modal
      function lastFocusable(domEl) {
        var list = domEl.querySelectorAll(tababbleSelector);
        return list[list.length - 1];
      }
      var lastEl = lastFocusable(iElm[0]);
      //focus lastElement when shitKey Tab on first element
      function shiftKeyTabTrap (evt) {
        if(iElm[0] === evt.target && evt.shiftKey && evt.keyCode === 9){
          lastEl.focus();
          evt.preventDefault();
        }
      }
      iElm.bind('keydown', shiftKeyTabTrap);
    }
  };
}])

.directive('tabpanel', ['getUID', '$timeout',function(getUID, $timeout){
  return {
    link: function($scope, iElm) {


      function render() {

        var tablist = iElm[0].firstElementChild;
        var tabs = angular.element(tablist).children();

        var tabContent = iElm[0].lastElementChild;
        var tabpanels = angular.element(tabContent).children();

        angular.forEach(angular.element(tabs), function(value, key){

          var tab = angular.element(value);
          var panel = angular.element(tabpanels[key]);

          var idtab = getUID('tab-');
          tab.attr('id', idtab);
          panel.attr('aria-labelledby', idtab);

          var idpanel = getUID('panel-');
          panel.attr('id', idpanel);
          tab.attr('aria-controls', idpanel);

        });
      }

      $timeout(render,0);

    }
  };
}])

.directive('tooltipPopup', ['getUID',function(getUID){
  return {
    link: function($scope, iElm) {
      //Add role tooltip
      iElm.attr('role', 'tooltip');
      //Add a Unique ID
      var idtooltip = getUID('tooltip-');
      iElm.attr('id', idtooltip);
      var originElement = angular.element(iElm[0].previousElementSibling);
      originElement.attr('aria-describedby', idtooltip);

      //Remove tooltip on keyup ESC
      function dismissTooltip (e) {
        if(e.keyCode === 27){
          iElm.remove();
        }
      }
      originElement.bind('keyup', dismissTooltip);

      $scope.$on('$destroy',function() {
        originElement.removeAttr('aria-describedby');
        originElement.unbind('keyup', dismissTooltip);
      });

    }
  };
}])

.controller('GroupController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

  // This array keeps track of the accordion groups
  this.groups = [];
  this.groupsElem = [];

  // This is called from the accordion-group directive to add itself to the accordion
  this.addGroup = function(groupScope, element) {
    var that = this;
    this.groups.push(groupScope);
    this.groupsElem.push(element);

    groupScope.$on('$destroy', function (event) {
      that.removeGroup(groupScope);
    });
  };

  // This is called from the accordion-group directive when to remove itself
  this.removeGroup = function(group) {
    var index = this.groups.indexOf(group);
    if ( index !== -1 ) {
      this.groups.splice(index, 1);
      this.groupsElem.splice(index, 1);
    }
  };

  this.initFocusable = function() {
    var that = this;
    angular.forEach(this.groups, function (group, index) {
      if ( index === 0 ) {
        group.isFocused = true;
        that.groups.indexSelected = 0;
      }
    });
  };

  this.nextFocusable = function(change) {
    this.groups.indexSelected = this.modulo(this.groups.indexSelected + change,this.groups.length);
    this.changeSelected();
    var focusElement = this.groupsElem[this.groups.indexSelected];
    focusElement[0].focus();
  };

  this.elemFocus = function(group) {
    var index = this.groups.indexOf(group);
    this.groups.indexSelected = index;
    this.changeSelected();
  };

  this.changeSelected = function() {
    var that = this;
    angular.forEach(this.groups, function (group, index) {
      group.isFocused = false;
      if ( index === that.groups.indexSelected ) {
        group.isFocused = true;
      }
    });
  };

  this.modulo = function(i, iMax) {
    return ((i % iMax) + iMax) % iMax;
  };

}])

// The group directive simply sets up the directive controller
.directive('group', function () {
  return {
    restrict:'EA',
    controller:'GroupController',
    priority: 10000,
    link: function(scope, element, attrs, groupCtrl) {
      groupCtrl.initFocusable();
    }
  };
})

// The group-item directive indicates a block of html that will expand and collapse in an accordion
.directive('groupItem', ['$timeout',function($timeout) {
  return {
    require:'^group',
    restrict:'EA',
    priority: 10000,
    scope: true,
    link: function(scope, element, attrs, groupCtrl) {
      scope.isFocused = false;
      groupCtrl.addGroup(scope, element);

      function KeyTrap (evt) {
        var keyCode = evt.keyCode;
        //Right key and up key
        if (keyCode === 39 || keyCode === 40) {
          groupCtrl.nextFocusable(1);
          scope.$apply();
        }
        //Left key and down key
        if (keyCode === 37 || keyCode === 38) {
          groupCtrl.nextFocusable(-1);
          scope.$apply();
        }
      }

      element.on('keydown',KeyTrap);
      element.on('click', function() {
        groupCtrl.elemFocus(scope);
        scope.$apply();
      });

    }
  };
}])

.directive('keySpace', function() {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if(event.which === 32) {
        scope.$apply(function(){
          scope.$eval(attrs.keySpace);
        });
        event.preventDefault();
      }
    });
  };
})

.directive('keyboardRotate',['$document','$timeout',function($document,$timeout){
  return {
    restrict: 'A',
    scope: {
      param : '@keyboardRotate',
    },
    link: function($scope, iElm, iAttrs, controller) {
      var recursion = $scope.param;
      $timeout(function(){
        function KeyTrap (evt) {
          var next;
          var keyCode = evt.keyCode;
          //Right key and up key
          if (keyCode === 39 || keyCode === 40) {
            next = evt.target.nextElementSibling;
            if (recursion === '1') {
              next = evt.target.parentElement.nextElementSibling;
            }
            //if last go to first
            if (!next) {
              next = iElm.children()[0];
            }
          }
          //Left key and down key
          if (keyCode === 37 || keyCode === 38) {
            next = evt.target.previousElementSibling;
            if (recursion === '1') {
              next = evt.target.parentElement.previousElementSibling;
            }
            //if first go to last
            if (!next) {
              var child = iElm.children();
              next = child[child.length-1];
            }
          }
          //go to next element if defined (previous or next)
          if (next) {
            if (recursion === '1') {
              next = next.children[0];
            }
            next.click();
            next.focus();
          }
        }
        angular.element(iElm[0]).on('keydown',KeyTrap);
      },0);
    }
  };
}])

.directive('btnRadio', [function(btnRadioProvider){
  return {
    require: ['btnRadio', 'ngModel'],
    priority: 200, //Make sure watches are fired after any other directives that affect the ngModel value
    link: function($scope, iElm, iAttrs, controller) {
      var buttonsCtrl = controller[0], ngModelCtrl = controller[1];

      //model -> UI
      ngModelCtrl.$render = function () {
        var check = angular.equals(ngModelCtrl.$modelValue, $scope.$eval(iAttrs.btnRadio));
        iElm.attr('aria-checked', check);
        iElm.attr('tabindex', '-1');
        if (check) {
          iElm.attr('tabindex', '0');
        }
        iElm.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, $scope.$eval(iAttrs.btnRadio)));
      };

    }
  };
}])

.directive('btnCheckbox', [function(btnRadioProvider){
  return {
  	require: ['btnCheckbox', 'ngModel'],
    priority: 200, //Make sure watches are fired after any other directives that affect the ngModel value
    link: function($scope, iElm, iAttrs, controller) {
      var buttonsCtrl = controller[0], ngModelCtrl = controller[1];

      function getTrueValue() {
        return getCheckboxValue(iAttrs.btnCheckboxTrue, true);
      }

      function getCheckboxValue(attributeValue, defaultValue) {
        var val = $scope.$eval(attributeValue);
        return angular.isDefined(val) ? val : defaultValue;
      }

      //model -> UI
      ngModelCtrl.$render = function () {
      	var check = angular.equals(ngModelCtrl.$modelValue, getTrueValue());
        iElm.attr('aria-checked', check);
        iElm.toggleClass(buttonsCtrl.activeClass, check);
      };

    }
  };
}])

.directive('datepickerPopupWrap', ['$document', '$timeout', function($document, $timeout){
  return {
    link: function($scope, iElm, iAttrs, controller) {

      var elemOpener;
      $scope.$watch('isOpen', function(value) {
        if (value) {
          elemOpener = $document[0].activeElement;
        }
      });

      function backToElemOpener (evt) {
        if (evt.which === 27) {
          $timeout(function() {
            elemOpener.focus();
          });
        }
      }
      //Add event listener
      iElm.bind('keydown', backToElemOpener);


      $scope.$on('$destroy',function() {
        //Remove event listener
        iElm.unbind('keydown', backToElemOpener);
      });
    }
  };
}]);

//Templates
angular.module('template/datepicker/day.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('template/datepicker/day.html',
    '<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n' +
    '  <thead>\n' +
    '    <tr>\n' +
    '      <th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>\n' +
    '      <th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>\n' +
    '      <th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>\n' +
    '    </tr>\n' +
    '    <tr>\n' +
    '      <th ng-show="showWeeks" class="text-center"></th>\n' +
    '      <th role="columnheader" ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>\n' +
    '    </tr>\n' +
    '  </thead>\n' +
    '  <tbody>\n' +
    '    <tr role="row" ng-repeat="row in rows track by $index">\n' +
    '      <td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n' +
    '      <td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">\n' +
    '        <button type="button" style="width:100%;" class="btn btn-default btn-sm" aria-selected="{{dt.selected ? \'true\' : \'false\'}}" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </tbody>\n' +
    '</table>\n' +
    '');
}]);


angular.module('template/accordion/accordion-group.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('template/accordion/accordion-group.html',
    '<div unique-id="accordion" class="panel panel-default">\n' +
    '  <div role="tab" class="panel-heading">\n' +
    '    <h4 id="{{uniqueId}}" class="panel-title">\n' +
    '      <a group-item aria-selected="{{isOpen}}" tabindex="{{isFocused ? \'0\' : \'-1\'}}" aria-expanded="{{isOpen}}" href class="accordion-toggle" key-space="toggleOpen()" ng-click="toggleOpen()" accordion-transclude="heading"><span ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n' +
    '    </h4>\n' +
    '  </div>\n' +
    '  <div role="tabpanel" aria-labelledby="{{uniqueId}}" aria-hidden="{{!isOpen}}" class="panel-collapse" collapse="!isOpen">\n' +
    '   <div class="panel-body" ng-transclude></div>\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);

angular.module('template/accordion/accordion.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('template/accordion/accordion.html',
    '<div group role="tablist" class="panel-group" ng-transclude></div>');
}]);

angular.module("template/modal/window.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/modal/window.html",
    "<div><div enforce-focus tabindex=\"-1\" aria-labelledby=\"titre-modal\" role=\"dialog\" class=\"modal fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
    "    <div class=\"modal-dialog\" ng-class=\"{'modal-sm': size == 'sm', 'modal-lg': size == 'lg'}\"><div class=\"modal-content\" modal-transclude></div></div>\n" +
    "</div><div tabindex=\"0\"></div></div>");
}]);
