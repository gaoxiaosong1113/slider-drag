/**
 * Created by Administrator on 2016/7/21.
 */
(function () {
    "use strict";

    var Touch = function (container, params) {
        if (!(this instanceof Touch)) return new Touch(container, params);
        this.container = $(container)[0];
        this.params = params;
        var defaults = {
            touchBox: '.touch-box',
            touchMain: '.touch-main',
            touchItem: '.touch-item',
            isSlider: true,
            isScrolling: false,
            timer: 2000,
            item: 0,
            startPos: null
        };
        var _this = this;

        var thisWidth = _this.container.offsetWidth;
        var thisHeight = _this.container.offsetHeight;

        window.onresize = function () {
            thisWidth = _this.container.offsetWidth;
            thisHeight = _this.container.offsetHeight;
            touchSize();
        };

        //获取元素
        function $(selector, parten) {
            return new Query(selector, parten);
        }

        function Query(selector, parten) {
            var regId = /^#([a-z_]\w*)$/i;
            var regClass = /^\.(.*)$/i;
            var regTag = /^[a-z]\w*$/i;
            var ele;
            if (regId.test(selector)) {
                parten = parten || document;
                var ele = parten.querySelector(RegExp.$1);
                if (ele) {
                    this[0] = ele;
                    this.length = 1;
                }
            } else if (regClass.test(selector)) {
                ele = document.querySelectorAll(selector);
                for (var i = 0; i < ele.length; i++) {
                    this[i] = ele[i];
                }
                this.length = ele.length;
            } else if (regTag.test(selector)) {
                ele = document.querySelectorAll(selector);
                console.log(ele);
                for (var i = 0; i < ele.length; i++) {
                    this[i] = ele[i];
                }
                this.length = ele.length;
            }
        }

        Query.prototype.addClass = function (obj) {
            var Aclass = new RegExp(obj, "g");
            for (var i = 0; i < this.length; i++) {
                if (this[i].className.match(Aclass)) {
                    return this
                } else {
                    this[i].className = this[i].className + " " + obj;
                }
            }
            return this;
        };
        Query.prototype.css = function (obj) {
            obj = obj || {};
            for (var attr in obj) {
                this.setCss(attr, obj[attr]);
            }
            return this;
        };
        Query.prototype.setCss = function (attr, val) {
            switch (attr) {
                case "width":
                case "height":
                case "top":
                case "left":
                    for (var i = 0; i < this.length; i++) {
                        this[i].style[attr] = val + "px";
                    }
                    break;
                case "float":
                    for (var i = 0; i < this.length; i++) {
                        this[i].style.cssFloat = val;
                        this[i].style.styleFloat = val;
                    }
                    break;
                case "opacity":

                    for (var i = 0; i < this.length; i++) {
                        this[i].style.opacity = val;
                        this[i].style.filter = "alpha(opacity=" + val * 100 + ")";
                    }
                    break;
                default:
                    for (var i = 0; i < this.length; i++) {
                        this[i].style[attr] = val;
                    }
            }
            return this;
        };

        var touchSize = function () {
            $(defaults.touchBox, _this.container).css({'width': thisWidth * $(defaults.touchMain, _this.container).length});
            $(defaults.touchMain, _this.container).css({'width': thisWidth, 'height': thisHeight})
        };
        touchSize();

        //绑定事件
        on($(defaults.touchBox)[0], "mousedown", down);
        on($(defaults.touchBox)[0], "touchstart", down);
        var nextPage = function () {
            if (defaults.isScrolling == false) {
                return;
            }
            if (defaults.item >= $(defaults.touchMain).length - 1) {
                defaults.item = -1;
            }
            defaults.item++;
            objAnimation();
            /*处理动画*/
            curItem();
            /*显示当前索引值*/
        };
        var prevPage = function () {
            if (defaults.isScrolling == false) {
                return;
            }
            if (defaults.item <= 0) {
                defaults.item = $(defaults.touchMain).length - 1;
            }
            defaults.item--;
            objAnimation();
            curItem();
        };
        var curItem = function () {
            $(defaults.touchMain).addClass('hot');
//                $(defaults.touchMain)[defaults.item].className="1";
//                $(defaults.touchMain).eq(defaults.item).addClass('cur');
        };
        var objAnimation = function () {
            var setEq = -(defaults.item * thisWidth);
            animationStar(setEq, 300);
        };
        var animationStar = function (num, time) {
            $(defaults.touchBox, _this.container).css({
                "-webkit-transform": "translate3d(" + num + "px,0,0)",
                "-moz-transform": "translate3d(" + num + "px,0,0)",
                "-ms-transform": "translate3d(" + num + "px,0,0)",
                "transform": "translate3d(" + num + "px,0,0)",
                "-webkit-transition-duration": time + "ms",
                "-moz-transition-duration": time + "ms",
                "-ms-transition-duration": time + "ms",
                "transition-duration": time + "ms"
            });
        };

        function on(ele, type, fn) {//登记
            if (ele.addEventListener) {
                ele.addEventListener(type, fn, false);
            } else {
                new Error("当前浏览器不支持addEventListener绑定事件");
            }
        }

        function off(ele, type, fn) {//解除事件绑定
            if (ele.removeEventListener) {
                ele.removeEventListener(type, fn, false);
            } else {
                new Error("当前浏览器不支持addEventListener绑定事件");
            }
        }

        function down(event) {//拖拽开始
            defaults.isScrolling = true;
            var startTouch;
            event.changedTouches ? startTouch = event.changedTouches[0] : startTouch = event;
            defaults.startPos = {
                x: startTouch.pageX,
                y: startTouch.pageY,
                time: +new Date()
            };
            on(this, "mousemove", move);
            on(this, "touchmove", move);
            on(this, "touchend", up);
            on(this, "mouseup", up);
            event.preventDefault();
        }

        function move(event) {//拖动
            if (!defaults.isScrolling) {
                return;
            }
            var moveTouch;
            event.changedTouches ? moveTouch = event.changedTouches[0] : moveTouch = event;

            var movePos = {
                x: moveTouch.pageX - defaults.startPos.x,
                y: moveTouch.pageY - defaults.startPos.y
            };

            defaults.isScrolling = Math.abs(movePos.x) > Math.abs(movePos.y);
            if (defaults.isScrolling) {
                var moveOffset = movePos.x - defaults.item * thisWidth;
                animationStar(moveOffset, 0);
            }
            event.preventDefault();
        }

        function up(event) {//松开
            if (!defaults.isScrolling) {
                return;
            }
            var endTouch;
            var duration = +new Date() - defaults.startPos.time;
            event.changedTouches ? endTouch = event.changedTouches[0] : endTouch = event;

            var endPos = {
                x: endTouch.pageX - defaults.startPos.x,
                y: endTouch.pageY - defaults.startPos.y
            };

            if (duration > 10) {
                if (Math.abs(endPos.x) > 50) {
                    if (endPos.x > 0) {
                        if (defaults.item == 0) {
                            defaults.isScrolling = false;
                            objAnimation();
                        } else {
                            prevPage();
                        }

                    } else if (endPos.x < 0) {
                        if (defaults.item == $(defaults.touchMain).length - 1) {
                            defaults.isScrolling = false;
                            objAnimation();
                        } else {
                            nextPage();
                        }
                    } else {
                        defaults.isScrolling = false;
                        objAnimation();
                    }
                } else {
                    defaults.isScrolling = false;
                    objAnimation();
                }
            }
            off(this, "mousemove", move);
            off(this, "touchmove", move);
            off(this, "mouseup", up);
            off(this, "touchstar", up)
        }


    };
    window.Touch = Touch;//暴露给外部,以供调用
})();


