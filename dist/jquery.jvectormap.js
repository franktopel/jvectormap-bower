(function($) {
    var apiParams = {
        set: {
            colors: 1,
            values: 1,
            backgroundColor: 1,
            scaleColors: 1,
            normalizeFunction: 1,
            focus: 1
        },
        get: {
            selectedRegions: 1,
            selectedMarkers: 1,
            mapObject: 1,
            regionName: 1
        }
    };
    $.fn.vectorMap = function(options) {
        var map, methodName, map = this.children(".jvectormap-container").data("mapObject");
        if (options === "addMap") {
            jvm.Map.maps[arguments[1]] = arguments[2];
        } else if ((options === "set" || options === "get") && apiParams[options][arguments[1]]) {
            methodName = arguments[1].charAt(0).toUpperCase() + arguments[1].substr(1);
            return map[options + methodName].apply(map, Array.prototype.slice.call(arguments, 2));
        } else {
            options = options || {};
            options.container = this;
            map = new jvm.Map(options);
        }
        return this;
    };
})(jQuery);

(function(factory) {
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory;
    } else {
        factory(jQuery);
    }
})(function($) {
    var toFix = [ "wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll" ], toBind = "onwheel" in document || document.documentMode >= 9 ? [ "wheel" ] : [ "mousewheel", "DomMouseScroll", "MozMousePixelScroll" ], slice = Array.prototype.slice, nullLowestDeltaTimeout, lowestDelta;
    if ($.event.fixHooks) {
        for (var i = toFix.length; i; ) {
            $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
        }
    }
    var special = $.event.special.mousewheel = {
        version: "3.1.9",
        setup: function() {
            if (this.addEventListener) {
                for (var i = toBind.length; i; ) {
                    this.addEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = handler;
            }
            $.data(this, "mousewheel-line-height", special.getLineHeight(this));
            $.data(this, "mousewheel-page-height", special.getPageHeight(this));
        },
        teardown: function() {
            if (this.removeEventListener) {
                for (var i = toBind.length; i; ) {
                    this.removeEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = null;
            }
        },
        getLineHeight: function(elem) {
            return parseInt($(elem)["offsetParent" in $.fn ? "offsetParent" : "parent"]().css("fontSize"), 10);
        },
        getPageHeight: function(elem) {
            return $(elem).height();
        },
        settings: {
            adjustOldDeltas: true
        }
    };
    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },
        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });
    function handler(event) {
        var orgEvent = event || window.event, args = slice.call(arguments, 1), delta = 0, deltaX = 0, deltaY = 0, absDelta = 0;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";
        if ("detail" in orgEvent) {
            deltaY = orgEvent.detail * -1;
        }
        if ("wheelDelta" in orgEvent) {
            deltaY = orgEvent.wheelDelta;
        }
        if ("wheelDeltaY" in orgEvent) {
            deltaY = orgEvent.wheelDeltaY;
        }
        if ("wheelDeltaX" in orgEvent) {
            deltaX = orgEvent.wheelDeltaX * -1;
        }
        if ("axis" in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }
        delta = deltaY === 0 ? deltaX : deltaY;
        if ("deltaY" in orgEvent) {
            deltaY = orgEvent.deltaY * -1;
            delta = deltaY;
        }
        if ("deltaX" in orgEvent) {
            deltaX = orgEvent.deltaX;
            if (deltaY === 0) {
                delta = deltaX * -1;
            }
        }
        if (deltaY === 0 && deltaX === 0) {
            return;
        }
        if (orgEvent.deltaMode === 1) {
            var lineHeight = $.data(this, "mousewheel-line-height");
            delta *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if (orgEvent.deltaMode === 2) {
            var pageHeight = $.data(this, "mousewheel-page-height");
            delta *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }
        absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if (!lowestDelta || absDelta < lowestDelta) {
            lowestDelta = absDelta;
            if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
                lowestDelta /= 40;
            }
        }
        if (shouldAdjustOldDeltas(orgEvent, absDelta)) {
            delta /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }
        delta = Math[delta >= 1 ? "floor" : "ceil"](delta / lowestDelta);
        deltaX = Math[deltaX >= 1 ? "floor" : "ceil"](deltaX / lowestDelta);
        deltaY = Math[deltaY >= 1 ? "floor" : "ceil"](deltaY / lowestDelta);
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.deltaMode = 0;
        args.unshift(event, delta, deltaX, deltaY);
        if (nullLowestDeltaTimeout) {
            clearTimeout(nullLowestDeltaTimeout);
        }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);
        return ($.event.dispatch || $.event.handle).apply(this, args);
    }
    function nullLowestDelta() {
        lowestDelta = null;
    }
    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        return special.settings.adjustOldDeltas && orgEvent.type === "mousewheel" && absDelta % 120 === 0;
    }
});

var jvm = {
    inherits: function(child, parent) {
        function temp() {}
        temp.prototype = parent.prototype;
        child.prototype = new temp();
        child.prototype.constructor = child;
        child.parentClass = parent;
    },
    mixin: function(target, source) {
        var prop;
        for (prop in source.prototype) {
            if (source.prototype.hasOwnProperty(prop)) {
                target.prototype[prop] = source.prototype[prop];
            }
        }
    },
    min: function(values) {
        var min = Number.MAX_VALUE, i;
        if (values instanceof Array) {
            for (i = 0; i < values.length; i++) {
                if (values[i] < min) {
                    min = values[i];
                }
            }
        } else {
            for (i in values) {
                if (values[i] < min) {
                    min = values[i];
                }
            }
        }
        return min;
    },
    max: function(values) {
        var max = Number.MIN_VALUE, i;
        if (values instanceof Array) {
            for (i = 0; i < values.length; i++) {
                if (values[i] > max) {
                    max = values[i];
                }
            }
        } else {
            for (i in values) {
                if (values[i] > max) {
                    max = values[i];
                }
            }
        }
        return max;
    },
    keys: function(object) {
        var keys = [], key;
        for (key in object) {
            keys.push(key);
        }
        return keys;
    },
    values: function(object) {
        var values = [], key, i;
        for (i = 0; i < arguments.length; i++) {
            object = arguments[i];
            for (key in object) {
                values.push(object[key]);
            }
        }
        return values;
    },
    whenImageLoaded: function(url) {
        var deferred = new jvm.$.Deferred(), img = jvm.$("<img/>");
        img.error(function() {
            deferred.reject();
        }).load(function() {
            deferred.resolve(img);
        });
        img.attr("src", url);
        return deferred;
    },
    isImageUrl: function(s) {
        return /\.\w{3,4}$/.test(s);
    }
};

jvm.$ = jQuery;

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
        var k;
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = +fromIndex || 0;
        if (Math.abs(n) === Infinity) {
            n = 0;
        }
        if (n >= len) {
            return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

jvm.AbstractElement = function(name, config) {
    this.node = this.createElement(name);
    this.name = name;
    this.properties = {};
    if (config) {
        this.set(config);
    }
};

jvm.AbstractElement.prototype.set = function(property, value) {
    var key;
    if (typeof property === "object") {
        for (key in property) {
            this.properties[key] = property[key];
            this.applyAttr(key, property[key]);
        }
    } else {
        this.properties[property] = value;
        this.applyAttr(property, value);
    }
};

jvm.AbstractElement.prototype.get = function(property) {
    return this.properties[property];
};

jvm.AbstractElement.prototype.applyAttr = function(property, value) {
    this.node.setAttribute(property, value);
};

jvm.AbstractElement.prototype.remove = function() {
    jvm.$(this.node).remove();
};

jvm.AbstractCanvasElement = function(container, width, height) {
    this.container = container;
    this.setSize(width, height);
    this.rootElement = new jvm[this.classPrefix + "GroupElement"]();
    this.node.appendChild(this.rootElement.node);
    this.container.appendChild(this.node);
};

jvm.AbstractCanvasElement.prototype.add = function(element, group) {
    group = group || this.rootElement;
    group.add(element);
    element.canvas = this;
};

jvm.AbstractCanvasElement.prototype.addPath = function(config, style, group) {
    var el = new jvm[this.classPrefix + "PathElement"](config, style);
    this.add(el, group);
    return el;
};

jvm.AbstractCanvasElement.prototype.addCircle = function(config, style, group) {
    var el = new jvm[this.classPrefix + "CircleElement"](config, style);
    this.add(el, group);
    return el;
};

jvm.AbstractCanvasElement.prototype.addImage = function(config, style, group) {
    var el = new jvm[this.classPrefix + "ImageElement"](config, style);
    this.add(el, group);
    return el;
};

jvm.AbstractCanvasElement.prototype.addText = function(config, style, group) {
    var el = new jvm[this.classPrefix + "TextElement"](config, style);
    this.add(el, group);
    return el;
};

jvm.AbstractCanvasElement.prototype.addGroup = function(parentGroup) {
    var el = new jvm[this.classPrefix + "GroupElement"]();
    if (parentGroup) {
        parentGroup.node.appendChild(el.node);
    } else {
        this.node.appendChild(el.node);
    }
    el.canvas = this;
    return el;
};

jvm.AbstractShapeElement = function(name, config, style) {
    this.style = style || {};
    this.style.current = this.style.current || {};
    this.isHovered = false;
    this.isSelected = false;
    this.updateStyle();
};

jvm.AbstractShapeElement.prototype.setStyle = function(property, value) {
    var styles = {};
    if (typeof property === "object") {
        styles = property;
    } else {
        styles[property] = value;
    }
    jvm.$.extend(this.style.current, styles);
    this.updateStyle();
};

jvm.AbstractShapeElement.prototype.updateStyle = function() {
    var attrs = {};
    jvm.AbstractShapeElement.mergeStyles(attrs, this.style.initial);
    jvm.AbstractShapeElement.mergeStyles(attrs, this.style.current);
    if (this.isHovered) {
        jvm.AbstractShapeElement.mergeStyles(attrs, this.style.hover);
    }
    if (this.isSelected) {
        jvm.AbstractShapeElement.mergeStyles(attrs, this.style.selected);
        if (this.isHovered) {
            jvm.AbstractShapeElement.mergeStyles(attrs, this.style.selectedHover);
        }
    }
    this.set(attrs);
};

jvm.AbstractShapeElement.mergeStyles = function(styles, newStyles) {
    var key;
    newStyles = newStyles || {};
    for (key in newStyles) {
        if (newStyles[key] === null) {
            delete styles[key];
        } else {
            styles[key] = newStyles[key];
        }
    }
};

jvm.SVGElement = function(name, config) {
    jvm.SVGElement.parentClass.apply(this, arguments);
};

jvm.inherits(jvm.SVGElement, jvm.AbstractElement);

jvm.SVGElement.svgns = "http://www.w3.org/2000/svg";

jvm.SVGElement.prototype.createElement = function(tagName) {
    return document.createElementNS(jvm.SVGElement.svgns, tagName);
};

jvm.SVGElement.prototype.addClass = function(className) {
    this.node.setAttribute("class", className);
};

jvm.SVGElement.prototype.getElementCtr = function(ctr) {
    return jvm["SVG" + ctr];
};

jvm.SVGElement.prototype.getBBox = function() {
    return this.node.getBBox();
};

jvm.SVGGroupElement = function() {
    jvm.SVGGroupElement.parentClass.call(this, "g");
};

jvm.inherits(jvm.SVGGroupElement, jvm.SVGElement);

jvm.SVGGroupElement.prototype.add = function(element) {
    this.node.appendChild(element.node);
};

jvm.SVGCanvasElement = function(container, width, height) {
    this.classPrefix = "SVG";
    jvm.SVGCanvasElement.parentClass.call(this, "svg");
    this.defsElement = new jvm.SVGElement("defs");
    this.node.appendChild(this.defsElement.node);
    jvm.AbstractCanvasElement.apply(this, arguments);
};

jvm.inherits(jvm.SVGCanvasElement, jvm.SVGElement);

jvm.mixin(jvm.SVGCanvasElement, jvm.AbstractCanvasElement);

jvm.SVGCanvasElement.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    this.node.setAttribute("width", width);
    this.node.setAttribute("height", height);
};

jvm.SVGCanvasElement.prototype.applyTransformParams = function(scale, transX, transY) {
    this.scale = scale;
    this.transX = transX;
    this.transY = transY;
    this.rootElement.node.setAttribute("transform", "scale(" + scale + ") translate(" + transX + ", " + transY + ")");
};

jvm.SVGShapeElement = function(name, config, style) {
    jvm.SVGShapeElement.parentClass.call(this, name, config);
    jvm.AbstractShapeElement.apply(this, arguments);
};

jvm.inherits(jvm.SVGShapeElement, jvm.SVGElement);

jvm.mixin(jvm.SVGShapeElement, jvm.AbstractShapeElement);

jvm.SVGShapeElement.prototype.applyAttr = function(attr, value) {
    var patternEl, imageEl, that = this;
    if (attr === "fill" && jvm.isImageUrl(value)) {
        if (!jvm.SVGShapeElement.images[value]) {
            jvm.whenImageLoaded(value).then(function(img) {
                imageEl = new jvm.SVGElement("image");
                imageEl.node.setAttributeNS("http://www.w3.org/1999/xlink", "href", value);
                imageEl.applyAttr("x", "0");
                imageEl.applyAttr("y", "0");
                imageEl.applyAttr("width", img[0].width);
                imageEl.applyAttr("height", img[0].height);
                patternEl = new jvm.SVGElement("pattern");
                patternEl.applyAttr("id", "image" + jvm.SVGShapeElement.imageCounter);
                patternEl.applyAttr("x", 0);
                patternEl.applyAttr("y", 0);
                patternEl.applyAttr("width", img[0].width / 2);
                patternEl.applyAttr("height", img[0].height / 2);
                patternEl.applyAttr("viewBox", "0 0 " + img[0].width + " " + img[0].height);
                patternEl.applyAttr("patternUnits", "userSpaceOnUse");
                patternEl.node.appendChild(imageEl.node);
                that.canvas.defsElement.node.appendChild(patternEl.node);
                jvm.SVGShapeElement.images[value] = jvm.SVGShapeElement.imageCounter++;
                that.applyAttr("fill", "url(#image" + jvm.SVGShapeElement.images[value] + ")");
            });
        } else {
            this.applyAttr("fill", "url(#image" + jvm.SVGShapeElement.images[value] + ")");
        }
    } else {
        jvm.SVGShapeElement.parentClass.prototype.applyAttr.apply(this, arguments);
    }
};

jvm.SVGShapeElement.imageCounter = 1;

jvm.SVGShapeElement.images = {};

jvm.SVGPathElement = function(config, style) {
    jvm.SVGPathElement.parentClass.call(this, "path", config, style);
    this.node.setAttribute("fill-rule", "evenodd");
};

jvm.inherits(jvm.SVGPathElement, jvm.SVGShapeElement);

jvm.SVGCircleElement = function(config, style) {
    jvm.SVGCircleElement.parentClass.call(this, "circle", config, style);
};

jvm.inherits(jvm.SVGCircleElement, jvm.SVGShapeElement);

jvm.SVGImageElement = function(config, style) {
    jvm.SVGImageElement.parentClass.call(this, "image", config, style);
};

jvm.inherits(jvm.SVGImageElement, jvm.SVGShapeElement);

jvm.SVGImageElement.prototype.applyAttr = function(attr, value) {
    var that = this;
    if (attr == "image") {
        jvm.whenImageLoaded(value).then(function(img) {
            that.node.setAttributeNS("http://www.w3.org/1999/xlink", "href", value);
            that.width = img[0].width;
            that.height = img[0].height;
            that.applyAttr("width", that.width);
            that.applyAttr("height", that.height);
            that.applyAttr("x", that.cx - that.width / 2);
            that.applyAttr("y", that.cy - that.height / 2);
            jvm.$(that.node).trigger("imageloaded", [ img ]);
        });
    } else if (attr == "cx") {
        this.cx = value;
        if (this.width) {
            this.applyAttr("x", value - this.width / 2);
        }
    } else if (attr == "cy") {
        this.cy = value;
        if (this.height) {
            this.applyAttr("y", value - this.height / 2);
        }
    } else {
        jvm.SVGImageElement.parentClass.prototype.applyAttr.apply(this, arguments);
    }
};

jvm.SVGTextElement = function(config, style) {
    jvm.SVGTextElement.parentClass.call(this, "text", config, style);
};

jvm.inherits(jvm.SVGTextElement, jvm.SVGShapeElement);

jvm.SVGTextElement.prototype.applyAttr = function(attr, value) {
    if (attr === "text") {
        this.node.textContent = value;
    } else {
        jvm.SVGTextElement.parentClass.prototype.applyAttr.apply(this, arguments);
    }
};

jvm.VMLElement = function(name, config) {
    if (!jvm.VMLElement.VMLInitialized) {
        jvm.VMLElement.initializeVML();
    }
    jvm.VMLElement.parentClass.apply(this, arguments);
};

jvm.inherits(jvm.VMLElement, jvm.AbstractElement);

jvm.VMLElement.VMLInitialized = false;

jvm.VMLElement.initializeVML = function() {
    try {
        if (!document.namespaces.rvml) {
            document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
        }
        jvm.VMLElement.prototype.createElement = function(tagName) {
            return document.createElement("<rvml:" + tagName + ' class="rvml">');
        };
    } catch (e) {
        jvm.VMLElement.prototype.createElement = function(tagName) {
            return document.createElement("<" + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
        };
    }
    document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
    jvm.VMLElement.VMLInitialized = true;
};

jvm.VMLElement.prototype.getElementCtr = function(ctr) {
    return jvm["VML" + ctr];
};

jvm.VMLElement.prototype.addClass = function(className) {
    jvm.$(this.node).addClass(className);
};

jvm.VMLElement.prototype.applyAttr = function(attr, value) {
    this.node[attr] = value;
};

jvm.VMLElement.prototype.getBBox = function() {
    var node = jvm.$(this.node);
    return {
        x: node.position().left / this.canvas.scale,
        y: node.position().top / this.canvas.scale,
        width: node.width() / this.canvas.scale,
        height: node.height() / this.canvas.scale
    };
};

jvm.VMLGroupElement = function() {
    jvm.VMLGroupElement.parentClass.call(this, "group");
    this.node.style.left = "0px";
    this.node.style.top = "0px";
    this.node.coordorigin = "0 0";
};

jvm.inherits(jvm.VMLGroupElement, jvm.VMLElement);

jvm.VMLGroupElement.prototype.add = function(element) {
    this.node.appendChild(element.node);
};

jvm.VMLCanvasElement = function(container, width, height) {
    this.classPrefix = "VML";
    jvm.VMLCanvasElement.parentClass.call(this, "group");
    jvm.AbstractCanvasElement.apply(this, arguments);
    this.node.style.position = "absolute";
};

jvm.inherits(jvm.VMLCanvasElement, jvm.VMLElement);

jvm.mixin(jvm.VMLCanvasElement, jvm.AbstractCanvasElement);

jvm.VMLCanvasElement.prototype.setSize = function(width, height) {
    var paths, groups, i, l;
    this.width = width;
    this.height = height;
    this.node.style.width = width + "px";
    this.node.style.height = height + "px";
    this.node.coordsize = width + " " + height;
    this.node.coordorigin = "0 0";
    if (this.rootElement) {
        paths = this.rootElement.node.getElementsByTagName("shape");
        for (i = 0, l = paths.length; i < l; i++) {
            paths[i].coordsize = width + " " + height;
            paths[i].style.width = width + "px";
            paths[i].style.height = height + "px";
        }
        groups = this.node.getElementsByTagName("group");
        for (i = 0, l = groups.length; i < l; i++) {
            groups[i].coordsize = width + " " + height;
            groups[i].style.width = width + "px";
            groups[i].style.height = height + "px";
        }
    }
};

jvm.VMLCanvasElement.prototype.applyTransformParams = function(scale, transX, transY) {
    this.scale = scale;
    this.transX = transX;
    this.transY = transY;
    this.rootElement.node.coordorigin = this.width - transX - this.width / 100 + "," + (this.height - transY - this.height / 100);
    this.rootElement.node.coordsize = this.width / scale + "," + this.height / scale;
};

jvm.VMLShapeElement = function(name, config) {
    jvm.VMLShapeElement.parentClass.call(this, name, config);
    this.fillElement = new jvm.VMLElement("fill");
    this.strokeElement = new jvm.VMLElement("stroke");
    this.node.appendChild(this.fillElement.node);
    this.node.appendChild(this.strokeElement.node);
    this.node.stroked = false;
    jvm.AbstractShapeElement.apply(this, arguments);
};

jvm.inherits(jvm.VMLShapeElement, jvm.VMLElement);

jvm.mixin(jvm.VMLShapeElement, jvm.AbstractShapeElement);

jvm.VMLShapeElement.prototype.applyAttr = function(attr, value) {
    switch (attr) {
      case "fill":
        this.node.fillcolor = value;
        break;

      case "fill-opacity":
        this.fillElement.node.opacity = Math.round(value * 100) + "%";
        break;

      case "stroke":
        if (value === "none") {
            this.node.stroked = false;
        } else {
            this.node.stroked = true;
        }
        this.node.strokecolor = value;
        break;

      case "stroke-opacity":
        this.strokeElement.node.opacity = Math.round(value * 100) + "%";
        break;

      case "stroke-width":
        if (parseInt(value, 10) === 0) {
            this.node.stroked = false;
        } else {
            this.node.stroked = true;
        }
        this.node.strokeweight = value;
        break;

      case "d":
        this.node.path = jvm.VMLPathElement.pathSvgToVml(value);
        break;

      default:
        jvm.VMLShapeElement.parentClass.prototype.applyAttr.apply(this, arguments);
    }
};

jvm.VMLPathElement = function(config, style) {
    var scale = new jvm.VMLElement("skew");
    jvm.VMLPathElement.parentClass.call(this, "shape", config, style);
    this.node.coordorigin = "0 0";
    scale.node.on = true;
    scale.node.matrix = "0.01,0,0,0.01,0,0";
    scale.node.offset = "0,0";
    this.node.appendChild(scale.node);
};

jvm.inherits(jvm.VMLPathElement, jvm.VMLShapeElement);

jvm.VMLPathElement.prototype.applyAttr = function(attr, value) {
    if (attr === "d") {
        this.node.path = jvm.VMLPathElement.pathSvgToVml(value);
    } else {
        jvm.VMLShapeElement.prototype.applyAttr.call(this, attr, value);
    }
};

jvm.VMLPathElement.pathSvgToVml = function(path) {
    var cx = 0, cy = 0, ctrlx, ctrly;
    path = path.replace(/(-?\d+)e(-?\d+)/g, "0");
    return path.replace(/([MmLlHhVvCcSs])\s*((?:-?\d*(?:\.\d+)?\s*,?\s*)+)/g, function(segment, letter, coords, index) {
        coords = coords.replace(/(\d)-/g, "$1,-").replace(/^\s+/g, "").replace(/\s+$/g, "").replace(/\s+/g, ",").split(",");
        if (!coords[0]) coords.shift();
        for (var i = 0, l = coords.length; i < l; i++) {
            coords[i] = Math.round(100 * coords[i]);
        }
        switch (letter) {
          case "m":
            cx += coords[0];
            cy += coords[1];
            return "t" + coords.join(",");

          case "M":
            cx = coords[0];
            cy = coords[1];
            return "m" + coords.join(",");

          case "l":
            cx += coords[0];
            cy += coords[1];
            return "r" + coords.join(",");

          case "L":
            cx = coords[0];
            cy = coords[1];
            return "l" + coords.join(",");

          case "h":
            cx += coords[0];
            return "r" + coords[0] + ",0";

          case "H":
            cx = coords[0];
            return "l" + cx + "," + cy;

          case "v":
            cy += coords[0];
            return "r0," + coords[0];

          case "V":
            cy = coords[0];
            return "l" + cx + "," + cy;

          case "c":
            ctrlx = cx + coords[coords.length - 4];
            ctrly = cy + coords[coords.length - 3];
            cx += coords[coords.length - 2];
            cy += coords[coords.length - 1];
            return "v" + coords.join(",");

          case "C":
            ctrlx = coords[coords.length - 4];
            ctrly = coords[coords.length - 3];
            cx = coords[coords.length - 2];
            cy = coords[coords.length - 1];
            return "c" + coords.join(",");

          case "s":
            coords.unshift(cy - ctrly);
            coords.unshift(cx - ctrlx);
            ctrlx = cx + coords[coords.length - 4];
            ctrly = cy + coords[coords.length - 3];
            cx += coords[coords.length - 2];
            cy += coords[coords.length - 1];
            return "v" + coords.join(",");

          case "S":
            coords.unshift(cy + cy - ctrly);
            coords.unshift(cx + cx - ctrlx);
            ctrlx = coords[coords.length - 4];
            ctrly = coords[coords.length - 3];
            cx = coords[coords.length - 2];
            cy = coords[coords.length - 1];
            return "c" + coords.join(",");
        }
        return "";
    }).replace(/z/g, "e");
};

jvm.VMLCircleElement = function(config, style) {
    jvm.VMLCircleElement.parentClass.call(this, "oval", config, style);
};

jvm.inherits(jvm.VMLCircleElement, jvm.VMLShapeElement);

jvm.VMLCircleElement.prototype.applyAttr = function(attr, value) {
    switch (attr) {
      case "r":
        this.node.style.width = value * 2 + "px";
        this.node.style.height = value * 2 + "px";
        this.applyAttr("cx", this.get("cx") || 0);
        this.applyAttr("cy", this.get("cy") || 0);
        break;

      case "cx":
        if (!value) return;
        this.node.style.left = value - (this.get("r") || 0) + "px";
        break;

      case "cy":
        if (!value) return;
        this.node.style.top = value - (this.get("r") || 0) + "px";
        break;

      default:
        jvm.VMLCircleElement.parentClass.prototype.applyAttr.call(this, attr, value);
    }
};

jvm.VectorCanvas = function(container, width, height) {
    this.mode = window.SVGAngle ? "svg" : "vml";
    if (this.mode == "svg") {
        this.impl = new jvm.SVGCanvasElement(container, width, height);
    } else {
        this.impl = new jvm.VMLCanvasElement(container, width, height);
    }
    this.impl.mode = this.mode;
    return this.impl;
};

jvm.SimpleScale = function(scale) {
    this.scale = scale;
};

jvm.SimpleScale.prototype.getValue = function(value) {
    return value;
};

jvm.OrdinalScale = function(scale) {
    this.scale = scale;
};

jvm.OrdinalScale.prototype.getValue = function(value) {
    return this.scale[value];
};

jvm.OrdinalScale.prototype.getTicks = function() {
    var ticks = [], key;
    for (key in this.scale) {
        ticks.push({
            label: key,
            value: this.scale[key]
        });
    }
    return ticks;
};

jvm.NumericScale = function(scale, normalizeFunction, minValue, maxValue) {
    this.scale = [];
    normalizeFunction = normalizeFunction || "linear";
    if (scale) this.setScale(scale);
    if (normalizeFunction) this.setNormalizeFunction(normalizeFunction);
    if (typeof minValue !== "undefined") this.setMin(minValue);
    if (typeof maxValue !== "undefined") this.setMax(maxValue);
};

jvm.NumericScale.prototype = {
    setMin: function(min) {
        this.clearMinValue = min;
        if (typeof this.normalize === "function") {
            this.minValue = this.normalize(min);
        } else {
            this.minValue = min;
        }
    },
    setMax: function(max) {
        this.clearMaxValue = max;
        if (typeof this.normalize === "function") {
            this.maxValue = this.normalize(max);
        } else {
            this.maxValue = max;
        }
    },
    setScale: function(scale) {
        var i;
        this.scale = [];
        for (i = 0; i < scale.length; i++) {
            this.scale[i] = [ scale[i] ];
        }
    },
    setNormalizeFunction: function(f) {
        if (f === "polynomial") {
            this.normalize = function(value) {
                return Math.pow(value, .2);
            };
        } else if (f === "linear") {
            delete this.normalize;
        } else {
            this.normalize = f;
        }
        this.setMin(this.clearMinValue);
        this.setMax(this.clearMaxValue);
    },
    getValue: function(value) {
        var lengthes = [], fullLength = 0, l, i = 0, c;
        if (typeof this.normalize === "function") {
            value = this.normalize(value);
        }
        for (i = 0; i < this.scale.length - 1; i++) {
            l = this.vectorLength(this.vectorSubtract(this.scale[i + 1], this.scale[i]));
            lengthes.push(l);
            fullLength += l;
        }
        c = (this.maxValue - this.minValue) / fullLength;
        for (i = 0; i < lengthes.length; i++) {
            lengthes[i] *= c;
        }
        i = 0;
        value -= this.minValue;
        while (value - lengthes[i] >= 0) {
            value -= lengthes[i];
            i++;
        }
        if (i == this.scale.length - 1) {
            value = this.vectorToNum(this.scale[i]);
        } else {
            value = this.vectorToNum(this.vectorAdd(this.scale[i], this.vectorMult(this.vectorSubtract(this.scale[i + 1], this.scale[i]), value / lengthes[i])));
        }
        return value;
    },
    vectorToNum: function(vector) {
        var num = 0, i;
        for (i = 0; i < vector.length; i++) {
            num += Math.round(vector[i]) * Math.pow(256, vector.length - i - 1);
        }
        return num;
    },
    vectorSubtract: function(vector1, vector2) {
        var vector = [], i;
        for (i = 0; i < vector1.length; i++) {
            vector[i] = vector1[i] - vector2[i];
        }
        return vector;
    },
    vectorAdd: function(vector1, vector2) {
        var vector = [], i;
        for (i = 0; i < vector1.length; i++) {
            vector[i] = vector1[i] + vector2[i];
        }
        return vector;
    },
    vectorMult: function(vector, num) {
        var result = [], i;
        for (i = 0; i < vector.length; i++) {
            result[i] = vector[i] * num;
        }
        return result;
    },
    vectorLength: function(vector) {
        var result = 0, i;
        for (i = 0; i < vector.length; i++) {
            result += vector[i] * vector[i];
        }
        return Math.sqrt(result);
    },
    getTicks: function() {
        var m = 5, extent = [ this.clearMinValue, this.clearMaxValue ], span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step, ticks = [], tick, v;
        if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
        extent[0] = Math.floor(extent[0] / step) * step;
        extent[1] = Math.ceil(extent[1] / step) * step;
        tick = extent[0];
        while (tick <= extent[1]) {
            if (tick == extent[0]) {
                v = this.clearMinValue;
            } else if (tick == extent[1]) {
                v = this.clearMaxValue;
            } else {
                v = tick;
            }
            ticks.push({
                label: tick,
                value: this.getValue(v)
            });
            tick += step;
        }
        return ticks;
    }
};

jvm.ColorScale = function(colors, normalizeFunction, minValue, maxValue) {
    jvm.ColorScale.parentClass.apply(this, arguments);
};

jvm.inherits(jvm.ColorScale, jvm.NumericScale);

jvm.ColorScale.prototype.setScale = function(scale) {
    var i;
    for (i = 0; i < scale.length; i++) {
        this.scale[i] = jvm.ColorScale.rgbToArray(scale[i]);
    }
};

jvm.ColorScale.prototype.getValue = function(value) {
    return jvm.ColorScale.numToRgb(jvm.ColorScale.parentClass.prototype.getValue.call(this, value));
};

jvm.ColorScale.arrayToRgb = function(ar) {
    var rgb = "#", d, i;
    for (i = 0; i < ar.length; i++) {
        d = ar[i].toString(16);
        rgb += d.length == 1 ? "0" + d : d;
    }
    return rgb;
};

jvm.ColorScale.numToRgb = function(num) {
    num = num.toString(16);
    while (num.length < 6) {
        num = "0" + num;
    }
    return "#" + num;
};

jvm.ColorScale.rgbToArray = function(rgb) {
    rgb = rgb.substr(1);
    return [ parseInt(rgb.substr(0, 2), 16), parseInt(rgb.substr(2, 2), 16), parseInt(rgb.substr(4, 2), 16) ];
};

jvm.Legend = function(params) {
    this.params = params || {};
    this.map = this.params.map;
    this.series = this.params.series;
    this.body = jvm.$("<div/>");
    this.body.addClass("jvectormap-legend");
    if (this.params.cssClass) {
        this.body.addClass(this.params.cssClass);
    }
    if (params.vertical) {
        this.map.legendCntVertical.append(this.body);
    } else {
        this.map.legendCntHorizontal.append(this.body);
    }
    this.render();
};

jvm.Legend.prototype.render = function() {
    var ticks = this.series.scale.getTicks(), i, inner = jvm.$("<div/>").addClass("jvectormap-legend-inner"), tick, sample, label;
    this.body.html("");
    if (this.params.title) {
        this.body.append(jvm.$("<div/>").addClass("jvectormap-legend-title").html(this.params.title));
    }
    this.body.append(inner);
    for (i = 0; i < ticks.length; i++) {
        tick = jvm.$("<div/>").addClass("jvectormap-legend-tick");
        sample = jvm.$("<div/>").addClass("jvectormap-legend-tick-sample");
        switch (this.series.params.attribute) {
          case "fill":
            if (jvm.isImageUrl(ticks[i].value)) {
                sample.css("background", "url(" + ticks[i].value + ")");
            } else {
                sample.css("background", ticks[i].value);
            }
            break;

          case "stroke":
            sample.css("background", ticks[i].value);
            break;

          case "image":
            sample.css("background", "url(" + ticks[i].value + ") no-repeat center center");
            break;

          case "r":
            jvm.$("<div/>").css({
                "border-radius": ticks[i].value,
                border: this.map.params.markerStyle.initial["stroke-width"] + "px " + this.map.params.markerStyle.initial["stroke"] + " solid",
                width: ticks[i].value * 2 + "px",
                height: ticks[i].value * 2 + "px",
                background: this.map.params.markerStyle.initial["fill"]
            }).appendTo(sample);
            break;
        }
        tick.append(sample);
        label = ticks[i].label;
        if (this.params.labelRender) {
            label = this.params.labelRender(label);
        }
        tick.append(jvm.$("<div>" + label + " </div>").addClass("jvectormap-legend-tick-text"));
        inner.append(tick);
    }
    inner.append(jvm.$("<div/>").css("clear", "both"));
};

jvm.DataSeries = function(params, elements, map) {
    var scaleConstructor;
    params = params || {};
    params.attribute = params.attribute || "fill";
    this.elements = elements;
    this.params = params;
    this.map = map;
    if (params.attributes) {
        this.setAttributes(params.attributes);
    }
    if (jvm.$.isArray(params.scale)) {
        scaleConstructor = params.attribute === "fill" || params.attribute === "stroke" ? jvm.ColorScale : jvm.NumericScale;
        this.scale = new scaleConstructor(params.scale, params.normalizeFunction, params.min, params.max);
    } else if (params.scale) {
        this.scale = new jvm.OrdinalScale(params.scale);
    } else {
        this.scale = new jvm.SimpleScale(params.scale);
    }
    this.values = params.values || {};
    this.setValues(this.values);
    if (this.params.legend) {
        this.legend = new jvm.Legend($.extend({
            map: this.map,
            series: this
        }, this.params.legend));
    }
};

jvm.DataSeries.prototype = {
    setAttributes: function(key, attr) {
        var attrs = key, code;
        if (typeof key == "string") {
            if (this.elements[key]) {
                this.elements[key].setStyle(this.params.attribute, attr);
            }
        } else {
            for (code in attrs) {
                if (this.elements[code]) {
                    this.elements[code].element.setStyle(this.params.attribute, attrs[code]);
                }
            }
        }
    },
    setValues: function(values) {
        var max = -Number.MAX_VALUE, min = Number.MAX_VALUE, val, cc, attrs = {};
        if (!(this.scale instanceof jvm.OrdinalScale) && !(this.scale instanceof jvm.SimpleScale)) {
            if (typeof this.params.min === "undefined" || typeof this.params.max === "undefined") {
                for (cc in values) {
                    val = parseFloat(values[cc]);
                    if (val > max) max = val;
                    if (val < min) min = val;
                }
            }
            if (typeof this.params.min === "undefined") {
                this.scale.setMin(min);
            } else {
                this.scale.setMin(this.params.min);
            }
            if (typeof this.params.max === "undefined") {
                this.scale.setMax(max);
            } else {
                this.scale.setMax(this.params.max);
            }
            for (cc in values) {
                if (cc != "indexOf") {
                    val = parseFloat(values[cc]);
                    if (!isNaN(val)) {
                        attrs[cc] = this.scale.getValue(val);
                    } else {
                        attrs[cc] = this.elements[cc].element.style.initial[this.params.attribute];
                    }
                }
            }
        } else {
            for (cc in values) {
                if (values[cc]) {
                    attrs[cc] = this.scale.getValue(values[cc]);
                } else {
                    attrs[cc] = this.elements[cc].element.style.initial[this.params.attribute];
                }
            }
        }
        this.setAttributes(attrs);
        jvm.$.extend(this.values, values);
    },
    clear: function() {
        var key, attrs = {};
        for (key in this.values) {
            if (this.elements[key]) {
                attrs[key] = this.elements[key].element.shape.style.initial[this.params.attribute];
            }
        }
        this.setAttributes(attrs);
        this.values = {};
    },
    setScale: function(scale) {
        this.scale.setScale(scale);
        if (this.values) {
            this.setValues(this.values);
        }
    },
    setNormalizeFunction: function(f) {
        this.scale.setNormalizeFunction(f);
        if (this.values) {
            this.setValues(this.values);
        }
    }
};

jvm.Proj = {
    degRad: 180 / Math.PI,
    radDeg: Math.PI / 180,
    radius: 6381372,
    sgn: function(n) {
        if (n > 0) {
            return 1;
        } else if (n < 0) {
            return -1;
        } else {
            return n;
        }
    },
    mill: function(lat, lng, c) {
        return {
            x: this.radius * (lng - c) * this.radDeg,
            y: -this.radius * Math.log(Math.tan((45 + .4 * lat) * this.radDeg)) / .8
        };
    },
    mill_inv: function(x, y, c) {
        return {
            lat: (2.5 * Math.atan(Math.exp(.8 * y / this.radius)) - 5 * Math.PI / 8) * this.degRad,
            lng: (c * this.radDeg + x / this.radius) * this.degRad
        };
    },
    merc: function(lat, lng, c) {
        return {
            x: this.radius * (lng - c) * this.radDeg,
            y: -this.radius * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))
        };
    },
    merc_inv: function(x, y, c) {
        return {
            lat: (2 * Math.atan(Math.exp(y / this.radius)) - Math.PI / 2) * this.degRad,
            lng: (c * this.radDeg + x / this.radius) * this.degRad
        };
    },
    aea: function(lat, lng, c) {
        var fi0 = 0, lambda0 = c * this.radDeg, fi1 = 29.5 * this.radDeg, fi2 = 45.5 * this.radDeg, fi = lat * this.radDeg, lambda = lng * this.radDeg, n = (Math.sin(fi1) + Math.sin(fi2)) / 2, C = Math.cos(fi1) * Math.cos(fi1) + 2 * n * Math.sin(fi1), theta = n * (lambda - lambda0), ro = Math.sqrt(C - 2 * n * Math.sin(fi)) / n, ro0 = Math.sqrt(C - 2 * n * Math.sin(fi0)) / n;
        return {
            x: ro * Math.sin(theta) * this.radius,
            y: -(ro0 - ro * Math.cos(theta)) * this.radius
        };
    },
    aea_inv: function(xCoord, yCoord, c) {
        var x = xCoord / this.radius, y = yCoord / this.radius, fi0 = 0, lambda0 = c * this.radDeg, fi1 = 29.5 * this.radDeg, fi2 = 45.5 * this.radDeg, n = (Math.sin(fi1) + Math.sin(fi2)) / 2, C = Math.cos(fi1) * Math.cos(fi1) + 2 * n * Math.sin(fi1), ro0 = Math.sqrt(C - 2 * n * Math.sin(fi0)) / n, ro = Math.sqrt(x * x + (ro0 - y) * (ro0 - y)), theta = Math.atan(x / (ro0 - y));
        return {
            lat: Math.asin((C - ro * ro * n * n) / (2 * n)) * this.degRad,
            lng: (lambda0 + theta / n) * this.degRad
        };
    },
    lcc: function(lat, lng, c) {
        var fi0 = 0, lambda0 = c * this.radDeg, lambda = lng * this.radDeg, fi1 = 33 * this.radDeg, fi2 = 45 * this.radDeg, fi = lat * this.radDeg, n = Math.log(Math.cos(fi1) * (1 / Math.cos(fi2))) / Math.log(Math.tan(Math.PI / 4 + fi2 / 2) * (1 / Math.tan(Math.PI / 4 + fi1 / 2))), F = Math.cos(fi1) * Math.pow(Math.tan(Math.PI / 4 + fi1 / 2), n) / n, ro = F * Math.pow(1 / Math.tan(Math.PI / 4 + fi / 2), n), ro0 = F * Math.pow(1 / Math.tan(Math.PI / 4 + fi0 / 2), n);
        return {
            x: ro * Math.sin(n * (lambda - lambda0)) * this.radius,
            y: -(ro0 - ro * Math.cos(n * (lambda - lambda0))) * this.radius
        };
    },
    lcc_inv: function(xCoord, yCoord, c) {
        var x = xCoord / this.radius, y = yCoord / this.radius, fi0 = 0, lambda0 = c * this.radDeg, fi1 = 33 * this.radDeg, fi2 = 45 * this.radDeg, n = Math.log(Math.cos(fi1) * (1 / Math.cos(fi2))) / Math.log(Math.tan(Math.PI / 4 + fi2 / 2) * (1 / Math.tan(Math.PI / 4 + fi1 / 2))), F = Math.cos(fi1) * Math.pow(Math.tan(Math.PI / 4 + fi1 / 2), n) / n, ro0 = F * Math.pow(1 / Math.tan(Math.PI / 4 + fi0 / 2), n), ro = this.sgn(n) * Math.sqrt(x * x + (ro0 - y) * (ro0 - y)), theta = Math.atan(x / (ro0 - y));
        return {
            lat: (2 * Math.atan(Math.pow(F / ro, 1 / n)) - Math.PI / 2) * this.degRad,
            lng: (lambda0 + theta / n) * this.degRad
        };
    }
};

jvm.MapObject = function(config) {};

jvm.MapObject.prototype.getLabelText = function(key) {
    var text;
    if (this.config.label) {
        if (typeof this.config.label.render === "function") {
            text = this.config.label.render(key);
        } else {
            text = key;
        }
    } else {
        text = null;
    }
    return text;
};

jvm.MapObject.prototype.getLabelOffsets = function(key) {
    var offsets;
    if (this.config.label) {
        if (typeof this.config.label.offsets === "function") {
            offsets = this.config.label.offsets(key);
        } else if (typeof this.config.label.offsets === "object") {
            offsets = this.config.label.offsets[key];
        }
    }
    return offsets || [ 0, 0 ];
};

jvm.MapObject.prototype.setHovered = function(isHovered) {
    if (this.isHovered !== isHovered) {
        this.isHovered = isHovered;
        this.shape.isHovered = isHovered;
        this.shape.updateStyle();
        if (this.label) {
            this.label.isHovered = isHovered;
            this.label.updateStyle();
        }
    }
};

jvm.MapObject.prototype.setSelected = function(isSelected) {
    if (this.isSelected !== isSelected) {
        this.isSelected = isSelected;
        this.shape.isSelected = isSelected;
        this.shape.updateStyle();
        if (this.label) {
            this.label.isSelected = isSelected;
            this.label.updateStyle();
        }
        jvm.$(this.shape).trigger("selected", [ isSelected ]);
    }
};

jvm.MapObject.prototype.setStyle = function() {
    this.shape.setStyle.apply(this.shape, arguments);
};

jvm.MapObject.prototype.remove = function() {
    this.shape.remove();
    if (this.label) {
        this.label.remove();
    }
};

jvm.Region = function(config) {
    var bbox, text, offsets, labelDx, labelDy;
    this.config = config;
    this.map = this.config.map;
    this.shape = config.canvas.addPath({
        d: config.path,
        "data-code": config.code
    }, config.style, config.canvas.rootElement);
    this.shape.addClass("jvectormap-region jvectormap-element");
    bbox = this.shape.getBBox();
    text = this.getLabelText(config.code);
    if (this.config.label && text) {
        offsets = this.getLabelOffsets(config.code);
        this.labelX = bbox.x + bbox.width / 2 + offsets[0];
        this.labelY = bbox.y + bbox.height / 2 + offsets[1];
        this.label = config.canvas.addText({
            text: text,
            "text-anchor": "middle",
            "alignment-baseline": "central",
            x: this.labelX,
            y: this.labelY,
            "data-code": config.code
        }, config.labelStyle, config.labelsGroup);
        this.label.addClass("jvectormap-region jvectormap-element");
    }
};

jvm.inherits(jvm.Region, jvm.MapObject);

jvm.Region.prototype.updateLabelPosition = function() {
    if (this.label) {
        this.label.set({
            x: this.labelX * this.map.scale + this.map.transX * this.map.scale,
            y: this.labelY * this.map.scale + this.map.transY * this.map.scale
        });
    }
};

jvm.Marker = function(config) {
    var text, offsets;
    this.config = config;
    this.map = this.config.map;
    this.isImage = !!this.config.style.initial.image;
    this.createShape();
    text = this.getLabelText(config.index);
    if (this.config.label && text) {
        this.offsets = this.getLabelOffsets(config.index);
        this.labelX = config.cx / this.map.scale - this.map.transX;
        this.labelY = config.cy / this.map.scale - this.map.transY;
        this.label = config.canvas.addText({
            text: text,
            "data-index": config.index,
            dy: "0.6ex",
            x: this.labelX,
            y: this.labelY
        }, config.labelStyle, config.labelsGroup);
        this.label.addClass("jvectormap-marker jvectormap-element");
    }
};

jvm.inherits(jvm.Marker, jvm.MapObject);

jvm.Marker.prototype.createShape = function() {
    var that = this;
    if (this.shape) {
        this.shape.remove();
    }
    this.shape = this.config.canvas[this.isImage ? "addImage" : "addCircle"]({
        "data-index": this.config.index,
        cx: this.config.cx,
        cy: this.config.cy
    }, this.config.style, this.config.group);
    this.shape.addClass("jvectormap-marker jvectormap-element");
    if (this.isImage) {
        jvm.$(this.shape.node).on("imageloaded", function() {
            that.updateLabelPosition();
        });
    }
};

jvm.Marker.prototype.updateLabelPosition = function() {
    if (this.label) {
        this.label.set({
            x: this.labelX * this.map.scale + this.offsets[0] + this.map.transX * this.map.scale + 5 + (this.isImage ? (this.shape.width || 0) / 2 : this.shape.properties.r),
            y: this.labelY * this.map.scale + this.map.transY * this.map.scale + this.offsets[1]
        });
    }
};

jvm.Marker.prototype.setStyle = function(property, value) {
    var isImage;
    jvm.Marker.parentClass.prototype.setStyle.apply(this, arguments);
    if (property === "r") {
        this.updateLabelPosition();
    }
    isImage = !!this.shape.get("image");
    if (isImage != this.isImage) {
        this.isImage = isImage;
        this.config.style = jvm.$.extend(true, {}, this.shape.style);
        this.createShape();
    }
};

jvm.Map = function(params) {
    var map = this, e;
    this.params = jvm.$.extend(true, {}, jvm.Map.defaultParams, params);
    if (!jvm.Map.maps[this.params.map]) {
        throw new Error("Attempt to use map which was not loaded: " + this.params.map);
    }
    this.mapData = jvm.Map.maps[this.params.map];
    this.markers = {};
    this.regions = {};
    this.regionsColors = {};
    this.regionsData = {};
    this.container = jvm.$("<div>").addClass("jvectormap-container");
    if (this.params.container) {
        this.params.container.append(this.container);
    }
    this.container.data("mapObject", this);
    this.defaultWidth = this.mapData.width;
    this.defaultHeight = this.mapData.height;
    this.setBackgroundColor(this.params.backgroundColor);
    this.onResize = function() {
        map.updateSize();
    };
    jvm.$(window).resize(this.onResize);
    for (e in jvm.Map.apiEvents) {
        if (this.params[e]) {
            this.container.bind(jvm.Map.apiEvents[e] + ".jvectormap", this.params[e]);
        }
    }
    this.canvas = new jvm.VectorCanvas(this.container[0], this.width, this.height);
    if (this.params.bindTouchEvents) {
        if ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch) {
            this.bindContainerTouchEvents();
        } else if (window.MSGesture) {
            this.bindContainerPointerEvents();
        }
    }
    this.bindContainerEvents();
    this.bindElementEvents();
    this.createTip();
    if (this.params.zoomButtons) {
        this.bindZoomButtons();
    }
    this.createRegions();
    this.createMarkers(this.params.markers || {});
    this.updateSize();
    if (this.params.focusOn) {
        if (typeof this.params.focusOn === "string") {
            this.params.focusOn = {
                region: this.params.focusOn
            };
        } else if (jvm.$.isArray(this.params.focusOn)) {
            this.params.focusOn = {
                regions: this.params.focusOn
            };
        }
        this.setFocus(this.params.focusOn);
    }
    if (this.params.selectedRegions) {
        this.setSelectedRegions(this.params.selectedRegions);
    }
    if (this.params.selectedMarkers) {
        this.setSelectedMarkers(this.params.selectedMarkers);
    }
    this.legendCntHorizontal = jvm.$("<div/>").addClass("jvectormap-legend-cnt jvectormap-legend-cnt-h");
    this.legendCntVertical = jvm.$("<div/>").addClass("jvectormap-legend-cnt jvectormap-legend-cnt-v");
    this.container.append(this.legendCntHorizontal);
    this.container.append(this.legendCntVertical);
    if (this.params.series) {
        this.createSeries();
    }
};

jvm.Map.prototype = {
    transX: 0,
    transY: 0,
    scale: 1,
    baseTransX: 0,
    baseTransY: 0,
    baseScale: 1,
    width: 0,
    height: 0,
    setBackgroundColor: function(backgroundColor) {
        this.container.css("background-color", backgroundColor);
    },
    resize: function() {
        var curBaseScale = this.baseScale;
        if (this.width / this.height > this.defaultWidth / this.defaultHeight) {
            this.baseScale = this.height / this.defaultHeight;
            this.baseTransX = Math.abs(this.width - this.defaultWidth * this.baseScale) / (2 * this.baseScale);
        } else {
            this.baseScale = this.width / this.defaultWidth;
            this.baseTransY = Math.abs(this.height - this.defaultHeight * this.baseScale) / (2 * this.baseScale);
        }
        this.scale *= this.baseScale / curBaseScale;
        this.transX *= this.baseScale / curBaseScale;
        this.transY *= this.baseScale / curBaseScale;
    },
    updateSize: function() {
        this.width = this.container.width();
        this.height = this.container.height();
        this.resize();
        this.canvas.setSize(this.width, this.height);
        this.applyTransform();
    },
    reset: function() {
        var key, i;
        for (key in this.series) {
            for (i = 0; i < this.series[key].length; i++) {
                this.series[key][i].clear();
            }
        }
        this.scale = this.baseScale;
        this.transX = this.baseTransX;
        this.transY = this.baseTransY;
        this.applyTransform();
    },
    applyTransform: function() {
        var maxTransX, maxTransY, minTransX, minTransY;
        if (this.defaultWidth * this.scale <= this.width) {
            maxTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
            minTransX = (this.width - this.defaultWidth * this.scale) / (2 * this.scale);
        } else {
            maxTransX = 0;
            minTransX = (this.width - this.defaultWidth * this.scale) / this.scale;
        }
        if (this.defaultHeight * this.scale <= this.height) {
            maxTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
            minTransY = (this.height - this.defaultHeight * this.scale) / (2 * this.scale);
        } else {
            maxTransY = 0;
            minTransY = (this.height - this.defaultHeight * this.scale) / this.scale;
        }
        if (this.transY > maxTransY) {
            this.transY = maxTransY;
        } else if (this.transY < minTransY) {
            this.transY = minTransY;
        }
        if (this.transX > maxTransX) {
            this.transX = maxTransX;
        } else if (this.transX < minTransX) {
            this.transX = minTransX;
        }
        this.canvas.applyTransformParams(this.scale, this.transX, this.transY);
        if (this.markers) {
            this.repositionMarkers();
        }
        this.repositionLabels();
        this.container.trigger("viewportChange", [ this.scale / this.baseScale, this.transX, this.transY ]);
    },
    bindContainerEvents: function() {
        var mouseDown = false, oldPageX, oldPageY, map = this;
        if (this.params.panOnDrag) {
            this.container.mousemove(function(e) {
                if (mouseDown) {
                    map.transX -= (oldPageX - e.pageX) / map.scale;
                    map.transY -= (oldPageY - e.pageY) / map.scale;
                    map.applyTransform();
                    oldPageX = e.pageX;
                    oldPageY = e.pageY;
                }
                return false;
            }).mousedown(function(e) {
                mouseDown = true;
                oldPageX = e.pageX;
                oldPageY = e.pageY;
                return false;
            });
            this.onContainerMouseUp = function() {
                mouseDown = false;
            };
            jvm.$("body").mouseup(this.onContainerMouseUp);
        }
        if (this.params.zoomOnScroll) {
            this.container.mousewheel(function(event, delta, deltaX, deltaY) {
                var offset = jvm.$(map.container).offset(), centerX = event.pageX - offset.left, centerY = event.pageY - offset.top, zoomStep = Math.pow(1 + map.params.zoomOnScrollSpeed / 1e3, event.deltaFactor * event.deltaY);
                map.tip.hide();
                map.setScale(map.scale * zoomStep, centerX, centerY);
                event.preventDefault();
            });
        }
    },
    bindContainerTouchEvents: function() {
        var touchStartScale, touchStartDistance, map = this, touchX, touchY, centerTouchX, centerTouchY, lastTouchesLength, handleTouchEvent = function(e) {
            var touches = e.originalEvent.touches, offset, scale, transXOld, transYOld;
            if (e.type == "touchstart") {
                lastTouchesLength = 0;
            }
            if (touches.length == 1) {
                if (lastTouchesLength == 1) {
                    transXOld = map.transX;
                    transYOld = map.transY;
                    map.transX -= (touchX - touches[0].pageX) / map.scale;
                    map.transY -= (touchY - touches[0].pageY) / map.scale;
                    map.applyTransform();
                    map.tip.hide();
                    if (transXOld != map.transX || transYOld != map.transY) {
                        e.preventDefault();
                    }
                }
                touchX = touches[0].pageX;
                touchY = touches[0].pageY;
            } else if (touches.length == 2) {
                if (lastTouchesLength == 2) {
                    scale = Math.sqrt(Math.pow(touches[0].pageX - touches[1].pageX, 2) + Math.pow(touches[0].pageY - touches[1].pageY, 2)) / touchStartDistance;
                    map.setScale(touchStartScale * scale, centerTouchX, centerTouchY);
                    map.tip.hide();
                    e.preventDefault();
                } else {
                    offset = jvm.$(map.container).offset();
                    if (touches[0].pageX > touches[1].pageX) {
                        centerTouchX = touches[1].pageX + (touches[0].pageX - touches[1].pageX) / 2;
                    } else {
                        centerTouchX = touches[0].pageX + (touches[1].pageX - touches[0].pageX) / 2;
                    }
                    if (touches[0].pageY > touches[1].pageY) {
                        centerTouchY = touches[1].pageY + (touches[0].pageY - touches[1].pageY) / 2;
                    } else {
                        centerTouchY = touches[0].pageY + (touches[1].pageY - touches[0].pageY) / 2;
                    }
                    centerTouchX -= offset.left;
                    centerTouchY -= offset.top;
                    touchStartScale = map.scale;
                    touchStartDistance = Math.sqrt(Math.pow(touches[0].pageX - touches[1].pageX, 2) + Math.pow(touches[0].pageY - touches[1].pageY, 2));
                }
            }
            lastTouchesLength = touches.length;
        };
        jvm.$(this.container).bind("touchstart", handleTouchEvent);
        jvm.$(this.container).bind("touchmove", handleTouchEvent);
    },
    bindContainerPointerEvents: function() {
        var map = this, gesture = new MSGesture(), element = this.container[0], handlePointerDownEvent = function(e) {
            gesture.addPointer(e.pointerId);
        }, handleGestureEvent = function(e) {
            var offset, scale, transXOld, transYOld;
            if (e.translationX != 0 || e.translationY != 0) {
                transXOld = map.transX;
                transYOld = map.transY;
                map.transX += e.translationX / map.scale;
                map.transY += e.translationY / map.scale;
                map.applyTransform();
                map.tip.hide();
                if (transXOld != map.transX || transYOld != map.transY) {
                    e.preventDefault();
                }
            }
            if (e.scale != 1) {
                map.setScale(map.scale * e.scale, e.offsetX, e.offsetY);
                map.tip.hide();
                e.preventDefault();
            }
        };
        gesture.target = element;
        element.addEventListener("MSGestureChange", handleGestureEvent, false);
        element.addEventListener("pointerdown", handlePointerDownEvent, false);
    },
    bindElementEvents: function() {
        var map = this, pageX, pageY, mouseMoved;
        this.container.mousemove(function(e) {
            if (Math.abs(pageX - e.pageX) + Math.abs(pageY - e.pageY) > 2) {
                mouseMoved = true;
            }
        });
        this.container.delegate("[class~='jvectormap-element']", "mouseover mouseout", function(e) {
            var baseVal = jvm.$(this).attr("class").baseVal || jvm.$(this).attr("class"), type = baseVal.indexOf("jvectormap-region") === -1 ? "marker" : "region", code = type == "region" ? jvm.$(this).attr("data-code") : jvm.$(this).attr("data-index"), element = type == "region" ? map.regions[code].element : map.markers[code].element, tipText = type == "region" ? map.mapData.paths[code].name : map.markers[code].config.name || "", tipShowEvent = jvm.$.Event(type + "TipShow.jvectormap"), overEvent = jvm.$.Event(type + "Over.jvectormap");
            if (e.type == "mouseover") {
                map.container.trigger(overEvent, [ code ]);
                if (!overEvent.isDefaultPrevented()) {
                    element.setHovered(true);
                }
                map.tip.text(tipText);
                map.container.trigger(tipShowEvent, [ map.tip, code ]);
                if (!tipShowEvent.isDefaultPrevented()) {
                    map.tip.show();
                    map.tipWidth = map.tip.width();
                    map.tipHeight = map.tip.height();
                }
            } else {
                element.setHovered(false);
                map.tip.hide();
                map.container.trigger(type + "Out.jvectormap", [ code ]);
            }
        });
        this.container.delegate("[class~='jvectormap-element']", "mousedown", function(e) {
            pageX = e.pageX;
            pageY = e.pageY;
            mouseMoved = false;
        });
        this.container.delegate("[class~='jvectormap-element']", "mouseup", function() {
            var baseVal = jvm.$(this).attr("class").baseVal ? jvm.$(this).attr("class").baseVal : jvm.$(this).attr("class"), type = baseVal.indexOf("jvectormap-region") === -1 ? "marker" : "region", code = type == "region" ? jvm.$(this).attr("data-code") : jvm.$(this).attr("data-index"), clickEvent = jvm.$.Event(type + "Click.jvectormap"), element = type == "region" ? map.regions[code].element : map.markers[code].element;
            if (!mouseMoved) {
                map.container.trigger(clickEvent, [ code ]);
                if (type === "region" && map.params.regionsSelectable || type === "marker" && map.params.markersSelectable) {
                    if (!clickEvent.isDefaultPrevented()) {
                        if (map.params[type + "sSelectableOne"]) {
                            map.clearSelected(type + "s");
                        }
                        element.setSelected(!element.isSelected);
                    }
                }
            }
        });
    },
    bindZoomButtons: function() {
        var map = this;
        jvm.$("<div/>").addClass("jvectormap-zoomin").text("+").appendTo(this.container);
        jvm.$("<div/>").addClass("jvectormap-zoomout").html("&#x2212;").appendTo(this.container);
        this.container.find(".jvectormap-zoomin").click(function() {
            map.setScale(map.scale * map.params.zoomStep, map.width / 2, map.height / 2, false, map.params.zoomAnimate);
        });
        this.container.find(".jvectormap-zoomout").click(function() {
            map.setScale(map.scale / map.params.zoomStep, map.width / 2, map.height / 2, false, map.params.zoomAnimate);
        });
    },
    createTip: function() {
        var map = this;
        this.tip = jvm.$("<div/>").addClass("jvectormap-tip").appendTo(jvm.$("body"));
        this.container.mousemove(function(e) {
            var left = e.pageX - 15 - map.tipWidth, top = e.pageY - 15 - map.tipHeight;
            if (left < 5) {
                left = e.pageX + 15;
            }
            if (top < 5) {
                top = e.pageY + 15;
            }
            map.tip.css({
                left: left,
                top: top
            });
        });
    },
    setScale: function(scale, anchorX, anchorY, isCentered, animate) {
        var viewportChangeEvent = jvm.$.Event("zoom.jvectormap"), interval, that = this, i = 0, count = Math.abs(Math.round((scale - this.scale) * 60 / Math.max(scale, this.scale))), scaleStart, scaleDiff, transXStart, transXDiff, transYStart, transYDiff, transX, transY, deferred = new jvm.$.Deferred();
        if (scale > this.params.zoomMax * this.baseScale) {
            scale = this.params.zoomMax * this.baseScale;
        } else if (scale < this.params.zoomMin * this.baseScale) {
            scale = this.params.zoomMin * this.baseScale;
        }
        if (typeof anchorX != "undefined" && typeof anchorY != "undefined") {
            zoomStep = scale / this.scale;
            if (isCentered) {
                transX = anchorX + this.defaultWidth * (this.width / (this.defaultWidth * scale)) / 2;
                transY = anchorY + this.defaultHeight * (this.height / (this.defaultHeight * scale)) / 2;
            } else {
                transX = this.transX - (zoomStep - 1) / scale * anchorX;
                transY = this.transY - (zoomStep - 1) / scale * anchorY;
            }
        }
        if (animate && count > 0) {
            scaleStart = this.scale;
            scaleDiff = (scale - scaleStart) / count;
            transXStart = this.transX * this.scale;
            transYStart = this.transY * this.scale;
            transXDiff = (transX * scale - transXStart) / count;
            transYDiff = (transY * scale - transYStart) / count;
            interval = setInterval(function() {
                i += 1;
                that.scale = scaleStart + scaleDiff * i;
                that.transX = (transXStart + transXDiff * i) / that.scale;
                that.transY = (transYStart + transYDiff * i) / that.scale;
                that.applyTransform();
                if (i == count) {
                    clearInterval(interval);
                    that.container.trigger(viewportChangeEvent, [ scale / that.baseScale ]);
                    deferred.resolve();
                }
            }, 10);
        } else {
            this.transX = transX;
            this.transY = transY;
            this.scale = scale;
            this.applyTransform();
            this.container.trigger(viewportChangeEvent, [ scale / this.baseScale ]);
            deferred.resolve();
        }
        return deferred;
    },
    setFocus: function(config) {
        var bbox, itemBbox, newBbox, codes, i, point;
        config = config || {};
        if (config.region) {
            codes = [ config.region ];
        } else if (config.regions) {
            codes = config.regions;
        }
        if (codes) {
            for (i = 0; i < codes.length; i++) {
                if (this.regions[codes[i]]) {
                    itemBbox = this.regions[codes[i]].element.shape.getBBox();
                    if (itemBbox) {
                        if (typeof bbox == "undefined") {
                            bbox = itemBbox;
                        } else {
                            newBbox = {
                                x: Math.min(bbox.x, itemBbox.x),
                                y: Math.min(bbox.y, itemBbox.y),
                                width: Math.max(bbox.x + bbox.width, itemBbox.x + itemBbox.width) - Math.min(bbox.x, itemBbox.x),
                                height: Math.max(bbox.y + bbox.height, itemBbox.y + itemBbox.height) - Math.min(bbox.y, itemBbox.y)
                            };
                            bbox = newBbox;
                        }
                    }
                }
            }
            return this.setScale(Math.min(this.width / bbox.width, this.height / bbox.height), -(bbox.x + bbox.width / 2), -(bbox.y + bbox.height / 2), true, config.animate);
        } else {
            if (config.lat && config.lng) {
                point = this.latLngToPoint(config.lat, config.lng);
                config.x = this.transX - point.x / this.scale;
                config.y = this.transY - point.y / this.scale;
            } else if (config.x && config.y) {
                config.x *= -this.defaultWidth;
                config.y *= -this.defaultHeight;
            }
            return this.setScale(config.scale * this.baseScale, config.x, config.y, true, config.animate);
        }
    },
    getSelected: function(type) {
        var key, selected = [];
        for (key in this[type]) {
            if (this[type][key].element.isSelected) {
                selected.push(key);
            }
        }
        return selected;
    },
    getSelectedRegions: function() {
        return this.getSelected("regions");
    },
    getSelectedMarkers: function() {
        return this.getSelected("markers");
    },
    setSelected: function(type, keys) {
        var i;
        if (typeof keys != "object") {
            keys = [ keys ];
        }
        if (jvm.$.isArray(keys)) {
            for (i = 0; i < keys.length; i++) {
                if (this[type].hasOwnProperty(keys[i])) {
                    this[type][keys[i]].element.setSelected(true);
                }
            }
        } else {
            for (i in keys) {
                if (this[type].hasOwnProperty(i)) {
                    this[type][i].element.setSelected(!!keys[i]);
                }
            }
        }
    },
    setSelectedRegions: function(keys) {
        this.setSelected("regions", keys);
    },
    setSelectedMarkers: function(keys) {
        this.setSelected("markers", keys);
    },
    clearSelected: function(type) {
        var select = {}, selected = this.getSelected(type), i;
        for (i = 0; i < selected.length; i++) {
            select[selected[i]] = false;
        }
        this.setSelected(type, select);
    },
    clearSelectedRegions: function() {
        this.clearSelected("regions");
    },
    clearSelectedMarkers: function() {
        this.clearSelected("markers");
    },
    getMapObject: function() {
        return this;
    },
    getRegionName: function(code) {
        return this.mapData.paths[code].name;
    },
    createRegions: function() {
        var key, region, map = this;
        this.regionLabelsGroup = this.regionLabelsGroup || this.canvas.addGroup();
        for (key in this.mapData.paths) {
            region = new jvm.Region({
                map: this,
                path: this.mapData.paths[key].path,
                code: key,
                style: jvm.$.extend(true, {}, this.params.regionStyle),
                labelStyle: jvm.$.extend(true, {}, this.params.regionLabelStyle),
                canvas: this.canvas,
                labelsGroup: this.regionLabelsGroup,
                label: this.canvas.mode != "vml" ? this.params.labels && this.params.labels.regions : null
            });
            jvm.$(region.shape).bind("selected", function(e, isSelected) {
                map.container.trigger("regionSelected.jvectormap", [ jvm.$(this.node).attr("data-code"), isSelected, map.getSelectedRegions() ]);
            });
            this.regions[key] = {
                element: region,
                config: this.mapData.paths[key]
            };
        }
    },
    createMarkers: function(markers) {
        var i, marker, point, markerConfig, markersArray, map = this;
        this.markersGroup = this.markersGroup || this.canvas.addGroup();
        this.markerLabelsGroup = this.markerLabelsGroup || this.canvas.addGroup();
        if (jvm.$.isArray(markers)) {
            markersArray = markers.slice();
            markers = {};
            for (i = 0; i < markersArray.length; i++) {
                markers[i] = markersArray[i];
            }
        }
        for (i in markers) {
            markerConfig = markers[i] instanceof Array ? {
                latLng: markers[i]
            } : markers[i];
            point = this.getMarkerPosition(markerConfig);
            if (point !== false) {
                marker = new jvm.Marker({
                    map: this,
                    style: jvm.$.extend(true, {}, this.params.markerStyle, {
                        initial: markerConfig.style || {}
                    }),
                    labelStyle: jvm.$.extend(true, {}, this.params.markerLabelStyle),
                    index: i,
                    cx: point.x,
                    cy: point.y,
                    group: this.markersGroup,
                    canvas: this.canvas,
                    labelsGroup: this.markerLabelsGroup,
                    label: this.canvas.mode != "vml" ? this.params.labels && this.params.labels.markers : null
                });
                jvm.$(marker.shape).bind("selected", function(e, isSelected) {
                    map.container.trigger("markerSelected.jvectormap", [ jvm.$(this.node).attr("data-index"), isSelected, map.getSelectedMarkers() ]);
                });
                if (this.markers[i]) {
                    this.removeMarkers([ i ]);
                }
                this.markers[i] = {
                    element: marker,
                    config: markerConfig
                };
            }
        }
    },
    repositionMarkers: function() {
        var i, point;
        for (i in this.markers) {
            point = this.getMarkerPosition(this.markers[i].config);
            if (point !== false) {
                this.markers[i].element.setStyle({
                    cx: point.x,
                    cy: point.y
                });
            }
        }
    },
    repositionLabels: function() {
        var key;
        for (key in this.regions) {
            this.regions[key].element.updateLabelPosition();
        }
        for (key in this.markers) {
            this.markers[key].element.updateLabelPosition();
        }
    },
    getMarkerPosition: function(markerConfig) {
        if (jvm.Map.maps[this.params.map].projection) {
            return this.latLngToPoint.apply(this, markerConfig.latLng || [ 0, 0 ]);
        } else {
            return {
                x: markerConfig.coords[0] * this.scale + this.transX * this.scale,
                y: markerConfig.coords[1] * this.scale + this.transY * this.scale
            };
        }
    },
    addMarker: function(key, marker, seriesData) {
        var markers = {}, data = [], values, i, seriesData = seriesData || [];
        markers[key] = marker;
        for (i = 0; i < seriesData.length; i++) {
            values = {};
            if (typeof seriesData[i] !== "undefined") {
                values[key] = seriesData[i];
            }
            data.push(values);
        }
        this.addMarkers(markers, data);
    },
    addMarkers: function(markers, seriesData) {
        var i;
        seriesData = seriesData || [];
        this.createMarkers(markers);
        for (i = 0; i < seriesData.length; i++) {
            this.series.markers[i].setValues(seriesData[i] || {});
        }
    },
    removeMarkers: function(markers) {
        var i;
        for (i = 0; i < markers.length; i++) {
            this.markers[markers[i]].element.remove();
            delete this.markers[markers[i]];
        }
    },
    removeAllMarkers: function() {
        var i, markers = [];
        for (i in this.markers) {
            markers.push(i);
        }
        this.removeMarkers(markers);
    },
    latLngToPoint: function(lat, lng) {
        var point, proj = jvm.Map.maps[this.params.map].projection, centralMeridian = proj.centralMeridian, inset, bbox;
        if (lng < -180 + centralMeridian) {
            lng += 360;
        }
        point = jvm.Proj[proj.type](lat, lng, centralMeridian);
        inset = this.getInsetForPoint(point.x, point.y);
        if (inset) {
            bbox = inset.bbox;
            point.x = (point.x - bbox[0].x) / (bbox[1].x - bbox[0].x) * inset.width * this.scale;
            point.y = (point.y - bbox[0].y) / (bbox[1].y - bbox[0].y) * inset.height * this.scale;
            return {
                x: point.x + this.transX * this.scale + inset.left * this.scale,
                y: point.y + this.transY * this.scale + inset.top * this.scale
            };
        } else {
            return false;
        }
    },
    pointToLatLng: function(x, y) {
        var proj = jvm.Map.maps[this.params.map].projection, centralMeridian = proj.centralMeridian, insets = jvm.Map.maps[this.params.map].insets, i, inset, bbox, nx, ny;
        for (i = 0; i < insets.length; i++) {
            inset = insets[i];
            bbox = inset.bbox;
            nx = x - (this.transX * this.scale + inset.left * this.scale);
            ny = y - (this.transY * this.scale + inset.top * this.scale);
            nx = nx / (inset.width * this.scale) * (bbox[1].x - bbox[0].x) + bbox[0].x;
            ny = ny / (inset.height * this.scale) * (bbox[1].y - bbox[0].y) + bbox[0].y;
            if (nx > bbox[0].x && nx < bbox[1].x && ny > bbox[0].y && ny < bbox[1].y) {
                return jvm.Proj[proj.type + "_inv"](nx, -ny, centralMeridian);
            }
        }
        return false;
    },
    getInsetForPoint: function(x, y) {
        var insets = jvm.Map.maps[this.params.map].insets, i, bbox;
        for (i = 0; i < insets.length; i++) {
            bbox = insets[i].bbox;
            if (x > bbox[0].x && x < bbox[1].x && y > bbox[0].y && y < bbox[1].y) {
                return insets[i];
            }
        }
    },
    createSeries: function() {
        var i, key;
        this.series = {
            markers: [],
            regions: []
        };
        for (key in this.params.series) {
            for (i = 0; i < this.params.series[key].length; i++) {
                this.series[key][i] = new jvm.DataSeries(this.params.series[key][i], this[key], this);
            }
        }
    },
    remove: function() {
        this.tip.remove();
        this.container.remove();
        jvm.$(window).unbind("resize", this.onResize);
        jvm.$("body").unbind("mouseup", this.onContainerMouseUp);
    }
};

jvm.Map.maps = {};

jvm.Map.defaultParams = {
    map: "world_mill_en",
    backgroundColor: "#505050",
    zoomButtons: true,
    zoomOnScroll: true,
    zoomOnScrollSpeed: 3,
    panOnDrag: true,
    zoomMax: 8,
    zoomMin: 1,
    zoomStep: 1.6,
    zoomAnimate: true,
    regionsSelectable: false,
    markersSelectable: false,
    bindTouchEvents: true,
    regionStyle: {
        initial: {
            fill: "white",
            "fill-opacity": 1,
            stroke: "none",
            "stroke-width": 0,
            "stroke-opacity": 1
        },
        hover: {
            "fill-opacity": .8,
            cursor: "pointer"
        },
        selected: {
            fill: "yellow"
        },
        selectedHover: {}
    },
    regionLabelStyle: {
        initial: {
            "font-family": "Verdana",
            "font-size": "12",
            "font-weight": "bold",
            cursor: "default",
            fill: "black"
        },
        hover: {
            cursor: "pointer"
        }
    },
    markerStyle: {
        initial: {
            fill: "grey",
            stroke: "#505050",
            "fill-opacity": 1,
            "stroke-width": 1,
            "stroke-opacity": 1,
            r: 5
        },
        hover: {
            stroke: "black",
            "stroke-width": 2,
            cursor: "pointer"
        },
        selected: {
            fill: "blue"
        },
        selectedHover: {}
    },
    markerLabelStyle: {
        initial: {
            "font-family": "Verdana",
            "font-size": "12",
            "font-weight": "bold",
            cursor: "default",
            fill: "black"
        },
        hover: {
            cursor: "pointer"
        }
    }
};

jvm.Map.apiEvents = {
    onRegionTipShow: "regionTipShow",
    onRegionOver: "regionOver",
    onRegionOut: "regionOut",
    onRegionClick: "regionClick",
    onRegionSelected: "regionSelected",
    onMarkerTipShow: "markerTipShow",
    onMarkerOver: "markerOver",
    onMarkerOut: "markerOut",
    onMarkerClick: "markerClick",
    onMarkerSelected: "markerSelected",
    onViewportChange: "viewportChange"
};

jvm.MultiMap = function(params) {
    var that = this;
    this.maps = {};
    this.params = jvm.$.extend(true, {}, jvm.MultiMap.defaultParams, params);
    this.params.maxLevel = this.params.maxLevel || Number.MAX_VALUE;
    this.params.main = this.params.main || {};
    this.params.main.multiMapLevel = 0;
    this.history = [ this.addMap(this.params.main.map, this.params.main) ];
    this.defaultProjection = this.history[0].mapData.projection.type;
    this.mapsLoaded = {};
    this.params.container.css({
        position: "relative"
    });
    this.backButton = jvm.$("<div/>").addClass("jvectormap-goback").text("Back").appendTo(this.params.container);
    this.backButton.hide();
    this.backButton.click(function() {
        that.goBack();
    });
    this.spinner = jvm.$("<div/>").addClass("jvectormap-spinner").appendTo(this.params.container);
    this.spinner.hide();
};

jvm.MultiMap.prototype = {
    addMap: function(name, config) {
        var cnt = jvm.$("<div/>").css({
            width: "100%",
            height: "100%"
        });
        this.params.container.append(cnt);
        this.maps[name] = new jvm.Map(jvm.$.extend(config, {
            container: cnt
        }));
        if (this.params.maxLevel > config.multiMapLevel) {
            this.maps[name].container.on("regionClick.jvectormap", {
                scope: this
            }, function(e, code) {
                var multimap = e.data.scope, mapName = multimap.params.mapNameByCode(code, multimap);
                if (!multimap.drillDownPromise || multimap.drillDownPromise.state() !== "pending") {
                    multimap.drillDown(mapName, code);
                }
            });
        }
        return this.maps[name];
    },
    downloadMap: function(code) {
        var that = this, deferred = jvm.$.Deferred();
        if (!this.mapsLoaded[code]) {
            jvm.$.get(this.params.mapUrlByCode(code, this)).then(function() {
                that.mapsLoaded[code] = true;
                deferred.resolve();
            }, function() {
                deferred.reject();
            });
        } else {
            deferred.resolve();
        }
        return deferred;
    },
    drillDown: function(name, code) {
        var currentMap = this.history[this.history.length - 1], that = this, focusPromise = currentMap.setFocus({
            region: code,
            animate: true
        }), downloadPromise = this.downloadMap(code);
        focusPromise.then(function() {
            if (downloadPromise.state() === "pending") {
                that.spinner.show();
            }
        });
        downloadPromise.always(function() {
            that.spinner.hide();
        });
        this.drillDownPromise = jvm.$.when(downloadPromise, focusPromise);
        this.drillDownPromise.then(function() {
            currentMap.params.container.hide();
            if (!that.maps[name]) {
                that.addMap(name, {
                    map: name,
                    multiMapLevel: currentMap.params.multiMapLevel + 1
                });
            } else {
                that.maps[name].params.container.show();
            }
            that.history.push(that.maps[name]);
            that.backButton.show();
        });
    },
    goBack: function() {
        var currentMap = this.history.pop(), prevMap = this.history[this.history.length - 1], that = this;
        currentMap.setFocus({
            scale: 1,
            x: .5,
            y: .5,
            animate: true
        }).then(function() {
            currentMap.params.container.hide();
            prevMap.params.container.show();
            prevMap.updateSize();
            if (that.history.length === 1) {
                that.backButton.hide();
            }
            prevMap.setFocus({
                scale: 1,
                x: .5,
                y: .5,
                animate: true
            });
        });
    }
};

jvm.MultiMap.defaultParams = {
    mapNameByCode: function(code, multiMap) {
        return code.toLowerCase() + "_" + multiMap.defaultProjection + "_en";
    },
    mapUrlByCode: function(code, multiMap) {
        return "jquery-jvectormap-data-" + code.toLowerCase() + "-" + multiMap.defaultProjection + "-en.js";
    }
};