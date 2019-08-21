window.rsharpe = window.rsharpe || {};

(function ($, ns) {
  'use strict';

  var plugin = ns.waypoint = {
    $scrollElement: $(window),
    callbacksList: [],

    defaults: {
      lockTime: 250
    },

    init: function (config) {
      var callbacks = this.data('callbacks.waypoint') || $.Callbacks();

      config.offset = config.offset || 0;
      config._order = ++callbacks.count || (callbacks.count = 1);

      !plugin.callbacksList.includes(callbacks) && plugin.callbacksList.push(callbacks);
      callbacks.add(config._callee = plugin._onScroll.bind(this, config, []));

      return plugin._start.call(
        this.data('callbacks.waypoint', callbacks), plugin.defaults.lockTime
      );
    },

    _onScroll: function (config, trashWPs, sPos) {
      plugin._observe.call(this, config, trashWPs, sPos, function () {
        // count лучше не декрементировать, 
        // т.к. к этой цифре привязаны данные waypoint'ов; 
        // в таком случае придется удалять и их также
        this.data('callbacks.waypoint')
          .remove(config._callee);
      });
    },

    _observe: function (config, trashWPs, sPos, fallback) {
      if (trashWPs.length === this.length) {
        fallback && fallback.call(this);
        return;
      }

      this
        .filter(function () {
          return trashWPs.indexOf(this) === -1;
        })
        .each(function () {
          var $waypoint = $(this).data('waypoint', config);

          if (!$waypoint.is(':visible')) {
            return;
          }

          var wPos = new WaypointPos($waypoint);
          var wOffset = wPos.height * config.offset / 100;

          // HACK: Дополнительная единица нужна чтобы исключить проверки на равенство (<=, >=), 
          // т.к. позиции некоторых элементом могут быть с плавающей точкой.

          if (sPos.bottom > wPos.top + wOffset && sPos.top + 1 < wPos.bottom) {
            plugin._tryFireEnter.call($waypoint);

            if (sPos.top + 1 > wPos.top) {
              plugin._tryFireActive.call($waypoint);
            } else {
              plugin._tryFireInactive.call($waypoint);
            }
          } else {
            plugin._tryFireInactive.call($waypoint);

            if (plugin._tryFireExit.call($waypoint) && config.once) {
              trashWPs.push($waypoint[0]);
            }
          }
        });
    },

    _tryFireEnter: function () {
      var key = 'isDetected.waypoint' + this.data('waypoint')._order;

      if (this.data(key)) {
        return false;
      }

      plugin._fire.call(this.data(key, true), 'onEnter');
      return true;
    },

    _tryFireExit: function () {
      var key = 'isDetected.waypoint' + this.data('waypoint')._order;

      if (!this.data(key)) {
        return false;
      }

      plugin._fire.call(this.data(key, false), 'onExit');
      return true;
    },

    _tryFireActive: function () {
      var key = 'isActive.waypoint' + this.data('waypoint')._order;

      if (this.data(key)) {
        return false;
      }

      plugin._fire.call(this.data(key, true), 'onActive');
      return true;
    },

    _tryFireInactive: function () {
      var key = 'isActive.waypoint' + this.data('waypoint')._order;

      if (!this.data(key)) {
        return false;
      }

      plugin._fire.call(this.data(key, false), 'onInactive');
      return true;
    },

    _fire: function (fnName) {
      var callback = this.data('waypoint')[fnName];
      callback && callback.call(this);
    },

    _start: function (lockTime) {
      if (!plugin.isInit) {
        plugin.$scrollElement.on('scroll resize', function () {
          if (!plugin.locked) {
            plugin.locked = true;

            setTimeout(function () {
              plugin.callbacksList.forEach(function (item) {
                item.fire(new ScrollPos(plugin.$scrollElement));
              });

              plugin.locked = false;
            }, lockTime);
          }
        });

        plugin.isInit = true;
      }

      plugin.$scrollElement.trigger('resize');
      return this;
    },
  };

  //======================

  var PositionBase = function () {
    this.bottom = this.top + this.height;
  };

  //======================

  var ScrollPos = function ($element) {
    this.top = $element.scrollTop();
    this.height = $element.height();
    PositionBase.call(this);
  };

  ScrollPos.prototype = Object.create(PositionBase.prototype);
  ScrollPos.prototype.constructor = ScrollPos;

  //======================

  var WaypointPos = function ($element) {
    this.top = $element.offset().top;
    this.height = $element.outerHeight();
    PositionBase.call(this);
  };

  WaypointPos.prototype = Object.create(PositionBase.prototype);
  WaypointPos.prototype.constructor = WaypointPos;

  //======================

  $.fn.waypoint = function (config) {
    // Делаем доп. проверку т.к. на выборке где нет элементов будет ошибка
    if (!this.length) {
      return this;
    }

    return plugin.init.call(this, config || {});
  };

})(jQuery, rsharpe);
