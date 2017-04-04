/*
 * Angular Material Time Picker
 * https://github.com/mattbajorek/md-time-picker
 * @license MIT
 * v0.0.1
 */
(function(window, angular, undefined) {
  'use strict';

  function increase(value, min, max, type) {
    var num = parseInt(value);
    if (isNaN(num) || num === max)
      num = min;
    else
      num++;
    if (type === 'MM')
      return format(num);
    return String(num);
  }

  function decrease(value, min, max, type) {
    var num = parseInt(value);
    if (isNaN(num) || num === min)
      num = max;
    else
      num--;
    if (type === 'MM')
      return format(num);
    return String(num);
  }

  function format(num) {
    if (num < 10)
      return '0' + String(num);
    return String(num);
  }

  function handleInput(value, max, blur, type) {
    var num = parseInt(value);
    if (type === 'HH' && num === 0) return;
    if (num > max)
      return String(num)[0];
    else if (!isNaN(num)) {
      if (value.length === 2 || (blur && type === 'MM'))
        return format(num);
      return String(num);
    }
  }

  function TimePickerCtrl($scope, $mdDialog, time, noMeridiem, autoSwitch, $mdMedia) {
    var self = this;

    this.time = new Date(time.getTime());
    this.noMeridiem = noMeridiem;
    if (!noMeridiem)
      this.meridiem = time.getHours() < 12 ? 'AM' : 'PM';

    this.VIEW_HOURS = 1;
    this.VIEW_MINUTES = 2;
    this.currentView = this.VIEW_HOURS;
    this.autoSwitch = !!autoSwitch;

    $scope.$mdMedia = $mdMedia;

    this.switchView = function() {
      self.currentView = self.currentView == self.VIEW_HOURS ? self.VIEW_MINUTES : self.VIEW_HOURS;
    };

    this.hours = function() {
      var hours = self.time.getHours();
      if (noMeridiem) return hours;
      if (hours > 12) return hours-12;
      else if (hours === 0) return 12;
      return hours;
    }

    this.minutes = function() {
      return format(self.time.getMinutes());
    }

    this.setAM = function() {
      var hours = self.time.getHours();
      if (hours >= 12) {
        self.time.setHours(hours - 12);
        self.meridiem = 'AM';
      }
    };

    this.setPM = function() {
      var hours = self.time.getHours();
      if (hours < 12) {
        self.time.setHours(hours + 12);
        self.meridiem = 'PM';
      }
    };

    this.cancel = function() {
      $mdDialog.cancel();
    };

    this.confirm = function() {
      $mdDialog.hide(this.time);
    };
  }

  function ClockCtrl($scope) {
    var TYPE_HOURS = "hours";
    var TYPE_MINUTES = "minutes";
    var self = this;

    this.noMeridiem = $scope.$parent.timepicker.noMeridiem;

    this.STEP_DEG = this.noMeridiem ? 360/24 : 360/12;
    this.STEP_DEG_MINUTES = 360/12;
    this.steps = [];

    this.CLOCK_TYPES = {
      "hours": {
        range: this.noMeridiem ? 24 : 12,
      },
      "minutes": {
        range: 60,
      }
    }

    this.getPointerStyle = function() {
      var divider = 1;
      switch (self.type) {
        case TYPE_HOURS:
          divider = self.noMeridiem ? 24 : 12;
          break;
        case TYPE_MINUTES:
          divider = 60;
          break;
      }
      var degrees = Math.round(self.selected * (360 / divider)) - 180;
      return {
        "-webkit-transform": "rotate(" + degrees + "deg)",
        "-ms-transform": "rotate(" + degrees + "deg)",
        "transform": "rotate(" + degrees + "deg)"
      }
    };

    this.setTimeByDeg = function(deg) {

      var divider = 0;
      switch (self.type) {
        case TYPE_HOURS:
          divider = self.noMeridiem ? 24 : 12;
          break;
        case TYPE_MINUTES:
          divider = 60;
          break;
      }

      var time = Math.round(divider / 360 * deg);
      if (!self.noMeridiem && self.type === "hours" && time === 0)
        time = 12;
      else if (self.type === "minutes" && time === 60)
        time = 0;
      self.setTime(time);
    };

    this.setTime = function(time) {

      this.selected = time;

      switch (self.type) {
        case TYPE_HOURS:
          if (!self.noMeridiem) {
            var PM = this.time.getHours() >= 12 ? true : false;
            if (PM && time != 12)
              time += 12;
            else if (!PM && time === 12)
              time = 0;
          }
          this.time.setHours(time);
          break;
        case TYPE_MINUTES:
          this.time.setMinutes(time);
          break;
      }

    };

    this.init = function() {

      self.type = self.type || "hours";

      switch (self.type) {
        case TYPE_HOURS:
          if (self.noMeridiem) {
            for (var i = 1; i <= 23; i++)
              self.steps.push(i);
            self.steps.push(0);
            self.selected = self.time.getHours() || 0;
          }
          else {
            for (var i = 1; i <= 12; i++)
              self.steps.push(i);
              self.selected = self.time.getHours() || 0;
              if (self.selected > 12) self.selected -= 12;
          }

          break;
        case TYPE_MINUTES:
          for (var i = 5; i <= 55; i += 5)
            self.steps.push(i);
          self.steps.push(0);

          self.selected = self.time.getMinutes() || 0;

          break;
      }
    };

    this.init();
  }

  angular.module('md.time.picker', ['ngMessages'])

    .directive('mdHoursMinutes', function() {

      return {

        restrict: 'E',
        scope: {
          type: '@',
          message: '@',
          ngModel: '='
        },
        template: '<md-input-container md-no-float>' +
          '<input required ' +
          'type="text"' +
          'name="time_{{type}}"' +
          'ng-model="time[type]"' +
          'ng-change="handleInput()"' +
          'placeholder="{{type}}"' +
          'maxlength="2"' +
          'ng-blur="handleInput(true)"' +
          'ng-keydown="handleKeypress($event)"/>' +
          '<span class="md-up-arrow" aria-hidden="true" ng-click="increase()"></span>' +
          '<span class="md-down-arrow" aria-hidden="true" ng-click="decrease()"></span>' +
          '<div class="time-error-messages" ng-messages="$parent.timeForm[\'time_\' + type].$error" role="alert">' +
          '<div ng-message="required">{{message}}</div>' +
          '</div>' +
          '</md-input-container>',
        controller: function($scope) {

          if ($scope.type === "HH") {
            if ($scope.$parent.noMeridiem) {
              $scope.min = 0;
              $scope.max = 23;
            } else {
              $scope.min = 1;
              $scope.max = 12;
            }
          } else {
            $scope.min = 0;
            $scope.max = 59;
          }

          function setTime() {
            if ($scope.type === "HH") {
              var hours = $scope.$parent.ngModel.getHours();
              if (!$scope.$parent.noMeridiem) {
                if (hours > 12)
                  hours -= 12;
                else if (hours === 0)
                  hours += 12;
              }
              $scope.time.HH = String(hours);
            } else
              $scope.time.MM = format($scope.$parent.ngModel.getMinutes());
          }

          $scope.time = {};
          setTime();

          var removeListener = $scope.$on('mdpTimeUpdated', setTime);
          $scope.$on('$destroy', removeListener);

          function updateTime(next) {
            if ($scope.type === 'HH')
              $scope.ngModel.setHours(next);
            else
              $scope.ngModel.setMinutes(next);
          }

          $scope.increase = function() {
            var next = increase($scope.time[$scope.type], $scope.min, $scope.max, $scope.type)
            $scope.time[$scope.type] = next;
            updateTime(parseInt(next));
          }

          $scope.decrease = function() {
            var next = decrease($scope.time[$scope.type], $scope.min, $scope.max, $scope.type);
            $scope.time[$scope.type] = next;
            updateTime(parseInt(next));
          }

          $scope.handleInput = function(blur) {
            $scope.time[$scope.type] = handleInput($scope.time[$scope.type], $scope.max, blur, $scope.type);
          }

          $scope.handleKeypress = function(ev) {
            if (ev.keyCode === 38) $scope.increase();
            else if (ev.keyCode === 40) $scope.decrease();
          }

        }
      }

    })

    .directive('mdMeridiem', function() {

      return {

        restrict: 'E',
        scope: {
          message: '@'
        },
        template: '<md-input-container md-no-float>' +
          '<md-select ' +
          'required ' +
          'name="meridiem"' +
          'ng-model="meridiem"' +
          'ng-change="updateTime()"' +
          'placeholder="AM/PM"' +
          'flex-gt-sm>' +
          '<md-option value="AM">AM</md-option>' +
          '<md-option value="PM">PM</md-option>' +
          '</md-select>' +
          '<div class="time-error-messages" ng-messages="$parent.timeForm.meridiem.$error" role="alert">' +
          '<div ng-message="required">{{message}}</div>' +
          '</div>' +
          '</md-input-container>',
        controller: function($scope) {

          function setMeridiem() {
            var hours = $scope.$parent.$parent.ngModel.getHours();
            $scope.meridiem = hours >= 0 && hours < 12 ? 'AM' : 'PM';
          }

          setMeridiem();

          $scope.updateTime = function() {
            var hours = $scope.$parent.$parent.ngModel.getHours();
            if ($scope.meridiem === 'AM') $scope.$parent.$parent.ngModel.setHours(hours-12);
            else $scope.$parent.$parent.ngModel.setHours(hours+12);
          }

          var removeListener = $scope.$on('mdpTimeUpdated', setMeridiem);
          $scope.$on('$destroy', removeListener);

        }

      }

    })

    .directive('mdTimePicker', function() {

      return {

        restrict: 'E',
        scope: {
          message: '<',
          ngModel: '='
        },
        template: '<form name="timeForm">' +
          '<button class="md-icon-button md-button md-ink-ripple" type="button" ng-click="showPicker($event)">' +
          '<md-icon>' +
          '<i class="material-icons">&#xE192;</i>' +
          '</md-icon>' +
          '<div class="md-ripple-container"></div>' +
          '</button>' +
          '<md-hours-minutes type="HH" ng-model="ngModel" message="{{message.hour}}"></md-hours-minutes>' +
          '<span class="time-colon">:</span>' +
          '<md-hours-minutes type="MM" ng-model="ngModel" message="{{message.minute}}"></md-hours-minutes>' +
          '<md-meridiem ng-if="!noMeridiem" message="{{message.meridiem}}"></md-meridiem>' +
          '</form>',
        controller: function($scope, $mdpTimePicker, $attrs) {

          if (!angular.isDate($scope.ngModel))
            throw "ng-model must be initialized as a date object";

          $scope.showPicker = function(ev) {

            $mdpTimePicker($scope.ngModel, $scope.noMeridiem, {
              targetEvent: ev,
              autoSwitch: !$scope.noAutoSwitch
            }).then(function(time) {
              $scope.ngModel = new Date(time.getTime());
              $scope.$broadcast('mdpTimeUpdated');
            });

          }
        },
        compile: function(tElement, tAttrs) {
          return {
            pre: function preLink(scope) {
              scope.noMeridiem = tAttrs.noMeridiem === "" ? true : false;
              scope.noAutoSwitch = tAttrs.noAutoSwitch === "" ? true : false;
            }
          }
        }

      }

    })

    .provider("$mdpTimePicker", function() {
      var LABEL_OK = "OK",
        LABEL_CANCEL = "Cancel";

      this.setOKButtonLabel = function(label) {
        LABEL_OK = label;
      };

      this.setCancelButtonLabel = function(label) {
        LABEL_CANCEL = label;
      };

      this.$get = ["$mdDialog", function($mdDialog) {
        var timePicker = function(time, noMeridiem, options) {

          return $mdDialog.show({
            controller: ['$scope', '$mdDialog', 'time', 'noMeridiem', 'autoSwitch', '$mdMedia', TimePickerCtrl],
            controllerAs: 'timepicker',
            clickOutsideToClose: true,
            template: '<md-dialog aria-label="" class="mdp-timepicker" ng-class="{ \'portrait\': !$mdMedia(\'gt-xs\') }">' +
              '<md-dialog-content layout-gt-xs="row" layout-wrap>' +
              '<md-toolbar layout-gt-xs="column" layout-xs="row" layout-align="center center" flex class="mdp-timepicker-time md-hue-1 md-primary">' +
              '<div class="mdp-timepicker-selected-time">' +
              '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_HOURS }" ng-click="timepicker.currentView = timepicker.VIEW_HOURS">{{ timepicker.hours() }}</span>:' +
              '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_MINUTES }" ng-click="timepicker.currentView = timepicker.VIEW_MINUTES">{{ timepicker.minutes() }}</span>' +
              '</div>' +
              '<div layout="column" class="mdp-timepicker-selected-ampm">' +
              '<span ng-if="timepicker.meridiem" ng-click="timepicker.setAM()" ng-class="{ \'active\': timepicker.meridiem === \'AM\' }">AM</span>' +
              '<span ng-if="timepicker.meridiem" ng-click="timepicker.setPM()" ng-class="{ \'active\': timepicker.meridiem === \'PM\' }">PM</span>' +
              '</div>' +
              '</md-toolbar>' +
              '<div>' +
              '<div class="mdp-clock-switch-container" ng-switch="timepicker.currentView" layout layout-align="center center">' +
              '<mdp-clock class="mdp-animation-zoom" auto-switch="timepicker.autoSwitch" time="timepicker.time" no-meridiem="noMeridiem" type="hours" ng-switch-when="1"></mdp-clock>' +
              '<mdp-clock class="mdp-animation-zoom" auto-switch="timepicker.autoSwitch" time="timepicker.time" type="minutes" ng-switch-when="2"></mdp-clock>' +
              '</div>' +

              '<md-dialog-actions layout="row">' +
              '<span flex></span>' +
              '<md-button ng-click="timepicker.cancel()" aria-label="' + LABEL_CANCEL + '">' + LABEL_CANCEL + '</md-button>' +
              '<md-button ng-click="timepicker.confirm()" class="md-primary" aria-label="' + LABEL_OK + '">' + LABEL_OK + '</md-button>' +
              '</md-dialog-actions>' +
              '</div>' +
              '</md-dialog-content>' +
              '</md-dialog>',
            targetEvent: options.targetEvent,
            locals: {
              time: time,
              noMeridiem: noMeridiem,
              autoSwitch: options.autoSwitch
            },
            skipHide: true
          });
        };

        return timePicker;
      }];
    })

    .directive("mdpClock", ["$animate", "$timeout", function($animate, $timeout) {
      return {
        restrict: 'E',
        bindToController: {
          'type': '@?',
          'time': '=',
          'autoSwitch': '=?'
        },
        replace: true,
        template: '<div class="mdp-clock">' +
          '<div class="mdp-clock-container">' +
          '<md-toolbar class="mdp-clock-center md-primary"></md-toolbar>' +
          '<md-toolbar ng-style="clock.getPointerStyle()" class="mdp-pointer md-primary">' +
          '<span class="mdp-clock-selected md-button md-raised md-primary"></span>' +
          '</md-toolbar>' +
          '<md-button ng-if="clock.type === \'minutes\'" ng-class="{ \'md-primary\': clock.selected == step }" class="md-icon-button md-raised mdp-clock-deg{{ ::(clock.STEP_DEG_MINUTES * ($index + 1)) }}" ng-repeat="step in clock.steps">{{ step }}</md-button>' +
          '<md-button ng-if="clock.type !== \'minutes\'" ng-class="{ \'md-primary\': clock.selected == step }" class="md-icon-button md-raised mdp-clock-deg{{ ::(clock.STEP_DEG * ($index + 1)) }}" ng-repeat="step in clock.steps">{{ step }}</md-button>' +
          '</div>' +
          '</div>',
        controller: ["$scope", ClockCtrl],
        controllerAs: "clock",
        link: function(scope, element, attrs, ctrl) {
          var pointer = angular.element(element[0].querySelector(".mdp-pointer")),
            timepickerCtrl = scope.$parent.timepicker;

          var onEvent = function(event) {
            var containerCoords = event.currentTarget.getClientRects()[0];
            var x = ((event.currentTarget.offsetWidth / 2) - (event.pageX - containerCoords.left)),
              y = ((event.pageY - containerCoords.top) - (event.currentTarget.offsetHeight / 2));

            var deg = Math.round((Math.atan2(x, y) * (180 / Math.PI)));
            $timeout(function() {
              ctrl.setTimeByDeg(deg + 180);
              if (ctrl.type === 'hours' && ctrl.autoSwitch) timepickerCtrl.switchView();
            });
          };

          element.on("click", onEvent);
          scope.$on("$destroy", function() {
              element.off("click", onEvent);
          });

        }
      }
    }]);

})(window, angular);