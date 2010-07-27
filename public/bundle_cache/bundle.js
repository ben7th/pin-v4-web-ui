/* --------- /javascripts/prototype.js --------- */ 
/*  Prototype JavaScript framework, version 1.6.1
 *  (c) 2005-2009 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.1',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile.*Safari/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div');
      var form = document.createElement('form');
      var isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {
  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString;

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = toJSON(object[property]);
      if (!isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    var results = [];
    for (var property in object)
      results.push(property);
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) == "[object Array]";
  }


  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return typeof object === "function";
  }

  function isString(object) {
    return _toString.call(object) == "[object String]";
  }

  function isNumber(object) {
    return _toString.call(object) == "[object Number]";
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());


Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function toJSON() {
    return this.inspect(true);
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.indexOf(pattern) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim ? String.prototype.trim : strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    toJSON:         toJSON,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();
function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function toJSON() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect,
    toJSON:    toJSON
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }

  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }

  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values))
          return results.concat(values.map(toQueryPair.curry(key)));
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function toJSON() {
    return Object.toJSON(this.toObject());
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toJSON,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function toJSON() {
    return isFinite(this) ? this.toString() : 'null';
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    toJSON:         toJSON,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});



function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}


(function(global) {

  var SETATTRIBUTE_IGNORES_NAME = (function(){
    var elForm = document.createElement("form");
    var elInput = document.createElement("input");
    var root = document.documentElement;
    elInput.setAttribute("name", "test");
    elForm.appendChild(elInput);
    root.appendChild(elForm);
    var isBuggy = elForm.elements
      ? (typeof elForm.elements.test == "undefined")
      : null;
    root.removeChild(elForm);
    elForm = elInput = null;
    return isBuggy;
  })();

  var element = global.Element;
  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (SETATTRIBUTE_IGNORES_NAME && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;
})(this);

Element.cache = { };
Element.idCounter = 1;

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },


  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();

    function update(element, content) {
      element = $(element);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (SELECT_ELEMENT_INNERHTML_BUGGY || TABLE_ELEMENT_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = Element.previousSiblings(element);
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = Element.nextSiblings(element);
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },


  select: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element, args);
  },

  adjacent: function(element) {
    var args = Array.prototype.slice.call(arguments, 1);
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = Element.getStyle(element, 'display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    if (originalPosition != 'fixed') // Switching fixed to absolute causes issues in Safari
      els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') == 'absolute') return element;

    var offsets = Element.positionedOffset(element);
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') == 'relative') return element;

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = $(source);
    var p = Element.viewportOffset(source);

    element = $(element);
    var delta = [0, 0];
    var parent = null;
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className';
    var forProp = 'for';

    var el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div');
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');
            var f;

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return $(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'))

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2);
        var el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName);
    var proto = element['__proto__'] || element.constructor.prototype;
    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = $(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = [Element.Storage.UID++];
      uid = element._prototypeUID[0];
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = $(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = $(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = $(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  }
});
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: (function() {

    var IS_DESCENDANT_SELECTOR_BUGGY = (function(){
      var isBuggy = false;
      if (document.evaluate && window.XPathResult) {
        var el = document.createElement('div');
        el.innerHTML = '<ul><li></li></ul><div><ul><li></li></ul></div>';

        var xpath = ".//*[local-name()='ul' or local-name()='UL']" +
          "//*[local-name()='li' or local-name()='LI']";

        var result = document.evaluate(xpath, el, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        isBuggy = (result.snapshotLength !== 2);
        el = null;
      }
      return isBuggy;
    })();

    return function() {
      if (!Prototype.BrowserFeatures.XPath) return false;

      var e = this.expression;

      if (Prototype.Browser.WebKit &&
       (e.include("-of-type") || e.include(":empty")))
        return false;

      if ((/(\[[\w-]*?:|:checked)/).test(e))
        return false;

      if (IS_DESCENDANT_SELECTOR_BUGGY) return false;

      return true;
    }

  })(),

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (Selector.CASE_INSENSITIVE_CLASS_NAMES) return false;

    if (!Selector._div) Selector._div = new Element('div');

    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[name]) ? c[name](m) :
            new Template(c[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m, len = ps.length, name;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        name = ps[i].name;
        if (m = e.match(ps[i].re)) {
          this.matcher.push(Object.isFunction(x[name]) ? x[name](m) :
            new Template(x[name]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':
        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          id = id.replace(/([\.:])/g, "\\$1");
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m, len = ps.length, name;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i = 0; i<len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if (m = e.match(p)) {
          if (as[name]) {
            this.tokens.push([name, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

if (Prototype.BrowserFeatures.SelectorsAPI &&
 document.compatMode === 'BackCompat') {
  Selector.CASE_INSENSITIVE_CLASS_NAMES = (function(){
    var div = document.createElement('div'),
     span = document.createElement('span');

    div.id = "prototype_test_id";
    span.className = 'Test';
    div.appendChild(span);
    var isIgnored = (div.querySelector('#prototype_test_id .test') !== null);
    div = span = null;
    return isIgnored;
  })();
}

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v, len = p.length, name;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i = 0; i<len; i++) {
            name = p[i].name
            if (m = e.match(p[i].re)) {
              v = Object.isFunction(x[name]) ? x[name](m) : new Template(x[name]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: [
    { name: 'laterSibling', re: /^\s*~\s*/ },
    { name: 'child',        re: /^\s*>\s*/ },
    { name: 'adjacent',     re: /^\s*\+\s*/ },
    { name: 'descendant',   re: /^\s/ },

    { name: 'tagName',      re: /^\s*(\*|[\w\-]+)(\b|$)?/ },
    { name: 'id',           re: /^#([\w\-\*]+)(\b|$)/ },
    { name: 'className',    re: /^\.([\w\-\*]+)(\b|$)/ },
    { name: 'pseudo',       re: /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/ },
    { name: 'attrPresence', re: /^\[((?:[\w-]+:)?[\w-]+)\]/ },
    { name: 'attr',         re: /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/ }
  ],

  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: (function(){

      var PROPERTIES_ATTRIBUTES_MAP = (function(){
        var el = document.createElement('div'),
            isBuggy = false,
            propName = '_countedByPrototype',
            value = 'x'
        el[propName] = value;
        isBuggy = (el.getAttribute(propName) === value);
        el = null;
        return isBuggy;
      })();

      return PROPERTIES_ATTRIBUTES_MAP ?
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node.removeAttribute('_countedByPrototype');
          return nodes;
        } :
        function(nodes) {
          for (var i = 0, node; node = nodes[i]; i++)
            node._countedByPrototype = void 0;
          return nodes;
        }
    })(),

    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (typeof (n = nodes[i])._countedByPrototype == 'undefined') {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;

      if (root == document) {
        if (!targetNode) return [];
        if (!nodes) return [targetNode];
      } else {
        if (!root.sourceIndex || root.sourceIndex < 1) {
          var nodes = root.getElementsByTagName('*');
          for (var j = 0, node; node = nodes[j]; j++) {
            if (node.id === id) return [node];
          }
        }
      }

      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}

var Form = {
  reset: function(form) {
    form = $(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = $(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;

  var _isButton;
  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    _isButton = function(event, code) {
      return event.button === buttonMap[code];
    };
  } else if (Prototype.Browser.WebKit) {
    _isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };
  } else {
    _isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);
    if (!expression) return element;
    var elements = [element].concat(element.ancestors());
    return Selector.findElement(elements, expression, 0);
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }

  Event.Methods = {
    isLeftClick: isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick: isRightClick,

    element: element,
    findElement: findElement,

    pointer: pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };


  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover': element = event.fromElement; break;
        case 'mouseout':  element = event.toElement;   break;
        default: return null;
      }
      return Element.extend(element);
    }

    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    });

    Event.extend = function(event, element) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      return Object.extend(event, methods);
    };
  } else {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
    Event.extend = Prototype.K;
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K;

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      var translations = { mouseenter: "mouseover", mouseleave: "mouseout" };
      return eventName in translations ? translations[eventName] : eventName;
    };
  }

  function observe(element, eventName, handler) {
    element = $(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onfilterchange", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = $(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) return element;

    if (eventName && !handler) {
      var responders = registry.get(eventName);

      if (Object.isUndefined(responders)) return element;

      responders.each( function(r) {
        Element.stopObserving(element, eventName, r.handler);
      });
      return element;
    } else if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key, responders = pair.value;

        responders.each( function(r) {
          Element.stopObserving(element, eventName, r.handler);
        });
      });
      return element;
    }

    var responders = registry.get(eventName);

    if (!responders) return;

    var responder = responders.find( function(r) { return r.handler === handler; });
    if (!responder) return element;

    var actualEventName = _getDOMEventName(eventName);

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onfilterchange",  responder);
      }
    } else {
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = $(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', true, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onfilterchange';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }


  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();

Element.addMethods();

/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*//* --------- /javascripts/effects.js --------- */ 
// script.aculo.us effects.js v1.8.3, Thu Oct 08 11:23:33 +0200 2009

// Copyright (c) 2005-2009 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
// Contributors:
//  Justin Palmer (http://encytemedia.com/)
//  Mark Pilgrim (http://diveintomark.org/)
//  Martin Bialasinki
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// converts rgb() and #xxx to #xxxxxx format,
// returns self (or first argument) if not convertable
String.prototype.parseColor = function() {
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if (this.slice(0,1) == '#') {
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();
      if (this.length==7) color = this.toLowerCase();
    }
  }
  return (color.length==7 ? color : (arguments[0] || this));
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);
  element.setStyle({fontSize: (percent/100) + 'em'});
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';

    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character),
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') ||
        Object.isFunction(element)) &&
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;

    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect, options) {
    element = $(element);
    effect  = (effect || 'appear').toLowerCase();
    
    return Effect[ Effect.PAIRS[ effect ][ element.visible() ? 1 : 0 ] ](element, Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, options || {}));
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();

    var position = Object.isString(effect.options.queue) ?
      effect.options.queue : effect.options.queue.position;

    switch(position) {
      case 'front':
        // move unstarted effects after this effect
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }

    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);

    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++)
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;

    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;

    this.render = (function() {
      function dispatch(effect, eventName) {
        if (effect.options[eventName + 'Internal'])
          effect.options[eventName + 'Internal'](effect);
        if (effect.options[eventName])
          effect.options[eventName](effect);
      }

      return function(pos) {
        if (this.state === "idle") {
          this.state = "running";
          dispatch(this, 'beforeSetup');
          if (this.setup) this.setup();
          dispatch(this, 'afterSetup');
        }
        if (this.state === "running") {
          pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
          this.position = pos;
          dispatch(this, 'beforeUpdate');
          if (this.update) this.update(pos);
          dispatch(this, 'afterUpdate');
        }
      };
    })();

    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish();
        this.event('afterFinish');
        return;
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(),
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: this.element.getOpacity() || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    this.element.setOpacity(position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    this.element.setStyle({
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element,
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');

    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));

    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;

    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));

    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()); }
  );
};

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  var options = Object.extend({
    from: element.getOpacity() || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) {
      if (effect.options.to!=0) return;
      effect.element.hide().setStyle({opacity: oldOpacity});
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show();
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = {
    opacity: element.getInlineOpacity(),
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200,
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }),
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ],
     Object.extend({ duration: 1.0,
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element);
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false,
      scaleX: false,
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      }
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, {
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) {
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      });
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }),
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned();
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        }
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}); }}); }}); }}); }}); }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false,
    scaleX: false,
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, {
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping();
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping();
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var initialMoveX, initialMoveY;
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0;
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }

  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01,
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width },
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show();
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
             }
           }, options)
      );
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }

  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping();
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };

  return new Effect.Opacity(element,
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, {
      scaleContent: false,
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });

    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },

  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 );
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return {
        style: property.camelize(),
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0),
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      );
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] =
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' +
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');

Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }

  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]);
  });

  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) {
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    };
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);/* --------- /javascripts/dragdrop.js --------- */ 
// script.aculo.us dragdrop.js v1.8.3, Thu Oct 08 11:23:33 +0200 2009

// Copyright (c) 2005-2009 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

if(Object.isUndefined(Effect))
  throw("dragdrop.js requires including script.aculo.us' effects.js library");

var Droppables = {
  drops: [],

  remove: function(element) {
    this.drops = this.drops.reject(function(d) { return d.element==$(element) });
  },

  add: function(element) {
    element = $(element);
    var options = Object.extend({
      greedy:     true,
      hoverclass: null,
      tree:       false
    }, arguments[1] || { });

    // cache containers
    if(options.containment) {
      options._containers = [];
      var containment = options.containment;
      if(Object.isArray(containment)) {
        containment.each( function(c) { options._containers.push($(c)) });
      } else {
        options._containers.push($(containment));
      }
    }

    if(options.accept) options.accept = [options.accept].flatten();

    Element.makePositioned(element); // fix IE
    options.element = element;

    this.drops.push(options);
  },

  findDeepestChild: function(drops) {
    deepest = drops[0];

    for (i = 1; i < drops.length; ++i)
      if (Element.isParent(drops[i].element, deepest.element))
        deepest = drops[i];

    return deepest;
  },

  isContained: function(element, drop) {
    var containmentNode;
    if(drop.tree) {
      containmentNode = element.treeNode;
    } else {
      containmentNode = element.parentNode;
    }
    return drop._containers.detect(function(c) { return containmentNode == c });
  },

  isAffected: function(point, element, drop) {
    return (
      (drop.element!=element) &&
      ((!drop._containers) ||
        this.isContained(element, drop)) &&
      ((!drop.accept) ||
        (Element.classNames(element).detect(
          function(v) { return drop.accept.include(v) } ) )) &&
      Position.within(drop.element, point[0], point[1]) );
  },

  deactivate: function(drop) {
    if(drop.hoverclass)
      Element.removeClassName(drop.element, drop.hoverclass);
    this.last_active = null;
  },

  activate: function(drop) {
    if(drop.hoverclass)
      Element.addClassName(drop.element, drop.hoverclass);
    this.last_active = drop;
  },

  show: function(point, element) {
    if(!this.drops.length) return;
    var drop, affected = [];

    this.drops.each( function(drop) {
      if(Droppables.isAffected(point, element, drop))
        affected.push(drop);
    });

    if(affected.length>0)
      drop = Droppables.findDeepestChild(affected);

    if(this.last_active && this.last_active != drop) this.deactivate(this.last_active);
    if (drop) {
      Position.within(drop.element, point[0], point[1]);
      if(drop.onHover)
        drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));

      if (drop != this.last_active) Droppables.activate(drop);
    }
  },

  fire: function(event, element) {
    if(!this.last_active) return;
    Position.prepare();

    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
      if (this.last_active.onDrop) {
        this.last_active.onDrop(element, this.last_active.element, event);
        return true;
      }
  },

  reset: function() {
    if(this.last_active)
      this.deactivate(this.last_active);
  }
};

var Draggables = {
  drags: [],
  observers: [],

  register: function(draggable) {
    if(this.drags.length == 0) {
      this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
      this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
      this.eventKeypress  = this.keyPress.bindAsEventListener(this);

      Event.observe(document, "mouseup", this.eventMouseUp);
      Event.observe(document, "mousemove", this.eventMouseMove);
      Event.observe(document, "keypress", this.eventKeypress);
    }
    this.drags.push(draggable);
  },

  unregister: function(draggable) {
    this.drags = this.drags.reject(function(d) { return d==draggable });
    if(this.drags.length == 0) {
      Event.stopObserving(document, "mouseup", this.eventMouseUp);
      Event.stopObserving(document, "mousemove", this.eventMouseMove);
      Event.stopObserving(document, "keypress", this.eventKeypress);
    }
  },

  activate: function(draggable) {
    if(draggable.options.delay) {
      this._timeout = setTimeout(function() {
        Draggables._timeout = null;
        window.focus();
        Draggables.activeDraggable = draggable;
      }.bind(this), draggable.options.delay);
    } else {
      window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
      this.activeDraggable = draggable;
    }
  },

  deactivate: function() {
    this.activeDraggable = null;
  },

  updateDrag: function(event) {
    if(!this.activeDraggable) return;
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    // Mozilla-based browsers fire successive mousemove events with
    // the same coordinates, prevent needless redrawing (moz bug?)
    if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) return;
    this._lastPointer = pointer;

    this.activeDraggable.updateDrag(event, pointer);
  },

  endDrag: function(event) {
    if(this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if(!this.activeDraggable) return;
    this._lastPointer = null;
    this.activeDraggable.endDrag(event);
    this.activeDraggable = null;
  },

  keyPress: function(event) {
    if(this.activeDraggable)
      this.activeDraggable.keyPress(event);
  },

  addObserver: function(observer) {
    this.observers.push(observer);
    this._cacheObserverCallbacks();
  },

  removeObserver: function(element) {  // element instead of observer fixes mem leaks
    this.observers = this.observers.reject( function(o) { return o.element==element });
    this._cacheObserverCallbacks();
  },

  notify: function(eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
    if(this[eventName+'Count'] > 0)
      this.observers.each( function(o) {
        if(o[eventName]) o[eventName](eventName, draggable, event);
      });
    if(draggable.options[eventName]) draggable.options[eventName](draggable, event);
  },

  _cacheObserverCallbacks: function() {
    ['onStart','onEnd','onDrag'].each( function(eventName) {
      Draggables[eventName+'Count'] = Draggables.observers.select(
        function(o) { return o[eventName]; }
      ).length;
    });
  }
};

/*--------------------------------------------------------------------------*/

var Draggable = Class.create({
  initialize: function(element) {
    var defaults = {
      handle: false,
      reverteffect: function(element, top_offset, left_offset) {
        var dur = Math.sqrt(Math.abs(top_offset^2)+Math.abs(left_offset^2))*0.02;
        new Effect.Move(element, { x: -left_offset, y: -top_offset, duration: dur,
          queue: {scope:'_draggable', position:'end'}
        });
      },
      endeffect: function(element) {
        var toOpacity = Object.isNumber(element._opacity) ? element._opacity : 1.0;
        new Effect.Opacity(element, {duration:0.2, from:0.7, to:toOpacity,
          queue: {scope:'_draggable', position:'end'},
          afterFinish: function(){
            Draggable._dragging[element] = false
          }
        });
      },
      zindex: 1000,
      revert: false,
      quiet: false,
      scroll: false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      snap: false,  // false, or xy or [x,y] or function(x,y){ return [x,y] }
      delay: 0
    };

    if(!arguments[1] || Object.isUndefined(arguments[1].endeffect))
      Object.extend(defaults, {
        starteffect: function(element) {
          element._opacity = Element.getOpacity(element);
          Draggable._dragging[element] = true;
          new Effect.Opacity(element, {duration:0.2, from:element._opacity, to:0.7});
        }
      });

    var options = Object.extend(defaults, arguments[1] || { });

    this.element = $(element);

    if(options.handle && Object.isString(options.handle))
      this.handle = this.element.down('.'+options.handle, 0);

    if(!this.handle) this.handle = $(options.handle);
    if(!this.handle) this.handle = this.element;

    if(options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
      options.scroll = $(options.scroll);
      this._isScrollChild = Element.childOf(this.element, options.scroll);
    }

    Element.makePositioned(this.element); // fix IE

    this.options  = options;
    this.dragging = false;

    this.eventMouseDown = this.initDrag.bindAsEventListener(this);
    Event.observe(this.handle, "mousedown", this.eventMouseDown);

    Draggables.register(this);
  },

  destroy: function() {
    Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
    Draggables.unregister(this);
  },

  currentDelta: function() {
    return([
      parseInt(Element.getStyle(this.element,'left') || '0'),
      parseInt(Element.getStyle(this.element,'top') || '0')]);
  },

  initDrag: function(event) {
    if(!Object.isUndefined(Draggable._dragging[this.element]) &&
      Draggable._dragging[this.element]) return;
    if(Event.isLeftClick(event)) {
      // abort on form elements, fixes a Firefox issue
      var src = Event.element(event);
      if((tag_name = src.tagName.toUpperCase()) && (
        tag_name=='INPUT' ||
        tag_name=='SELECT' ||
        tag_name=='OPTION' ||
        tag_name=='BUTTON' ||
        tag_name=='TEXTAREA')) return;

      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      var pos     = this.element.cumulativeOffset();
      this.offset = [0,1].map( function(i) { return (pointer[i] - pos[i]) });

      Draggables.activate(this);
      Event.stop(event);
    }
  },

  startDrag: function(event) {
    this.dragging = true;
    if(!this.delta)
      this.delta = this.currentDelta();

    if(this.options.zindex) {
      this.originalZ = parseInt(Element.getStyle(this.element,'z-index') || 0);
      this.element.style.zIndex = this.options.zindex;
    }

    if(this.options.ghosting) {
      this._clone = this.element.cloneNode(true);
      this._originallyAbsolute = (this.element.getStyle('position') == 'absolute');
      if (!this._originallyAbsolute)
        Position.absolutize(this.element);
      this.element.parentNode.insertBefore(this._clone, this.element);
    }

    if(this.options.scroll) {
      if (this.options.scroll == window) {
        var where = this._getWindowScroll(this.options.scroll);
        this.originalScrollLeft = where.left;
        this.originalScrollTop = where.top;
      } else {
        this.originalScrollLeft = this.options.scroll.scrollLeft;
        this.originalScrollTop = this.options.scroll.scrollTop;
      }
    }

    Draggables.notify('onStart', this, event);

    if(this.options.starteffect) this.options.starteffect(this.element);
  },

  updateDrag: function(event, pointer) {
    if(!this.dragging) this.startDrag(event);

    if(!this.options.quiet){
      Position.prepare();
      Droppables.show(pointer, this.element);
    }

    Draggables.notify('onDrag', this, event);

    this.draw(pointer);
    if(this.options.change) this.options.change(this);

    if(this.options.scroll) {
      this.stopScrolling();

      var p;
      if (this.options.scroll == window) {
        with(this._getWindowScroll(this.options.scroll)) { p = [ left, top, left+width, top+height ]; }
      } else {
        p = Position.page(this.options.scroll);
        p[0] += this.options.scroll.scrollLeft + Position.deltaX;
        p[1] += this.options.scroll.scrollTop + Position.deltaY;
        p.push(p[0]+this.options.scroll.offsetWidth);
        p.push(p[1]+this.options.scroll.offsetHeight);
      }
      var speed = [0,0];
      if(pointer[0] < (p[0]+this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[0]+this.options.scrollSensitivity);
      if(pointer[1] < (p[1]+this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[1]+this.options.scrollSensitivity);
      if(pointer[0] > (p[2]-this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[2]-this.options.scrollSensitivity);
      if(pointer[1] > (p[3]-this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[3]-this.options.scrollSensitivity);
      this.startScrolling(speed);
    }

    // fix AppleWebKit rendering
    if(Prototype.Browser.WebKit) window.scrollBy(0,0);

    Event.stop(event);
  },

  finishDrag: function(event, success) {
    this.dragging = false;

    if(this.options.quiet){
      Position.prepare();
      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      Droppables.show(pointer, this.element);
    }

    if(this.options.ghosting) {
      if (!this._originallyAbsolute)
        Position.relativize(this.element);
      delete this._originallyAbsolute;
      Element.remove(this._clone);
      this._clone = null;
    }

    var dropped = false;
    if(success) {
      dropped = Droppables.fire(event, this.element);
      if (!dropped) dropped = false;
    }
    if(dropped && this.options.onDropped) this.options.onDropped(this.element);
    Draggables.notify('onEnd', this, event);

    var revert = this.options.revert;
    if(revert && Object.isFunction(revert)) revert = revert(this.element);

    var d = this.currentDelta();
    if(revert && this.options.reverteffect) {
      if (dropped == 0 || revert != 'failure')
        this.options.reverteffect(this.element,
          d[1]-this.delta[1], d[0]-this.delta[0]);
    } else {
      this.delta = d;
    }

    if(this.options.zindex)
      this.element.style.zIndex = this.originalZ;

    if(this.options.endeffect)
      this.options.endeffect(this.element);

    Draggables.deactivate(this);
    Droppables.reset();
  },

  keyPress: function(event) {
    if(event.keyCode!=Event.KEY_ESC) return;
    this.finishDrag(event, false);
    Event.stop(event);
  },

  endDrag: function(event) {
    if(!this.dragging) return;
    this.stopScrolling();
    this.finishDrag(event, true);
    Event.stop(event);
  },

  draw: function(point) {
    var pos = this.element.cumulativeOffset();
    if(this.options.ghosting) {
      var r   = Position.realOffset(this.element);
      pos[0] += r[0] - Position.deltaX; pos[1] += r[1] - Position.deltaY;
    }

    var d = this.currentDelta();
    pos[0] -= d[0]; pos[1] -= d[1];

    if(this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
      pos[0] -= this.options.scroll.scrollLeft-this.originalScrollLeft;
      pos[1] -= this.options.scroll.scrollTop-this.originalScrollTop;
    }

    var p = [0,1].map(function(i){
      return (point[i]-pos[i]-this.offset[i])
    }.bind(this));

    if(this.options.snap) {
      if(Object.isFunction(this.options.snap)) {
        p = this.options.snap(p[0],p[1],this);
      } else {
      if(Object.isArray(this.options.snap)) {
        p = p.map( function(v, i) {
          return (v/this.options.snap[i]).round()*this.options.snap[i] }.bind(this));
      } else {
        p = p.map( function(v) {
          return (v/this.options.snap).round()*this.options.snap }.bind(this));
      }
    }}

    var style = this.element.style;
    if((!this.options.constraint) || (this.options.constraint=='horizontal'))
      style.left = p[0] + "px";
    if((!this.options.constraint) || (this.options.constraint=='vertical'))
      style.top  = p[1] + "px";

    if(style.visibility=="hidden") style.visibility = ""; // fix gecko rendering
  },

  stopScrolling: function() {
    if(this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
      Draggables._lastScrollPointer = null;
    }
  },

  startScrolling: function(speed) {
    if(!(speed[0] || speed[1])) return;
    this.scrollSpeed = [speed[0]*this.options.scrollSpeed,speed[1]*this.options.scrollSpeed];
    this.lastScrolled = new Date();
    this.scrollInterval = setInterval(this.scroll.bind(this), 10);
  },

  scroll: function() {
    var current = new Date();
    var delta = current - this.lastScrolled;
    this.lastScrolled = current;
    if(this.options.scroll == window) {
      with (this._getWindowScroll(this.options.scroll)) {
        if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
          var d = delta / 1000;
          this.options.scroll.scrollTo( left + d*this.scrollSpeed[0], top + d*this.scrollSpeed[1] );
        }
      }
    } else {
      this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
      this.options.scroll.scrollTop  += this.scrollSpeed[1] * delta / 1000;
    }

    Position.prepare();
    Droppables.show(Draggables._lastPointer, this.element);
    Draggables.notify('onDrag', this);
    if (this._isScrollChild) {
      Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
      Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
      Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
      if (Draggables._lastScrollPointer[0] < 0)
        Draggables._lastScrollPointer[0] = 0;
      if (Draggables._lastScrollPointer[1] < 0)
        Draggables._lastScrollPointer[1] = 0;
      this.draw(Draggables._lastScrollPointer);
    }

    if(this.options.change) this.options.change(this);
  },

  _getWindowScroll: function(w) {
    var T, L, W, H;
    with (w.document) {
      if (w.document.documentElement && documentElement.scrollTop) {
        T = documentElement.scrollTop;
        L = documentElement.scrollLeft;
      } else if (w.document.body) {
        T = body.scrollTop;
        L = body.scrollLeft;
      }
      if (w.innerWidth) {
        W = w.innerWidth;
        H = w.innerHeight;
      } else if (w.document.documentElement && documentElement.clientWidth) {
        W = documentElement.clientWidth;
        H = documentElement.clientHeight;
      } else {
        W = body.offsetWidth;
        H = body.offsetHeight;
      }
    }
    return { top: T, left: L, width: W, height: H };
  }
});

Draggable._dragging = { };

/*--------------------------------------------------------------------------*/

var SortableObserver = Class.create({
  initialize: function(element, observer) {
    this.element   = $(element);
    this.observer  = observer;
    this.lastValue = Sortable.serialize(this.element);
  },

  onStart: function() {
    this.lastValue = Sortable.serialize(this.element);
  },

  onEnd: function() {
    Sortable.unmark();
    if(this.lastValue != Sortable.serialize(this.element))
      this.observer(this.element)
  }
});

var Sortable = {
  SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,

  sortables: { },

  _findRootElement: function(element) {
    while (element.tagName.toUpperCase() != "BODY") {
      if(element.id && Sortable.sortables[element.id]) return element;
      element = element.parentNode;
    }
  },

  options: function(element) {
    element = Sortable._findRootElement($(element));
    if(!element) return;
    return Sortable.sortables[element.id];
  },

  destroy: function(element){
    element = $(element);
    var s = Sortable.sortables[element.id];

    if(s) {
      Draggables.removeObserver(s.element);
      s.droppables.each(function(d){ Droppables.remove(d) });
      s.draggables.invoke('destroy');

      delete Sortable.sortables[s.element.id];
    }
  },

  create: function(element) {
    element = $(element);
    var options = Object.extend({
      element:     element,
      tag:         'li',       // assumes li children, override with tag: 'tagname'
      dropOnEmpty: false,
      tree:        false,
      treeTag:     'ul',
      overlap:     'vertical', // one of 'vertical', 'horizontal'
      constraint:  'vertical', // one of 'vertical', 'horizontal', false
      containment: element,    // also takes array of elements (or id's); or false
      handle:      false,      // or a CSS class
      only:        false,
      delay:       0,
      hoverclass:  null,
      ghosting:    false,
      quiet:       false,
      scroll:      false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      format:      this.SERIALIZE_RULE,

      // these take arrays of elements or ids and can be
      // used for better initialization performance
      elements:    false,
      handles:     false,

      onChange:    Prototype.emptyFunction,
      onUpdate:    Prototype.emptyFunction
    }, arguments[1] || { });

    // clear any old sortable with same element
    this.destroy(element);

    // build options for the draggables
    var options_for_draggable = {
      revert:      true,
      quiet:       options.quiet,
      scroll:      options.scroll,
      scrollSpeed: options.scrollSpeed,
      scrollSensitivity: options.scrollSensitivity,
      delay:       options.delay,
      ghosting:    options.ghosting,
      constraint:  options.constraint,
      handle:      options.handle };

    if(options.starteffect)
      options_for_draggable.starteffect = options.starteffect;

    if(options.reverteffect)
      options_for_draggable.reverteffect = options.reverteffect;
    else
      if(options.ghosting) options_for_draggable.reverteffect = function(element) {
        element.style.top  = 0;
        element.style.left = 0;
      };

    if(options.endeffect)
      options_for_draggable.endeffect = options.endeffect;

    if(options.zindex)
      options_for_draggable.zindex = options.zindex;

    // build options for the droppables
    var options_for_droppable = {
      overlap:     options.overlap,
      containment: options.containment,
      tree:        options.tree,
      hoverclass:  options.hoverclass,
      onHover:     Sortable.onHover
    };

    var options_for_tree = {
      onHover:      Sortable.onEmptyHover,
      overlap:      options.overlap,
      containment:  options.containment,
      hoverclass:   options.hoverclass
    };

    // fix for gecko engine
    Element.cleanWhitespace(element);

    options.draggables = [];
    options.droppables = [];

    // drop on empty handling
    if(options.dropOnEmpty || options.tree) {
      Droppables.add(element, options_for_tree);
      options.droppables.push(element);
    }

    (options.elements || this.findElements(element, options) || []).each( function(e,i) {
      var handle = options.handles ? $(options.handles[i]) :
        (options.handle ? $(e).select('.' + options.handle)[0] : e);
      options.draggables.push(
        new Draggable(e, Object.extend(options_for_draggable, { handle: handle })));
      Droppables.add(e, options_for_droppable);
      if(options.tree) e.treeNode = element;
      options.droppables.push(e);
    });

    if(options.tree) {
      (Sortable.findTreeElements(element, options) || []).each( function(e) {
        Droppables.add(e, options_for_tree);
        e.treeNode = element;
        options.droppables.push(e);
      });
    }

    // keep reference
    this.sortables[element.identify()] = options;

    // for onupdate
    Draggables.addObserver(new SortableObserver(element, options.onUpdate));

  },

  // return all suitable-for-sortable elements in a guaranteed order
  findElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.tag);
  },

  findTreeElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.treeTag);
  },

  onHover: function(element, dropon, overlap) {
    if(Element.isParent(dropon, element)) return;

    if(overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {
      return;
    } else if(overlap>0.5) {
      Sortable.mark(dropon, 'before');
      if(dropon.previousSibling != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, dropon);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    } else {
      Sortable.mark(dropon, 'after');
      var nextElement = dropon.nextSibling || null;
      if(nextElement != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, nextElement);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    }
  },

  onEmptyHover: function(element, dropon, overlap) {
    var oldParentNode = element.parentNode;
    var droponOptions = Sortable.options(dropon);

    if(!Element.isParent(dropon, element)) {
      var index;

      var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});
      var child = null;

      if(children) {
        var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);

        for (index = 0; index < children.length; index += 1) {
          if (offset - Element.offsetSize (children[index], droponOptions.overlap) >= 0) {
            offset -= Element.offsetSize (children[index], droponOptions.overlap);
          } else if (offset - (Element.offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {
            child = index + 1 < children.length ? children[index + 1] : null;
            break;
          } else {
            child = children[index];
            break;
          }
        }
      }

      dropon.insertBefore(element, child);

      Sortable.options(oldParentNode).onChange(element);
      droponOptions.onChange(element);
    }
  },

  unmark: function() {
    if(Sortable._marker) Sortable._marker.hide();
  },

  mark: function(dropon, position) {
    // mark on ghosting only
    var sortable = Sortable.options(dropon.parentNode);
    if(sortable && !sortable.ghosting) return;

    if(!Sortable._marker) {
      Sortable._marker =
        ($('dropmarker') || Element.extend(document.createElement('DIV'))).
          hide().addClassName('dropmarker').setStyle({position:'absolute'});
      document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
    }
    var offsets = dropon.cumulativeOffset();
    Sortable._marker.setStyle({left: offsets[0]+'px', top: offsets[1] + 'px'});

    if(position=='after')
      if(sortable.overlap == 'horizontal')
        Sortable._marker.setStyle({left: (offsets[0]+dropon.clientWidth) + 'px'});
      else
        Sortable._marker.setStyle({top: (offsets[1]+dropon.clientHeight) + 'px'});

    Sortable._marker.show();
  },

  _tree: function(element, options, parent) {
    var children = Sortable.findElements(element, options) || [];

    for (var i = 0; i < children.length; ++i) {
      var match = children[i].id.match(options.format);

      if (!match) continue;

      var child = {
        id: encodeURIComponent(match ? match[1] : null),
        element: element,
        parent: parent,
        children: [],
        position: parent.children.length,
        container: $(children[i]).down(options.treeTag)
      };

      /* Get the element containing the children and recurse over it */
      if (child.container)
        this._tree(child.container, options, child);

      parent.children.push (child);
    }

    return parent;
  },

  tree: function(element) {
    element = $(element);
    var sortableOptions = this.options(element);
    var options = Object.extend({
      tag: sortableOptions.tag,
      treeTag: sortableOptions.treeTag,
      only: sortableOptions.only,
      name: element.id,
      format: sortableOptions.format
    }, arguments[1] || { });

    var root = {
      id: null,
      parent: null,
      children: [],
      container: element,
      position: 0
    };

    return Sortable._tree(element, options, root);
  },

  /* Construct a [i] index for a particular node */
  _constructIndex: function(node) {
    var index = '';
    do {
      if (node.id) index = '[' + node.position + ']' + index;
    } while ((node = node.parent) != null);
    return index;
  },

  sequence: function(element) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[1] || { });

    return $(this.findElements(element, options) || []).map( function(item) {
      return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
    });
  },

  setSequence: function(element, new_sequence) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[2] || { });

    var nodeMap = { };
    this.findElements(element, options).each( function(n) {
        if (n.id.match(options.format))
            nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
        n.parentNode.removeChild(n);
    });

    new_sequence.each(function(ident) {
      var n = nodeMap[ident];
      if (n) {
        n[1].appendChild(n[0]);
        delete nodeMap[ident];
      }
    });
  },

  serialize: function(element) {
    element = $(element);
    var options = Object.extend(Sortable.options(element), arguments[1] || { });
    var name = encodeURIComponent(
      (arguments[1] && arguments[1].name) ? arguments[1].name : element.id);

    if (options.tree) {
      return Sortable.tree(element, arguments[1]).children.map( function (item) {
        return [name + Sortable._constructIndex(item) + "[id]=" +
                encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
      }).flatten().join('&');
    } else {
      return Sortable.sequence(element, arguments[1]).map( function(item) {
        return name + "[]=" + encodeURIComponent(item);
      }).join('&');
    }
  }
};

// Returns true if child is contained within element
Element.isParent = function(child, element) {
  if (!child.parentNode || child == element) return false;
  if (child.parentNode == element) return true;
  return Element.isParent(child.parentNode, element);
};

Element.findChildren = function(element, only, recursive, tagName) {
  if(!element.hasChildNodes()) return null;
  tagName = tagName.toUpperCase();
  if(only) only = [only].flatten();
  var elements = [];
  $A(element.childNodes).each( function(e) {
    if(e.tagName && e.tagName.toUpperCase()==tagName &&
      (!only || (Element.classNames(e).detect(function(v) { return only.include(v) }))))
        elements.push(e);
    if(recursive) {
      var grandchildren = Element.findChildren(e, only, recursive, tagName);
      if(grandchildren) elements.push(grandchildren);
    }
  });

  return (elements.length>0 ? elements.flatten() : []);
};

Element.offsetSize = function (element, type) {
  return element['offset' + ((type=='vertical' || type=='height') ? 'Height' : 'Width')];
};/* --------- /javascripts/controls.js --------- */ 
// script.aculo.us controls.js v1.8.3, Thu Oct 08 11:23:33 +0200 2009

// Copyright (c) 2005-2009 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005-2009 Ivan Krstic (http://blogs.law.harvard.edu/ivan)
//           (c) 2005-2009 Jon Tirsen (http://www.tirsen.com)
// Contributors:
//  Richard Livsey
//  Rahul Bhargava
//  Rob Wills
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// Autocompleter.Base handles all the autocompletion functionality
// that's independent of the data source for autocompletion. This
// includes drawing the autocompletion menu, observing keyboard
// and mouse events, and similar.
//
// Specific autocompleters need to provide, at the very least,
// a getUpdatedChoices function that will be invoked every time
// the text inside the monitored textbox changes. This method
// should get the text for which to provide autocompletion by
// invoking this.getToken(), NOT by directly accessing
// this.element.value. This is to allow incremental tokenized
// autocompletion. Specific auto-completion logic (AJAX, etc)
// belongs in getUpdatedChoices.
//
// Tokenized incremental autocompletion is enabled automatically
// when an autocompleter is instantiated with the 'tokens' option
// in the options parameter, e.g.:
// new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
// will incrementally autocomplete with a comma as the token.
// Additionally, ',' in the above example can be replaced with
// a token array, e.g. { tokens: [',', '\n'] } which
// enables autocompletion on multiple tokens. This is most
// useful when one of the tokens is \n (a newline), as it
// allows smart autocompletion after linebreaks.

if(typeof Effect == 'undefined')
  throw("controls.js requires including script.aculo.us' effects.js library");

var Autocompleter = { };
Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
      function(element, update){
        if(!update.style.position || update.style.position=='absolute') {
          update.style.position = 'absolute';
          Position.clone(element, update, {
            setHeight: false,
            offsetTop: element.offsetHeight
          });
        }
        Effect.Appear(update,{duration:0.15});
      };
    this.options.onHide = this.options.onHide ||
      function(element, update){ new Effect.Fade(update,{duration:0.15}) };

    if(typeof(this.options.tokens) == 'string')
      this.options.tokens = new Array(this.options.tokens);
    // Force carriage returns as token delimiters anyway
    if (!this.options.tokens.include('\n'))
      this.options.tokens.push('\n');

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix &&
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update,
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },

  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyPress: function(event) {
    if(this.active)
      switch(event.keyCode) {
       case Event.KEY_TAB:
       case Event.KEY_RETURN:
         this.selectEntry();
         Event.stop(event);
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_LEFT:
       case Event.KEY_RIGHT:
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
      }
     else
       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN ||
         (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;

    this.changed = true;
    this.hasFocus = true;

    if(this.observer) clearTimeout(this.observer);
      this.observer =
        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
          Element.addClassName(this.getEntry(i),"selected") :
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) this.index--;
      else this.index = this.entryCount-1;
    this.getEntry(this.index).scrollIntoView(true);
  },

  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
      else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },

  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    if (this.options.select) {
      var nodes = $(selectedElement).select('.' + this.options.select) || [];
      if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
    } else
      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');

    var bounds = this.getTokenBounds();
    if (bounds[0] != -1) {
      var newValue = this.element.value.substr(0, bounds[0]);
      var whitespace = this.element.value.substr(bounds[0]).match(/^\s+/);
      if (whitespace)
        newValue += whitespace[0];
      this.element.value = newValue + value + this.element.value.substr(bounds[1]);
    } else {
      this.element.value = value;
    }
    this.oldElementValue = this.element.value;
    this.element.focus();

    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;

      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;
    this.tokenBounds = null;
    if(this.getToken().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getToken: function() {
    var bounds = this.getTokenBounds();
    return this.element.value.substring(bounds[0], bounds[1]).strip();
  },

  getTokenBounds: function() {
    if (null != this.tokenBounds) return this.tokenBounds;
    var value = this.element.value;
    if (value.strip().empty()) return [-1, 0];
    var diff = arguments.callee.getFirstDifferencePos(value, this.oldElementValue);
    var offset = (diff == this.oldElementValue.length ? 1 : 0);
    var prevTokenPos = -1, nextTokenPos = value.length;
    var tp;
    for (var index = 0, l = this.options.tokens.length; index < l; ++index) {
      tp = value.lastIndexOf(this.options.tokens[index], diff + offset - 1);
      if (tp > prevTokenPos) prevTokenPos = tp;
      tp = value.indexOf(this.options.tokens[index], diff + offset);
      if (-1 != tp && tp < nextTokenPos) nextTokenPos = tp;
    }
    return (this.tokenBounds = [prevTokenPos + 1, nextTokenPos]);
  }
});

Autocompleter.Base.prototype.getTokenBounds.getFirstDifferencePos = function(newS, oldS) {
  var boundary = Math.min(newS.length, oldS.length);
  for (var index = 0; index < boundary; ++index)
    if (newS[index] != oldS[index])
      return index;
  return boundary;
};

Ajax.Autocompleter = Class.create(Autocompleter.Base, {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    this.startIndicator();

    var entry = encodeURIComponent(this.options.paramName) + '=' +
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams)
      this.options.parameters += '&' + this.options.defaultParams;

    new Ajax.Request(this.url, this.options);
  },

  onComplete: function(request) {
    this.updateChoices(request.responseText);
  }
});

// The local array autocompleter. Used when you'd prefer to
// inject an array of autocompletion options into the page, rather
// than sending out Ajax queries, which can be quite slow sometimes.
//
// The constructor takes four parameters. The first two are, as usual,
// the id of the monitored textbox, and id of the autocompletion menu.
// The third is the array you want to autocomplete from, and the fourth
// is the options block.
//
// Extra local autocompletion options:
// - choices - How many autocompletion choices to offer
//
// - partialSearch - If false, the autocompleter will match entered
//                    text only at the beginning of strings in the
//                    autocomplete array. Defaults to true, which will
//                    match text at the beginning of any *word* in the
//                    strings in the autocomplete array. If you want to
//                    search anywhere in the string, additionally set
//                    the option fullSearch to true (default: off).
//
// - fullSsearch - Search anywhere in autocomplete array strings.
//
// - partialChars - How many characters to enter before triggering
//                   a partial match (unlike minChars, which defines
//                   how many characters are required to do any match
//                   at all). Defaults to 2.
//
// - ignoreCase - Whether to ignore case when autocompleting.
//                 Defaults to true.
//
// It's possible to pass in a custom function as the 'selector'
// option, if you prefer to write your own autocompletion logic.
// In that case, the other options above will not apply unless
// you support them.

Autocompleter.Local = Class.create(Autocompleter.Base, {
  initialize: function(element, update, array, options) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },

  getUpdatedChoices: function() {
    this.updateChoices(this.options.selector(this));
  },

  setOptions: function(options) {
    this.options = Object.extend({
      choices: 10,
      partialSearch: true,
      partialChars: 2,
      ignoreCase: true,
      fullSearch: false,
      selector: function(instance) {
        var ret       = []; // Beginning matches
        var partial   = []; // Inside matches
        var entry     = instance.getToken();
        var count     = 0;

        for (var i = 0; i < instance.options.array.length &&
          ret.length < instance.options.choices ; i++) {

          var elem = instance.options.array[i];
          var foundPos = instance.options.ignoreCase ?
            elem.toLowerCase().indexOf(entry.toLowerCase()) :
            elem.indexOf(entry);

          while (foundPos != -1) {
            if (foundPos == 0 && elem.length != entry.length) {
              ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" +
                elem.substr(entry.length) + "</li>");
              break;
            } else if (entry.length >= instance.options.partialChars &&
              instance.options.partialSearch && foundPos != -1) {
              if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
                partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
                  elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                  foundPos + entry.length) + "</li>");
                break;
              }
            }

            foundPos = instance.options.ignoreCase ?
              elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) :
              elem.indexOf(entry, foundPos + 1);

          }
        }
        if (partial.length)
          ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
        return "<ul>" + ret.join('') + "</ul>";
      }
    }, options || { });
  }
});

// AJAX in-place editor and collection editor
// Full rewrite by Christophe Porteneuve <tdd@tddsworld.com> (April 2007).

// Use this if you notice weird scrolling problems on some browsers,
// the DOM might be a bit confused when this gets called so do this
// waits 1 ms (with setTimeout) until it does the activation
Field.scrollFreeActivate = function(field) {
  setTimeout(function() {
    Field.activate(field);
  }, 1);
};

Ajax.InPlaceEditor = Class.create({
  initialize: function(element, url, options) {
    this.url = url;
    this.element = element = $(element);
    this.prepareOptions();
    this._controls = { };
    arguments.callee.dealWithDeprecatedOptions(options); // DEPRECATION LAYER!!!
    Object.extend(this.options, options || { });
    if (!this.options.formId && this.element.id) {
      this.options.formId = this.element.id + '-inplaceeditor';
      if ($(this.options.formId))
        this.options.formId = '';
    }
    if (this.options.externalControl)
      this.options.externalControl = $(this.options.externalControl);
    if (!this.options.externalControl)
      this.options.externalControlOnly = false;
    this._originalBackground = this.element.getStyle('background-color') || 'transparent';
    this.element.title = this.options.clickToEditText;
    this._boundCancelHandler = this.handleFormCancellation.bind(this);
    this._boundComplete = (this.options.onComplete || Prototype.emptyFunction).bind(this);
    this._boundFailureHandler = this.handleAJAXFailure.bind(this);
    this._boundSubmitHandler = this.handleFormSubmission.bind(this);
    this._boundWrapperHandler = this.wrapUp.bind(this);
    this.registerListeners();
  },
  checkForEscapeOrReturn: function(e) {
    if (!this._editing || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (Event.KEY_ESC == e.keyCode)
      this.handleFormCancellation(e);
    else if (Event.KEY_RETURN == e.keyCode)
      this.handleFormSubmission(e);
  },
  createControl: function(mode, handler, extraClasses) {
    var control = this.options[mode + 'Control'];
    var text = this.options[mode + 'Text'];
    if ('button' == control) {
      var btn = document.createElement('input');
      btn.type = 'submit';
      btn.value = text;
      btn.className = 'editor_' + mode + '_button';
      if ('cancel' == mode)
        btn.onclick = this._boundCancelHandler;
      this._form.appendChild(btn);
      this._controls[mode] = btn;
    } else if ('link' == control) {
      var link = document.createElement('a');
      link.href = '#';
      link.appendChild(document.createTextNode(text));
      link.onclick = 'cancel' == mode ? this._boundCancelHandler : this._boundSubmitHandler;
      link.className = 'editor_' + mode + '_link';
      if (extraClasses)
        link.className += ' ' + extraClasses;
      this._form.appendChild(link);
      this._controls[mode] = link;
    }
  },
  createEditField: function() {
    var text = (this.options.loadTextURL ? this.options.loadingText : this.getText());
    var fld;
    if (1 >= this.options.rows && !/\r|\n/.test(this.getText())) {
      fld = document.createElement('input');
      fld.type = 'text';
      var size = this.options.size || this.options.cols || 0;
      if (0 < size) fld.size = size;
    } else {
      fld = document.createElement('textarea');
      fld.rows = (1 >= this.options.rows ? this.options.autoRows : this.options.rows);
      fld.cols = this.options.cols || 40;
    }
    fld.name = this.options.paramName;
    fld.value = text; // No HTML breaks conversion anymore
    fld.className = 'editor_field';
    if (this.options.submitOnBlur)
      fld.onblur = this._boundSubmitHandler;
    this._controls.editor = fld;
    if (this.options.loadTextURL)
      this.loadExternalText();
    this._form.appendChild(this._controls.editor);
  },
  createForm: function() {
    var ipe = this;
    function addText(mode, condition) {
      var text = ipe.options['text' + mode + 'Controls'];
      if (!text || condition === false) return;
      ipe._form.appendChild(document.createTextNode(text));
    };
    this._form = $(document.createElement('form'));
    this._form.id = this.options.formId;
    this._form.addClassName(this.options.formClassName);
    this._form.onsubmit = this._boundSubmitHandler;
    this.createEditField();
    if ('textarea' == this._controls.editor.tagName.toLowerCase())
      this._form.appendChild(document.createElement('br'));
    if (this.options.onFormCustomization)
      this.options.onFormCustomization(this, this._form);
    addText('Before', this.options.okControl || this.options.cancelControl);
    this.createControl('ok', this._boundSubmitHandler);
    addText('Between', this.options.okControl && this.options.cancelControl);
    this.createControl('cancel', this._boundCancelHandler, 'editor_cancel');
    addText('After', this.options.okControl || this.options.cancelControl);
  },
  destroy: function() {
    if (this._oldInnerHTML)
      this.element.innerHTML = this._oldInnerHTML;
    this.leaveEditMode();
    this.unregisterListeners();
  },
  enterEditMode: function(e) {
    if (this._saving || this._editing) return;
    this._editing = true;
    this.triggerCallback('onEnterEditMode');
    if (this.options.externalControl)
      this.options.externalControl.hide();
    this.element.hide();
    this.createForm();
    this.element.parentNode.insertBefore(this._form, this.element);
    if (!this.options.loadTextURL)
      this.postProcessEditField();
    if (e) Event.stop(e);
  },
  enterHover: function(e) {
    if (this.options.hoverClassName)
      this.element.addClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onEnterHover');
  },
  getText: function() {
    return this.element.innerHTML.unescapeHTML();
  },
  handleAJAXFailure: function(transport) {
    this.triggerCallback('onFailure', transport);
    if (this._oldInnerHTML) {
      this.element.innerHTML = this._oldInnerHTML;
      this._oldInnerHTML = null;
    }
  },
  handleFormCancellation: function(e) {
    this.wrapUp();
    if (e) Event.stop(e);
  },
  handleFormSubmission: function(e) {
    var form = this._form;
    var value = $F(this._controls.editor);
    this.prepareSubmission();
    var params = this.options.callback(form, value) || '';
    if (Object.isString(params))
      params = params.toQueryParams();
    params.editorId = this.element.id;
    if (this.options.htmlResponse) {
      var options = Object.extend({ evalScripts: true }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Updater({ success: this.element }, this.url, options);
    } else {
      var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Request(this.url, options);
    }
    if (e) Event.stop(e);
  },
  leaveEditMode: function() {
    this.element.removeClassName(this.options.savingClassName);
    this.removeForm();
    this.leaveHover();
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
    if (this.options.externalControl)
      this.options.externalControl.show();
    this._saving = false;
    this._editing = false;
    this._oldInnerHTML = null;
    this.triggerCallback('onLeaveEditMode');
  },
  leaveHover: function(e) {
    if (this.options.hoverClassName)
      this.element.removeClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onLeaveHover');
  },
  loadExternalText: function() {
    this._form.addClassName(this.options.loadingClassName);
    this._controls.editor.disabled = true;
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._form.removeClassName(this.options.loadingClassName);
        var text = transport.responseText;
        if (this.options.stripLoadedTextTags)
          text = text.stripTags();
        this._controls.editor.value = text;
        this._controls.editor.disabled = false;
        this.postProcessEditField();
      }.bind(this),
      onFailure: this._boundFailureHandler
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },
  postProcessEditField: function() {
    var fpc = this.options.fieldPostCreation;
    if (fpc)
      $(this._controls.editor)['focus' == fpc ? 'focus' : 'activate']();
  },
  prepareOptions: function() {
    this.options = Object.clone(Ajax.InPlaceEditor.DefaultOptions);
    Object.extend(this.options, Ajax.InPlaceEditor.DefaultCallbacks);
    [this._extraDefaultOptions].flatten().compact().each(function(defs) {
      Object.extend(this.options, defs);
    }.bind(this));
  },
  prepareSubmission: function() {
    this._saving = true;
    this.removeForm();
    this.leaveHover();
    this.showSaving();
  },
  registerListeners: function() {
    this._listeners = { };
    var listener;
    $H(Ajax.InPlaceEditor.Listeners).each(function(pair) {
      listener = this[pair.value].bind(this);
      this._listeners[pair.key] = listener;
      if (!this.options.externalControlOnly)
        this.element.observe(pair.key, listener);
      if (this.options.externalControl)
        this.options.externalControl.observe(pair.key, listener);
    }.bind(this));
  },
  removeForm: function() {
    if (!this._form) return;
    this._form.remove();
    this._form = null;
    this._controls = { };
  },
  showSaving: function() {
    this._oldInnerHTML = this.element.innerHTML;
    this.element.innerHTML = this.options.savingText;
    this.element.addClassName(this.options.savingClassName);
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
  },
  triggerCallback: function(cbName, arg) {
    if ('function' == typeof this.options[cbName]) {
      this.options[cbName](this, arg);
    }
  },
  unregisterListeners: function() {
    $H(this._listeners).each(function(pair) {
      if (!this.options.externalControlOnly)
        this.element.stopObserving(pair.key, pair.value);
      if (this.options.externalControl)
        this.options.externalControl.stopObserving(pair.key, pair.value);
    }.bind(this));
  },
  wrapUp: function(transport) {
    this.leaveEditMode();
    // Can't use triggerCallback due to backward compatibility: requires
    // binding + direct element
    this._boundComplete(transport, this.element);
  }
});

Object.extend(Ajax.InPlaceEditor.prototype, {
  dispose: Ajax.InPlaceEditor.prototype.destroy
});

Ajax.InPlaceCollectionEditor = Class.create(Ajax.InPlaceEditor, {
  initialize: function($super, element, url, options) {
    this._extraDefaultOptions = Ajax.InPlaceCollectionEditor.DefaultOptions;
    $super(element, url, options);
  },

  createEditField: function() {
    var list = document.createElement('select');
    list.name = this.options.paramName;
    list.size = 1;
    this._controls.editor = list;
    this._collection = this.options.collection || [];
    if (this.options.loadCollectionURL)
      this.loadCollection();
    else
      this.checkForExternalText();
    this._form.appendChild(this._controls.editor);
  },

  loadCollection: function() {
    this._form.addClassName(this.options.loadingClassName);
    this.showLoadingText(this.options.loadingCollectionText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        var js = transport.responseText.strip();
        if (!/^\[.*\]$/.test(js)) // TODO: improve sanity check
          throw('Server returned an invalid collection representation.');
        this._collection = eval(js);
        this.checkForExternalText();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadCollectionURL, options);
  },

  showLoadingText: function(text) {
    this._controls.editor.disabled = true;
    var tempOption = this._controls.editor.firstChild;
    if (!tempOption) {
      tempOption = document.createElement('option');
      tempOption.value = '';
      this._controls.editor.appendChild(tempOption);
      tempOption.selected = true;
    }
    tempOption.update((text || '').stripScripts().stripTags());
  },

  checkForExternalText: function() {
    this._text = this.getText();
    if (this.options.loadTextURL)
      this.loadExternalText();
    else
      this.buildOptionList();
  },

  loadExternalText: function() {
    this.showLoadingText(this.options.loadingText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._text = transport.responseText.strip();
        this.buildOptionList();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },

  buildOptionList: function() {
    this._form.removeClassName(this.options.loadingClassName);
    this._collection = this._collection.map(function(entry) {
      return 2 === entry.length ? entry : [entry, entry].flatten();
    });
    var marker = ('value' in this.options) ? this.options.value : this._text;
    var textFound = this._collection.any(function(entry) {
      return entry[0] == marker;
    }.bind(this));
    this._controls.editor.update('');
    var option;
    this._collection.each(function(entry, index) {
      option = document.createElement('option');
      option.value = entry[0];
      option.selected = textFound ? entry[0] == marker : 0 == index;
      option.appendChild(document.createTextNode(entry[1]));
      this._controls.editor.appendChild(option);
    }.bind(this));
    this._controls.editor.disabled = false;
    Field.scrollFreeActivate(this._controls.editor);
  }
});

//**** DEPRECATION LAYER FOR InPlace[Collection]Editor! ****
//**** This only  exists for a while,  in order to  let ****
//**** users adapt to  the new API.  Read up on the new ****
//**** API and convert your code to it ASAP!            ****

Ajax.InPlaceEditor.prototype.initialize.dealWithDeprecatedOptions = function(options) {
  if (!options) return;
  function fallback(name, expr) {
    if (name in options || expr === undefined) return;
    options[name] = expr;
  };
  fallback('cancelControl', (options.cancelLink ? 'link' : (options.cancelButton ? 'button' :
    options.cancelLink == options.cancelButton == false ? false : undefined)));
  fallback('okControl', (options.okLink ? 'link' : (options.okButton ? 'button' :
    options.okLink == options.okButton == false ? false : undefined)));
  fallback('highlightColor', options.highlightcolor);
  fallback('highlightEndColor', options.highlightendcolor);
};

Object.extend(Ajax.InPlaceEditor, {
  DefaultOptions: {
    ajaxOptions: { },
    autoRows: 3,                                // Use when multi-line w/ rows == 1
    cancelControl: 'link',                      // 'link'|'button'|false
    cancelText: 'cancel',
    clickToEditText: 'Click to edit',
    externalControl: null,                      // id|elt
    externalControlOnly: false,
    fieldPostCreation: 'activate',              // 'activate'|'focus'|false
    formClassName: 'inplaceeditor-form',
    formId: null,                               // id|elt
    highlightColor: '#ffff99',
    highlightEndColor: '#ffffff',
    hoverClassName: '',
    htmlResponse: true,
    loadingClassName: 'inplaceeditor-loading',
    loadingText: 'Loading...',
    okControl: 'button',                        // 'link'|'button'|false
    okText: 'ok',
    paramName: 'value',
    rows: 1,                                    // If 1 and multi-line, uses autoRows
    savingClassName: 'inplaceeditor-saving',
    savingText: 'Saving...',
    size: 0,
    stripLoadedTextTags: false,
    submitOnBlur: false,
    textAfterControls: '',
    textBeforeControls: '',
    textBetweenControls: ''
  },
  DefaultCallbacks: {
    callback: function(form) {
      return Form.serialize(form);
    },
    onComplete: function(transport, element) {
      // For backward compatibility, this one is bound to the IPE, and passes
      // the element directly.  It was too often customized, so we don't break it.
      new Effect.Highlight(element, {
        startcolor: this.options.highlightColor, keepBackgroundImage: true });
    },
    onEnterEditMode: null,
    onEnterHover: function(ipe) {
      ipe.element.style.backgroundColor = ipe.options.highlightColor;
      if (ipe._effect)
        ipe._effect.cancel();
    },
    onFailure: function(transport, ipe) {
      alert('Error communication with the server: ' + transport.responseText.stripTags());
    },
    onFormCustomization: null, // Takes the IPE and its generated form, after editor, before controls.
    onLeaveEditMode: null,
    onLeaveHover: function(ipe) {
      ipe._effect = new Effect.Highlight(ipe.element, {
        startcolor: ipe.options.highlightColor, endcolor: ipe.options.highlightEndColor,
        restorecolor: ipe._originalBackground, keepBackgroundImage: true
      });
    }
  },
  Listeners: {
    click: 'enterEditMode',
    keydown: 'checkForEscapeOrReturn',
    mouseover: 'enterHover',
    mouseout: 'leaveHover'
  }
});

Ajax.InPlaceCollectionEditor.DefaultOptions = {
  loadingCollectionText: 'Loading options...'
};

// Delayed observer, like Form.Element.Observer,
// but waits for delay after last key input
// Ideal for live-search fields

Form.Element.DelayedObserver = Class.create({
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.lastValue = $F(this.element);
    Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));
  },
  delayedListener: function(event) {
    if(this.lastValue == $F(this.element)) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
    this.lastValue = $F(this.element);
  },
  onTimerEvent: function() {
    this.timer = null;
    this.callback(this.element, $F(this.element));
  }
});/* --------- /javascripts/application.js --------- */ 
// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
/* --------- /javascripts/scriptaculous.js --------- */ 
// script.aculo.us scriptaculous.js v1.8.3, Thu Oct 08 11:23:33 +0200 2009

// Copyright (c) 2005-2009 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// For details, see the script.aculo.us web site: http://script.aculo.us/

var Scriptaculous = {
  Version: '1.8.3',
  require: function(libraryName) {
    try{
      // inserting via DOM fails in Safari 2.0, so brute force approach
      document.write('<script type="text/javascript" src="'+libraryName+'"><\/script>');
    } catch(e) {
      // for xhtml+xml served content, fall back to DOM methods
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = libraryName;
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  },
  REQUIRED_PROTOTYPE: '1.6.0.3',
  load: function() {
    function convertVersionString(versionString) {
      var v = versionString.replace(/_.*|\./g, '');
      v = parseInt(v + '0'.times(4-v.length));
      return versionString.indexOf('_') > -1 ? v-1 : v;
    }

    if((typeof Prototype=='undefined') ||
       (typeof Element == 'undefined') ||
       (typeof Element.Methods=='undefined') ||
       (convertVersionString(Prototype.Version) <
        convertVersionString(Scriptaculous.REQUIRED_PROTOTYPE)))
       throw("script.aculo.us requires the Prototype JavaScript framework >= " +
        Scriptaculous.REQUIRED_PROTOTYPE);

    var js = /scriptaculous\.js(\?.*)?$/;
    $$('head script[src]').findAll(function(s) {
      return s.src.match(js);
    }).each(function(s) {
      var path = s.src.replace(js, ''),
      includes = s.src.match(/\?.*load=([a-z,]*)/);
      (includes ? includes[1] : 'builder,effects,dragdrop,controls,slider,sound').split(',').each(
       function(include) { Scriptaculous.require(path+include+'.js') });
    });
  }
};

Scriptaculous.load();/* --------- /javascripts/builder.js --------- */ 
// script.aculo.us builder.js v1.8.3, Thu Oct 08 11:23:33 +0200 2009

// Copyright (c) 2005-2009 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

var Builder = {
  NODEMAP: {
    AREA: 'map',
    CAPTION: 'table',
    COL: 'table',
    COLGROUP: 'table',
    LEGEND: 'fieldset',
    OPTGROUP: 'select',
    OPTION: 'select',
    PARAM: 'object',
    TBODY: 'table',
    TD: 'table',
    TFOOT: 'table',
    TH: 'table',
    THEAD: 'table',
    TR: 'table'
  },
  // note: For Firefox < 1.5, OPTION and OPTGROUP tags are currently broken,
  //       due to a Firefox bug
  node: function(elementName) {
    elementName = elementName.toUpperCase();

    // try innerHTML approach
    var parentTag = this.NODEMAP[elementName] || 'div';
    var parentElement = document.createElement(parentTag);
    try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
      parentElement.innerHTML = "<" + elementName + "></" + elementName + ">";
    } catch(e) {}
    var element = parentElement.firstChild || null;

    // see if browser added wrapping tags
    if(element && (element.tagName.toUpperCase() != elementName))
      element = element.getElementsByTagName(elementName)[0];

    // fallback to createElement approach
    if(!element) element = document.createElement(elementName);

    // abort if nothing could be created
    if(!element) return;

    // attributes (or text)
    if(arguments[1])
      if(this._isStringOrNumber(arguments[1]) ||
        (arguments[1] instanceof Array) ||
        arguments[1].tagName) {
          this._children(element, arguments[1]);
        } else {
          var attrs = this._attributes(arguments[1]);
          if(attrs.length) {
            try { // prevent IE "feature": http://dev.rubyonrails.org/ticket/2707
              parentElement.innerHTML = "<" +elementName + " " +
                attrs + "></" + elementName + ">";
            } catch(e) {}
            element = parentElement.firstChild || null;
            // workaround firefox 1.0.X bug
            if(!element) {
              element = document.createElement(elementName);
              for(attr in arguments[1])
                element[attr == 'class' ? 'className' : attr] = arguments[1][attr];
            }
            if(element.tagName.toUpperCase() != elementName)
              element = parentElement.getElementsByTagName(elementName)[0];
          }
        }

    // text, or array of children
    if(arguments[2])
      this._children(element, arguments[2]);

     return $(element);
  },
  _text: function(text) {
     return document.createTextNode(text);
  },

  ATTR_MAP: {
    'className': 'class',
    'htmlFor': 'for'
  },

  _attributes: function(attributes) {
    var attrs = [];
    for(attribute in attributes)
      attrs.push((attribute in this.ATTR_MAP ? this.ATTR_MAP[attribute] : attribute) +
          '="' + attributes[attribute].toString().escapeHTML().gsub(/"/,'&quot;') + '"');
    return attrs.join(" ");
  },
  _children: function(element, children) {
    if(children.tagName) {
      element.appendChild(children);
      return;
    }
    if(typeof children=='object') { // array can hold nodes and text
      children.flatten().each( function(e) {
        if(typeof e=='object')
          element.appendChild(e);
        else
          if(Builder._isStringOrNumber(e))
            element.appendChild(Builder._text(e));
      });
    } else
      if(Builder._isStringOrNumber(children))
        element.appendChild(Builder._text(children));
  },
  _isStringOrNumber: function(param) {
    return(typeof param=='string' || typeof param=='number');
  },
  build: function(html) {
    var element = this.node('div');
    $(element).update(html.strip());
    return element.down();
  },
  dump: function(scope) {
    if(typeof scope != 'object' && typeof scope != 'function') scope = window; //global scope

    var tags = ("A ABBR ACRONYM ADDRESS APPLET AREA B BASE BASEFONT BDO BIG BLOCKQUOTE BODY " +
      "BR BUTTON CAPTION CENTER CITE CODE COL COLGROUP DD DEL DFN DIR DIV DL DT EM FIELDSET " +
      "FONT FORM FRAME FRAMESET H1 H2 H3 H4 H5 H6 HEAD HR HTML I IFRAME IMG INPUT INS ISINDEX "+
      "KBD LABEL LEGEND LI LINK MAP MENU META NOFRAMES NOSCRIPT OBJECT OL OPTGROUP OPTION P "+
      "PARAM PRE Q S SAMP SCRIPT SELECT SMALL SPAN STRIKE STRONG STYLE SUB SUP TABLE TBODY TD "+
      "TEXTAREA TFOOT TH THEAD TITLE TR TT U UL VAR").split(/\s+/);

    tags.each( function(tag){
      scope[tag] = function() {
        return Builder.node.apply(Builder, [tag].concat($A(arguments)));
      };
    });
  }
};/* --------- /javascripts/pie/core.js --------- */ 
/** pielib Core version 0.2
 *  (c) 2006-2008 MindPin.com - songliang
 *  
 *  created at 2007.03.27
 *  updated on 2008.6.13 
 *  
 *  require:
 *  prototype.js ver 1.6.0.1
 *  
 *  working on //W3C//DTD XHTML 1.0 Strict//EN"
 *
 *  For details, to the web site: http://www.mindpin.com/
 *--------------------------------------------------------------------------*/

pie={
	html:{},
	dom:{},
	data:{},
	js:{},
	util:{}
};

//bug fix..

//ie 6 image cache
//修正ie6的小图片反复加载问题
try{
	document.execCommand('BackgroundImageCache', false, true);
}catch(e){}

pie.isIE=function(){
	return window.navigator.userAgent.indexOf("MSIE")>=1;
}

pie.isFF=function(){
	return window.navigator.userAgent.indexOf("Firefox")>=1;
}

pie.isChrome=function(){
	return window.navigator.userAgent.indexOf("Chrome")>=1;
}

Element.addMethods({
  makeUnselectable: function(element, cursor){
    cursor = cursor || 'default';
    element.onselectstart = function(){
      return false;
    };
    element.unselectable = "on";
    element.style.MozUserSelect = "none";
    return element;
  },
  makeSelectable: function(element){
    element.onselectstart = function(){
      return true;
    };
    element.unselectable = "off";
    element.style.MozUserSelect = "";
    return element;
  },
  do_click:function(element){
    pie.do_click(element)
  }
});

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).getFormatValue("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).getFormatValue("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.getFormatValue = function(fmt){
  //author: meizz
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
}


pie.do_click = function(id,evt){
  var fire_on_this = $(id)
  if (document.createEvent){
    var evObj = document.createEvent('MouseEvents')
    evObj.initEvent( 'click', true, false )
    fire_on_this.dispatchEvent(evObj)
  }
  else if (document.createEventObject){
    fire_on_this.fireEvent('onclick')
  }
  if(evt) evt.stop();
}

//---XML code begin
pie.dom.xml={
  //获取空的XML解析对象
  getXMLDoc:function(){
    var xmlDoc=null;
    if(document.implementation && document.implementation.createDocument){
      xmlDoc=document.implementation.createDocument("","",null);
    }else if(typeof ActiveXObject != "undefined"){
      xmlDoc=new ActiveXObject('MSXML2.DOMDocument');
    }
    xmlDoc.async = false;
    return xmlDoc;
  },
  //从字符串获取XML解析对象
  getXMLDocFromString:function(str){
    var xmlDoc=null;
    if(document.implementation && document.implementation.createDocument){
      var parser=new DOMParser();
      xmlDoc = parser.parseFromString(str, "text/xml");
      delete parser;
    }else if(typeof ActiveXObject != "undefined"){
      xmlDoc=new ActiveXObject('MSXML2.DOMDocument');
      xmlDoc.loadXML(str);
    }
    return xmlDoc;
  },
  //进行XSLT->XML转换,返回字符串
  transformXML:function(xmlDoc,xslDoc){
    if(window.ActiveXObject){
      return xmlDoc.documentElement.transformNode(xslDoc);
    }else{
      var xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xslDoc);
      var fragment = xsltProcessor.transformToFragment(xmlDoc,document);
      var e=document.createElement("div");
      e.appendChild(fragment);
      return e.innerHTML;
    }
  },
  //将xml对象转化为字符串的方法
  serialize:function(dom) {
    var xml = dom.xml;
    if (xml == undefined) {
      try{
        var serializer = new XMLSerializer();
        xml = serializer.serializeToString(dom);
        delete serializer;
      } catch (error) {
        if (debug)
          alert("DOM serialization is not supported.");
      }
    }
    return xml;
  }
}
//---XML code end

//firefox控制台方法代理
pie.log = function(){
  var arr = [];
  for(i=0;i<arguments.length;i++){
    arr.push('arguments['+i+']')
  }
  eval('try{console.log('+arr.join(',')+')}catch(e){}')
}

pie.dir = function(){
  var arr = [];
  for(i=0;i<arguments.length;i++){
    arr.push('arguments['+i+']')
  }
  eval('try{console.dir('+arr.join(',')+')}catch(e){}')
}

//onload
pie.load = function(func){
  document.observe('dom:loaded',function(){
    try{func();}catch(e){alert(e);}
  });
}

//---以下是方法重载--------
if (pie.isFF()){
  HTMLElement.prototype.contains=function(node){// 是否包含某节点
    do if(node==this)return true;
    while(node=node.parentNode);
    return false;
  }
	
  HTMLElement.prototype.__defineGetter__("outerHTML",function(){
    var attr;
    var attrs=this.attributes;
    var str="<"+this.tagName;
    for(var i=0;i<attrs.length;i++){
      attr=attrs[i];
      if(attr.specified)
        str+=" "+attr.name+'="'+attr.value+'"';
    }
    if(!this.canHaveChildren)
      return str+">";
    return str+">"+this.innerHTML+"</"+this.tagName+">";
  });

  HTMLElement.prototype.__defineGetter__("canHaveChildren",function(){
    return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
  });
	
  Event.prototype.__defineGetter__("fromElement",function(){// 返回鼠标移出的源节点
    var node;
    if(this.type=="mouseover")
      node=this.relatedTarget;
    else if(this.type=="mouseout")
      node=this.target;
    if(!node) return null;
    while(node.nodeType!=1)node=node.parentNode;
    return node;
  });
	
  Event.prototype.__defineGetter__("toElement",function(){// 返回鼠标移入的源节点
    try{
      var node;
      if(this.type=="mouseout")
        node=this.relatedTarget;
      else if(this.type=="mouseover")
        node=this.target;
      if(!node || (node.tagName=='INPUT' && node.type=='file')) return null;
      while(node.nodeType!=1) node=node.parentNode;
      return node;
    }catch(e){}
  });
}/* --------- /javascripts/pie/menu.js --------- */ 
/** pielib Menu version 0.2e
 *  (c) 2006-2008 MindPin.com - songliang
 *  
 *  require:
 *  prototype.js ver 1.6.0.1
 *  builder.js
 *  
 *  working on //W3C//DTD XHTML 1.0 Strict//EN"
 *
 *  For details, to the web site: http://www.mindpin.com/
 *--------------------------------------------------------------------------*/

/*
 * 07年写的代码，现在看比较烂，抽时间重构
 **/

//---Menu code begin
pie.html.Menu=Class.create({
  initialize:function(options){
    //check
    options=options||{};

    //construct
    this.options=options;

    this.items=[];

    //this._el 用于保存菜单dom
    this._el = null;
    this.caller=null;

    this.loaded=false;

    this.handles = [];

    //打开方式，默认是右键.
    this.on=options.on||"contextmenu";
    //关闭方式，默认是任何点击.
    this.closeon=options.closeon||"anyclick";

    //宽度，默认是100.
    this.width = parseInt(options.width)||100;
    this.line_height = parseInt(options.line_height)||20;
    //宽高度修正值，根据css来说，默认是4px
    this.width_diff = 4;
    this.height_diff = 4;

    //observer
    this.observer=$(options.observer||document.body);

    this.afterload=options.afterload||function(){};

    this.log = function(){};
    //this.log = new pie.Logger().get("debugger");
  },

  KIND:{
    HASH:'hash',
    DOM:'dom'
  },

  //caller 参数用于把一个菜单绑定到多个dom上的情况
  //mindmap_editor中有这种情况
  append:function(dom,at,caller){
    var handle = {'dom':dom,'at':at};

    this.handles.push(handle);

    //出现位置，默认是鼠标光标位置.
    at = at||"pointer";

    //this.on bind
    //只有mouseover比较特殊呢
    switch(this.on){
      case "mouseover":{
        $(dom).observe("mouseover",function(evt){
          evt.stop();
          var to_el=evt.toElement;var from_el=evt.fromElement;
          if((el==to_el)&&(!el.contains(from_el))){ //TODO 这里好像有点问题 再说吧
            this.load(handle,caller);
          }
        }.bindAsEventListener(this));
      }break;

      case "contextmenu":
      default:{
        $(dom).observe(this.on, function(evt){
          evt.stop();
          if($(dom).hasClassName('menu-opened')){
            this.unload();
          }else{
            $$('ul.p_h_m').each(function(m){$(m).remove();})
            $$('.menu-opened').each(function(x){$(x).removeClassName('menu-opened')})
            this.load(handle,caller,evt);
            $(dom).addClassName('menu-opened');
          }
        }.bind(this));
      }
    }

    //this.closeon bind
    switch(this.closeon){
      case "out":{
        $(dom).observe("mouseout",function(evt){
          evt.stop();
          var te=evt.toElement;
          //mouse is out of this._el?
          if (this._el) {
            if (!dom.contains(te) && !(this._el.contains(te))) {
              this.unload();
            }
          }
        }.bind(this));
      }break;

      case "anyclick":
      default:{}
    }
  },

  //Add item into Menu
  add:function(title,itemoptions){
    itemoptions=itemoptions||{};
    itemoptions.title=(itemoptions.title||title).escapeHTML();
    itemoptions.kind = this.KIND.HASH;
    this.items.push(itemoptions);
    return this;
  },

  //Add dom into Menu
  add_dom:function(dom,itemoptions){
    itemoptions=itemoptions||{};
    itemoptions.kind = this.KIND.DOM;
    itemoptions.dom = dom;
    this.items.push(itemoptions);
    return this;
  },

  //Remove item from Menu
  //By index or by title. Revmove the first founded when there is many same title;
  remove:function(i){
    if(typeof i=="number"){
      this.items=this.items.without(this.items[i])
    }else if(typeof i =="string"){
      this.items.each(function(item){
        if(item.title==i){
          this.items=this.items.without(item);
          throw $break;
        }
      }.bind(this));
    }else{
      this.items=this.items.without(i);
    }
  },

  load:function(handle,caller,evt){
    setTimeout(function(){
      //Create a Element , if it is not exist
      this.caller=caller;
      
      if(this._el){
        this.log("load menu cache");
      }else{
        this.log("create menu element");

        var m = this._build_ul_dom();

        this.items.each(function(item){
          var menuitem  = this._build_li_dom(item);

          //bind event
          item.func = item.func||function(){};

          menuitem
          .observe("mouseover",function(){
            Element.addClassName(menuitem,"item-mouseover");
          })
          .observe("mouseout",function(){
            Element.removeClassName(menuitem,"item-mouseover");
          })
          .observe("mousedown",function(evt){evt.stop();})
          .observe("contextmenu",function(evt){evt.stop();})
          .observe("click",function(evt){
            evt.stop();
            Element.removeClassName(menuitem,"item-mouseover");
            item.func.bind(this.caller)();
            this.unload();
          }.bindAsEventListener(this))
          
          $(m).insert(menuitem);
          item.li_el = menuitem;

        }.bind(this));

        this._unload_on_mousedown();

        this._el=m;
      }

      //append to observer
      var position = this._getPosition(handle,evt)
      this._append_to_observer(position.x,position.y);
    }.bind(this),0)
  },

  _build_li_dom:function(item){
    switch(item.kind){
      case this.KIND.HASH:{
        return $(Builder.node("li",{
          "class":item.func?"has_event":"no_event"
        },item.title));
      }break;
      case this.KIND.DOM:{
        return $(Builder.node("li",{
          "class":"dom"
        },[$(item.dom).show()]));
      }break;
    }
  },

  _build_ul_dom:function(){
    return $(Builder.node("ul", {
      id:Math.random(),
      "class": "p_h_m",
      "style":"width:"+this.width+"px;"
    }));
  },

  _unload_on_mousedown:function(){
    document.observe("mousedown",this.unload.bind(this));
  },

  _init_show_flag:function(){
    this.items.each(function(i){
      if(i.flag && !i.flag()){
        $(i.li_el).hide(); //2008-12-25 加入一个判断某菜单项是否显示的标志
      }else{
        $(i.li_el).show();
      }
    }.bind(this));
  },

  _append_to_observer:function(x,y){
    this._el.style.left = x+"px";
    this._el.style.top = y+"px";
    this.observer.appendChild(this._el);
    this.afterload();
    this.loaded = true;
  },

  _total_width:function(){
    return this.width + this.width_diff;
  },

  _total_height:function(){
    return this.items.length * this.line_height + this.height_diff;
  },

  _getPosition:function(handle,evt){
    var dom = handle.dom , at = handle.at;
    var x;
    var y;

    var oof=Element.cumulativeOffset(this.observer.parentNode);
    var ox=oof.left;
    var oy=oof.top;
    //默认情况下 observer是body 所以 ox oy 默认都是 0
    var co,dim,cso;

    switch(at){
      case "bottom":
      case "bottom_left":{
          co = dom.cumulativeOffset();
          cso = dom.cumulativeScrollOffset();
          dim = dom.getDimensions();
          x = co.left - cso.left - ox;
          y = co.top - cso.top + dim.height-oy;
          break;
        }
      case "bottom_center":{
        co = dom.cumulativeOffset();
        cso = dom.cumulativeScrollOffset();
        dim = dom.getDimensions();
        x = co.left - cso.left + (dim.width-this.width)/2-ox;
        y = co.top - cso.top + dim.height-oy;
        break;
      }
      case "bottom_right":{
        co = dom.cumulativeOffset();
        cso = dom.cumulativeScrollOffset();
        dim = dom.getDimensions();
        x = co.left - cso.left + dim.width - this._total_width();
        y = co.top - cso.top + dim.height;
        //3.13 特殊情况处理 菜单超出屏幕下边缘
        var screen_height = document.viewport.getHeight();
        var total_height = this._total_height()
        var menu_bottom = y + total_height;
        if(menu_bottom > screen_height){
          y = co.top - cso.top - total_height;
        }
        break;
      }
      case "":
      case "pointer":
      default:{
        x=Event.pointerX(evt);
        y=Event.pointerY(evt);
        break;
      }
    }
    this.log("x:"+x+",y:"+y);
    return {"x":x,"y":y};
  },

  //Remove all Menu dom from document
  unload:function(){
    if(this.loaded) {
      this._el.remove();
      this.loaded = false;
      this.handles.each(function(handle){handle.dom.removeClassName('menu-opened')});
    }
  }
});
//---Menu code end/* --------- /javascripts/pie/inline-menu.js --------- */ 
pie.inline_menu = {
  init:function(){
    //生成页面上的所有菜单，同时避免重复生成
    $$('.inline-menu').each(function(menu_dom){
      this._init_menu(menu_dom);
    }.bind(this));
  },

  _init_menu:function(menu_dom){
    //如果已经生成过了，排除
    if($(menu_dom).hasClassName('menu-packed')) return;
    //生成
    menu_dom.addClassName('menu-packed');
    
    var menu = new pie.html.Menu({on:'mousedown',width:80});
    var menu_icon = menu_dom.down('.menu-icon');
    menu_dom.down('.menu-body').select('a').each(function(a){
      menu.add_dom(a);
    })
    menu.append(menu_icon,"bottom_right");
  }

}


/* --------- /javascripts/pie/cell.js --------- */ 
pie.cell={
  init:function(){
  },

  //关闭cell，但不改变历史记录
  _close_cell:function(position){
    $$('#PL-'+position+' .content-cell').each(function(cell){
      $(cell).remove();
    })
  },

  //在某个页面区块显示loading效果
  show_loading:function(position){
    var el = $('PL-'+position)
    if(el){
      el.update(this.loading_cell.cloneNode(true));
      this.hide_blank_paper_cell();
    }
  },

  update_html:function(position,html_str){
    var el = $('PL-'+position)
    if(el){
      el.update(html_str);
    }
  },

  refresh_page_selectors:function(){
    //根据历史记录进行页面一些链接的高亮
    $$('.page-selector').each(function(ps){
      $(ps).removeClassName('url-active')
    });
    pie.history.hash.each(function(h){
      var url = h.value;
      var str = ':"'+url+'"'; //TODO 此处hack了，为了便于维护，以后要改掉
      $$('.page-selector').each(function(ps){
        if(ps.innerHTML.include(str)){
          $(ps).addClassName('url-active')
        }
      });
    })
  }
}/* --------- /javascripts/pie/mplist.js --------- */ 
pie.mplist = {
  init:function(){
    this.selected = null;
    this.over = null;
    this.editing = null;

    this._enabled_el_ids = [];

    document.observe('mplist:loaded',function(){
      //所有mplist的鼠标滑过高亮效果和选择效果
      this.init_mplist_mouse_over_and_out_effects_and_click_select();
    }.bind(this));

    //处理 mplist:select 事件
    document.observe('mplist:select',function(evt){
      mplist_select_handler(evt);
    })

    this.loaded();
  },

  loaded:function(){
    document.fire('mplist:loaded');
  },

  //替换paper内容之前，清除已绑定事件的列表记录
  clear_paper_events_cache:function(){
    $$('#mppaper .mplist').each(function(list){
      this._enabled_el_ids = this._enabled_el_ids.without(list.id)
    }.bind(this))
  },

  init_mplist_mouse_over_and_out_effects_and_click_select:function(){
    //只有有selectable样式的列表才能被选择
    $$('.mplist.mouseoverable').each(function(list){
      //已经绑定了事件的，不重复绑定
      //1月10日 由于id冲突，这里检测重复绑定时直接通过对象检测，但这样可能会导致内存泄漏
      //以后应该修改
      if(!this._enabled_el_ids.include(list)){
        this._init_mouseover(list);
        this._init_mouseout(list);
        this._init_click_select(list);
        this._enabled_el_ids.push(list);
      }
    }.bind(this));
  },
  _init_mouseover:function(list){
    $(list).observe('mouseover',function(evt){
      var to_el = $(evt.toElement);
      //只有从外部移入li时，才触发事件
      if(to_el){
        var li = this._is_in_li(to_el,list)
        if(li){
          //记录当前被鼠标滑过的li，同时防止有两个li同时有mouseover的class
          if(this.over) this.over.removeClassName('mouseover');
          this.over = li
          li.addClassName('mouseover');
        }
      }
    }.bind(this))
  },
  _init_mouseout:function(list){
    $(list).observe('mouseout',function(evt){
      var from_el = $(evt.fromElement);
      var to_el = $(evt.toElement);
      //只有移出li外部时，才触发事件
      // ancestors 表示祖先节点
      if(!to_el || $(from_el).ancestors().include(to_el)){
        var li = this._is_in_li(from_el,list)
        if(li) li.removeClassName('mouseover');
      }
    }.bind(this))
  },
  _init_click_select:function(list){
    $(list).observe('click',function(evt){
      var el = evt.element();
      var li = this._is_in_li(el,list);
      if(li) this._do_select_mplist_li(li);
    }.bind(this))
  },

  _is_in_li:function(el,list){
    //如果el自身是li，则看el的父节点是否是当前list，如果是，返回el
    if(el.tagName == 'LI' && el.parentNode == list) return el;
    //如果el在li之中，则看el之上最近的ul是否是当前list，如果是，返回el之上最近的li
    var li = $(el).up('li');
    if(li && $(el).up('ul') == list) return li
    //以上都不是的话，返回false
    return false;
  },

  //根据传入的el获取所在的mplist li
  _get_mpli:function(el){
    if(el.tagName == 'LI' && el.parentNode.tagName=='UL') return el;
    var li = $(el).up('li');
    if(li && $(el).up('ul')) return li
    return false;
  },

  _do_select_mplist_li:function(li){
    if(!$(li).hasClassName('mouseselected')){
      this._do_mp_select_mplist_li_change_class_name(li);
      //触发事件
      li.fire('mplist:select');
    }
  },
  _do_mp_select_mplist_li_change_class_name:function(li){
    //取消原来的选择
    if(this.selected) $(this.selected).removeClassName('mouseselected');
    //选择新的
    this.selected = li;
    $(li).addClassName('mouseselected');
  },


  //插入一个行新建的表单
  open_new_form:function(new_form_html_str,list,prev_li_or_id){
    var editing_dom = $(Builder.node('li',{'id':'li_new','class':'editing_form'}));

    editing_dom.update(new_form_html_str);

    if(prev_li_or_id){
      var prev = $(prev_li_or_id)
      prev.insert({'after':editing_dom});
    }else{
      $(list).insert(editing_dom);
    }

    init_rich_text_editor();
    pie.inline_menu.init();
  },

  //切换到行编辑模式
  open_edit_form:function(li_or_id,editing_html_str){
    //选中行元素，附加样式
    var li = $(li_or_id);
    li.addClassName('editing');
    //生成编辑模式的li元素
    var editing_dom = $(Builder.node('li',{'id':'li_edit_'+li.id,'class':'editing_form'}));
    editing_dom.update(editing_html_str);
    //插入dom
    li.insert({'after':editing_dom});
    
    this.editing_li = li;

    init_rich_text_editor();
    pie.inline_menu.init();
  },

  //关闭行编辑模式
  close_edit_form:function(){
    $$('#li_new').each(function(li_new){
      $(li_new).remove();
    }) // TODO 暂时这么写 稍后重构掉

    if(this.editing_li){
      $('li_edit_'+this.editing_li.id).remove();
      $(this.editing_li).removeClassName('editing');
      this.editing_li = null
    }
  },
  
  close_all_new_form: function(list){
    if(list){
      $(list).select('#li_new').each(function(li_new){
        $(li_new).remove();
      })
    }else{
      $$('#li_new').each(function(li_new){
        $(li_new).remove();
      }) //暂时先这样写，稍后重构到ui render方法里，去掉这个ifelse
    }
  },

  //插入li_html_str到list中
  //被rjs调用的方法，参数比较诡异
  insert_li: function(list,li_html_str,prev_li_pattern){
    var li = Builder.node('div').update(li_html_str).firstChild; //转换字符串为dom
    
    if(prev_li_pattern){
      if(prev_li_pattern == 'TOP'){
        $(list).insert({'top':li});
      }else{
        $$(prev_li_pattern).each(function(prev_li){
          prev_li.insert({'after':li});
        });
      }
    }else{
      $(list).insert(li);
    }

    init_rich_text_editor();
    pie.inline_menu.init();

    pie.tab.show_content_in_tab(list);
    init_mini_buttons();

    $(li).highlight({duration:0.3,afterFinish:function(){pie.mplist.clear_background(li)}});
  },
  
  remove_li: function(_li){
    var li = $(_li)
    $(li).fade({duration:0.3});
    $(li).highlight({startcolor: '#FFECCB',duration:0.3,afterFinish:function(){pie.mplist.clear_background(li)}});
    setTimeout(function() {
      var list = $(li).parentNode;
      $(li).remove();
    }.bind(this), 300);
  },

  update_li: function(li,new_li_html_str){
    this.close_edit_form();
    $(li).update(new_li_html_str);
    init_rich_text_editor();
    pie.inline_menu.init();
    $(li).highlight({duration:0.3,afterFinish:function(){pie.mplist.clear_background(li)}});
  },

  clear_background: function(dom){
    dom.setStyle({'backgroundImage':'','backgroundColor':''})
  },

  deal_app_json: function(json_str,prefix,list_id){
    try{
      var json = json_str.evalJSON();
      var html = json.html;
      var li_id = prefix + '_' + json.id;
      $$('#'+list_id).each(function(list){
        if(list.down('#'+li_id)){
          this.update_li($(li_id),html);
        }else{
          var li_html_str = '<li id="'+li_id+'">' + html + '</li>'
          this.insert_li(list,li_html_str,'TOP');
        }
      }.bind(this));
    }catch(e){
      alert(e)
    }
  }
}


/* --------- /javascripts/pie/tab.js --------- */ 
pie.tab = {
  init:function(){
    //生成页面上的所有页签，同时避免重复生成
    $$('.tab-panel').each(function(tab_panel){
      this._init_panel(tab_panel);
    }.bind(this));
  },

  _init_panel:function(tab_panel){
    //如果已经生成过了，排除
    if($(tab_panel).hasClassName('tab-packed')) return;
    //生成
    tab_panel.addClassName('tab-packed');
    // 初始化tab栏dom
    this._init_tab_control(tab_panel);
    //最后，把整个页签面板置于初始化状态，选中一个
    var set = tab_panel.down('.tab-panel-set');
    var items = set.childElements();
    items.each(function(x){
      $(x).hide()
    });
    items[0].show();
    var default_tab_item = tab_panel.down('.tab-control .tab-control-li')
    default_tab_item.addClassName('tab-selected');
  },

  // 初始化 tab栏dom
  _init_tab_control:function(tab_panel){
    var set = tab_panel.down('.tab-panel-set');
    var items = set.childElements();
    var ul = tab_panel.down('.tab-control')
    var clis = ul.childElements();
    this._init_tab_control_tab_el(clis,items)
  },

  // 初始化 tab栏 里面的标签的 dom
  _init_tab_control_tab_el:function(clis,items){
    clis.each(function(cli,index){
      // 绑定事件
      cli.observe('click',function(evt){
        evt.stop();
        //dom显示隐藏控制
        items.each(function(x){$(x).hide()});
        $(items[index]).show();
        //页签选中状态控制
        clis.each(function(x){x.removeClassName('tab-selected')})
        cli.addClassName('tab-selected')
        // 异步模式
        var a = cli.down("a")
        if(a){
          var tip = a.readAttribute("data-tip")
          $(items[index]).update(Builder.node("div",{"class":"loadingbox"},[Builder.node("div",{"class":"loading-img"}),Builder.node("div",{"class":"loading-tip"},tip + "载入中")]))
          var url = a.readAttribute("data-url")
          new Ajax.Request(url,{
            method: 'get',
            onSuccess: function(transport){
              $(items[index]).update(transport.responseText)
            }
          })
        }
      }.bind(this));
    }.bind(this))
  },
    //根据传入的内容，点亮对应的页签
  show_content_in_tab:function(dom){
    $(dom).ancestors().each(function(el){
      if($(el).hasClassName('tab-panel')){
        //找到所在的tab-panel
        var tab_panel = el;
        //找到对应的页签
        var tab_control_li = this._get_tab_control_li(tab_panel,dom)
        //点击之
        pie.do_click(tab_control_li)
      }
    }.bind(this))
  },
  show_tab:function(tab_panel,li_index){
    //找到对应的页签
    var tab_control_li = $(tab_panel).down('.tab-control').childElements()[li_index];
    //点击之
    pie.do_click(tab_control_li)
  },
  _get_tab_control_li:function(tab_panel,dom){
    var li_index;
    $(tab_panel).down('.tab-panel-set').childElements().each(function(panel_item,index){
      if(panel_item.contains(dom)) li_index = index;
    });
    var li = tab_panel.down('.tab-control').childElements()[li_index]
    return li;
  }
}/* --------- /javascripts/views/base.js --------- */ 
pie.load(function(){
  pie.cell.init();
  pie.tab.init();
  pie.mplist.init();
  init_mini_buttons();
});

function init_mini_buttons(){
  $$('a.minibutton').each(function(btn){
    if(btn.hasClassName('inited')) return;
    btn
      .observe('mousedown',minibutton_toggle_mousedown)
      .observe('mouseup',minibutton_toggle_mouseup)
      .observe('mouseleave',minibutton_toggle_mouseup);
    btn.addClassName('inited');
  })
}

function minibutton_toggle_mousedown(){
  $(this).addClassName('mousedown');
}

function minibutton_toggle_mouseup(){
  $(this).removeClassName('mousedown');
}

//此处放置一些全局的函数

function enable_mouse_over(el){
  $(el)
  .observe('mouseover',function(evt){
    evt.stop();
    el.addClassName('mouseover');
  }.bind(this))
  .observe('mouseout',function(evt){
    evt.stop();
    el.removeClassName('mouseover');
  }.bind(this))
  return el;
}

function show_ajax_info(options){
  options = options || {}
  var mode = options.mode;
  switch(mode){
    case 'success':{
      pie.page_cache.ajax_page_info_div.remove();
    }break;
    case 'failure':{
      pie.page_cache.ajax_page_info_div.remove();
      show_fbox('<div style="background:red;font-size:30px;color:white;font-weight:bold;">啊喔，出錯了..! &gt;_&lt;</div>')
    }
    default:{
      document.body.appendChild(pie.page_cache.ajax_page_info_div.addClassName('ajax-page-loading').update('正在讀取...'));
    }
  }
}

//切换页面皮肤样式
function toggle_theme(theme){
  var csslink = $$('link[t=theme]')[0];
  csslink.href = '/stylesheets/themes/'+theme+'.css'
  if(pie.isIE()){
    var csslink_ie = $$('link[t=themeie]')[0];
    csslink_ie.href = '/stylesheets/themes/'+theme+'.ie.css'
  }
}

function show_fbox(string){
  Prototype.facebox(string);
  pie.tab.init();
}

function close_fbox(){
  Prototype.facebox.close()
};/* --------- /javascripts/pie/autocompleter.js --------- */ 
var MindpinAutocompleter = { };
MindpinAutocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.old_element_value = this.element.value;

    this.animation_time = 0.05;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4; //每0.4秒之内最多发送一个请求
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
    function(element, update){
      if(!update.style.position || update.style.position=='absolute') {
        update.style.position = 'absolute';
        Position.clone(element, update, {
          setHeight: false,
          offsetTop: element.offsetHeight
        });
      }
      Effect.Appear(update,{
        duration:this.animation_time
      });
    }.bind(this);
    this.options.onHide = this.options.onHide ||
    function(element, update){
      new Effect.Fade(update,{
        duration:this.animation_time
      })
    }.bind(this);

    if(typeof(this.options.tokens) == 'string')
      this.options.tokens = new Array(this.options.tokens);
    // Force carriage returns as token delimiters anyway
    if (!this.options.tokens.include('\n'))
      this.options.tokens.push('\n');

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, 'keydown', this.onKeyDownPress.bindAsEventListener(this));
    Event.observe(this.element, 'keyup', function(){
      if(!this.periodical_executer){
        this.periodical_executer = new PeriodicalExecuter(this._period_request.bind(this), 0.01);
        setTimeout(function(){
          this.periodical_executer.stop();
          this.periodical_executer = null;
        }.bind(this),this.options.frequency*1000);
      }
    }.bindAsEventListener(this))
    if(!pie.cached_username_advice_hash) pie.cached_username_advice_hash = new Hash();
  },

  _period_request:function(){
    var input_str = this.element.value;

    if(this.old_element_value != input_str){
      this.changed = true;
      this.hasFocus = true;

      this.onObserverEvent();
    }
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix &&
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update,
        '<iframe id="' + this.update.id + '_iefix" '+
        'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
        'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },

  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {
      setTop:(!this.update.style.height)
    });
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyDownPress: function(event){
    if(this.active)
      switch(event.keyCode) {
        case Event.KEY_TAB:
        case Event.KEY_RETURN:
          this.selectEntry();
          Event.stop(event);
        case Event.KEY_ESC:
          this.hide();
          this.active = false;
          Event.stop(event);
          return;
        case Event.KEY_LEFT:
        case Event.KEY_RIGHT:
          return;
        case Event.KEY_UP:
          this.markPrevious();
          this.render();
          Event.stop(event);
          return;
        case Event.KEY_DOWN:
          this.markNext();
          this.render();
          Event.stop(event);
          return;
      }
    else
    if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN ||
      (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
      this.index = element.autocompleteIndex;
      this.render();
    }
    Event.stop(event);
  },

  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
        Element.addClassName(this.getEntry(i),"selected") :
        Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) this.index--;
    else this.index = this.entryCount-1;
    this.getEntry(this.index).scrollIntoView(true);
  },

  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
    else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },

  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  //选择了某一项之后应该如何处理，需要根据情况换用不同的实现
  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
        this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;

      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;
    this.tokenBounds = null;
    if(this.getToken().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.old_element_value = this.element.value;
  },

  getToken: function() {
    var bounds = this.getTokenBounds();
    return this.element.value.substring(bounds[0], bounds[1]).strip();
  },

  getTokenBounds: function() {
    if (null != this.tokenBounds) return this.tokenBounds;
    var value = this.element.value;
    if (value.strip().empty()) return [-1, 0];
    var diff = arguments.callee.getFirstDifferencePos(value, this.old_element_value);
    var offset = (diff == this.old_element_value.length ? 1 : 0);
    var prevTokenPos = -1, nextTokenPos = value.length;
    var tp;
    for (var index = 0, l = this.options.tokens.length; index < l; ++index) {
      tp = value.lastIndexOf(this.options.tokens[index], diff + offset - 1);
      if (tp > prevTokenPos) prevTokenPos = tp;
      tp = value.indexOf(this.options.tokens[index], diff + offset);
      if (-1 != tp && tp < nextTokenPos) nextTokenPos = tp;
    }
    return (this.tokenBounds = [prevTokenPos + 1, nextTokenPos]);
  }
});

MindpinAutocompleter.Base.prototype.getTokenBounds.getFirstDifferencePos = function(newS, oldS) {
  var boundary = Math.min(newS.length, oldS.length);
  for (var index = 0; index < boundary; ++index)
    if (newS[index] != oldS[index])
      return index;
  return boundary;
};

Ajax.MindpinAutocompleter = Class.create(MindpinAutocompleter.Base, {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    //this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    this.startIndicator();

    var entry = encodeURIComponent(this.options.paramName) + '=' +
    encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
    this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams)
      this.options.parameters += '&' + this.options.defaultParams;

    //2月28日，增加本地缓存
    //3月1日，因为考虑到用户信息修改等问题，暂时先不用，而且服务端缓存和HTTP缓存已经足够强
    var input_str = this.element.value;
    //    var cached_response_text = pie.cached_username_advice_hash.get(input_str)
    //    if(!cached_response_text){
    //如果值没有缓存，则发起请求
    new Ajax.Request(this.url, Object.extend(Object.clone(this.options),{
      onComplete: function(request) {
        pie.cached_username_advice_hash.set(input_str,request.responseText);
        this.updateChoices(request.responseText);
      }.bind(this)
    }));
  //    }else{
  //      //否则直接取缓存好了
  //      this.updateChoices(cached_response_text);
  //    }
  }
});

// 用于控制站内信列表选中的类 李飞添加
MplistLiCheckBoxSelect = Class.create({
  initialize: function (dom_id){
    this.ul_dom = $(dom_id)
    this.add_checkbox_change_evt()
  },
  check_message_topic_li: function(li){
    li.select("input[type='checkbox']").each(function(check_box){
      check_box.checked = true
      this.check_or_cancel(check_box)
    }.bind(this))
  },
  cancel_check_message_topic_li: function(li){
    li.select("input[type='checkbox']").each(function(check_box){
      check_box.checked = false
      this.check_or_cancel(check_box)
    }.bind(this))
  },
  check_or_cancel:function(input){
    var li = input.up('li')
    if(input.checked == true){
      li.addClassName("checkbox_selected")
    }else if(input.checked == false){
      li.removeClassName("checkbox_selected")
    }
  },
  add_checkbox_change_evt:function(){
    $(this.ul_dom).observe('change',function(evt){
      var element = Event.element(evt)
      if(element.tagName == 'INPUT' && element.readAttribute('type')=='checkbox'){
        this.check_or_cancel(element)
      }
    }.bind(this))
  }
});

MplistLiCheckBoxSelect.select = function(mplist,checked,selector_func){
  $(mplist).childElements().each(function(cld){
    if(cld.tagName=='LI'){
      var li = cld;
      if(selector_func == null || selector_func(li)){
        MplistLiCheckBoxSelect._select(li,checked)
      }else{
        MplistLiCheckBoxSelect._select(li,false)
      }
    }
  });
};

MplistLiCheckBoxSelect._select = function(li,checked){
  li.select("input[type='checkbox']").each(function(check_box){
    check_box.checked = checked
  });
  if(checked){
    li.addClassName("checkbox_selected");
  }else{
    li.removeClassName("checkbox_selected");
  }
}

//MplistLiCheckBoxSelect = Class.create({
//  initialize: function (settings){
//    this.settings = settings
//    this.init()
//    this.add_checkbox_change_evt()
//  },
//  init:function(){
//    var settings = this.settings
//    settings.check_all_btns.each(function(btn){
//      btn.observe('click',function(evt){
//        evt.stop()
//        var lis = this.select_all_message_topic_li()
//        lis.each(function(li){
//          this.check_message_topic_li(li)
//        }.bind(this))
//      }.bind(this))
//    }.bind(this))
//
//    settings.cancel_check_all_btns.each(function(btn){
//      btn.observe('click',function(evt){
//        evt.stop()
//        this.cancel_check_all_message_topic_li()
//      }.bind(this))
//    }.bind(this))
//
//    if(settings.check_read_btns!=null){
//      settings.check_read_btns.each(function(btn){
//        btn.observe('click',function(evt){
//          evt.stop()
//          this.cancel_check_all_message_topic_li()
//          var read_lis = this.select_read_message_topic_li()
//          read_lis.each(function(li){
//            this.check_message_topic_li(li)
//          }.bind(this))
//        }.bind(this))
//      }.bind(this))
//    }
//
//    if(settings.check_unread_btns!=null){
//      settings.check_unread_btns.each(function(btn){
//        btn.observe('click',function(evt){
//          evt.stop()
//          this.cancel_check_all_message_topic_li()
//          var read_lis = this.select_unread_message_topic_li()
//          read_lis.each(function(li){
//            this.check_message_topic_li(li)
//          }.bind(this))
//        }.bind(this))
//      }.bind(this))
//    }
//
//    if(settings.check_used_btns!=null){
//      settings.check_used_btns.each(function(btn){
//        btn.observe('click',function(evt){
//          evt.stop()
//          this.cancel_check_all_message_topic_li()
//          var read_lis = this.select_used_li()
//          read_lis.each(function(li){
//            this.check_message_topic_li(li)
//          }.bind(this))
//        }.bind(this))
//      }.bind(this))
//    }
//
//    if(settings.check_unused_btns!=null){
//      settings.check_unused_btns.each(function(btn){
//        btn.observe('click',function(evt){
//          evt.stop()
//          this.cancel_check_all_message_topic_li()
//          var read_lis = this.select_unused_li()
//          read_lis.each(function(li){
//            this.check_message_topic_li(li)
//          }.bind(this))
//        }.bind(this))
//      }.bind(this))
//    }
//  },
//  check_message_topic_li: function(li){
//    li.select("input[type='checkbox']").each(function(check_box){
//      check_box.checked = true
//      this.check_or_cancel(check_box)
//    }.bind(this))
//  },
//  cancel_check_message_topic_li: function(li){
//    li.select("input[type='checkbox']").each(function(check_box){
//      check_box.checked = false
//      this.check_or_cancel(check_box)
//    }.bind(this))
//  },
//  select_all_message_topic_li: function(){
//    return $(this.settings.ul_dom).select('li')
//  },
//  select_read_message_topic_li: function (){
//    return $(this.settings.ul_dom).select('li div.read').map(function(div){
//      return div.up('li')
//    })
//  },
//  select_unread_message_topic_li: function (){
//    return $(this.settings.ul_dom).select('li div.unread').map(function(div){
//      return div.up('li')
//    })
//  },
//  select_used_li: function(){
//    return $(this.settings.ul_dom).select('li div.used').map(function(div){
//      return div.up('li')
//    })
//  },
//  select_unused_li: function(){
//    return $(this.settings.ul_dom).select('li div.unused').map(function(div){
//      return div.up('li')
//    })
//  },
//  cancel_check_all_message_topic_li: function(){
//    var lis = this.select_all_message_topic_li()
//    lis.each(function(li){
//      this.cancel_check_message_topic_li(li)
//    }.bind(this))
//  },
//  check_or_cancel:function(input){
//    var li = input.up('li')
//    if(input.checked == true){
//      li.addClassName(this.settings.check_add_class_name)
//    }else if(input.checked == false){
//      li.removeClassName(this.settings.check_add_class_name)
//    }
//  },
//  add_checkbox_change_evt:function(){
//    $(this.settings.ul_dom).observe('change',function(evt){
//      var element = Event.element(evt)
//      if(element.tagName == 'INPUT' && element.readAttribute('type')=='checkbox'){
//        this.check_or_cancel(element)
//      }
//    }.bind(this))
//  }
//});

//procedure中的附件显示/隐藏切换
ProcedureAttachmentsHandel = Class.create({
  initialize: function(attrs){
    this.divdom = attrs.divdom;
    this.attachments = attrs.divdom.down('ul');
    this.button_open = attrs.divdom.down('.button_open');
    this.button_close = attrs.divdom.down('.button_close');
    this.button_change = attrs.divdom.down('div.change_style');
    $(this.button_open).observe('click',this.open_attachemnts_by_click.bind(this));
    $(this.button_close).observe('click',this.close_attachemnts_by_click.bind(this));
  },
  open_attachemnts_by_click: function(){
    this.attachments.removeClassName('hide');
    this.button_close.removeClassName('hide');
    this.button_open.addClassName('hide');
    this.button_change.removeClassName('hide');
  },
  close_attachemnts_by_click: function(){
    this.attachments.addClassName('hide');
    this.button_close.addClassName('hide');
    this.button_open.removeClassName('hide');
    this.button_change.addClassName('hide');
  }
});
/* --------- /javascripts/swfupload/swfupload.js --------- */ 
/**
 * SWFUpload: http://www.swfupload.org, http://swfupload.googlecode.com
 *
 * mmSWFUpload 1.0: Flash upload dialog - http://profandesign.se/swfupload/,  http://www.vinterwebb.se/
 *
 * SWFUpload is (c) 2006-2007 Lars Huring, Olov Nilz�n and Mammon Media and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * SWFUpload 2 is (c) 2007-2008 Jake Roberts and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */


/* ******************* */
/* Constructor & Init  */
/* ******************* */
var SWFUpload;

if (SWFUpload == undefined) {
	SWFUpload = function (settings) {
		this.initSWFUpload(settings);
	};
}

SWFUpload.prototype.initSWFUpload = function (settings) {
	try {
		this.customSettings = {};	// A container where developers can place their own settings associated with this instance.
		this.settings = settings;
		this.eventQueue = [];
		this.movieName = "SWFUpload_" + SWFUpload.movieCount++;
		this.movieElement = null;


		// Setup global control tracking
		SWFUpload.instances[this.movieName] = this;

		// Load the settings.  Load the Flash movie.
		this.initSettings();
		this.loadFlash();
		this.displayDebugInfo();
	} catch (ex) {
		delete SWFUpload.instances[this.movieName];
		throw ex;
	}
};

/* *************** */
/* Static Members  */
/* *************** */
SWFUpload.instances = {};
SWFUpload.movieCount = 0;
SWFUpload.version = "2.2.0 2009-03-25";
SWFUpload.QUEUE_ERROR = {
	QUEUE_LIMIT_EXCEEDED	  		: -100,
	FILE_EXCEEDS_SIZE_LIMIT  		: -110,
	ZERO_BYTE_FILE			  		: -120,
	INVALID_FILETYPE		  		: -130
};
SWFUpload.UPLOAD_ERROR = {
	HTTP_ERROR				  		: -200,
	MISSING_UPLOAD_URL	      		: -210,
	IO_ERROR				  		: -220,
	SECURITY_ERROR			  		: -230,
	UPLOAD_LIMIT_EXCEEDED	  		: -240,
	UPLOAD_FAILED			  		: -250,
	SPECIFIED_FILE_ID_NOT_FOUND		: -260,
	FILE_VALIDATION_FAILED	  		: -270,
	FILE_CANCELLED			  		: -280,
	UPLOAD_STOPPED					: -290
};
SWFUpload.FILE_STATUS = {
	QUEUED		 : -1,
	IN_PROGRESS	 : -2,
	ERROR		 : -3,
	COMPLETE	 : -4,
	CANCELLED	 : -5
};
SWFUpload.BUTTON_ACTION = {
	SELECT_FILE  : -100,
	SELECT_FILES : -110,
	START_UPLOAD : -120
};
SWFUpload.CURSOR = {
	ARROW : -1,
	HAND : -2
};
SWFUpload.WINDOW_MODE = {
	WINDOW : "window",
	TRANSPARENT : "transparent",
	OPAQUE : "opaque"
};

// Private: takes a URL, determines if it is relative and converts to an absolute URL
// using the current site. Only processes the URL if it can, otherwise returns the URL untouched
SWFUpload.completeURL = function(url) {
	if (typeof(url) !== "string" || url.match(/^https?:\/\//i) || url.match(/^\//)) {
		return url;
	}
	
	var currentURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
	
	var indexSlash = window.location.pathname.lastIndexOf("/");
	if (indexSlash <= 0) {
		path = "/";
	} else {
		path = window.location.pathname.substr(0, indexSlash) + "/";
	}
	
	return /*currentURL +*/ path + url;
	
};


/* ******************** */
/* Instance Members  */
/* ******************** */

// Private: initSettings ensures that all the
// settings are set, getting a default value if one was not assigned.
SWFUpload.prototype.initSettings = function () {
	this.ensureDefault = function (settingName, defaultValue) {
		this.settings[settingName] = (this.settings[settingName] == undefined) ? defaultValue : this.settings[settingName];
	};
	
	// Upload backend settings
	this.ensureDefault("upload_url", "");
	this.ensureDefault("preserve_relative_urls", false);
	this.ensureDefault("file_post_name", "Filedata");
	this.ensureDefault("post_params", {});
	this.ensureDefault("use_query_string", false);
	this.ensureDefault("requeue_on_error", false);
	this.ensureDefault("http_success", []);
	this.ensureDefault("assume_success_timeout", 0);
	
	// File Settings
	this.ensureDefault("file_types", "*.*");
	this.ensureDefault("file_types_description", "All Files");
	this.ensureDefault("file_size_limit", 0);	// Default zero means "unlimited"
	this.ensureDefault("file_upload_limit", 0);
	this.ensureDefault("file_queue_limit", 0);

	// Flash Settings
	this.ensureDefault("flash_url", "swfupload.swf");
	this.ensureDefault("prevent_swf_caching", true);
	
	// Button Settings
	this.ensureDefault("button_image_url", "");
	this.ensureDefault("button_width", 1);
	this.ensureDefault("button_height", 1);
	this.ensureDefault("button_text", "");
	this.ensureDefault("button_text_style", "color: #000000; font-size: 16pt;");
	this.ensureDefault("button_text_top_padding", 0);
	this.ensureDefault("button_text_left_padding", 0);
	this.ensureDefault("button_action", SWFUpload.BUTTON_ACTION.SELECT_FILES);
	this.ensureDefault("button_disabled", false);
	this.ensureDefault("button_placeholder_id", "");
	this.ensureDefault("button_placeholder", null);
	this.ensureDefault("button_cursor", SWFUpload.CURSOR.ARROW);
	this.ensureDefault("button_window_mode", SWFUpload.WINDOW_MODE.WINDOW);
	
	// Debug Settings
	this.ensureDefault("debug", false);
	this.settings.debug_enabled = this.settings.debug;	// Here to maintain v2 API
	
	// Event Handlers
	this.settings.return_upload_start_handler = this.returnUploadStart;
	this.ensureDefault("swfupload_loaded_handler", null);
	this.ensureDefault("file_dialog_start_handler", null);
	this.ensureDefault("file_queued_handler", null);
	this.ensureDefault("file_queue_error_handler", null);
	this.ensureDefault("file_dialog_complete_handler", null);
	
	this.ensureDefault("upload_start_handler", null);
	this.ensureDefault("upload_progress_handler", null);
	this.ensureDefault("upload_error_handler", null);
	this.ensureDefault("upload_success_handler", null);
	this.ensureDefault("upload_complete_handler", null);
	
	this.ensureDefault("debug_handler", this.debugMessage);

	this.ensureDefault("custom_settings", {});

	// Other settings
	this.customSettings = this.settings.custom_settings;
	
	// Update the flash url if needed
	if (!!this.settings.prevent_swf_caching) {
		this.settings.flash_url = this.settings.flash_url + (this.settings.flash_url.indexOf("?") < 0 ? "?" : "&") + "preventswfcaching=" + new Date().getTime();
	}
	
	if (!this.settings.preserve_relative_urls) {
		//this.settings.flash_url = SWFUpload.completeURL(this.settings.flash_url);	// Don't need to do this one since flash doesn't look at it
		this.settings.upload_url = SWFUpload.completeURL(this.settings.upload_url);
		this.settings.button_image_url = SWFUpload.completeURL(this.settings.button_image_url);
	}
	
	delete this.ensureDefault;
};

// Private: loadFlash replaces the button_placeholder element with the flash movie.
SWFUpload.prototype.loadFlash = function () {
	var targetElement, tempParent;

	// Make sure an element with the ID we are going to use doesn't already exist
	if (document.getElementById(this.movieName) !== null) {
		throw "ID " + this.movieName + " is already in use. The Flash Object could not be added";
	}

	// Get the element where we will be placing the flash movie
	targetElement = document.getElementById(this.settings.button_placeholder_id) || this.settings.button_placeholder;

	if (targetElement == undefined) {
		throw "Could not find the placeholder element: " + this.settings.button_placeholder_id;
	}

	// Append the container and load the flash
	tempParent = document.createElement("div");
	tempParent.innerHTML = this.getFlashHTML();	// Using innerHTML is non-standard but the only sensible way to dynamically add Flash in IE (and maybe other browsers)
	targetElement.parentNode.replaceChild(tempParent.firstChild, targetElement);

	// Fix IE Flash/Form bug
	if (window[this.movieName] == undefined) {
		window[this.movieName] = this.getMovieElement();
	}
	
};

// Private: getFlashHTML generates the object tag needed to embed the flash in to the document
SWFUpload.prototype.getFlashHTML = function () {
	// Flash Satay object syntax: http://www.alistapart.com/articles/flashsatay
	return ['<object id="', this.movieName, '" type="application/x-shockwave-flash" data="', this.settings.flash_url, '" width="', this.settings.button_width, '" height="', this.settings.button_height, '" class="swfupload">',
				'<param name="wmode" value="', this.settings.button_window_mode, '" />',
				'<param name="movie" value="', this.settings.flash_url, '" />',
				'<param name="quality" value="high" />',
				'<param name="menu" value="false" />',
				'<param name="allowScriptAccess" value="always" />',
				'<param name="flashvars" value="' + this.getFlashVars() + '" />',
				'</object>'].join("");
};

// Private: getFlashVars builds the parameter string that will be passed
// to flash in the flashvars param.
SWFUpload.prototype.getFlashVars = function () {
	// Build a string from the post param object
	var paramString = this.buildParamString();
	var httpSuccessString = this.settings.http_success.join(",");
	
	// Build the parameter string
	return ["movieName=", encodeURIComponent(this.movieName),
			"&amp;uploadURL=", encodeURIComponent(this.settings.upload_url),
			"&amp;useQueryString=", encodeURIComponent(this.settings.use_query_string),
			"&amp;requeueOnError=", encodeURIComponent(this.settings.requeue_on_error),
			"&amp;httpSuccess=", encodeURIComponent(httpSuccessString),
			"&amp;assumeSuccessTimeout=", encodeURIComponent(this.settings.assume_success_timeout),
			"&amp;params=", encodeURIComponent(paramString),
			"&amp;filePostName=", encodeURIComponent(this.settings.file_post_name),
			"&amp;fileTypes=", encodeURIComponent(this.settings.file_types),
			"&amp;fileTypesDescription=", encodeURIComponent(this.settings.file_types_description),
			"&amp;fileSizeLimit=", encodeURIComponent(this.settings.file_size_limit),
			"&amp;fileUploadLimit=", encodeURIComponent(this.settings.file_upload_limit),
			"&amp;fileQueueLimit=", encodeURIComponent(this.settings.file_queue_limit),
			"&amp;debugEnabled=", encodeURIComponent(this.settings.debug_enabled),
			"&amp;buttonImageURL=", encodeURIComponent(this.settings.button_image_url),
			"&amp;buttonWidth=", encodeURIComponent(this.settings.button_width),
			"&amp;buttonHeight=", encodeURIComponent(this.settings.button_height),
			"&amp;buttonText=", encodeURIComponent(this.settings.button_text),
			"&amp;buttonTextTopPadding=", encodeURIComponent(this.settings.button_text_top_padding),
			"&amp;buttonTextLeftPadding=", encodeURIComponent(this.settings.button_text_left_padding),
			"&amp;buttonTextStyle=", encodeURIComponent(this.settings.button_text_style),
			"&amp;buttonAction=", encodeURIComponent(this.settings.button_action),
			"&amp;buttonDisabled=", encodeURIComponent(this.settings.button_disabled),
			"&amp;buttonCursor=", encodeURIComponent(this.settings.button_cursor)
		].join("");
};

// Public: getMovieElement retrieves the DOM reference to the Flash element added by SWFUpload
// The element is cached after the first lookup
SWFUpload.prototype.getMovieElement = function () {
	if (this.movieElement == undefined) {
		this.movieElement = document.getElementById(this.movieName);
	}

	if (this.movieElement === null) {
		throw "Could not find Flash element";
	}
	
	return this.movieElement;
};

// Private: buildParamString takes the name/value pairs in the post_params setting object
// and joins them up in to a string formatted "name=value&amp;name=value"
SWFUpload.prototype.buildParamString = function () {
	var postParams = this.settings.post_params; 
	var paramStringPairs = [];

	if (typeof(postParams) === "object") {
		for (var name in postParams) {
			if (postParams.hasOwnProperty(name)) {
				paramStringPairs.push(encodeURIComponent(name.toString()) + "=" + encodeURIComponent(postParams[name].toString()));
			}
		}
	}

	return paramStringPairs.join("&amp;");
};

// Public: Used to remove a SWFUpload instance from the page. This method strives to remove
// all references to the SWF, and other objects so memory is properly freed.
// Returns true if everything was destroyed. Returns a false if a failure occurs leaving SWFUpload in an inconsistant state.
// Credits: Major improvements provided by steffen
SWFUpload.prototype.destroy = function () {
	try {
		// Make sure Flash is done before we try to remove it
		this.cancelUpload(null, false);
		

		// Remove the SWFUpload DOM nodes
		var movieElement = null;
		movieElement = this.getMovieElement();
		
		if (movieElement && typeof(movieElement.CallFunction) === "unknown") { // We only want to do this in IE
			// Loop through all the movie's properties and remove all function references (DOM/JS IE 6/7 memory leak workaround)
			for (var i in movieElement) {
				try {
					if (typeof(movieElement[i]) === "function") {
						movieElement[i] = null;
					}
				} catch (ex1) {}
			}

			// Remove the Movie Element from the page
			try {
				movieElement.parentNode.removeChild(movieElement);
			} catch (ex) {}
		}
		
		// Remove IE form fix reference
		window[this.movieName] = null;

		// Destroy other references
		SWFUpload.instances[this.movieName] = null;
		delete SWFUpload.instances[this.movieName];

		this.movieElement = null;
		this.settings = null;
		this.customSettings = null;
		this.eventQueue = null;
		this.movieName = null;
		
		
		return true;
	} catch (ex2) {
		return false;
	}
};


// Public: displayDebugInfo prints out settings and configuration
// information about this SWFUpload instance.
// This function (and any references to it) can be deleted when placing
// SWFUpload in production.
SWFUpload.prototype.displayDebugInfo = function () {
	this.debug(
		[
			"---SWFUpload Instance Info---\n",
			"Version: ", SWFUpload.version, "\n",
			"Movie Name: ", this.movieName, "\n",
			"Settings:\n",
			"\t", "upload_url:               ", this.settings.upload_url, "\n",
			"\t", "flash_url:                ", this.settings.flash_url, "\n",
			"\t", "use_query_string:         ", this.settings.use_query_string.toString(), "\n",
			"\t", "requeue_on_error:         ", this.settings.requeue_on_error.toString(), "\n",
			"\t", "http_success:             ", this.settings.http_success.join(", "), "\n",
			"\t", "assume_success_timeout:   ", this.settings.assume_success_timeout, "\n",
			"\t", "file_post_name:           ", this.settings.file_post_name, "\n",
			"\t", "post_params:              ", this.settings.post_params.toString(), "\n",
			"\t", "file_types:               ", this.settings.file_types, "\n",
			"\t", "file_types_description:   ", this.settings.file_types_description, "\n",
			"\t", "file_size_limit:          ", this.settings.file_size_limit, "\n",
			"\t", "file_upload_limit:        ", this.settings.file_upload_limit, "\n",
			"\t", "file_queue_limit:         ", this.settings.file_queue_limit, "\n",
			"\t", "debug:                    ", this.settings.debug.toString(), "\n",

			"\t", "prevent_swf_caching:      ", this.settings.prevent_swf_caching.toString(), "\n",

			"\t", "button_placeholder_id:    ", this.settings.button_placeholder_id.toString(), "\n",
			"\t", "button_placeholder:       ", (this.settings.button_placeholder ? "Set" : "Not Set"), "\n",
			"\t", "button_image_url:         ", this.settings.button_image_url.toString(), "\n",
			"\t", "button_width:             ", this.settings.button_width.toString(), "\n",
			"\t", "button_height:            ", this.settings.button_height.toString(), "\n",
			"\t", "button_text:              ", this.settings.button_text.toString(), "\n",
			"\t", "button_text_style:        ", this.settings.button_text_style.toString(), "\n",
			"\t", "button_text_top_padding:  ", this.settings.button_text_top_padding.toString(), "\n",
			"\t", "button_text_left_padding: ", this.settings.button_text_left_padding.toString(), "\n",
			"\t", "button_action:            ", this.settings.button_action.toString(), "\n",
			"\t", "button_disabled:          ", this.settings.button_disabled.toString(), "\n",

			"\t", "custom_settings:          ", this.settings.custom_settings.toString(), "\n",
			"Event Handlers:\n",
			"\t", "swfupload_loaded_handler assigned:  ", (typeof this.settings.swfupload_loaded_handler === "function").toString(), "\n",
			"\t", "file_dialog_start_handler assigned: ", (typeof this.settings.file_dialog_start_handler === "function").toString(), "\n",
			"\t", "file_queued_handler assigned:       ", (typeof this.settings.file_queued_handler === "function").toString(), "\n",
			"\t", "file_queue_error_handler assigned:  ", (typeof this.settings.file_queue_error_handler === "function").toString(), "\n",
			"\t", "upload_start_handler assigned:      ", (typeof this.settings.upload_start_handler === "function").toString(), "\n",
			"\t", "upload_progress_handler assigned:   ", (typeof this.settings.upload_progress_handler === "function").toString(), "\n",
			"\t", "upload_error_handler assigned:      ", (typeof this.settings.upload_error_handler === "function").toString(), "\n",
			"\t", "upload_success_handler assigned:    ", (typeof this.settings.upload_success_handler === "function").toString(), "\n",
			"\t", "upload_complete_handler assigned:   ", (typeof this.settings.upload_complete_handler === "function").toString(), "\n",
			"\t", "debug_handler assigned:             ", (typeof this.settings.debug_handler === "function").toString(), "\n"
		].join("")
	);
};

/* Note: addSetting and getSetting are no longer used by SWFUpload but are included
	the maintain v2 API compatibility
*/
// Public: (Deprecated) addSetting adds a setting value. If the value given is undefined or null then the default_value is used.
SWFUpload.prototype.addSetting = function (name, value, default_value) {
    if (value == undefined) {
        return (this.settings[name] = default_value);
    } else {
        return (this.settings[name] = value);
	}
};

// Public: (Deprecated) getSetting gets a setting. Returns an empty string if the setting was not found.
SWFUpload.prototype.getSetting = function (name) {
    if (this.settings[name] != undefined) {
        return this.settings[name];
	}

    return "";
};



// Private: callFlash handles function calls made to the Flash element.
// Calls are made with a setTimeout for some functions to work around
// bugs in the ExternalInterface library.
SWFUpload.prototype.callFlash = function (functionName, argumentArray) {
	argumentArray = argumentArray || [];
	
	var movieElement = this.getMovieElement();
	var returnValue, returnString;

	// Flash's method if calling ExternalInterface methods (code adapted from MooTools).
	try {
		returnString = movieElement.CallFunction('<invoke name="' + functionName + '" returntype="javascript">' + __flash__argumentsToXML(argumentArray, 0) + '</invoke>');
		returnValue = eval(returnString);
	} catch (ex) {
		throw "Call to " + functionName + " failed";
	}
	
	// Unescape file post param values
	if (returnValue != undefined && typeof returnValue.post === "object") {
		returnValue = this.unescapeFilePostParams(returnValue);
	}

	return returnValue;
};

/* *****************************
	-- Flash control methods --
	Your UI should use these
	to operate SWFUpload
   ***************************** */

// WARNING: this function does not work in Flash Player 10
// Public: selectFile causes a File Selection Dialog window to appear.  This
// dialog only allows 1 file to be selected.
SWFUpload.prototype.selectFile = function () {
	this.callFlash("SelectFile");
};

// WARNING: this function does not work in Flash Player 10
// Public: selectFiles causes a File Selection Dialog window to appear/ This
// dialog allows the user to select any number of files
// Flash Bug Warning: Flash limits the number of selectable files based on the combined length of the file names.
// If the selection name length is too long the dialog will fail in an unpredictable manner.  There is no work-around
// for this bug.
SWFUpload.prototype.selectFiles = function () {
	this.callFlash("SelectFiles");
};


// Public: startUpload starts uploading the first file in the queue unless
// the optional parameter 'fileID' specifies the ID 
SWFUpload.prototype.startUpload = function (fileID) {
	this.callFlash("StartUpload", [fileID]);
};

// Public: cancelUpload cancels any queued file.  The fileID parameter may be the file ID or index.
// If you do not specify a fileID the current uploading file or first file in the queue is cancelled.
// If you do not want the uploadError event to trigger you can specify false for the triggerErrorEvent parameter.
SWFUpload.prototype.cancelUpload = function (fileID, triggerErrorEvent) {
	if (triggerErrorEvent !== false) {
		triggerErrorEvent = true;
	}
	this.callFlash("CancelUpload", [fileID, triggerErrorEvent]);
};

// Public: stopUpload stops the current upload and requeues the file at the beginning of the queue.
// If nothing is currently uploading then nothing happens.
SWFUpload.prototype.stopUpload = function () {
	this.callFlash("StopUpload");
};

/* ************************
 * Settings methods
 *   These methods change the SWFUpload settings.
 *   SWFUpload settings should not be changed directly on the settings object
 *   since many of the settings need to be passed to Flash in order to take
 *   effect.
 * *********************** */

// Public: getStats gets the file statistics object.
SWFUpload.prototype.getStats = function () {
	return this.callFlash("GetStats");
};

// Public: setStats changes the SWFUpload statistics.  You shouldn't need to 
// change the statistics but you can.  Changing the statistics does not
// affect SWFUpload accept for the successful_uploads count which is used
// by the upload_limit setting to determine how many files the user may upload.
SWFUpload.prototype.setStats = function (statsObject) {
	this.callFlash("SetStats", [statsObject]);
};

// Public: getFile retrieves a File object by ID or Index.  If the file is
// not found then 'null' is returned.
SWFUpload.prototype.getFile = function (fileID) {
	if (typeof(fileID) === "number") {
		return this.callFlash("GetFileByIndex", [fileID]);
	} else {
		return this.callFlash("GetFile", [fileID]);
	}
};

// Public: addFileParam sets a name/value pair that will be posted with the
// file specified by the Files ID.  If the name already exists then the
// exiting value will be overwritten.
SWFUpload.prototype.addFileParam = function (fileID, name, value) {
	return this.callFlash("AddFileParam", [fileID, name, value]);
};

// Public: removeFileParam removes a previously set (by addFileParam) name/value
// pair from the specified file.
SWFUpload.prototype.removeFileParam = function (fileID, name) {
	this.callFlash("RemoveFileParam", [fileID, name]);
};

// Public: setUploadUrl changes the upload_url setting.
SWFUpload.prototype.setUploadURL = function (url) {
	this.settings.upload_url = url.toString();
	this.callFlash("SetUploadURL", [url]);
};

// Public: setPostParams changes the post_params setting
SWFUpload.prototype.setPostParams = function (paramsObject) {
	this.settings.post_params = paramsObject;
	this.callFlash("SetPostParams", [paramsObject]);
};

// Public: addPostParam adds post name/value pair.  Each name can have only one value.
SWFUpload.prototype.addPostParam = function (name, value) {
	this.settings.post_params[name] = value;
	this.callFlash("SetPostParams", [this.settings.post_params]);
};

// Public: removePostParam deletes post name/value pair.
SWFUpload.prototype.removePostParam = function (name) {
	delete this.settings.post_params[name];
	this.callFlash("SetPostParams", [this.settings.post_params]);
};

// Public: setFileTypes changes the file_types setting and the file_types_description setting
SWFUpload.prototype.setFileTypes = function (types, description) {
	this.settings.file_types = types;
	this.settings.file_types_description = description;
	this.callFlash("SetFileTypes", [types, description]);
};

// Public: setFileSizeLimit changes the file_size_limit setting
SWFUpload.prototype.setFileSizeLimit = function (fileSizeLimit) {
	this.settings.file_size_limit = fileSizeLimit;
	this.callFlash("SetFileSizeLimit", [fileSizeLimit]);
};

// Public: setFileUploadLimit changes the file_upload_limit setting
SWFUpload.prototype.setFileUploadLimit = function (fileUploadLimit) {
	this.settings.file_upload_limit = fileUploadLimit;
	this.callFlash("SetFileUploadLimit", [fileUploadLimit]);
};

// Public: setFileQueueLimit changes the file_queue_limit setting
SWFUpload.prototype.setFileQueueLimit = function (fileQueueLimit) {
	this.settings.file_queue_limit = fileQueueLimit;
	this.callFlash("SetFileQueueLimit", [fileQueueLimit]);
};

// Public: setFilePostName changes the file_post_name setting
SWFUpload.prototype.setFilePostName = function (filePostName) {
	this.settings.file_post_name = filePostName;
	this.callFlash("SetFilePostName", [filePostName]);
};

// Public: setUseQueryString changes the use_query_string setting
SWFUpload.prototype.setUseQueryString = function (useQueryString) {
	this.settings.use_query_string = useQueryString;
	this.callFlash("SetUseQueryString", [useQueryString]);
};

// Public: setRequeueOnError changes the requeue_on_error setting
SWFUpload.prototype.setRequeueOnError = function (requeueOnError) {
	this.settings.requeue_on_error = requeueOnError;
	this.callFlash("SetRequeueOnError", [requeueOnError]);
};

// Public: setHTTPSuccess changes the http_success setting
SWFUpload.prototype.setHTTPSuccess = function (http_status_codes) {
	if (typeof http_status_codes === "string") {
		http_status_codes = http_status_codes.replace(" ", "").split(",");
	}
	
	this.settings.http_success = http_status_codes;
	this.callFlash("SetHTTPSuccess", [http_status_codes]);
};

// Public: setHTTPSuccess changes the http_success setting
SWFUpload.prototype.setAssumeSuccessTimeout = function (timeout_seconds) {
	this.settings.assume_success_timeout = timeout_seconds;
	this.callFlash("SetAssumeSuccessTimeout", [timeout_seconds]);
};

// Public: setDebugEnabled changes the debug_enabled setting
SWFUpload.prototype.setDebugEnabled = function (debugEnabled) {
	this.settings.debug_enabled = debugEnabled;
	this.callFlash("SetDebugEnabled", [debugEnabled]);
};

// Public: setButtonImageURL loads a button image sprite
SWFUpload.prototype.setButtonImageURL = function (buttonImageURL) {
	if (buttonImageURL == undefined) {
		buttonImageURL = "";
	}
	
	this.settings.button_image_url = buttonImageURL;
	this.callFlash("SetButtonImageURL", [buttonImageURL]);
};

// Public: setButtonDimensions resizes the Flash Movie and button
SWFUpload.prototype.setButtonDimensions = function (width, height) {
	this.settings.button_width = width;
	this.settings.button_height = height;
	
	var movie = this.getMovieElement();
	if (movie != undefined) {
		movie.style.width = width + "px";
		movie.style.height = height + "px";
	}
	
	this.callFlash("SetButtonDimensions", [width, height]);
};
// Public: setButtonText Changes the text overlaid on the button
SWFUpload.prototype.setButtonText = function (html) {
	this.settings.button_text = html;
	this.callFlash("SetButtonText", [html]);
};
// Public: setButtonTextPadding changes the top and left padding of the text overlay
SWFUpload.prototype.setButtonTextPadding = function (left, top) {
	this.settings.button_text_top_padding = top;
	this.settings.button_text_left_padding = left;
	this.callFlash("SetButtonTextPadding", [left, top]);
};

// Public: setButtonTextStyle changes the CSS used to style the HTML/Text overlaid on the button
SWFUpload.prototype.setButtonTextStyle = function (css) {
	this.settings.button_text_style = css;
	this.callFlash("SetButtonTextStyle", [css]);
};
// Public: setButtonDisabled disables/enables the button
SWFUpload.prototype.setButtonDisabled = function (isDisabled) {
	this.settings.button_disabled = isDisabled;
	this.callFlash("SetButtonDisabled", [isDisabled]);
};
// Public: setButtonAction sets the action that occurs when the button is clicked
SWFUpload.prototype.setButtonAction = function (buttonAction) {
	this.settings.button_action = buttonAction;
	this.callFlash("SetButtonAction", [buttonAction]);
};

// Public: setButtonCursor changes the mouse cursor displayed when hovering over the button
SWFUpload.prototype.setButtonCursor = function (cursor) {
	this.settings.button_cursor = cursor;
	this.callFlash("SetButtonCursor", [cursor]);
};

/* *******************************
	Flash Event Interfaces
	These functions are used by Flash to trigger the various
	events.
	
	All these functions a Private.
	
	Because the ExternalInterface library is buggy the event calls
	are added to a queue and the queue then executed by a setTimeout.
	This ensures that events are executed in a determinate order and that
	the ExternalInterface bugs are avoided.
******************************* */

SWFUpload.prototype.queueEvent = function (handlerName, argumentArray) {
	// Warning: Don't call this.debug inside here or you'll create an infinite loop
	
	if (argumentArray == undefined) {
		argumentArray = [];
	} else if (!(argumentArray instanceof Array)) {
		argumentArray = [argumentArray];
	}
	
	var self = this;
	if (typeof this.settings[handlerName] === "function") {
		// Queue the event
		this.eventQueue.push(function () {
			this.settings[handlerName].apply(this, argumentArray);
		});
		
		// Execute the next queued event
		setTimeout(function () {
			self.executeNextEvent();
		}, 0);
		
	} else if (this.settings[handlerName] !== null) {
		throw "Event handler " + handlerName + " is unknown or is not a function";
	}
};

// Private: Causes the next event in the queue to be executed.  Since events are queued using a setTimeout
// we must queue them in order to garentee that they are executed in order.
SWFUpload.prototype.executeNextEvent = function () {
	// Warning: Don't call this.debug inside here or you'll create an infinite loop

	var  f = this.eventQueue ? this.eventQueue.shift() : null;
	if (typeof(f) === "function") {
		f.apply(this);
	}
};

// Private: unescapeFileParams is part of a workaround for a flash bug where objects passed through ExternalInterface cannot have
// properties that contain characters that are not valid for JavaScript identifiers. To work around this
// the Flash Component escapes the parameter names and we must unescape again before passing them along.
SWFUpload.prototype.unescapeFilePostParams = function (file) {
	var reg = /[$]([0-9a-f]{4})/i;
	var unescapedPost = {};
	var uk;

	if (file != undefined) {
		for (var k in file.post) {
			if (file.post.hasOwnProperty(k)) {
				uk = k;
				var match;
				while ((match = reg.exec(uk)) !== null) {
					uk = uk.replace(match[0], String.fromCharCode(parseInt("0x" + match[1], 16)));
				}
				unescapedPost[uk] = file.post[k];
			}
		}

		file.post = unescapedPost;
	}

	return file;
};

// Private: Called by Flash to see if JS can call in to Flash (test if External Interface is working)
SWFUpload.prototype.testExternalInterface = function () {
	try {
		return this.callFlash("TestExternalInterface");
	} catch (ex) {
		return false;
	}
};

// Private: This event is called by Flash when it has finished loading. Don't modify this.
// Use the swfupload_loaded_handler event setting to execute custom code when SWFUpload has loaded.
SWFUpload.prototype.flashReady = function () {
	// Check that the movie element is loaded correctly with its ExternalInterface methods defined
	var movieElement = this.getMovieElement();

	if (!movieElement) {
		this.debug("Flash called back ready but the flash movie can't be found.");
		return;
	}

	this.cleanUp(movieElement);
	
	this.queueEvent("swfupload_loaded_handler");
};

// Private: removes Flash added fuctions to the DOM node to prevent memory leaks in IE.
// This function is called by Flash each time the ExternalInterface functions are created.
SWFUpload.prototype.cleanUp = function (movieElement) {
	// Pro-actively unhook all the Flash functions
	try {
		if (this.movieElement && typeof(movieElement.CallFunction) === "unknown") { // We only want to do this in IE
			this.debug("Removing Flash functions hooks (this should only run in IE and should prevent memory leaks)");
			for (var key in movieElement) {
				try {
					if (typeof(movieElement[key]) === "function") {
						movieElement[key] = null;
					}
				} catch (ex) {
				}
			}
		}
	} catch (ex1) {
	
	}

	// Fix Flashes own cleanup code so if the SWFMovie was removed from the page
	// it doesn't display errors.
	window["__flash__removeCallback"] = function (instance, name) {
		try {
			if (instance) {
				instance[name] = null;
			}
		} catch (flashEx) {
		
		}
	};

};


/* This is a chance to do something before the browse window opens */
SWFUpload.prototype.fileDialogStart = function () {
	this.queueEvent("file_dialog_start_handler");
};


/* Called when a file is successfully added to the queue. */
SWFUpload.prototype.fileQueued = function (file) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("file_queued_handler", file);
};


/* Handle errors that occur when an attempt to queue a file fails. */
SWFUpload.prototype.fileQueueError = function (file, errorCode, message) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("file_queue_error_handler", [file, errorCode, message]);
};

/* Called after the file dialog has closed and the selected files have been queued.
	You could call startUpload here if you want the queued files to begin uploading immediately. */
SWFUpload.prototype.fileDialogComplete = function (numFilesSelected, numFilesQueued, numFilesInQueue) {
	this.queueEvent("file_dialog_complete_handler", [numFilesSelected, numFilesQueued, numFilesInQueue]);
};

SWFUpload.prototype.uploadStart = function (file) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("return_upload_start_handler", file);
};

SWFUpload.prototype.returnUploadStart = function (file) {
	var returnValue;
	if (typeof this.settings.upload_start_handler === "function") {
		file = this.unescapeFilePostParams(file);
		returnValue = this.settings.upload_start_handler.call(this, file);
	} else if (this.settings.upload_start_handler != undefined) {
		throw "upload_start_handler must be a function";
	}

	// Convert undefined to true so if nothing is returned from the upload_start_handler it is
	// interpretted as 'true'.
	if (returnValue === undefined) {
		returnValue = true;
	}
	
	returnValue = !!returnValue;
	
	this.callFlash("ReturnUploadStart", [returnValue]);
};



SWFUpload.prototype.uploadProgress = function (file, bytesComplete, bytesTotal) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_progress_handler", [file, bytesComplete, bytesTotal]);
};

SWFUpload.prototype.uploadError = function (file, errorCode, message) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_error_handler", [file, errorCode, message]);
};

SWFUpload.prototype.uploadSuccess = function (file, serverData, responseReceived) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_success_handler", [file, serverData, responseReceived]);
};

SWFUpload.prototype.uploadComplete = function (file) {
	file = this.unescapeFilePostParams(file);
	this.queueEvent("upload_complete_handler", file);
};

/* Called by SWFUpload JavaScript and Flash functions when debug is enabled. By default it writes messages to the
   internal debug console.  You can override this event and have messages written where you want. */
SWFUpload.prototype.debug = function (message) {
	this.queueEvent("debug_handler", message);
};


/* **********************************
	Debug Console
	The debug console is a self contained, in page location
	for debug message to be sent.  The Debug Console adds
	itself to the body if necessary.

	The console is automatically scrolled as messages appear.
	
	If you are using your own debug handler or when you deploy to production and
	have debug disabled you can remove these functions to reduce the file size
	and complexity.
********************************** */
   
// Private: debugMessage is the default debug_handler.  If you want to print debug messages
// call the debug() function.  When overriding the function your own function should
// check to see if the debug setting is true before outputting debug information.
SWFUpload.prototype.debugMessage = function (message) {
	if (this.settings.debug) {
		var exceptionMessage, exceptionValues = [];

		// Check for an exception object and print it nicely
		if (typeof message === "object" && typeof message.name === "string" && typeof message.message === "string") {
			for (var key in message) {
				if (message.hasOwnProperty(key)) {
					exceptionValues.push(key + ": " + message[key]);
				}
			}
			exceptionMessage = exceptionValues.join("\n") || "";
			exceptionValues = exceptionMessage.split("\n");
			exceptionMessage = "EXCEPTION: " + exceptionValues.join("\nEXCEPTION: ");
			SWFUpload.Console.writeLine(exceptionMessage);
		} else {
			SWFUpload.Console.writeLine(message);
		}
	}
};

SWFUpload.Console = {};
SWFUpload.Console.writeLine = function (message) {
	var console, documentForm;

	try {
		console = document.getElementById("SWFUpload_Console");

		if (!console) {
			documentForm = document.createElement("form");
			document.getElementsByTagName("body")[0].appendChild(documentForm);

			console = document.createElement("textarea");
			console.id = "SWFUpload_Console";
			console.style.fontFamily = "monospace";
			console.setAttribute("wrap", "off");
			console.wrap = "off";
			console.style.overflow = "auto";
			console.style.width = "700px";
			console.style.height = "350px";
			console.style.margin = "5px";
			documentForm.appendChild(console);
		}

		console.value += message + "\n";

		console.scrollTop = console.scrollHeight - console.clientHeight;
	} catch (ex) {
		alert("Exception: " + ex.name + " Message: " + ex.message);
	}
};
/* --------- /javascripts/swfupload/swfupload.queue.js --------- */ 
/*
	Queue Plug-in
	
	Features:
		*Adds a cancelQueue() method for cancelling the entire queue.
		*All queued files are uploaded when startUpload() is called.
		*If false is returned from uploadComplete then the queue upload is stopped.
		 If false is not returned (strict comparison) then the queue upload is continued.
		*Adds a QueueComplete event that is fired when all the queued files have finished uploading.
		 Set the event handler with the queue_complete_handler setting.
		
	*/

var SWFUpload;
if (typeof(SWFUpload) === "function") {
	SWFUpload.queue = {};
	
	SWFUpload.prototype.initSettings = (function (oldInitSettings) {
		return function () {
			if (typeof(oldInitSettings) === "function") {
				oldInitSettings.call(this);
			}
			
			this.queueSettings = {};
			
			this.queueSettings.queue_cancelled_flag = false;
			this.queueSettings.queue_upload_count = 0;
			
			this.queueSettings.user_upload_complete_handler = this.settings.upload_complete_handler;
			this.queueSettings.user_upload_start_handler = this.settings.upload_start_handler;
			this.settings.upload_complete_handler = SWFUpload.queue.uploadCompleteHandler;
			this.settings.upload_start_handler = SWFUpload.queue.uploadStartHandler;
			
			this.settings.queue_complete_handler = this.settings.queue_complete_handler || null;
		};
	})(SWFUpload.prototype.initSettings);

	SWFUpload.prototype.startUpload = function (fileID) {
		this.queueSettings.queue_cancelled_flag = false;
		this.callFlash("StartUpload", [fileID]);
	};

	SWFUpload.prototype.cancelQueue = function () {
		this.queueSettings.queue_cancelled_flag = true;
		this.stopUpload();
		
		var stats = this.getStats();
		while (stats.files_queued > 0) {
			this.cancelUpload();
			stats = this.getStats();
		}
	};
	
	SWFUpload.queue.uploadStartHandler = function (file) {
		var returnValue;
		if (typeof(this.queueSettings.user_upload_start_handler) === "function") {
			returnValue = this.queueSettings.user_upload_start_handler.call(this, file);
		}
		
		// To prevent upload a real "FALSE" value must be returned, otherwise default to a real "TRUE" value.
		returnValue = (returnValue === false) ? false : true;
		
		this.queueSettings.queue_cancelled_flag = !returnValue;

		return returnValue;
	};
	
	SWFUpload.queue.uploadCompleteHandler = function (file) {
		var user_upload_complete_handler = this.queueSettings.user_upload_complete_handler;
		var continueUpload;
		
		if (file.filestatus === SWFUpload.FILE_STATUS.COMPLETE) {
			this.queueSettings.queue_upload_count++;
		}

		if (typeof(user_upload_complete_handler) === "function") {
			continueUpload = (user_upload_complete_handler.call(this, file) === false) ? false : true;
		} else if (file.filestatus === SWFUpload.FILE_STATUS.QUEUED) {
			// If the file was stopped and re-queued don't restart the upload
			continueUpload = false;
		} else {
			continueUpload = true;
		}
		
		if (continueUpload) {
			var stats = this.getStats();
			if (stats.files_queued > 0 && this.queueSettings.queue_cancelled_flag === false) {
				this.startUpload();
			} else if (this.queueSettings.queue_cancelled_flag === false) {
				this.queueEvent("queue_complete_handler", [this.queueSettings.queue_upload_count]);
				this.queueSettings.queue_upload_count = 0;
			} else {
				this.queueSettings.queue_cancelled_flag = false;
				this.queueSettings.queue_upload_count = 0;
			}
		}
	};
}/* --------- /javascripts/swfupload/fileprogress.js --------- */ 
/*
	A simple class for displaying file information and progress
	Note: This is a demonstration only and not part of SWFUpload.
	Note: Some have had problems adapting this class in IE7. It may not be suitable for your application.
*/

// Constructor
// file is a SWFUpload file object
// targetID is the HTML element id attribute that the FileProgress HTML structure will be added to.
// Instantiating a new FileProgress object with an existing file will reuse/update the existing DOM elements
function FileProgress(file, targetID) {
	this.fileProgressID = file.id;

	this.opacity = 100;
	this.height = 0;
	

	this.fileProgressWrapper = document.getElementById(this.fileProgressID);
	if (!this.fileProgressWrapper) {
		this.fileProgressWrapper = document.createElement("div");
		this.fileProgressWrapper.className = "progressWrapper";
		this.fileProgressWrapper.id = this.fileProgressID;

		this.fileProgressElement = document.createElement("div");
		this.fileProgressElement.className = "progressContainer";

		var progressCancel = document.createElement("a");
		progressCancel.className = "progressCancel";
		progressCancel.href = "#";
		progressCancel.style.visibility = "hidden";
		progressCancel.appendChild(document.createTextNode(" "));

		var progressText = document.createElement("div");
		progressText.className = "progressName";
		progressText.appendChild(document.createTextNode(file.name));

		var progressBar = document.createElement("div");
		progressBar.className = "progressBarInProgress";

		var progressStatus = document.createElement("div");
		progressStatus.className = "progressBarStatus";
		progressStatus.innerHTML = "&nbsp;";

		this.fileProgressElement.appendChild(progressCancel);
		this.fileProgressElement.appendChild(progressText);
		this.fileProgressElement.appendChild(progressStatus);
		this.fileProgressElement.appendChild(progressBar);

		this.fileProgressWrapper.appendChild(this.fileProgressElement);

		document.getElementById(targetID).appendChild(this.fileProgressWrapper);
	} else {
		this.fileProgressElement = this.fileProgressWrapper.firstChild;
		this.reset();
	}

	this.height = this.fileProgressWrapper.offsetHeight;
	this.setTimer(null);


}

FileProgress.prototype.setTimer = function (timer) {
	this.fileProgressElement["FP_TIMER"] = timer;
};
FileProgress.prototype.getTimer = function (timer) {
	return this.fileProgressElement["FP_TIMER"] || null;
};

FileProgress.prototype.reset = function () {
	this.fileProgressElement.className = "progressContainer";

	this.fileProgressElement.childNodes[2].innerHTML = "&nbsp;";
	this.fileProgressElement.childNodes[2].className = "progressBarStatus";
	
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = "0%";
	
	this.appear();	
};

FileProgress.prototype.setProgress = function (percentage) {
	this.fileProgressElement.className = "progressContainer green";
	this.fileProgressElement.childNodes[3].className = "progressBarInProgress";
	this.fileProgressElement.childNodes[3].style.width = percentage + "%";

	this.appear();	
};
FileProgress.prototype.setComplete = function () {
	this.fileProgressElement.className = "progressContainer blue";
	this.fileProgressElement.childNodes[3].className = "progressBarComplete";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 10000));
};
FileProgress.prototype.setError = function () {
	this.fileProgressElement.className = "progressContainer red";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 5000));
};
FileProgress.prototype.setCancelled = function () {
	this.fileProgressElement.className = "progressContainer";
	this.fileProgressElement.childNodes[3].className = "progressBarError";
	this.fileProgressElement.childNodes[3].style.width = "";

	var oSelf = this;
	this.setTimer(setTimeout(function () {
		oSelf.disappear();
	}, 2000));
};
FileProgress.prototype.setStatus = function (status) {
	this.fileProgressElement.childNodes[2].innerHTML = status;
};

// Show/Hide the cancel button
FileProgress.prototype.toggleCancel = function (show, swfUploadInstance) {
	this.fileProgressElement.childNodes[0].style.visibility = show ? "visible" : "hidden";
	if (swfUploadInstance) {
		var fileID = this.fileProgressID;
		this.fileProgressElement.childNodes[0].onclick = function () {
			swfUploadInstance.cancelUpload(fileID);
			return false;
		};
	}
};

FileProgress.prototype.appear = function () {
	if (this.getTimer() !== null) {
		clearTimeout(this.getTimer());
		this.setTimer(null);
	}
	
	if (this.fileProgressWrapper.filters) {
		try {
			this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 100;
		} catch (e) {
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=100)";
		}
	} else {
		this.fileProgressWrapper.style.opacity = 1;
	}
		
	this.fileProgressWrapper.style.height = "";
	
	this.height = this.fileProgressWrapper.offsetHeight;
	this.opacity = 100;
	this.fileProgressWrapper.style.display = "";
	
};

// Fades out and clips away the FileProgress box.
FileProgress.prototype.disappear = function () {

	var reduceOpacityBy = 15;
	var reduceHeightBy = 4;
	var rate = 30;	// 15 fps

	if (this.opacity > 0) {
		this.opacity -= reduceOpacityBy;
		if (this.opacity < 0) {
			this.opacity = 0;
		}

		if (this.fileProgressWrapper.filters) {
			try {
				this.fileProgressWrapper.filters.item("DXImageTransform.Microsoft.Alpha").opacity = this.opacity;
			} catch (e) {
				// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
				this.fileProgressWrapper.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + this.opacity + ")";
			}
		} else {
			this.fileProgressWrapper.style.opacity = this.opacity / 100;
		}
	}

	if (this.height > 0) {
		this.height -= reduceHeightBy;
		if (this.height < 0) {
			this.height = 0;
		}

		this.fileProgressWrapper.style.height = this.height + "px";
	}

	if (this.height > 0 || this.opacity > 0) {
		var oSelf = this;
		this.setTimer(setTimeout(function () {
			oSelf.disappear();
		}, rate));
	} else {
		this.fileProgressWrapper.style.display = "none";
		this.setTimer(null);
	}
};/* --------- /javascripts/swfupload/handlers.js --------- */ 
/* Demo Note:  This demo uses a FileProgress class that handles the UI for displaying the file name and percent complete.
The FileProgress class is not part of SWFUpload.
 */


/* **********************
   Event Handlers
   These are my custom event handlers to make my
   web application behave the way I went when SWFUpload
   completes different tasks.  These aren't part of the SWFUpload
   package.  They are part of my application.  Without these none
   of the actions SWFUpload makes will show up in my application.
 ********************** */
function fileQueued(file) {
  try {
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setStatus("未上传，等待中...");
    progress.toggleCancel(true, this);

  } catch (ex) {
    this.debug(ex);
  }

}

function fileQueueError(file, errorCode, message) {
  try {
    if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
      alert("You have attempted to queue too many files.\n" + (message === 0 ? "You have reached the upload limit." : "You may select " + (message > 1 ? "up to " + message + " files." : "one file.")));
      return;
    }

    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);

    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        progress.setStatus("文件太大");
        this.debug("Error Code: File too big, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        progress.setStatus("不能上传零字节文件");
        this.debug("Error Code: Zero byte file, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        progress.setStatus("无效的文件类型");
        this.debug("Error Code: Invalid File Type, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      default:
        if (file !== null) {
          progress.setStatus("Unhandled Error");
        }
        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
    }
  } catch (ex) {
    this.debug(ex);
  }
}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
  try {
    if (numFilesSelected > 0) {
      document.getElementById(this.customSettings.cancelButtonId).disabled = false;
    }
		
    /* I want auto start the upload and I can do that here */
    this.startUpload();
  } catch (ex)  {
    this.debug(ex);
  }
}

function uploadStart(file) {
  try {
    /* I don't want to do any file validation or anything,  I'll just update the UI and
		return true to indicate that the upload should start.
		It's important to update the UI here because in Linux no uploadProgress events are called. The best
		we can do is say we are uploading.
		 */
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setStatus("正在上传...");
    progress.toggleCancel(true, this);
  }
  catch (ex) {}
	
  return true;
}

function uploadProgress(file, bytesLoaded, bytesTotal) {
  try {
    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setProgress(percent);
    progress.setStatus("正在上传...");
  } catch (ex) {
    this.debug(ex);
  }
}

// 每上传成功一个文件，就会运行一遍
function uploadSuccess(file, serverData) {
  try {
    eval(serverData)
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setComplete();
    progress.setStatus("上传完成.");
    progress.toggleCancel(false);
  } catch (ex) {
    this.debug(ex);
  }
}

function uploadError(file, errorCode, message) {
  try {
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);

    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        progress.setStatus("上传错误: " + message);
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        progress.setStatus("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        progress.setStatus("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        progress.setStatus("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        progress.setStatus("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        progress.setStatus("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
        // If there aren't any files left (they were all cancelled) disable the cancel button
        if (this.getStats().files_queued === 0) {
          document.getElementById(this.customSettings.cancelButtonId).disabled = true;
        }
        progress.setStatus("被取消");
        progress.setCancelled();
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        progress.setStatus("停止");
        break;
      default:
        progress.setStatus("Unhandled Error: " + errorCode);
        this.debug("Error Code: " + errorCode + ", File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
    }
  } catch (ex) {
    this.debug(ex);
  }
}

// 整个列表中的文件全部上传完后，会运行这个方法
function uploadComplete(file) {
  if (this.getStats().files_queued === 0) {
    document.getElementById(this.customSettings.cancelButtonId).disabled = true;
  }
}

// This event comes from the Queue Plugin
function queueComplete(numFilesUploaded) {
  var status = document.getElementById("divStatus");
  status.innerHTML = numFilesUploaded + " 个文件" + " 上传完成.";
}

// 单独上传一个文件的回调(导入课程时用)
single_file_upload = {
  swfupload_loaded_handler : function(){
    $(this.customSettings.startUploadBtn).observe('click',function(){
      this.startUpload()
    }.bind(this))
  },
  // 显示上传进度
  upload_progress_handler : function (file, bytesLoaded, bytesTotal) {
    var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
    if(bytesLoaded === bytesTotal){
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setComplete();
      progress.setStatus("上传完成.后台正在处理解析数据");
      progress.toggleCancel(false);
    } else{
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setProgress(percent);
      progress.setStatus("正在上传...");
    }
  },
  // 文件不合法的错误提示
  file_queue_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        alert("文件太大");
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        alert("文件不能是零字节");
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        alert("无效的文件类型");
        break;
    }
  },
  // 文件上传成功后，运行 rjs
  upload_success_handler : function (file, serverData) {
    eval(serverData)
  },
  // 向上传队列增加文件时,把文件名称显示出来
  file_queued_handler : function (file) {
    id = this.customSettings.inputFileName
    $(id).setAttribute('value',file.name)
  },
  // 点击选择文件时运行,因为只上传一个文件，每次选择文件时，清空文件上传队列
  file_dialog_start_handler: function (){
    id = this.customSettings.inputFileName
    $(id).setAttribute('value', '')
    this.cancelUpload();
  },
  // 上传出现异常时的处理
  upload_error_handler : function (file, errorCode, message) {
    if(errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED){
      return
    }
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);
    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        progress.setStatus("上传错误: " + message);
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        progress.setStatus("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        progress.setStatus("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        progress.setStatus("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        progress.setStatus("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        progress.setStatus("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        progress.setStatus("停止");
        break;
    }
  }
};

attachment_file_upload = {
  // 显示上传进度
  upload_progress_handler : function (file, bytesLoaded, bytesTotal) {
    try {
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setProgress(percent);
      progress.setStatus("正在上传...");
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 运行服务器传回的 rjs
  upload_success_handler : function (file, serverData) {
    try {
      var attachment_list_id = this.customSettings.attachmentListId
      var str = serverData
      new Insertion.Bottom(attachment_list_id,str)
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setComplete();
      progress.setStatus("上传完成.");
      progress.toggleCancel(false);
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 开始上传,提供取消按钮
  upload_start_handler : function (file) {
    try {
      var progress = new FileProgress(file, this.customSettings.progressTarget);
      progress.setStatus("正在上传...");
      progress.toggleCancel(true, this);
    }
    catch (ex) {}
    return true;
  },
  // 上传失败的错误提示
  upload_error_handler : function (file, errorCode, message) {
    if(errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED){
      id = this.customSettings.progressTarget
      $(id).innerHTML = ""
      return
    }
    var progress = new FileProgress(file, this.customSettings.progressTarget);
    progress.setError();
    progress.toggleCancel(false);
    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        progress.setStatus("上传错误: " + message);
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        progress.setStatus("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        progress.setStatus("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        progress.setStatus("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        progress.setStatus("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        progress.setStatus("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        progress.setStatus("停止");
        break;
    }
  },
  // 文件不合法的错误提示
  file_queue_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        alert("文件太大");
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        alert("文件不能是零字节");
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        alert("无效的文件类型");
        break;
    }
  },
  // 增加文件立即上传
  file_queued_handler : function() {
    this.startUpload()
  },
  // 每个文件上传完成后运行
  upload_complete_handler : function() {
    id = this.customSettings.progressTarget
    $(id).innerHTML = ""
  }
};

share_img_upload = {
  // 显示上传进度
  upload_progress_handler : function (file, bytesLoaded, bytesTotal) {
    try {
      var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
      $(this.customSettings.progressTarget).update("上传进度 " + percent + "%")
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 运行服务器传回的 rjs
  upload_success_handler : function (file, serverData) {
    try {
      var str = serverData
      eval(str)
      var obj = $(this.movieName)
      obj.addClassName("hide")
    } catch (ex) {
      this.debug(ex);
    }
  },
  // 开始上传
  upload_start_handler : function (file) {
    try {
      $(this.customSettings.progressTarget).update("开始上传")
    }
    catch (ex) {}
    return true;
  },
  // 上传失败的错误提示
  upload_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
        alert("上传错误: " + message)
        this.debug("Error Code: HTTP Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
        alert("上传失败.");
        this.debug("Error Code: Upload Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.IO_ERROR:
        alert("Server (IO) Error");
        this.debug("Error Code: IO Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
        alert("Security Error");
        this.debug("Error Code: Security Error, File name: " + file.name + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
        alert("Upload limit exceeded.");
        this.debug("Error Code: Upload Limit Exceeded, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
        alert("Failed Validation.  Upload skipped.");
        this.debug("Error Code: File Validation Failed, File name: " + file.name + ", File size: " + file.size + ", Message: " + message);
        break;
      case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
        alert("停止");
        break;
    }
  },
  // 文件不合法的错误提示
  file_queue_error_handler : function (file, errorCode, message) {
    switch (errorCode) {
      case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
        alert("文件太大");
        break;
      case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
        alert("文件不能是零字节");
        break;
      case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
        alert("无效的文件类型");
        break;
    }
  },
  // 增加文件立即上传
  file_queued_handler : function() {
    this.startUpload()
  },
  // 每个文件上传完成后运行
  upload_complete_handler : function() {
  }
};/* --------- /javascripts/views/mpaccordion.js --------- */ 
var MpAccordion = Class.create({
  initialize: function(togglers, elements, options){
    this.elements = $A(elements);
    this.togglers = $A(togglers);
    this.setOptions(options);
    
    this.togglers.each(function(toggler, i){
      if (toggler.onclick){
        toggler.prevClick = toggler.onclick;
      }else{
        toggler.prevClick = function(){};
      }
      $(toggler).onclick = function(){
        toggler.prevClick();
        this.show_or_hide(i);
      }.bind(this);
    }.bind(this));
    
  },
  setOptions:function(options){
    this.options = options || {}
    this.options = Object.extend({
      unfold_bgc:"#ff0000"
    },this.options)
  },
  show_or_hide:function(i){
    var el = this.elements[i]
    if (el.offsetHeight == el.scrollHeight){
      this.hide_el(i)
    }else if(el.offsetHeight == 0){
      this.show_el(i)
    }
  },
  show_el:function(i){
    var el = this.elements[i];
    var title = this.togglers[i];
    var height = el.scrollHeight;
    this.change_el_height(el, height);
    var unfold_bgc = title.getAttribute("data-active-bgc");
    this.change_title_color(title,unfold_bgc);
    title.addClassName("open").removeClassName("close");
  },
  hide_el:function(i){
    var el = this.elements[i];
    var title = this.togglers[i];
    this.change_el_height(el,0);
    this.change_title_color(title,title.getAttribute("data-bgc"));
    title.removeClassName("open").addClassName("close");
  },
  change_title_color:function(title,color){
    new Effect.Morph(title,{
      style: {backgroundColor:color},
      duration: 0.1
    });
  },
  change_el_height:function(el,height){
    new Effect.Morph(el, {
      style: {
        height:height + "px"
        },
      duration: 0.3
    });
  }
});
pie.load(function(){
  $$('.mpaccordion-bar').each(function(bar){
    var options = {}
    var toggles = bar.select(".mpaccordion-toggler")
    var contents = bar.select(".mpaccordion-content")
    new MpAccordion(toggles,contents,options)
  }.bind(this));
})
/* --------- /javascripts/kissy_editor/editor_mindpin.js --------- */ 
/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-11-20 14:54:53
Revision: 263
*/
/**
 * KISSY.Editor 富文本编辑器
 *
 * @creator     玉伯<lifesinger@gmail.com>
 * @depends     yahoo-dom-event
 *
 * @modified by 宋亮<ben7th@sina.com>
 */

var KISSY = window.KISSY || {};

/**
 * @class Editor
 * @constructor
 * @param {string|HTMLElement} textarea
 * @param {object} config
 */
KISSY.Editor = function(textarea, config) {
  var E = KISSY.Editor;

  if (!(this instanceof E)) {
    return new E(textarea, config);
  } else {
    if (!E._isReady) {E._setup();}
    return new E.Instance(textarea, config);
  }
};

Object.extend(KISSY.Editor,{
  /**
   * 版本号
   */
  version: "0.1",

  /**
   * 语言配置，在 lang 目录添加
   */
  lang: {},

  /**
   * 所有添加的模块
   * 注：mod = { name: modName, fn: initFn, details: {...} }
   */
  mods: {},

  /**
   * 所有注册的插件
   * 注：plugin = { name: pluginName, type: pluginType, init: initFn, ... }
   */
  plugins: {},

  /**
   * 添加模块
   */
  add: function(name, fn, details) {
    this.mods[name] = {
      name: name,
      fn: fn,
      details: details || {}
    };
    return this; // chain support
  },

  /**
   * 添加插件
   * @param {string|Array} name
   */
  addPlugin: function(name, p) {
    var arr = (typeof name == "string" ? [name] : name),
    plugins = this.plugins;

    arr.each(function(key){
      if (!plugins[key]) { // 不允许覆盖
        plugins[key] = Object.extend(Object.clone(p),{name:key}) //clone不能省，对应YAHOO.lang.merge
      }
    });
  },

  /**
   * 是否已完成 setup
   */
  _isReady: false,

  /**
   * setup to use
   */
  _setup: function() {
    this._loadModules();
    this._isReady = true;
  },

  /**
   * 已加载的模块
   */
  _attached: {},

  /**
   * 加载注册的所有模块
   */
  _loadModules: function() {
    var mods = this.mods,
    attached = this._attached,
    name, m;

    for (name in mods) {
      m = mods[name];

      if (!attached[name] && m) { // 不允许覆盖
        attached[name] = m;

        if (m.fn) {
          m.fn(this);
        }
      }

    // 注意：m.details 暂时没用到，仅是预留的扩展接口
    }

  // TODO
  // lang 的加载可以延迟到实例化时，只加载当前 lang
  }
});

// TODO
// 1. 自动替换页面中的 textarea ? 约定有特殊 class 的不替换

KISSY.Editor.add("config", function(E) {

  E.config = {
    /**
     * 基本路径
     */
    base: "",

    /**
     * 语言
     */
    language: "zh-cn",

    /**
     * 主题
     */
    theme: "default",

    /**
     * Toolbar 上功能插件
     * 每个按钮就是一个插件
     * ""表示按钮分隔线
     */
    toolbar: [
        "bold", "italic", "underline", "strikeThrough",
        /*"undo", "redo",
        "",*/ //原版好像有BUG
        "fontName", "fontSize", "foreColor", "backColor",
        "",
        "link", "smiley", "image",
        "",
        "insertOrderedList", "insertUnorderedList", "outdent", "indent", "justifyLeft", "justifyCenter", "justifyRight",
        "","source"
        //"",
        //"removeformat"
    ],

    /**
     * Statusbar 上的插件
     * 状态栏插件
     */
    statusbar: [
//      "wordcount",
//      "resize"
      "autoresize"
    ],

    /**
     * 插件的配置
     */
    pluginsConfig: { }

    /**
     * 自动聚焦
     */
    // autoFocus: false
  };

});

KISSY.Editor.add("lang~en", function(E) {

    E.lang["en"] = {

        // Toolbar buttons
        source: {
          text            : "Source",
          title           : "Source"
        },
        undo: {
          text            : "Undo",
          title           : "Undo (Ctrl+Z)"
        },
        redo: {
          text            : "Redo",
          title           : "Redo (Ctrl+Y)"
        },
        fontName: {
          text            : "Font Name",  
          title           : "Font Name",
          options         : {
              "Arial"           : "Arial",
              "Times New Roman" : "Times New Roman",
              "Arial Black"     : "Arial Black",
              "Arial Narrow"    : "Arial Narrow",
              "Comic Sans MS"   : "Comic Sans MS",
              "Courier New"     : "Courier New",
              "Garamond"        : "Garamond",
              "Georgia"         : "Georgia",
              "Tahoma"          : "Tahoma",
              "Trebuchet MS"    : "Trebuchet MS",
              "Verdana"         : "Verdana"
          }
        },
        fontSize: {
          text            : "Size",
          title           : "Font size",
          options         : {
              "8"               : "1",
              "10"              : "2",
              "12"              : "3",
              "14"              : "4",
              "18"              : "5",
              "24"              : "6",
              "36"              : "7"
          }
        },
        bold: {
            text          : "Bold",
            title         : "Bold (Ctrl+B)"
        },
        italic: {
            text          : "Italic",
            title         : "Italick (Ctrl+I)"
        },
        underline: {
            text          : "Underline",
            title         : "Underline (Ctrl+U)"
        },
        strikeThrough: {
            text          : "Strikeout",
            title         : "Strikeout"
        },
        link: {
            text          : "Link",
            title         : "Insert/Edit link",
            href          : "URL:",
            target        : "Open link in new window",
            remove        : "Remove link"
        },
        blockquote: {
            text          : "Blockquote",
            title         : "Insert blockquote"
        },
        smiley: {
            text          : "Smiley",
            title         : "Insert smiley"
        },
        image: {
            text          : "Image",
            title         : "Insert image",
            tab_link      : "Web Image",
            tab_local     : "Local Image",
            tab_album     : "Album Image",
            label_link    : "Enter image web address:",
            label_local   : "Browse your computer for the image file to upload:",
            label_album   : "Select the image from your album:",
            uploading     : "Uploading...",
            upload_error  : "Exception occurs when uploading file.",
            upload_filter : "Only allow PNG, GIF, JPG image type.",
            ok            : "Insert"
        },
        insertOrderedList: {
            text          : "Numbered List",
            title         : "Numbered List (Ctrl+7)"
        },
        insertUnorderedList: {
            text          : "Bullet List",
            title         : "Bullet List (Ctrl+8)"
        },
        outdent: {
            text          : "Decrease Indent",
            title         : "Decrease Indent"
        },
        indent: {
            text          : "Increase Indent",
            title         : "Increase Indent"
        },
        justifyLeft: {
            text          : "Left Justify",
            title         : "Left Justify (Ctrl+L)"
        },
        justifyCenter: {
            text          : "Center Justify",
            title         : "Center Justify (Ctrl+E)"
        },
        justifyRight: {
            text          : "Right Justify",
            title         : "Right Justify (Ctrl+R)"
        },
        foreColor: {
            text          : "Text Color",
            title         : "Text Color"
        },
        backColor: {
            text          : "Text Background Color",
            title         : "Text Background Color"
        },
        maximize: {
          text            : "Maximize",
          title           : "Maximize"
        },
        removeformat: {
          text            : "Remove Format",
          title           : "Remove Format"
        },
        wordcount: {
          tmpl            : "Remain %remain% words (include html code)"
        },
        resize: {
            larger_text   : "Larger",
            larger_title  : "Enlarge the editor",
            smaller_text  : "Smaller",
            smaller_title : "Shrink the editor"
        },

        // Common messages and labels
        common: {
            ok            : "OK",
            cancel        : "Cancel"
        }
    };

});

KISSY.Editor.add("lang~zh-cn", function(E) {

    E.lang["zh-cn"] = {

        // Toolbar buttons
        source: {
          text            : "源码",
          title           : "源码"
        },
        undo: {
          text            : "撤销",
          title           : "撤销"
        },
        redo: {
          text            : "重做",
          title           : "重做"
        },
        fontName: {
          text            : "字体",
          title           : "字体",
          options         : {
              "宋体"             : "宋体",
              "黑体"             : "黑体",
              "隶书"             : "隶书",
              "楷体"             : "楷体_GB2312",
              //"幼圆"             : "幼圆",
              "微软雅黑"          : "微软雅黑",
              "Georgia"         : "Georgia",
              //"Garamond"        : "Garamond",
              "Times New Roman" : "Times New Roman",
              "Impact"          : "Impact",
              "Courier New"     : "Courier New",
              "Arial"           : "Arial",
              "Verdana"         : "Verdana",
              "Tahoma"          : "Tahoma"
          }
        },
        fontSize: {
          text            : "大小",
          title           : "大小",
          options         : {
              "8"               : "1",
              "10"              : "2",
              "12"              : "3",
              "14"              : "4",
              "18"              : "5",
              "24"              : "6",
              "36"              : "7"
          }
        },
        bold: {
            text          : "粗体",
            title         : "粗体"
        },
        italic: {
            text          : "斜体",
            title         : "斜体"
        },
        underline: {
            text          : "下划线",
            title         : "下划线"
        },
        strikeThrough: {
            text          : "删除线",
            title         : "删除线"
        },
        link: {
            text          : "链接",
            title         : "插入/编辑链接",
            href          : "URL:",
            target        : "在新窗口打开链接",
            remove        : "移除链接"
        },
        blockquote: {
            text          : "引用",
            title         : "引用"
        },
        smiley: {
            text          : "表情",
            title         : "插入表情"
        },
        image: {
            text          : "图片",
            title         : "插入图片",
            tab_link      : "网络图片",
            tab_local     : "本地上传",
            tab_album     : "我的相册",
            label_link    : "请输入图片地址：",
            label_local   : "请选择本地图片：",
            label_album   : "请选择相册图片：",
            uploading     : "正在上传...",
            upload_error  : "对不起，上传文件时发生了错误：",
            upload_filter : "仅支持 JPG, PNG 和 GIF 图片，请重新选择。",
            ok            : "插入"
        },
        insertOrderedList: {
            text          : "有序列表",
            title         : "有序列表"
        },
        insertUnorderedList: {
            text          : "无序列表",
            title         : "无序列表"
        },
        outdent: {
            text          : "减少缩进",
            title         : "减少缩进"
        },
        indent: {
            text          : "增加缩进",
            title         : "增加缩进"
        },
        justifyLeft: {
            text          : "左对齐",
            title         : "左对齐"
        },
        justifyCenter: {
            text          : "居中对齐",
            title         : "居中对齐"
        },
        justifyRight: {
            text          : "右对齐",
            title         : "右对齐"
        },
        foreColor: {
            text          : "文本颜色",
            title         : "文本颜色"
        },
        backColor: {
            text          : "背景颜色",
            title         : "背景颜色"
        },
        maximize: {
          text            : "全屏编辑",
          title           : "全屏编辑"
        },
        removeformat: {
          text            : "清除格式",
          title           : "清除格式"
        },
        wordcount: {
          tmpl            : "还可以输入 %remain% 字（含 html 代码）"
        },
        resize: {
            larger_text   : "增大",
            larger_title  : "增大编辑区域",
            smaller_text  : "缩小",
            smaller_title : "缩小编辑区域"
        },

        // Common messages and labels
        common: {
            ok            : "确定",
            cancel        : "取消"
        }
    };

});

KISSY.Editor.add("core~plugin", function(E) {
  /**
   * 插件种类
   */
  E.PLUGIN_TYPE = {
    CUSTOM: 0,
    TOOLBAR_SEPARATOR: 1,
    TOOLBAR_BUTTON: 2,
    TOOLBAR_MENU_BUTTON: 4,
    TOOLBAR_SELECT: 8,
    STATUSBAR_ITEM: 16,
    FUNC: 32 // 纯功能性质插件，无 UI
  };
});

//2.23 10:07 modified
KISSY.Editor.add("core~dom", function(E) {
  
  E.Dom = {
    /**
     * 获取元素的文本内容
     */
    getText: function(el) {
      return el ? (el.textContent || '') : '';
    },

    /**
     * 让元素不可选，解决 ie 下 selection 丢失的问题
     */
    setItemUnselectable: function(el) {
      var arr, i, len, n, a;

      arr = el.getElementsByTagName("*");
      for (i = -1, len = arr.length; i < len; ++i) {
        a = (i == -1) ? el : arr[i];

        n = a.nodeName;
        if (n && n != "INPUT") {
          a.setAttribute("unselectable", "on");
        }
      }

      return el;
    },

    // Ref: CKEditor - core/dom/elementpath.js
    BLOCK_ELEMENTS: {

      /* 结构元素 */
      blockquote:1,
      div:1,
      h1:1,
      h2:1,
      h3:1,
      h4:1,
      h5:1,
      h6:1,
      hr:1,
      p:1,

      /* 文本格式元素 */
      address:1,
      center:1,
      pre:1,

      /* 表单元素 */
      form:1,
      fieldset:1,
      caption:1,

      /* 表格元素 */
      table:1,
      tbody:1,
      tr:1,
      th:1,
      td:1,

      /* 列表元素 */
      ul:1,
      ol:1,
      dl:1,
      dt:1,
      dd:1,
      li:1
    }
  };
  // for ie
  if (Prototype.Browser.IE) {
    E.Dom.getText = function(el) {
      return el ? (el.innerText || '') : '';
    };
  }
});

//2.23 10:55 modified
KISSY.Editor.add("core~color", function(E) {

  var TO_STRING = "toString",
  PARSE_INT = parseInt,
  RE = RegExp;

  E.Color = {
    KEYWORDS: {
      black: "000",
      silver: "c0c0c0",
      gray: "808080",
      white: "fff",
      maroon: "800000",
      red: "f00",
      purple: "800080",
      fuchsia: "f0f",
      green: "008000",
      lime: "0f0",
      olive: "808000",
      yellow: "ff0",
      navy: "000080",
      blue: "00f",
      teal: "008080",
      aqua: "0ff"
    },

    re_RGB: /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
    re_hex: /^#?([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
    re_hex3: /([0-9A-F])/gi,

    toRGB: function(val) {
      if (!this.re_RGB.test(val)) {
        val = this.toHex(val);
      }

      if(this.re_hex.exec(val)) {
        val = "rgb(" + [
        PARSE_INT(RE.$1, 16),
        PARSE_INT(RE.$2, 16),
        PARSE_INT(RE.$3, 16)
        ].join(", ") + ")";
      }
      return val;
    },

    toHex: function(val) {
      val = this.KEYWORDS[val] || val;

      if (this.re_RGB.exec(val)) {
        var r = (RE.$1 >> 0)[TO_STRING](16),
        g = (RE.$2 >> 0)[TO_STRING](16),
        b = (RE.$3 >> 0)[TO_STRING](16);

        val = [
        r.length == 1 ? "0" + r : r,
        g.length == 1 ? "0" + g : g,
        b.length == 1 ? "0" + b : b
        ].join("");
      }

      if (val.length < 6) {
        val = val.replace(this.re_hex3, "$1$1");
      }

      if (val !== "transparent" && val.indexOf("#") < 0) {
        val = "#" + val;
      }

      return val.toLowerCase();
    },

    /**
     * Convert the custom integer (B G R) format to hex format.
     */
    int2hex: function(val) {
      var red, green, blue;

      val = val >> 0;
      red = val & 255;
      green = (val >> 8) & 255;
      blue = (val >> 16) & 255;

      return this.toHex("rgb(" + red + "," + green +"," + blue + ")");
    }
  };

});

//2.23 11:11 modified
KISSY.Editor.add("core~command", function(E) {

  var CUSTOM_COMMANDS = {
    backColor: Prototype.Browser.Gecko ? "hiliteColor" : "backColor"
  },
  TAG_COMMANDS = "bold,italic,underline,strikeThrough",
  STYLE_WITH_CSS = "styleWithCSS",
  EXEC_COMMAND = "execCommand";
    
  E.Command = {

    /**
     * 执行 doc.execCommand
     */
    exec: function(doc, cmdName, val, styleWithCSS) {
      cmdName = CUSTOM_COMMANDS[cmdName] || cmdName;

      this._preExec(doc, cmdName, styleWithCSS);
      doc[EXEC_COMMAND](cmdName, false, val);
    },

    _preExec: function(doc, cmdName, styleWithCSS) {

      // 关闭 gecko 浏览器的 styleWithCSS 特性，使得产生的内容和 ie 一致
      if (Prototype.Browser.Gecko) {
        var val = typeof styleWithCSS === "undefined" ? (TAG_COMMANDS.indexOf(cmdName) === -1) : styleWithCSS;
        doc[EXEC_COMMAND](STYLE_WITH_CSS, false, val);
      }
    }
  };
});

//2.23 11:18 modified
KISSY.Editor.add("core~range", function(E) {

  var isIE = Prototype.Browser.IE;

  E.Range = {

    /**
     * 获取选中区域对象
     */
    getSelectionRange: function(win) {
      var doc = win.document,
      selection, range;

      if (win.getSelection) { // W3C
        selection = win.getSelection();

        if (selection.getRangeAt) {
          range = selection.getRangeAt(0);

        } else { // for Old Webkit! 高版本的已经支持 getRangeAt
          range = doc.createRange();
          range.setStart(selection.anchorNode, selection.anchorOffset);
          range.setEnd(selection.focusNode, selection.focusOffset);
        }

      } else if (doc.selection) { // IE
        range = doc.selection.createRange();
      }

      return range;
    },

    /**
     * 获取容器
     */
    getCommonAncestor: function(range) {
      return range.startContainer || // w3c
      (range.parentElement && range.parentElement()) || // ms TextRange
      (range.commonParentElement && range.commonParentElement()); // ms IHTMLControlRange
    },

    /**
     * 获取选中文本
     */
    getSelectedText: function(range) {
      if("text" in range) return range.text;
      return range.toString ? range.toString() : ""; // ms IHTMLControlRange 无 toString 方法
    },

    /**
     * 保存选区 for ie
     */
    saveRange: function(editor) {
      // 1. 保存 range, 以便还原
      isIE && editor.contentWin.focus(); // 确保下面这行 range 是编辑区域的，否则 [Issue 39]

      // 2. 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
      // 通过 blur / focus 等方式在 ie7- 下无效
      // 注意：2 和 1 冲突。权衡考虑，还是取消2
      //isIE && editor.contentDoc.selection.empty();

      return editor.getSelectionRange();
    }
  };

});

//2.23 12:04 modified
KISSY.Editor.add("core~instance", function(E) {

  var ie = Prototype.Browser.IE,
  EDITOR_CLASSNAME = "ks-editor",

  EDITOR_TMPL  =
    '<div class="ks-editor-toolbar"></div>' +
    '<div class="ks-editor-content"><iframe frameborder="0" allowtransparency="1"></iframe></div>' +
    '<div class="ks-editor-statusbar"></div>',

  CONTENT_TMPL =
    '<!doctype html>' +
    '<html>' +
    '<head>' +
    '<title>Rich Text Area</title>' +
    '<meta http-equiv="content-type" content="text/html; charset=gb18030" />' +
    '<link type="text/css" href="{CONTENT_CSS}" rel="stylesheet" />' +
    '</head>' +
    '<body spellcheck="false" class="ks-editor-post">{CONTENT}</body>' +
    '</html>',

  THEMES_DIR = "themes";

  /**
   * 编辑器的实例类
   */
  E.Instance = Class.create({
    initialize: function(textarea, config){
      //相关联的 textarea 元素
      this.textarea = $(textarea);

      //配置项
      this.config = Object.extend(Object.clone(E.config), config || {});

      /**
       * 以下在 renderUI 中赋值
       * @property container
       * @property contentWin
       * @property contentDoc
       * @property statusbar
       */

      //与该实例相关的插件
      //this.plugins = [];

      //是否处于源码编辑状态
      this.sourceMode = false;
      
      //工具栏
      this.toolbar = new E.Toolbar(this);

      //状态栏
      this.statusbar = new E.Statusbar(this);

      // init
      this._init();
    },

    /**
     * 初始化方法
     */
    _init: function() {
      this._renderUI();
      this._initPlugins();
      this._initAutoFocus();
    },

    _renderUI: function() {
      this._renderContainer();
      this._setupContentPanel();
    },

    /**
     * 初始化所有插件
     */
    _initPlugins: function() {
      var key, p,
      staticPlugins = E.plugins,
      plugins = [];

      // 每个实例，拥有一份自己的 plugins 列表
      for(key in staticPlugins) {
        plugins[key] = Object.clone(staticPlugins[key]);
      }
      this.plugins = plugins;

      // 工具栏上的插件
      this.toolbar.init();

      // 状态栏上的插件
      this.statusbar.init();

      // 其它功能性插件
      for (key in plugins) {
        p = plugins[key];
        if (p.inited) continue;

        if (p.type === E.PLUGIN_TYPE.FUNC) {
          p.editor = this; // 给 p 增加 editor 属性
          if (p.init) {
            p.init();
          }
          p.inited = true;
        }
      }
    },

    /**
     * 生成 DOM 结构
     */
    _renderContainer: function() {
      var textarea = this.textarea,
        dim = Element.getDimensions(textarea),
        width = dim.width + "px",
        height = dim.height + "px",
        container = document.createElement("div"),
        content, iframe;
      if(width == '0px'){width='100%'}
      if(dim.height < 50){height='50px'}

      container.className = EDITOR_CLASSNAME;
      //container.style.width = width;
      container.innerHTML = EDITOR_TMPL;

      content = container.childNodes[1];
      content.style.width = "100%";
      content.style.height = height;

      iframe = content.childNodes[0];
      iframe.style.width = "100%";
      iframe.style.height = "100%"; // 使得 resize 插件能正常工作
      iframe.setAttribute("frameBorder", 0);

      textarea.style.display = "none";
      Element.insert(textarea,{before:container})

      this.container = container;
      this.toolbar.domEl = container.childNodes[0];
      this.contentWin = iframe.contentWindow;
      this.contentDoc = iframe.contentWindow.document;

      this.statusbar.domEl = container.childNodes[2];
      $(this.statusbar.domEl).hide();

    // TODO 目前是根据 textatea 的宽度来设定 editor 的宽度。可以考虑 config 里指定宽度
    },

    _setupContentPanel: function() {
      var doc = this.contentDoc,
      config = this.config,
      contentCSS = "content" + (config.debug ? "" : "-min") + ".css",
      contentCSSUrl = config.base + THEMES_DIR + "/" + config.theme + "/" + contentCSS,
      self = this;

      // 初始化 iframe 的内容
      doc.open();
      doc.write(CONTENT_TMPL
        .replace("{CONTENT_CSS}", contentCSSUrl)
        .replace("{CONTENT}", this.textarea.value));
      doc.close();

      if (ie) {
        // 用 contentEditable 开启，否则 ie 下选区为黑底白字
        doc.body.contentEditable = "true";
      }else {
        // firefox 对 designMode 的支持更好
        doc.designMode = "on";
      }

      // 注1：在 tinymce 里，designMode = "on" 放在 try catch 里。
      //     原因是在 firefox 下，当iframe 在 display: none 的容器里，会导致错误。
      //     但经过我测试，firefox 3+ 以上已无此现象。
      // 注2： ie 用 contentEditable = true.
      //     原因是在 ie 下，IE needs to use contentEditable or it will display non secure items for HTTPS
      // Ref:
      //   - Differences between designMode and contentEditable
      //     http://74.125.153.132/search?q=cache:5LveNs1yHyMJ:nagoon97.wordpress.com/2008/04/20/differences-between-designmode-and-contenteditable/+ie+contentEditable+designMode+different&cd=6&hl=en&ct=clnk

      // TODO: 让初始输入文字始终在 p 标签内
      // 下面的处理办法不妥当
      //            if (Lang.trim(doc.body.innerHTML).length === 0) {
      //                if(UA.gecko) {
      //                    doc.body.innerHTML = '<p><br _moz_editor_bogus_node="TRUE" _moz_dirty=""/></p>';
      //                } else {
      //                    doc.body.innerHTML = '<p></p>';
      //                }
      //            }

      if(ie) {
        // 点击的 iframe doc 非 body 区域时，还原焦点位置
        $(doc).observe("click", function() {
          if (doc.activeElement.parentNode.nodeType === 9) { // 点击在 doc 上
            self._focusToEnd();
          }
        });
      }
    },

    _initAutoFocus: function() {
      if (this.config.autoFocus) {
        this._focusToEnd();
      }
    },

    /**
     * 将光标定位到最后一个元素
     */
    _focusToEnd: function() {
      this.contentWin.focus();

      var lastChild = this.contentDoc.body.lastChild,
      range = E.Range.getSelectionRange(this.contentWin);

      if (Prototype.Browser.IE) {
        try { // 有时会报错：编辑器 ie 下，切换源代码，再切换回去，点击编辑器框内，有无效指针的JS错误
          range.moveToElementText(lastChild);
        } catch(ex) { }
        range.collapse(false);
        range.select();

      } else {
        try {
          range.setEnd(lastChild, lastChild.childNodes.length);
        } catch(ex) { }
        range.collapse(false);
      }
    },

    /**
     * 获取焦点
     */
    focus: function() {
      this._focusToEnd();
    },

    /**
     * 执行 execCommand
     */
    execCommand: function(commandName, val, styleWithCSS) {
      this.contentWin.focus(); // 还原焦点
      E.Command.exec(this.contentDoc, commandName, val, styleWithCSS);
    },

    /**
     * 获取数据
     */
    getData: function() {
      if(this.sourceMode) {
        return this.textarea.value;
      }
      return this.getContentDocData();
    },

    /**
     * 获取 contentDoc 中的数据
     */
    getContentDocData: function() {
      var bd = this.contentDoc.body,
      data = "", p = E.plugins["save"];

      // Firefox 下，_moz_editor_bogus_node, _moz_dirty 等特有属性
      // 这些特有属性，在用 innerHTML 获取时，自动过滤了

      data = bd.innerHTML;
      if(data == "<br>") data = ""; // firefox 下会自动生成一个 br

      if(p && p.filterData) {
        data = p.filterData(data);
      }

      return data;
    },

    /**
     * 获取选中区域的 Range 对象
     */
    getSelectionRange: function() {
      return E.Range.getSelectionRange(this.contentWin);
    }
  })
});

//2.23 13:43 modified
KISSY.Editor.add("core~toolbar", function(E) {

  var isIE = Prototype.Browser.IE,
    isIE6 = (navigator.userAgent.indexOf("MSIE 6.")>=0  && document.all),
    TYPE = E.PLUGIN_TYPE,
    TOOLBAR_SEPARATOR_TMPL = '<div class="ks-editor-stripbar-sep ks-inline-block"></div>',

    TOOLBAR_BUTTON_TMPL = '' +
    '<div class="ks-editor-toolbar-button ks-inline-block" title="{TITLE}">' +
    '<div class="ks-editor-toolbar-button-outer-box">' +
    '<div class="ks-editor-toolbar-button-inner-box">' +
    '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
    '</div>' +
    '</div>' +
    '</div>',

    TOOLBAR_MENU_BUTTON_TMPL = '' +
    '<div class="ks-editor-toolbar-menu-button-caption ks-inline-block">' +
    '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
    '</div>' +
    '<div class="ks-editor-toolbar-menu-button-dropdown ks-inline-block"></div>',

    TOOLBAR_MENU_BUTTON = "ks-editor-toolbar-menu-button",
    TOOLBAR_SELECT = "ks-editor-toolbar-select",
    TOOLBAR_BUTTON_ACTIVE = "ks-editor-toolbar-button-active",
    TOOLBAR_BUTTON_HOVER = "ks-editor-toolbar-button-hover",
    TOOLBAR_BUTTON_SELECTED = "ks-editor-toolbar-button-selected",

    STATE_CMDS = "fontName,fontSize,bold,italic,underline,strikeThrough"
    + "insertOrderedList,insertUnorderedList"
    + "justifyLeft,justifyCenter,justifyRight",

    div = document.createElement("div"); // 通用 el 容器


  E.Toolbar = function(editor) {

    /**
     * 相关联的编辑器实例
     */
    this.editor = editor;

    /**
     * 相关联的配置
     */
    this.config = editor.config;

    /**
     * 当前语言
     */
    this.lang = E.lang[this.config.language];

    /**
     * 所有加载的工具栏插件
     */
    this.items = [];

    /**
     * 所有需要动态更新状态的工具栏插件项
     */
    this.stateItems = [];
  };

  Object.extend(E.Toolbar.prototype, {

    /**
     * 初始化工具条
     */
    init: function() {
      var items = this.config.toolbar,
      plugins = this.editor.plugins,
      key, p;

      // 遍历配置项，找到相关插件项，并添加到工具栏上
      for (var i = 0, len = items.length; i < len; ++i) {
        key = items[i];
        if (key) {
          if (!(key in plugins)) continue; // 配置项里有，但加载的插件里无，直接忽略

          // 添加插件项
          p = plugins[key];
          this._addItem(p);

          this.items.push(p);
          if(STATE_CMDS.indexOf(p.name) !== -1) {
            this.stateItems.push(p);
          }

        } else { // 添加分隔线
          this._addSeparator();
        }
      }

      // 状态更新
      this._initUpdateState();
    },

    /**
     * 添加工具栏项
     */
    _addItem: function(p) {
      var el, type = p.type, lang = this.lang, html;

      // 当 plugin 没有设置 lang 时，采用默认语言配置
      // TODO: 考虑重构到 instance 模块里，因为 lang 仅跟实例相关
      if (!p.lang) p.lang = Object.extend(Object.clone(lang["common"]), this.lang[p.name] || {});

      // 根据模板构建 DOM
      html = TOOLBAR_BUTTON_TMPL
      .replace("{TITLE}", p.lang.title || "")
      .replace("{NAME}", p.name)
      .replace("{TEXT}", p.lang.text || "");
      if (isIE6) {
        html = html
        .replace("outer-box", "outer-box ks-inline-block")
        .replace("inner-box", "inner-box ks-inline-block");
      }
      div.innerHTML = html;

      // 得到 domEl
      p.domEl = el = div.firstChild;

      // 根据插件类型，调整 DOM 结构
      if (type == TYPE.TOOLBAR_MENU_BUTTON || type == TYPE.TOOLBAR_SELECT) {
        // 注：select 是一种特殊的 menu button
        this._renderMenuButton(p);

        if(type == TYPE.TOOLBAR_SELECT) {
          this._renderSelect(p);
        }
      }

      // 绑定事件
      this._bindItemUI(p);

      // 添加到工具栏
      this._addToToolbar(el);

      // 调用插件自己的初始化函数，这是插件的个性化接口
      // init 放在添加到工具栏后面，可以保证 DOM 操作比如取 region 等操作的正确性
      p.editor = this.editor; // 给 p 增加 editor 属性
      if (p.init) {
        p.init();
      }

      // 标记为已初始化完成
      p.inited = true;
    },

    /**
     * 初始化下拉按钮的 DOM
     */
    _renderMenuButton: function(p) {
      var el = p.domEl,
      innerBox = el.getElementsByTagName("span")[0].parentNode;

      $(el).addClassName(TOOLBAR_MENU_BUTTON);
      innerBox.innerHTML = TOOLBAR_MENU_BUTTON_TMPL
      .replace("{NAME}", p.name)
      .replace("{TEXT}", p.lang.text || "");
    },

    /**
     * 初始化 selectBox 的 DOM
     */
    _renderSelect: function(p) {
      $(p.domEl).addClassName(TOOLBAR_SELECT);
    },

    /**
     * 给工具栏项绑定事件
     */
    _bindItemUI: function(p) {
      var el = p.domEl;

      // 1. 注册点击时的响应函数
      if (p.exec) {
        $(el).observe("click", function() {
          p.exec();
        });
      }

      // 2. 添加鼠标点击时，按钮按下的效果
      $(el).observe("mousedown", function() {
        $(el).addClassName(TOOLBAR_BUTTON_ACTIVE);
      });
      $(el).observe("mouseup", function() {
        $(el).removeClassName(TOOLBAR_BUTTON_ACTIVE);
      });
      // TODO 完善效果：在鼠标左键按下状态，将鼠标移出和移入按钮时，按钮状态的切换
      // 注：firefox 下，按住左键，将鼠标移出和移入按钮时，不会触发 mouseout. 需要研究下 google 是如何实现的
      $(el).observe("mouseout", function(e) {
        var toElement = e.toElement, isChild; //toElement是自己封装的，需要观察看是否有问题

        try {
          if (el.contains) {
            isChild = el.contains(toElement);
          } else if (el.compareDocumentPosition) {
            isChild = el.compareDocumentPosition(toElement) & 8;
          }
        } catch(e) {
          isChild = false; // 已经移动到 iframe 里
        }
        if (isChild) return;

        $(el).removeClassName(TOOLBAR_BUTTON_ACTIVE);
      });

      // 3. ie6 下，模拟 hover
      // prototype1.6里面没有这两个事件，需要进一步测试
      if(isIE6) {
        $(el).observe("mouseenter", function() {
          $(el).addClassName(TOOLBAR_BUTTON_HOVER);
        });
        $(el).observe("mouseleave", function() {
          $(el).removeClassName(TOOLBAR_BUTTON_HOVER);
        });
      }
    },

    /**
     * 添加分隔线
     */
    _addSeparator: function() {
      div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
      this._addToToolbar(div.firstChild);
    },

    /**
     * 将 item 或 分隔线 添加到工具栏
     */
    _addToToolbar: function(el) {
      if(isIE) el = E.Dom.setItemUnselectable(el);
      this.domEl.appendChild(el);
    },

    /**
     * 初始化按钮状态的动态更新
     */
    _initUpdateState: function() {
      var doc = this.editor.contentDoc,
      self = this;
      //此处doc可能为空元素，所以不能用$(doc)的写法，特此注明
      Element.observe(doc, "click", function() {
        self.updateState();
      });
      Element.observe(doc, "keyup", function(ev) {
        var keyCode = ev.keyCode;

        // PGUP,PGDN,END,HOME: 33 - 36
        // LEFT,UP,RIGHT,DOWN：37 - 40
        // BACKSPACE: 8
        // ENTER: 13
        // DEL: 46
        if((keyCode >= 33 && keyCode <= 40)
          || keyCode === 8
          || keyCode === 13
          || keyCode === 46) {
          self.updateState();
        }
      });

    // TODO: 监控粘贴时的事件，粘贴后需要更新按钮状态
    },

    /**
     * 按钮状态的动态更新（包括按钮选中状态的更新、字体字号的更新、颜色的动态更新等）
     * 遵守 Google Docs 的原则，让所有按钮始终可点击，只更新状态，不禁用按钮
     */
    updateState: function(filterNames) {
      var items = this.stateItems, p;
      filterNames = filterNames ? filterNames.join("|") : "";

      for(var i = 0, len = items.length; i < len; i++) {
        p = items[i];

        if(filterNames && filterNames.indexOf(p.name) === -1)
          continue;

        // 调用插件自己的状态更新函数
        if(p.updateState) {
          p.updateState();
          continue;
        }

        // 默认的状态更新函数
        this.updateItemState(p);
      }

    // TODO: webkit 下，对齐的状态没获取到
    },

    updateItemState: function(p) {
      var doc = this.editor.contentDoc;

      // 默认的状态更新函数
      try {
        if (doc.queryCommandEnabled(p.name)) {
          if (doc.queryCommandState(p.name)) {
            $(p.domEl).addClassName(TOOLBAR_BUTTON_SELECTED);
          } else {
            $(p.domEl).removeClassName(TOOLBAR_BUTTON_SELECTED);
          }
        }
      } catch(ex) {
      }
    }
  });
});

//2.23 15:36 modified
KISSY.Editor.add("core~statusbar", function(E) {

  var isIE = Prototype.Browser.IE,
  
  SEP_TMPL = '<div class="ks-editor-stripbar-sep kissy-inline-block"></div>',
  ITEM_TMPL = '<div class="ks-editor-statusbar-item ks-editor-{NAME} ks-inline-block"></div>',

  div = document.createElement("div"); // 通用 el 容器

  E.Statusbar = Class.create({
    initialize: function(editor){
    //相关联的编辑器实例
    this.editor = editor;

    //相关联的配置
    this.config = editor.config;

    //当前语言
    this.lang = E.lang[this.config.language];
    },

    /**
     * 初始化
     */
    init: function() {
      var items = this.config.statusbar,
      plugins = this.editor.plugins,
      key;

      // 遍历配置项，找到相关插件项，并添加到工具栏上
      items.each(function(key){
        if (key) {
          if (!(key in plugins)) throw $continue; // 配置项里有，但加载的插件里无，直接忽略

          // 添加插件项
          this._addItem(plugins[key]);

        } else { // 添加分隔线
          this._addSep();
        }
      }.bind(this));
    },

    /**
     * 添加工具栏项
     */
    _addItem: function(p) {
      var el, lang = this.lang;

      // 当 plugin 没有设置 lang 时，采用默认语言配置
      // TODO: 考虑重构到 instance 模块里，因为 lang 仅跟实例相关
      if (!p.lang) p.lang = Object.extend(Object.clone(lang["common"]), this.lang[p.name] || {});

      // 根据模板构建 DOM
      div.innerHTML = ITEM_TMPL.replace("{NAME}", p.name);

      // 得到 domEl
      p.domEl = el = div.firstChild;

      // 添加到工具栏
      this._addToToolbar(el);

      // 调用插件自己的初始化函数，这是插件的个性化接口
      // init 放在添加到工具栏后面，可以保证 DOM 操作比如取 region 等操作的正确性
      p.editor = this.editor; // 给 p 增加 editor 属性
      if (p.init) {
        p.init();
      }

      // 标记为已初始化完成
      p.inited = true;
    },

    /**
     * 添加分隔线
     */
    _addSep: function() {
      div.innerHTML = SEP_TMPL;
      this._addToToolbar(div.firstChild);
    },

    /**
     * 将 item 或 分隔线 添加到状态栏
     */
    _addToToolbar: function(el) {
      if(isIE) el = E.Dom.setItemUnselectable(el);
      this.domEl.appendChild(el);
    }
  })

});

//2.23 15:44 modified
KISSY.Editor.add("core~menu", function(E) {

  var isIE6 = (navigator.userAgent.indexOf("MSIE 6.")>=0  && document.all),
  DISPLAY = "display",
  NONE = "none",
  EMPTY = "",
  DROP_MENU_CLASS = "ks-editor-drop-menu",
  SHADOW_CLASS = "ks-editor-drop-menu-shadow",
  CONTENT_CLASS = "ks-editor-drop-menu-content",
  SELECTED_CLASS = "ks-editor-toolbar-button-selected",
  SHIM_CLASS = DROP_MENU_CLASS + "-shim", //  // iframe shim 的 class
  shim; // 共用一个 shim 即可
    
  E.Menu = {

    /**
     * 生成下拉框
     * @param {KISSY.Editor} editor dropMenu 所属的编辑器实例
     * @param {HTMLElement} trigger
     * @param {Array} offset dropMenu 位置的偏移量
     * @return {HTMLElement} dropMenu
     */
    generateDropMenu: function(editor, trigger, offset) {
      var dropMenu = document.createElement("div"),
      self = this;

      // 添加阴影层
      dropMenu.innerHTML = '<div class="' + SHADOW_CLASS + '"></div>'
      + '<div class="' + CONTENT_CLASS + '"></div>';
            
      // 生成 DOM
      dropMenu.className = DROP_MENU_CLASS;
      dropMenu.style[DISPLAY] = NONE;
      document.body.appendChild(dropMenu);

      // 点击触点时，显示下拉框
      // 注：一个编辑器实例，最多只能有一个激活的下拉框
      $(trigger).observe("click", function(ev) {
        // 不向上传播，自己控制
        // 否则 document 上监控点击后，会关闭刚打开的 dropMenu
        ev.stop();

        // 隐藏当前激活的下拉框
        editor.activeDropMenu && self._hide(editor);

        // 打开当前 trigger 的 dropMenu
        if(editor.activeDropMenu != dropMenu) {
          self._setDropMenuPosition(trigger, dropMenu, offset); // 延迟到显示时调整位置
          editor.activeDropMenu = dropMenu;
          editor.activeDropButton = trigger;
          self._show(editor);

        } else { // 第二次点击在 trigger 上，关闭 activeDropMenu, 并置为 null. 否则会导致第三次点击打不开
          editor.activeDropMenu = null;
          editor.activeDropButton = null;
        }
      });

      // document 捕获到点击时，关闭当前激活的下拉框
      [document, editor.contentDoc].each(function(doc_dom){
        Element.observe(doc_dom,"click", function() {
          if(editor.activeDropMenu) {
            self.hideActiveDropMenu(editor);

            // 还原选区和焦点
            if (this == editor.contentDoc) {
              // TODO: [bug 58]  需要重写一个 focusmanager 来统一管理焦点
              //                        if (UA.ie) {
              //                            var range = editor.getSelectionRange();
              //                            range.select();
              //                        }
              editor.contentWin.focus();
            }
          }
        })
      });

      // 改变窗口大小时，动态调整位置
      this._initResizeEvent(trigger, dropMenu, offset);

      // 返回
      return dropMenu.childNodes[1]; // 返回 content 部分
    },

    /**
         * 设置 dropMenu 的位置
         */
    _setDropMenuPosition: function(trigger, dropMenu, offset) {
      var r = $(trigger).viewportOffset();
      var d = $(trigger).getDimensions();
      var left = r.left, top = r.top + d.height;

      if(offset) {
        left += offset[0];
        top += offset[1];
      }

      dropMenu.style.left = left + "px";
      dropMenu.style.top = top + "px";
    },

    _isVisible: function(el) {
      if(!el) return false;
      return el.style[DISPLAY] != NONE;
    },

    /**
         * 隐藏编辑器当前打开的下拉框
         */
    hideActiveDropMenu: function(editor) {
      this._hide(editor);
      editor.activeDropMenu = null;
      editor.activeDropButton = null;
    },

    _hide: function(editor) {
      var dropMenu = editor.activeDropMenu,
      dropButton = editor.activeDropButton;

      if(dropMenu) {
        shim && (shim.style[DISPLAY] = NONE);

        dropMenu.style[DISPLAY] = NONE;
      //dropMenu.style.visibility = "hidden";
      // 注：visibilty 方式会导致ie下，上传并插入文件（选择了选取文件框）后，编辑区域焦点丢失
      }

      dropButton && ($(dropButton).removeClassName(SELECTED_CLASS));
    },

    _show: function(editor) {
      var dropMenu = editor.activeDropMenu,
      dropButton = editor.activeDropButton;

      if (dropMenu) {
        dropMenu.style[DISPLAY] = EMPTY;

        if (isIE6) {
          this._updateShimRegion(dropMenu);
          shim.style[DISPLAY] = EMPTY;
        }
      }

      dropButton && ($(dropButton).addClassName(SELECTED_CLASS));
    },

    _updateShimRegion: function(el) {
      if(el) {
        if(isIE6) {
          if(!shim) this._initShim();
          this._setShimRegion(el);
        }
      }
    },

    /**
     * window.onresize 时，重新调整 dropMenu 的位置
     */
    _initResizeEvent: function(trigger, dropMenu, offset) {
      var self = this, resizeTimer;

      Element.observe(window, "resize", function() {
        if (resizeTimer) {
          clearTimeout(resizeTimer);
        }

        resizeTimer = setTimeout(function() {
          if(self._isVisible(dropMenu)) { // 仅在显示时，需要动态调整
            self._setDropMenuPosition(trigger, dropMenu, offset);
          }
        }, 50);
      });
    },

    _initShim: function() {
      shim = document.createElement("iframe");
      shim.src = "about:blank";
      shim.className = SHIM_CLASS;
      shim.style.position = "absolute";
      shim.style[DISPLAY] = NONE;
      shim.style.border = NONE;
      document.body.appendChild(shim);
    },

    /**
     * 设置 shim 的 region
     * @protected
     */
    _setShimRegion: function(el) {
      if (shim && this._isVisible(el)) {
        var r = $(el).viewportOffset();
        var d = $(el).getDimensions();
        if (r.width > 0) {
          shim.style.left = r.left + "px";
          shim.style.top = r.top + "px";
          shim.style.width = (d.width - 1) + "px"; // 少一像素，否则 ie6 下会露出一像素
          shim.style.height = (d.height - 1) + "px";
        }
      }
    }
  };

});

//2.23 16:12 modified
KISSY.Editor.add("smilies~config~default", function(E) {
  E.Smilies = E.Smilies || {};
  E.Smilies["default"] = {
    name: "default",
    mode: "icons",
    cols: 5,
    fileNames: [
    "smile",  "confused",  "cool",      "cry",   "eek",
    "angry",  "wink",      "sweat",     "lol",   "stun",
    "razz",   "shy",       "rolleyes",  "sad",   "happy",
    "yes",    "no",        "heart",     "idea",  "rose"
    ],
    fileExt: "gif"
  };
});

//2.23 16:16 modified
KISSY.Editor.add("smilies~config~wangwang", function(E) {
  E.Smilies = E.Smilies || {};
  E.Smilies["wangwang"] = {
    name: "wangwang",
    mode: "sprite",
    base: "http://a.tbcdn.cn/sys/wangwang/smiley/48x48/",
    spriteStyle: "background: url(http://a.tbcdn.cn/sys/wangwang/smiley/sprite.png) no-repeat -1px 0; width: 288px; height: 235px",
    unitStyle: "width: 24px; height: 24px",
    filePattern: {
      start : 0,
      end   : 98,
      step  : 1
    },
    fileExt: "gif"
  };
});


//2.23 16:18 modified
KISSY.Editor.add("plugins~base", function(E) {

  var TYPE = E.PLUGIN_TYPE,
  buttons  = "bold,italic,underline,strikeThrough," +
  "insertOrderedList,insertUnorderedList";
  //粗体 斜体 下划线 删除线 有序列表 无序列表
  E.addPlugin(buttons.split(","), {
    /**
     * 种类：普通按钮
     */
    type: TYPE.TOOLBAR_BUTTON,

    /**
     * 响应函数
     */
    exec: function() {
      // 执行命令
      this.editor.execCommand(this.name);

      // 更新状态
      this.editor.toolbar.updateState();
    }
  });

});

//2.23 16:25 modified
KISSY.Editor.add("plugins~color", function(E) {

  var
  isIE = Prototype.Browser.IE,
  TYPE = E.PLUGIN_TYPE,

  PALETTE_TABLE_TMPL = '<div class="ks-editor-palette-table"><table><tbody>{TR}</tbody></table></div>',
  PALETTE_CELL_TMPL = '<td class="ks-editor-palette-cell"><div class="ks-editor-palette-colorswatch" title="{COLOR}" style="background-color:{COLOR}"></div></td>',

  COLOR_GRAY = ["000", "444", "666", "999", "CCC", "EEE", "F3F3F3", "FFF"],
  COLOR_NORMAL = ["F00", "F90", "FF0", "0F0", "0FF", "00F", "90F", "F0F"],
  COLOR_DETAIL = [
  "F4CCCC", "FCE5CD", "FFF2CC", "D9EAD3", "D0E0E3", "CFE2F3", "D9D2E9", "EAD1DC",
  "EA9999", "F9CB9C", "FFE599", "B6D7A8", "A2C4C9", "9FC5E8", "B4A7D6", "D5A6BD",
  "E06666", "F6B26B", "FFD966", "93C47D", "76A5AF", "6FA8DC", "8E7CC3", "C27BAD",
  "CC0000", "E69138", "F1C232", "6AA84F", "45818E", "3D85C6", "674EA7", "A64D79",
  "990000", "B45F06", "BF9000", "38761D", "134F5C", "0B5394", "351C75", "741B47",
  "660000", "783F04", "7F6000", "274E13", "0C343D", "073763", "20124D", "4C1130"
  ],

  PALETTE_CELL_CLS = "ks-editor-palette-colorswatch",
  PALETTE_CELL_SELECTED = "ks-editor-palette-cell-selected";

  E.addPlugin(["foreColor", "backColor"], {
    /**
     * 种类：菜单按钮
     */
    type: TYPE.TOOLBAR_MENU_BUTTON,

    /**
     * 当前选取色
     */
    color: "",

    /**
     * 当前颜色指示条
     */
    _indicator: null,

    /**
     * 取色块
     */
    swatches: null,

    /**
     * 关联的下拉菜单框
     */
    dropMenu: null,

    range: null,

    /**
     * 初始化
     */
    init: function() {
      var el = this.domEl,
      caption = el.getElementsByTagName("span")[0].parentNode;

      this.color = this._getDefaultColor();

      $(el).addClassName("ks-editor-toolbar-color-button");
      caption.innerHTML = '<div class="ks-editor-toolbar-color-button-indicator" style="border-bottom-color:' + this.color + '">'
      + caption.innerHTML
      + '</div>';

      this._indicator = caption.firstChild;

      this._renderUI();
      this._bindUI();

      this.swatches = $(this.dropMenu).select('div.'+PALETTE_CELL_CLS);
    },

    _renderUI: function() {
      // 有两种方案：
      //  1. 仿照 MS Office 2007, 仅当点击下拉箭头时，才弹出下拉框。点击 caption 时，直接设置颜色。
      //  2. 仿照 Google Docs, 不区分 caption 和 dropdown，让每次点击都弹出下拉框。
      // 从逻辑上讲，方案1不错。但是，考虑 web 页面上，按钮比较小，方案2这样反而能增加易用性。
      // 这里采用方案2

      this.dropMenu = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);

      // 生成下拉框内的内容
      this._generatePalettes();

      // 针对 ie，设置不可选择
      if (isIE) E.Dom.setItemUnselectable(this.dropMenu);
    },

    _bindUI: function() {
      // 注册选取事件
      this._bindPickEvent();

      Element.observe(this.domEl, "click", function() {
        // 保存 range, 以便还原
        this.range = this.editor.getSelectionRange();

        // 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
        // 注：通过 blur / focus 等方式在 ie7- 下无效
        isIE && this.editor.contentDoc.selection.empty();

        // 更新选中色
        this._updateSelectedColor(this.color);
      }, this, true);
    },

    /**
     * 生成取色板
     */
    _generatePalettes: function() {
      var htmlCode = "";

      // 黑白色板
      htmlCode += this._getPaletteTable(COLOR_GRAY);

      // 常用色板
      htmlCode += this._getPaletteTable(COLOR_NORMAL);

      // 详细色板
      htmlCode += this._getPaletteTable(COLOR_DETAIL);

      // 添加到 DOM 中
      this.dropMenu.innerHTML = htmlCode;
    },

    _getPaletteTable: function(colors) {
      var i, len = colors.length, color,
      trs = "<tr>";

      for(i = 0, len = colors.length; i < len; ++i) {
        if(i != 0 && i % 8 == 0) {
          trs += "</tr><tr>";
        }

        color = E.Color.toRGB("#" + colors[i]).toUpperCase();
        //console.log("color = " + color);
        trs += PALETTE_CELL_TMPL.replace(/{COLOR}/g, color);
      }
      trs += "</tr>";

      return PALETTE_TABLE_TMPL.replace("{TR}", trs);
    },

    /**
     * 绑定取色事件
     */
    _bindPickEvent: function() {
      var self = this;

      Element.observe(this.dropMenu, "click", function(ev) {
        var target = ev.element(),
        attr = target.getAttribute("title");

        if(attr && attr.indexOf("RGB") === 0) {
          self._doAction(attr);
        }

        // 关闭悬浮框
        ev.stop();
        E.Menu.hideActiveDropMenu(self.editor);
      // 注：在这里阻止掉事件冒泡，自己处理对话框的关闭，是因为
      // 在 Firefox 下，当执行 doAction 后，doc 获取到 click
      // 触发 updateState 时，还获取不到当前的颜色值。
      // 这样做，对性能也有好处，这种情况下不需要更新 updateState
      });
    },

    /**
     * 执行操作
     */
    _doAction: function(val) {
      if (!val) return;

      // 更新当前值
      this.setColor(E.Color.toHex(val));

      // 还原选区
      var range = this.range;
      if (isIE && range.select) range.select();

      // 执行命令
      this.editor.execCommand(this.name, this.color);
    },
        
    /**
     * 设置颜色
     * @param {string} val 格式 #RRGGBB or #RGB
     */
    setColor: function(val) {
      this.color = val;

      this._updateIndicatorColor(val);
      this._updateSelectedColor(val);
    },

    /**
     * 更新指示器的颜色
     * @param val HEX 格式
     */
    _updateIndicatorColor: function(val) {
      // 更新 indicator
      this._indicator.style.borderBottomColor = val;
    },

    /**
     * 更新下拉菜单中选中的颜色
     * @param {string} val 格式 #RRGGBB or #RGB
     */
    _updateSelectedColor: function(val) {
      var i, len, swatch, swatches = this.swatches;

      for(i = 0, len = swatches.length; i < len; ++i) {
        swatch = swatches[i];

        // 获取的 backgroundColor 在不同浏览器下，格式有差异，需要统一转换后再比较
        if(E.Color.toHex(swatch.style.backgroundColor) == val) {
          $(swatch.parentNode).addClassName(PALETTE_CELL_SELECTED);
        } else {
          $(swatch.parentNode).removeClassName(PALETTE_CELL_SELECTED);
        }
      }
    },

    /**
     * 更新按钮状态
     */
    // ie 下，queryCommandValue 无法正确获取到 backColor 的值
    // 干脆禁用此功能，模仿 Office2007 的处理，显示最后的选取色
    //        updateState: function() {
    //            var doc = this.editor.contentDoc,
    //                name = this.name, t, val;
    //
    //            if(name == "backColor" && UA.gecko) name = "hiliteColor";
    //
    //            try {
    //                if (doc.queryCommandEnabled(name)) {
    //                    t = doc.queryCommandValue(name);
    //
    //                    if(isIE && typeof t == "number") { // ie下，对于 backColor, 有时返回 int 格式，有时又会直接返回 hex 格式
    //                        t = E.Color.int2hex(t);
    //                    }
    //                    if (t === "transparent") t = ""; // 背景色为透明色时，取默认色
    //                    if(t === "rgba(0, 0, 0, 0)") t = ""; // webkit 的背景色是 rgba 的
    //
    //                    val = t ? E.Color.toHex(t) : this._getDefaultColor(); // t 为空字符串时，表示点击在空行或尚未设置样式的地方
    //                    if (val && val != this.color) {
    //                        this.color = val;
    //                        this._updateIndicatorColor(val);
    //                    }
    //                }
    //            } catch(ex) {
    //            }
    //        },

    _getDefaultColor: function() {
      return (this.name == "foreColor") ? "#000000" : "#ffffff";
    }
  });

});

//2.23 16:36 modified
// TODO
// 1. 仿 google, 对键盘事件的支持
KISSY.Editor.add("plugins~font", function(E) {

  var TYPE = E.PLUGIN_TYPE,

  OPTION_ITEM_HOVER_CLS = "ks-editor-option-hover",
  SELECT_TMPL = '<ul class="ks-editor-select-list">{LI}</ul>',
  OPTION_TMPL = '<li class="ks-editor-option" data-value="{VALUE}">' +
  '<span class="ks-editor-option-checkbox"></span>' +
  '<span style="{STYLE}">{KEY}</span>' +
  '</li>',
  OPTION_SELECTED = "ks-editor-option-selected",
  WEBKIT_FONT_SIZE = {
    "10px" : 1,
    "13px" : 2,
    "16px" : 3,
    "18px" : 4,
    "24px" : 5,
    "32px" : 6,
    "48px" : 7
  };

  E.addPlugin(["fontName", "fontSize"], {
    /**
     * 种类：菜单按钮
     */
    type: TYPE.TOOLBAR_SELECT,

    /**
     * 当前选中值
     */
    selectedValue: "",

    /**
     * 选择框头部
     */
    selectHead: null,

    /**
     * 关联的下拉选择列表
     */
    selectList: null,

    /**
     * 下拉框里的所有选项值
     */
    options: [],

    /**
     * 下拉列表项
     */
    items: null,

    /**
     * 选中的项
     */
    selectedItem: null,

    /**
     * 选中区域对象
     */
    range: null,

    /**
     * 初始化
     */
    init: function() {
      this.options = this.lang.options;
      this.selectHead = this.domEl.getElementsByTagName("span")[0];

      this._renderUI();
      this._bindUI();
    },

    _renderUI: function() {
      // 初始化下拉框 DOM
      this.selectList = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);
      this._renderSelectList();
      this.items = this.selectList.getElementsByTagName("li");
    },

    _bindUI: function() {
      // 注册选取事件
      this._bindPickEvent();

      Element.observe(this.domEl, "click", function() {
        // 保存 range, 以便还原
        this.range = this.editor.getSelectionRange();

        // 聚集到按钮上，隐藏光标，否则 ie 下光标会显示在层上面
        // 注：通过 blur / focus 等方式在 ie7- 下无效
        Prototype.Browser.IE && this.editor.contentDoc.selection.empty();

        // 更新下拉框中的选中项
        if(this.selectedValue) {
          this._updateSelectedOption(this.selectedValue);
        } else if(this.selectedItem) {
          $(this.selectedItem).removeClassName(OPTION_SELECTED);
          this.selectedItem = null;
        }
                
      }, this, true);
    },

    /**
     * 初始化下拉框 DOM
     */
    _renderSelectList: function() {
      var htmlCode = "", options = this.options,
      key, val;

      for(key in options) {
        val = options[key];

        htmlCode += OPTION_TMPL
        .replace("{VALUE}", val)
        .replace("{STYLE}", this._getOptionStyle(key, val))
        .replace("{KEY}", key);
      }

      // 添加到 DOM 中
      this.selectList.innerHTML = SELECT_TMPL.replace("{LI}", htmlCode);

      // 添加个性化 class
      $(this.selectList).addClassName("ks-editor-drop-menu-" + this.name);
    },

    /**
     * 绑定取色事件
     */
    _bindPickEvent: function() {
      var self = this;

      Element.observe(this.selectList, "click", function(ev) {
        var target = ev.element();

        if(target.nodeName != "LI") {
          target = Element.up(target,"li");
        }
        if(!target) return;

        self._doAction(target.getAttribute("data-value"));

        // 关闭悬浮框
        ev.stop();
        E.Menu.hideActiveDropMenu(self.editor);
      // 注：在这里阻止掉事件冒泡，自己处理对话框的关闭，是因为
      // 在 Firefox 下，当执行 doAction 后，doc 获取到 click
      // 触发 updateState 时，还获取不到当前的颜色值。
      // 这样做，对性能也有好处，这种情况下不需要更新 updateState
      });

      // ie6 下，模拟 hover
      if((navigator.userAgent.indexOf("MSIE 6.")>=0  && document.all)) {
        Element.observe(this.items, "mouseenter", function() {
          $(this).addClassName(OPTION_ITEM_HOVER_CLS);
        });
        Element.observe(this.items, "mouseleave", function() {
          $(this).removeClassName(OPTION_ITEM_HOVER_CLS);
        });
      }
    },

    /**
     * 执行操作
     */
    _doAction: function(val) {
      if(!val) return;

      this.selectedValue = val;

      // 更新当前值
      this._setOption(val);

      // 还原选区
      var range = this.range;
      if(Prototype.Browser.IE && range.select) range.select();

      // 执行命令
      this.editor.execCommand(this.name, this.selectedValue);
    },

    /**
     * 选中某一项
     */
    _setOption: function(val) {
      // 更新头部
      this._updateHeadText(this._getOptionKey(val));

      // 更新列表选中项
      this._updateSelectedOption(val);
    },

    _getOptionStyle: function(key, val) {
      if(this.name == "fontName") {
        return "font-family:" + val;
      } else { // font size
        return "font-size:" + key + "px";
      }
    },

    _getOptionKey: function(val) {
      var options = this.options, key;
            
      for(key in options) {
        if(options[key] == val) {
          return key;
        }
      }
      return null;
    },

    _updateHeadText: function(val) {
      this.selectHead.innerHTML = val;
    },

    /**
     * 更新下拉框的选中项
     */
    _updateSelectedOption: function(val) {
      var items = this.items,
      i, len = items.length, item;

      for(i = 0; i < len; ++i) {
        item = items[i];

        if(item.getAttribute("data-value") == val) {
          $(item).addClassName(OPTION_SELECTED);
          this.selectedItem = item;
        } else {
          $(item).removeClassName(OPTION_SELECTED);
        }
      }
    },

    /**
     * 更新按钮状态
     */
    updateState: function() {
      var doc = this.editor.contentDoc,
      options = this.options,
      name = this.name, key, val;

      try {
        if (doc.queryCommandEnabled(name)) {
          val = doc.queryCommandValue(name);

          if(Prototype.Browser.WebKit && name == "fontSize") {
            val = this._getWebkitFontSize(val);
          }
                    
          val && (key = this._getOptionKey(val));
          //console.log(key + " : " + val);

          if (key in options) {
            if(val != this.selectedValue) {
              this.selectedValue = val;
              this._updateHeadText(key);
            }
          } else {
            this.selectedValue = "";
            this._updateHeadText(this.lang.text);
          }
        }

      } catch(ex) {
      }
    },

    _getWebkitFontSize: function(val) {
      if(val in WEBKIT_FONT_SIZE) return WEBKIT_FONT_SIZE[val];
      return null;
    }
  });

});

// 2.23 16:56 modified
// TODO
//  1. 仿 google, 对键盘事件的支持
//  3. ie 下接管，否则光标处于某标签内，改变字体时，改变的是整段标签的字体
//  此处考虑另行设计，和现在的mindpin系统整合
KISSY.Editor.add("plugins~image", function(E) {

  var 
  isIE = Prototype.Browser.IE,
  TYPE = E.PLUGIN_TYPE,

  DIALOG_CLS = "ks-editor-image",
  BTN_OK_CLS = "ks-editor-btn-ok",
  BTN_CANCEL_CLS = "ks-editor-btn-cancel",
  TAB_CLS = "ks-editor-image-tabs",
  TAB_CONTENT_CLS = "ks-editor-image-tab-content",
  UPLOADING_CLS = "ks-editor-image-uploading",
  ACTIONS_CLS = "ks-editor-dialog-actions",
  NO_TAB_CLS = "ks-editor-image-no-tab",
  SELECTED_TAB_CLS = "ks-editor-image-tab-selected",

  TABS_TMPL = {
    local: '<li rel="local" class="' + SELECTED_TAB_CLS  + '">{tab_local}</li>',
    link: '<li rel="link">{tab_link}</li>',
    album: '<li rel="album">{tab_album}</li>'
  },

  DIALOG_TMPL = ['<form action="javascript: void(0)">',
  '<ul class="', TAB_CLS ,' ks-clearfix">',
  '</ul>',
  '<div class="', TAB_CONTENT_CLS, '" rel="local" style="display: none">',
  '<label>{label_local}</label>',
  '<input type="file" size="40" name="imgFile" unselectable="on" />',
  '{local_extraCode}',
  '</div>',
  '<div class="', TAB_CONTENT_CLS, '" rel="link">',
  '<label>{label_link}</label>',
  '<input name="imgUrl" size="50" />',
  '</div>',
  '<div class="', TAB_CONTENT_CLS, '" rel="album" style="display: none">',
  '<label>{label_album}</label>',
  '<p style="width: 300px">尚未实现...</p>', // TODO: 从相册中选择图片
  '</div>',
  '<div class="', UPLOADING_CLS, '" style="display: none">',
  '<p style="width: 300px">{uploading}</p>',
  '</div>',
  '<div class="', ACTIONS_CLS ,'">',
  '<button name="ok" class="', BTN_OK_CLS, '">{ok}</button>',
  '<span class="', BTN_CANCEL_CLS ,'">{cancel}</span>',
  '</div>',
  '</form>'].join(""),

  defaultConfig = {
    tabs: ["link"],
    upload: {
      actionUrl: "",
      filter: "png|gif|jpg|jpeg",
      filterMsg: "", // 默认为 this.lang.upload_filter
      enableXdr: false,
      connectionSwf: "http://a.tbcdn.cn/yui/2.8.0r4/build/connection/connection.swf",
      formatResponse: function(data) {
        var ret = [];
        for (var key in data) ret.push(data[key]);
        return ret;
      },
      extraCode: ""
    }
  };

  E.addPlugin("image", {
    /**
     * 种类：按钮
     */
    type: TYPE.TOOLBAR_BUTTON,

    /**
     * 配置项
     */
    config: {},

    /**
     * 关联的对话框
     */
    dialog: null,

    /**
     * 关联的表单
     */
    form: null,

    /**
     * 关联的 range 对象
     */
    range: null,

    currentTab: null,
    currentPanel: null,
    uploadingPanel: null,
    actionsBar: null,

    /**
     * 初始化函数
     */
    init: function() {
      var pluginConfig = this.editor.config.pluginsConfig[this.name] || {};
      defaultConfig.upload.filterMsg = this.lang["upload_filter"];
      this.config = Object.extend(Object.clone(defaultConfig), pluginConfig);
      this.config.upload = Object.extend(Object.clone(defaultConfig.upload), pluginConfig.upload || {});

      this._renderUI();
      this._bindUI();

      this.actionsBar = $(this.dialog).select('div.'+ACTIONS_CLS)[0];
      this.uploadingPanel = $(this.dialog).select('div.'+UPLOADING_CLS)[0];
      this.config.upload.enableXdr && this._initXdrUpload();
    },

    /**
     * 初始化对话框界面
     */
    _renderUI: function() {
      var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
      lang = this.lang;

      // 添加自定义项
      lang["local_extraCode"] = this.config.upload.extraCode;

      dialog.className += " " + DIALOG_CLS;
      dialog.innerHTML = DIALOG_TMPL.replace(/\{([^}]+)\}/g, function(match, key) {
        return (key in lang) ? lang[key] : key;
      });

      this.dialog = dialog;
      this.form = dialog.getElementsByTagName("form")[0];
      if(isIE) E.Dom.setItemUnselectable(dialog);

      this._renderTabs();
    },

    _renderTabs: function() {
      var lang = this.lang, self = this,
      ul = $(this.dialog).select('ul.'+TAB_CLS)[0],
      panels = $(this.dialog).select('div.'+TAB_CONTENT_CLS);

      // 根据配置添加 tabs
      var keys = this.config["tabs"], html = "";
      for(var k = 0, l = keys.length; k < l; k++) {
        html += TABS_TMPL[keys[k]];
      }

      // 文案
      ul.innerHTML = html.replace(/\{([^}]+)\}/g, function(match, key) {
        return (key in lang) ? lang[key] : key;
      });

      // 只有一个 tabs 时不显示
      var tabs = ul.childNodes, len = panels.length;
      if(tabs.length === 1) {
        $(this.dialog).addClassName(NO_TAB_CLS);
      }

      // 切换
      // TODO 这里事件绑定可能有问题 待测试
      switchTab(tabs[0]); // 默认选中第一个Tab
      $A(tabs).each(function(tab){
        $(tab).observe("click",function(){
          switchTab(this);
        })
      });

      function switchTab(trigger) {
        var j = 0, rel = trigger.getAttribute("rel");
        for (var i = 0; i < len; i++) {
          if(tabs[i]) $(tabs[i]).removeClassName(SELECTED_TAB_CLS);
          panels[i].style.display = "none";

          if (panels[i].getAttribute("rel") == rel) {
            j = i;
          }
        }

        // ie6 下，需更新 iframe shim
        if(navigator.userAgent.indexOf("MSIE 6.")>=0  && document.all) E.Menu._updateShimRegion(self.dialog);

        $(trigger).addClassName(SELECTED_TAB_CLS);
        panels[j].style.display = "";

        self.currentTab = trigger.getAttribute("rel");
        self.currentPanel = panels[j];
      }
    },

    /**
     * 绑定事件
     */
    _bindUI: function() {
      var self = this;

      // 显示/隐藏对话框时的事件
      Element.observe(this.domEl, "click", function() {
        // 仅在显示时更新
        if (self.dialog.style.visibility === isIE ? "hidden" : "visible") { // 事件的触发顺序不同
          self._syncUI();
        }
      });

      // 注册表单按钮点击事件
      Element.observe(this.dialog, "click", function(ev) {
        var target = ev.element(),
        currentTab = self.currentTab;

        switch(target.className) {
          case BTN_OK_CLS:
            if(currentTab === "local") {
              ev.stop();
              self._insertLocalImage();
            } else {
              self._insertWebImage();
            }
            break;
          case BTN_CANCEL_CLS: // 直接往上冒泡，关闭对话框
            break;
          default: // 点击在非按钮处，停止冒泡，保留对话框
            ev.stop();
        }
      });
    },

    /**
     * 初始化跨域上传
     */
    _initXdrUpload: function() {
      var tabs = this.config["tabs"];

      for(var i = 0, len = tabs.length; i < len; i++) {
        if(tabs[i] === "local") { // 有上传 tab 时才进行以下操作
          Connect.transport(this.config.upload.connectionSwf);
          //Connect.xdrReadyEvent.subscribe(function(){ alert("xdr ready"); });
          break;
        }
      }
    },

    _insertLocalImage: function() {
      var form = this.form,
      uploadConfig = this.config.upload,
      imgFile = form["imgFile"].value,
      actionUrl = uploadConfig.actionUrl,
      self = this, ext;

      if (imgFile && actionUrl) {

        // 检查文件类型是否正确
        if(uploadConfig.filter !== "*") {
          ext = imgFile.substring(imgFile.lastIndexOf(".") + 1).toLowerCase();
          if(uploadConfig.filter.indexOf(ext) == -1) {
            alert(uploadConfig.filterMsg);
            self.form.reset();
            return;
          }
        }

        // 显示上传滚动条
        this.uploadingPanel.style.display = "";
        this.currentPanel.style.display = "none";
        this.actionsBar.style.display = "none";
        if(navigator.userAgent.indexOf("MSIE 6.")>=0  && document.all) E.Menu._updateShimRegion(this.dialog); // ie6 下，还需更新 iframe shim

        // 发送 XHR
        Connect.setForm(form, true);
        Connect.asyncRequest("post", actionUrl, {
          upload: function(o) {
            try {
              // 标准格式如下：
              // 成功时，返回 ["0", "图片地址"]
              // 失败时，返回 ["1", "错误信息"]
              var data = uploadConfig.formatResponse(o.responseText.toJSON());
              if (data[0] == "0") {
                self._insertImage(data[1]);
                self._hideDialog();
              } else {
                self._onUploadError(data[1]);
              }
            }
            catch(ex) {
              self._onUploadError(
                Object.inspect(ex) +
                "\no = " + Object.inspect(o) +
                "\n[from upload catch code]");
            }
          },
          xdr: uploadConfig.enableXdr
        });
      } else {
        self._hideDialog();
      }
    },

    _onUploadError: function(msg) {
      alert(this.lang["upload_error"] + "\n\n" + msg);
      this._hideDialog();

    // 测试了以下错误类型：
    //   - json parse 异常，包括 actionUrl 不存在、未登录、跨域等各种因素
    //   - 服务器端返回错误信息 ["1", "error msg"]
    },

    _insertWebImage: function() {
      var imgUrl = this.form["imgUrl"].value;
      imgUrl && this._insertImage(imgUrl);
    },

    /**
     * 隐藏对话框
     */
    _hideDialog: function() {
      var activeDropMenu = this.editor.activeDropMenu;
      if(activeDropMenu && $(this.dialog).ancestors().include(activeDropMenu)) {
        E.Menu.hideActiveDropMenu(this.editor);
      }

      // 还原焦点
      this.editor.contentWin.focus();
    },

    /**
     * 更新界面上的表单值
     */
    _syncUI: function() {
      // 保存 range, 以便还原
      this.range = E.Range.saveRange(this.editor);

      // reset
      this.form.reset();

      // restore
      this.uploadingPanel.style.display = "none";
      this.currentPanel.style.display = "";
      this.actionsBar.style.display = "";
    },

    /**
     * 插入图片
     */
    _insertImage: function(url, alt) {
      url = url.strip();

      // url 为空时，不处理
      if (url.length === 0) {
        return;
      }

      var editor = this.editor,
      range = this.range;

      // 插入图片
      if (window.getSelection) { // W3C
        var img = editor.contentDoc.createElement("img");
        img.src = url;
        if(alt) img.setAttribute("alt", alt);

        range.deleteContents(); // 清空选中内容
        range.insertNode(img); // 插入图片

        // 使得连续插入图片时，添加在后面
        if(Prototype.Browser.WebKit) {
          var selection = editor.contentWin.getSelection();
          selection.addRange(range);
          selection.collapseToEnd();
        } else {
          range.setStartAfter(img);
        }

        editor.contentWin.focus(); // 显示光标

      } else if(document.selection) { // IE
        // 还原焦点
        editor.contentWin.focus();

        if("text" in range) { // TextRange
          range.select(); // 还原选区

          var html = '<img src="' + url + '"';
          alt && (html += ' "alt="' + alt + '"');
          html += '>';
          range.pasteHTML(html);

        } else { // ControlRange
          range.execCommand("insertImage", false, url);
        }
      }
    }
  });

});

//2.24 9:40 modified
/**
 * NOTES:
 *   - <input type="file" unselectable="on" /> 这一行，折腾了一下午。如果不加 unselectable, 会导致 IE 下
 *     焦点丢失（range.select() 和 contentDoc.focus() 不管用）。加上后，顺利解决。同时还自动使得 IE7- 下不可
 *     输入。
 *
 * TODO:
 *   - 跨域支持
 */
KISSY.Editor.add("plugins~indent", function(E) {

  var //Y = YAHOO.util, Dom = Y.Dom, Lang = YAHOO.lang,
  TYPE = E.PLUGIN_TYPE,
  //UA = YAHOO.env.ua,

  //        INDENT_ELEMENTS = Lang.merge(E.Dom.BLOCK_ELEMENTS, {
  //            li: 0 // 取消 li 元素的单独缩进，让 ol/ul 整体缩进
  //        }),
  //        INDENT_STEP = "40",
  //        INDENT_UNIT = "px",

  plugin = {
    /**
     * 种类：普通按钮
     */
    type: TYPE.TOOLBAR_BUTTON,

    /**
     * 响应函数
     */
    exec: function() {
      // 执行命令
      this.editor.execCommand(this.name);

      // 更新状态
      // 缩进时，可能会干掉 list 等状态
      this.editor.toolbar.updateState();
    }
  };

  // 注：ie 下，默认使用 blockquote 元素来实现缩进
  // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
  // ie 下，暂时依旧用默认的
  //    if (UA.ie) {
  //
  //        plugin.exec = function() {
  //            var range = this.editor.getSelectionRange(),
  //                parentEl, indentableAncestor;
  //
  //            if(range.parentElement) { // TextRange
  //                parentEl = range.parentElement();
  //            } else if(range.item) { // ControlRange
  //                parentEl = range.item(0);
  //            } else { // 不做任何处理
  //                return;
  //            }
  //
  //            // TODO: 和 CKEditor 一样，完全实现多区域的 iterator
  //            // 下面用 blockquote 临时解决最常见的选区的多个块的父级元素刚好是body的情景
  //            // 注意：要求 blockquote 的样式为缩进样式
  //            if(parentEl === this.editor.contentDoc.body) {
  //                this.editor.execCommand(this.name);
  //                return;
  //            }
  //            // end of 临时解决方案
  //
  //            // 获取可缩进的父元素
  //            if (isIndentableElement(parentEl)) {
  //                 indentableAncestor = parentEl;
  //            } else {
  //                 indentableAncestor = getIndentableAncestor(parentEl);
  //            }
  //
  //            // 设置 margin-left
  //            if (indentableAncestor) {
  //                var val = parseInt(indentableAncestor.style.marginLeft) >> 0;
  //                val += (this.name === "indent" ? +1 : -1) * INDENT_STEP;
  //
  //                indentableAncestor.style.marginLeft = val + INDENT_UNIT;
  //            }
  //
  //            /**
  //             * 获取可缩进的父元素
  //             */
  //            function getIndentableAncestor(el) {
  //                return Dom.getAncestorBy(el, function(elem) {
  //                    return isIndentableElement(elem);
  //                });
  //            }
  //
  //            /**
  //             * 判断是否可缩进元素
  //             */
  //            function isIndentableElement(el) {
  //                return INDENT_ELEMENTS[el.nodeName.toLowerCase()];
  //            }
  //        };
  //    }

  // 注册插件
  E.addPlugin(["indent", "outdent"], plugin);
});

//2.24 9:43 modified
/**
 * NOTES:
 * 
 *  - 要想完全接管 ie 的默认实现，需要考虑的因素很多。比如：
 *     1. range 只含 inline 元素，上面的代码已实现
 *     2. range 含多个完整的块元素，这个需要实现一个 blockIterator
 *     3. range 含块元素和另一个块元素的部分，这个得需要实现一个 html parser 来协助
 *
 */
KISSY.Editor.add("plugins~justify", function(E) {

  var //Y = YAHOO.util, Dom = Y.Dom,
  TYPE = E.PLUGIN_TYPE,
  NAMES = ["justifyLeft", "justifyCenter", "justifyRight"],
  //UA = YAHOO.env.ua,

  //JUSTIFY_ELEMENTS = E.Dom.BLOCK_ELEMENTS,

  plugin = {
    /**
     * 种类：普通按钮
     */
    type: TYPE.TOOLBAR_BUTTON,

    /**
     * 响应函数
     */
    exec: function() {
      // 执行命令
      this.editor.execCommand(this.name);

      // 更新状态
      this.editor.toolbar.updateState(NAMES);
    }
  };

  // 注：ie 下，默认使用 align 属性来实现对齐
  // 下面采用自主操作 range 的方式来实现，以保持和其它浏览器一致
  // 注：选择区域有多个块时，下面的代码有问题 [Issue 4]
  // 暂时依旧用默认的浏览器命令
  //    if (UA.ie) {
  //
  //        plugin.exec = function() {
  //            var range = this.editor.getSelectionRange(),
  //                parentEl, justifyAncestor;
  //
  //            if(range.parentElement) { // TextRange
  //                parentEl = range.parentElement();
  //            } else if(range.item) { // ControlRange
  //                parentEl = range.item(0);
  //            } else { // 不做任何处理
  //                return;
  //            }
  //
  //            // 获取可对齐的父元素
  //            if (isJustifyElement(parentEl)) {
  //                justifyAncestor = parentEl;
  //            } else {
  //                justifyAncestor = getJustifyAncestor(parentEl);
  //            }
  //
  //            // 设置 text-align
  //            if (justifyAncestor) {
  //                justifyAncestor.style.textAlign = this.name.substring(7).toLowerCase();
  //            }
  //
  //            /**
  //             * 获取可设置对齐的父元素
  //             */
  //            function getJustifyAncestor(el) {
  //                return Dom.getAncestorBy(el, function(elem) {
  //                    return isJustifyElement(elem);
  //                });
  //            }
  //
  //            /**
  //             * 判断是否可对齐元素
  //             */
  //            function isJustifyElement(el) {
  //                return JUSTIFY_ELEMENTS[el.nodeName.toLowerCase()];
  //            }
  //        };
  //    }


  // 注册插件
  E.addPlugin(NAMES, plugin);

});

//2.24 9:44 modified
KISSY.Editor.add("plugins~keystroke", function(E) {

  var 
  TYPE = E.PLUGIN_TYPE;


  E.addPlugin("keystroke", {
    /**
     * 种类
     */
    type: TYPE.FUNC,

    /**
     * 初始化
     */
    init: function() {
      var editor = this.editor;

      // [bug fix] ie7- 下，按下 Tab 键后，光标还在编辑器中闪烁，并且回车提交无效
      // if(UA.ie && UA.ie < 8)
      if (Prototype.Browser.IE && !(navigator.userAgent.indexOf("MSIE 8.")>=0)) {
        Element.observe(editor.contentDoc, "keydown", function(ev) {
          if(ev.keyCode == 9) {
            this.selection.empty();
          }
        });
      }

      // Ctrl + Enter 提交
      // TODO 宋亮：此处在 remote_form 里面有很大的问题，需要修改掉
//      var form = editor.textarea.form;
//      if (form) {
//        new YAHOO.util.KeyListener(
//          editor.contentDoc,
//          {
//            ctrl: true,
//            keys: 13
//          },
//
//          {
//            fn: function() {
//              if (!editor.sourceMode) {
//                editor.textarea.value = editor.getData();
//              }
//              form.submit();
//            }
//          }
//          ).enable();
//      }
    }

  });
});

//2.24 9:48 modified
KISSY.Editor.add("plugins~link", function(E) {

  var isIE = Prototype.Browser.IE,
  TYPE = E.PLUGIN_TYPE, Range = E.Range,
  timeStamp = new Date().getTime(),
  HREF_REG = /^\w+:\/\/.*|#.*$/,

  DIALOG_CLS = "ks-editor-link",
  NEW_LINK_CLS = "ks-editor-link-newlink-mode",
  BTN_OK_CLS = "ks-editor-btn-ok",
  BTN_CANCEL_CLS = "ks-editor-btn-cancel",
  BTN_REMOVE_CLS = "ks-editor-link-remove",
  DEFAULT_HREF = "http://",

  DIALOG_TMPL = ['<form onsubmit="return false"><ul>',
  '<li class="ks-editor-link-href"><label>{href}</label><input name="href" style="width: 220px" value="http://" type="text" /></li>',
  '<li class="ks-editor-link-target"><input name="target" id="target_"', timeStamp ,' type="checkbox" /> <label for="target_"', timeStamp ,'>{target}</label></li>',
  '<li class="ks-editor-dialog-actions">',
  '<button name="ok" class="', BTN_OK_CLS, '">{ok}</button>',
  '<span class="', BTN_CANCEL_CLS ,'">{cancel}</span>',
  '<span class="', BTN_REMOVE_CLS ,'">{remove}</span>',
  '</li>',
  '</ul></form>'].join("");

  E.addPlugin("link", {
    /**
     * 种类：按钮
     */
    type: TYPE.TOOLBAR_BUTTON,

    /**
     * 关联的对话框
     */
    dialog: null,

    /**
     * 关联的表单
     */
    form: null,

    /**
     * 关联的 range 对象
     */
    range: null,

    /**
     * 初始化函数
     */
    init: function() {
      this._renderUI();
      this._bindUI();
    },

    /**
     * 初始化对话框界面
     */
    _renderUI: function() {
      var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]),
      lang = this.lang;

      dialog.className += " " + DIALOG_CLS;
      dialog.innerHTML = DIALOG_TMPL.replace(/\{([^}]+)\}/g, function(match, key) {
        return lang[key] ? lang[key] : key;
      });

      this.dialog = dialog;
      this.form = dialog.getElementsByTagName("form")[0];

      // webkit 调用默认的 exeCommand, 需隐藏 target 设置
      Prototype.Browser.WebKit && (this.form.target.parentNode.style.display = "none");

      isIE && E.Dom.setItemUnselectable(dialog);
    },

    /**
         * 绑定事件
         */
    _bindUI: function() {
      var form = this.form, self = this;

      // 显示/隐藏对话框时的事件
      Element.observe(this.domEl, "click", function() {
        // 仅在显示时更新
        if(self.dialog.style.visibility === isIE ? "hidden" : "visible") { // 事件的触发顺序不同
          self._syncUI();
        }
      });

      // 注册表单按钮点击事件
      Element.observe(this.dialog, "click", function(ev) {
        var target = ev.element();

        switch(target.className) {
          case BTN_OK_CLS:
            self._createLink(form.href.value, form.target.checked);
            break;
          case BTN_CANCEL_CLS: // 直接往上冒泡，关闭对话框
            break;
          case BTN_REMOVE_CLS:
            self._unLink();
            break;
          default: // 点击在非按钮处，停止冒泡，保留对话框
            ev.stop();
        }
      });
    },

    /**
         * 更新界面上的表单值
         */
    _syncUI: function() {
      // 保存 range, 以便还原
      this.range = E.Range.saveRange(this.editor);

      var form = this.form, container, a;

      container = Range.getCommonAncestor(this.range);
      a = (container.nodeName == "A") ? container : Element.up(container,"A")||null; //宋亮：此处必须有\\null 才和yui的行为一致

      // 修改链接界面
      if(a) {
        form.href.value = a.href;
        form.target.checked = a.target === "_blank";
        $(form).removeClassName(NEW_LINK_CLS);

      } else { // 新建链接界面
        form.href.value = DEFAULT_HREF;
        form.target.checked = false;
        $(form).addClassName(NEW_LINK_CLS);
      }

      // 放在 setTimout 里，是 for ie
      setTimeout(function() {
        form.href.select();
      }, 50);
    },

    /**
     * 创建/修改链接
     */
    _createLink: function(href, target) {
      href = this._getValidHref(href);

      // href 为空时，移除链接
      if (href.length === 0) {
        this._unLink();
        return;
      }

      var range = this.range,
      div = document.createElement("div"),
      a, container, fragment;

      // 修改链接
      container = Range.getCommonAncestor(range);
      a = (container.nodeName == "A") ? container : Element.up(container,"A")||null; //宋亮：此处必须有\\null 才和yui的行为一致
      if (a) {
        a.href = href;
        if (target) a.setAttribute("target", "_blank");
        else a.removeAttribute("target");
        return;
      }

      // 创建链接
      a = document.createElement("a");
      a.href = href;
      if (target) a.setAttribute("target", "_blank");

      if (isIE) {
        if (range.select) range.select();
                
        if("text" in range) { // TextRange
          a.innerHTML = range.htmlText || href;
          div.innerHTML = "";
          div.appendChild(a);
          range.pasteHTML(div.innerHTML);
        } else { // ControlRange
          // TODO: ControlRange 链接的 target 实现
          this.editor.execCommand("createLink", href);
        }

      } else if(Prototype.Browser.WebKit) { // TODO: https://bugs.webkit.org/show_bug.cgi?id=16867
        this.editor.execCommand("createLink", href);

      } else { // W3C
        if(range.collapsed) {
          a.innerHTML = href;
        } else {
          fragment = range.cloneContents();
          while(fragment.firstChild) {
            a.appendChild(fragment.firstChild);
          }
        }
        range.deleteContents(); // 删除原内容
        range.insertNode(a); // 插入链接
        range.selectNode(a); // 选中链接
      }
    },

    _getValidHref: function(href) {
      href = href.strip();
      if(href && !HREF_REG.test(href)) { // 不为空 或 不符合标准模式 abcd://efg
        href = DEFAULT_HREF + href; // 添加默认前缀
      }
      return href;
    },

    /**
     * 移除链接
     */
    _unLink: function() {
      var editor = this.editor,
      range = this.range,
      selectedText = Range.getSelectedText(range),
      container = Range.getCommonAncestor(range),
      parentEl;

      // 没有选中文字时
      if (!selectedText && container.nodeType == 3) {
        parentEl = container.parentNode;
        if (parentEl.nodeName == "A") {
          parentEl.parentNode.replaceChild(container, parentEl);
        }
      } else {
        if(range.select) range.select();
        editor.execCommand("unLink", null);
      }
    }
  });

});

// TODO:
// 当选区包含链接/一部分包含链接时，生成的链接内容的调优处理。
// 目前只有 Google Docs 做了优化，其它编辑器都采用浏览器默认的处理方式。
// 先记于此，等以后优化。

//2.24 10:16 modified
/**
 * Notes:
 *  1. 在 ie 下，点击工具栏上的按钮时，会导致 iframe 编辑区域的 range 选区丢失。解决办法是：
 *     对所有元素添加 unselectable 属性。但是，对于 text input 框，为了能输入，不能有 unselectable
 *     属性。这就导致了矛盾。因此，权衡之后的解决办法是：在对话框弹出前，将 range 对象保存起来，
 *     丢失后，再通过 range.select() 选择回来。这基本上已经满足需求。
 *  2. 目前只有 CKEditor 和 TinyMCE 等完全接管命名的编辑器处理得很完美。但 1 的解决方案，目前已经
 *     够用，成本也很低。
 */
KISSY.Editor.add("plugins~resize", function(E) {

  var TYPE = E.PLUGIN_TYPE,

  TMPL = '<span class="ks-editor-resize-larger" title="{larger_title}">{larger_text}</span>'
  + '<span class="ks-editor-resize-smaller" title="{smaller_title}">{smaller_text}</span>';


  E.addPlugin("resize", {

    /**
     * 种类：状态栏插件
     */
    type: TYPE.STATUSBAR_ITEM,

    contentEl: null,

    currentHeight: 0,

    /**
     * 初始化
     */
    init: function() {
      this.contentEl = this.editor.container.childNodes[1];
      this.currentHeight = parseInt(this.contentEl.style.height);

      this.renderUI();
      this.bindUI();
    },

    renderUI: function() {
      var lang = this.lang;

      this.domEl.innerHTML = TMPL.replace(/\{([^}]+)\}/g, function(match, key) {
        return lang[key] ? lang[key] : key;
      });
    },

    bindUI: function() {
      var spans = this.domEl.getElementsByTagName("span"),
      largerEl = spans[0],
      smallerEl = spans[1],
      contentEl = this.contentEl;

      Element.observe(largerEl, "click", function() {
        this.currentHeight += 100;
        this._doResize();
      }.bind(this));

      Element.observe(smallerEl, "click", function() {

        // 不能小于 0
        if (this.currentHeight < 100) {
          this.currentHeight = 0;
        } else {
          this.currentHeight -= 100;
        }

        this._doResize();
      }.bind(this));
    },

    _doResize: function() {
      this.contentEl.style.height = this.currentHeight + "px";

      // 本来通过设置 textarea 的 height: 100% 自动就适应高度了
      // 但 ie7- 纯 css 方案有问题，因此干脆用下面这行 js 搞定
      this.editor.textarea.style.height = this.currentHeight + "px";
    }

  });

});

KISSY.Editor.add("plugins~autoresize", function(E) {
  E.addPlugin("autoresize", {
    init: function(){
      var editor = this.editor;
      editor.contentWin.frameElement.style.overflow='hidden';

      Element.observe(editor.textarea, "keydown", this.auto_resize.bind(this));
      //Element.observe(editor.textarea, "keyup", this.resize.bind(this));
      Element.observe(editor.contentDoc, "keydown", this.auto_resize.bind(this));
      //Element.observe(editor.contentDoc, "keyup", this.resize.bind(this));

    },
    auto_resize:function(){
      this.contentEl = this.editor.container.childNodes[1];
      var height = Element.getHeight(this.editor.contentDoc.body);
      
      if(height>50){
        Element.setStyle(this.contentEl,{'height':height+20+'px'});
        this.editor.contentWin.focus();
      }
    }
  })
})

//2.24 10:22 modified
/**
 * TODO:
 *   - 将全屏编辑也放入此处
 */
KISSY.Editor.add("plugins~save", function(E) {

  var TYPE = E.PLUGIN_TYPE,

  TAG_MAP = {
    b: {
      tag: "strong"
    },
    i: {
      tag: "em"
    },
    u: {
      tag: "span",
      style: "text-decoration:underline"
    },
    strike: {
      tag: "span",
      style: "text-decoration:line-through"
    }
  };


  E.addPlugin("save", {
    /**
     * 种类
     */
    type: TYPE.FUNC,

    /**
     * 初始化
     */
    init: function() {
      var editor = this.editor,
      textarea = editor.textarea,
      form = textarea.form;

      if(form) {
        Element.observe(form, "submit", function() {
          if(!editor.sourceMode) {
            //var val = editor.getData();
            // 统一样式  由后台控制
            //                        if(val && val.indexOf('<div class="ks-editor-post">') !== 0) {
            //                            val = '<div class="ks-editor-post">' + val + '</div>';
            //                        }
            textarea.value = editor.getData();
          }
        });
      }
    },

    /**
     * 过滤数据
     */
    filterData: function(data) {

      data = data.replace(/<(\/?)([^>\s]+)([^>]*)>/g, function(m, slash, tag, attr) {

        // 将 ie 的大写标签转换为小写
        tag = tag.toLowerCase();

        // 让标签语义化
        var map = TAG_MAP[tag],
        ret = tag;

        // 仅针对 <tag> 这种不含属性的标签做进一步处理
        if(map && !attr) {
          ret = map["tag"];
          if(!slash && map["style"]) {
            ret += ' style="' + map["style"] + '"';
          }
        }

        return "<" + slash + ret + attr + ">";
      });

      // 过滤 word 的垃圾数据
      if(data.indexOf("mso") > 0) {
        data = this.filterWord(data);
      }

      return data;

    // 注:
    //  1. 当 data 很大时，上面的 replace 可能会有性能问题。
    //    （更新：已经将多个 replace 合并成了一个，正常情况下，不会有性能问题）
    //
    //  2. 尽量语义化，google 的实用，但未必对
    // TODO: 进一步优化，比如 <span style="..."><span style="..."> 两个span可以合并为一个

    // FCKEditor 实现了部分语义化
    // Google Docs 采用是实用主义
    // KISSY Editor 的原则是：在保证实用的基础上，尽量语义化
    },

    /**
         * 过滤 word 粘贴过来的垃圾数据
         * Ref: CKEditor - pastefromword plugin
         */
    filterWord: function(html) {

      // Remove onmouseover and onmouseout events (from MS Word comments effect)
      html = html.replace(/<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3");
      html = html.replace(/<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3");

      // The original <Hn> tag send from Word is something like this: <Hn style="margin-top:0px;margin-bottom:0px">
      html = html.replace(/<H(\d)([^>]*)>/gi, "<h$1>");

      // Word likes to insert extra <font> tags, when using MSIE. (Wierd).
      html = html.replace(/<(H\d)><FONT[^>]*>([\s\S]*?)<\/FONT><\/\1>/gi, "<$1>$2<\/$1>");
      html = html.replace(/<(H\d)><EM>([\s\S]*?)<\/EM><\/\1>/gi, "<$1>$2<\/$1>");

      // Remove <meta xx...>
      html = html.replace(/<meta[^>]*>/ig, "");

      // Remove <link rel="xx" href="file:///...">
      html = html.replace(/<link rel="\S+" href="file:[^>]*">/ig, "");

      // Remove <!--[if gte mso 9|10]>...<![endif]-->
      html = html.replace(/<!--\[if gte mso [0-9]{1,2}\]>[\s\S]*?<!\[endif\]-->/ig, "");

      // Remove <style> ...mso...</style>
      html = html.replace(/<style>[\s\S]*?mso[\s\S]*?<\/style>/ig, "");

      // Remove lang="..."
      html = html.replace(/ lang=".+?"/ig, "");

      // Remove <o:p></o:p>
      html = html.replace(/<o:p><\/o:p>/ig, "");

      // Remove class="MsoNormal"
      html = html.replace(/ class="Mso.+?"/ig, "");

      return html;
    }

  });
});

//2.24 10:23 modified
//TODO 表情插入时的url要改成相对路径，不然导入导出时会有问题
KISSY.Editor.add("plugins~smiley", function(E) {

  var TYPE = E.PLUGIN_TYPE,

  DIALOG_CLS = "ks-editor-smiley-dialog",
  ICONS_CLS = "ks-editor-smiley-icons",
  SPRITE_CLS = "ks-editor-smiley-sprite",

  defaultConfig = {
    tabs: ["default"]
  };

  E.addPlugin("smiley", {
    /**
     * 种类：按钮
     */
    type: TYPE.TOOLBAR_BUTTON,

    /**
     * 配置项
     */
    config: {},

    /**
     * 关联的对话框
     */
    dialog: null,

    /**
     * 关联的 range 对象
     */
    range: null,

    /**
     * 初始化函数
     */
    init: function() {
      this.config = Object.extend(Object.clone(defaultConfig), this.editor.config.pluginsConfig[this.name] || {});

      this._renderUI();
      this._bindUI();
    },

    /**
     * 初始化对话框界面
     */
    _renderUI: function() {
      var dialog = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);

      dialog.className += " " + DIALOG_CLS;
      this.dialog = dialog;
      this._renderDialog();

      if(Prototype.Browser.IE) E.Dom.setItemUnselectable(dialog);
    },

    _renderDialog: function() {
      var smileyConfig = E.Smilies[this.config["tabs"][0]], // TODO: 支持多个 tab
      mode = smileyConfig["mode"];

      if(mode === "icons") this._renderIcons(smileyConfig);
      else if(mode === "sprite") this._renderSprite(smileyConfig);

    },

    _renderIcons: function(config) {
      var base = this.editor.config.base + "smilies/" + config["name"] + "/",
      fileNames = config["fileNames"],
      fileExt = "." + config["fileExt"],
      cols = config["cols"],
      htmlCode = [],
      i, len = fileNames.length, name;

      htmlCode.push('<div class="' + ICONS_CLS + '">');
      for(i = 0; i < len; i++) {
        name = fileNames[i];

        htmlCode.push(
          '<img src="' + base +  name + fileExt
          + '" alt="' + name
          + '" title="' + name
          + '" />');

        if(i % cols === cols - 1) htmlCode.push("<br />");
      }
      htmlCode.push('</div');

      this.dialog.innerHTML = htmlCode.join("");
    },

    _renderSprite: function(config) {
      var base = config.base,
      filePattern = config["filePattern"],
      fileExt = "." + config["fileExt"],
      len = filePattern.end + 1,
      step = filePattern.step,
      i, code = [];

      code.push('<div class="' + SPRITE_CLS + ' ks-clearfix" style="' + config["spriteStyle"] + '">');
      for(i = 0; i < len; i += step) {
        code.push(
          '<span data-icon="' + base +  i + fileExt
          + '" style="' + config["unitStyle"] + '"></span>');
      }
      code.push('</div');

      this.dialog.innerHTML = code.join("");
    },

    /**
     * 绑定事件
     */
    _bindUI: function() {
      var self = this;

      // range 处理
      Element.observe(this.domEl, "click", function() {
        self.range = E.Range.saveRange(self.editor);
      });

      // 注册表单按钮点击事件
      Element.observe(this.dialog, "click", function(ev) {
        var target = ev.element();

        switch(target.nodeName) {
          case "IMG":
            self._insertImage(target.src, target.getAttribute("alt"));
            break;
          case "SPAN":
            self._insertImage(target.getAttribute("data-icon"), "");
            break;
          default: // 点击在非按钮处，停止冒泡，保留对话框
            ev.stop();
        }
      });
    },

    /**
     * 插入图片
     */
    _insertImage: function(url, alt) {
      url = url.strip();

      // url 为空时，不处理
      if (url.length === 0) {
        return;
      }

      var editor = this.editor,
      range = this.range;

      // 插入图片
      if (window.getSelection) { // W3C
        var img = editor.contentDoc.createElement("img");
        img.src = url;
        img.setAttribute("alt", alt);

        range.deleteContents(); // 清空选中内容
        range.insertNode(img); // 插入图片

        // 使得连续插入图片时，添加在后面
        if(Prototype.Browser.WebKit) {
          var selection = editor.contentWin.getSelection();
          selection.addRange(range);
          selection.collapseToEnd();
        } else {
          range.setStartAfter(img);
        }

        editor.contentWin.focus(); // 显示光标

      } else if(document.selection) { // IE
        if("text" in range) { // TextRange
          range.pasteHTML('<img src="' + url + '" alt="' + alt + '" />');

        } else { // ControlRange
          editor.execCommand("insertImage", url);
        }
      }
    }
  });

});

//2.24 10:29 modified
/**
 * NOTES:
 *   - Webkit 下，不能将一个 document 内创建的 dom 节点移动到另一个 document
 *     http://www.codingforums.com/archive/index.php/t-153219.html 
 */
// TODO:
//  1. 多套表情支持
//  2. 表情的多国语言支持，包括 alt 和 title 信息
KISSY.Editor.add("plugins~source", function(E) {

  var 
  TYPE = E.PLUGIN_TYPE,

  TOOLBAR_BUTTON_SELECTED = "ks-editor-toolbar-button-selected",
  SRC_MODE_CLS = "ks-editor-src-mode";

  /**
     * 查看源代码插件
     */
  E.addPlugin("source", {
    /**
         * 种类：普通按钮
         */
    type: TYPE.TOOLBAR_BUTTON,

    /**
         * 初始化函数
         */
    init: function() {
      var editor = this.editor;

      this.iframe = editor.contentWin.frameElement;
      this.textarea = editor.textarea;

      // 将 textarea 放入 iframe 下面
      this.iframe.parentNode.appendChild(editor.textarea);

      // 添加 class
      Element.addClassName(this.domEl,"ks-editor-toolbar-source-button");
    },

    /**
         * 响应函数
         */
    exec: function() {
      var editor = this.editor,
      srcOn = editor.sourceMode;

      // 同步数据
      if(srcOn) {
        editor.contentDoc.body.innerHTML = this.textarea.value;
      } else {
        this.textarea.value = editor.getContentDocData();
      }

      // [bug fix] ie7-下，切换到源码时，iframe 的光标还可见，需隐藏掉
      if(Prototype.Browser.IE && !(navigator.userAgent.indexOf("MSIE 8.")>=0)) {
        editor.contentDoc.selection.empty();
      }

      // 切换显示
      this.textarea.style.display = srcOn ? "none" : "";
      this.iframe.style.display = srcOn ? "" : "none";

      // 更新状态
      editor.sourceMode = !srcOn;

      // 更新按钮状态
      this._updateButtonState();
    },

    /**
     * 更新按钮状态
     */
    _updateButtonState: function() {
      var editor = this.editor,
      srcOn = editor.sourceMode;

      if(srcOn) {
        Element.addClassName(editor.container, SRC_MODE_CLS);
        Element.addClassName(this.domEl, TOOLBAR_BUTTON_SELECTED);
      } else {
        Element.removeClassName(editor.container, SRC_MODE_CLS);
        Element.removeClassName(this.domEl, TOOLBAR_BUTTON_SELECTED);
      }
    }

  });

});


//2.24 10:39 modified
KISSY.Editor.add("plugins~undo", function(E) {

  var TYPE = E.PLUGIN_TYPE;

  E.addPlugin(["undo", "redo"], {
    /**
     * 种类：普通按钮
     */
    type: TYPE.TOOLBAR_BUTTON,

    /**
     * 响应函数
     */
    exec: function() {
      // TODO 接管
      this.editor.execCommand(this.name);
    }
  });

});

/**
 * TODO:
 *   - ie 下，只要有 dom 操作，undo 和 redo 就会失效。
 *     http://swik.net/qooxdoo/qooxdoo+news/Clashed+with+IE%E2%80%99s+execCommand/cj7g7
 */

//2.24 10:39 modified
KISSY.Editor.add("plugins~wordcount", function(E) {

  var
  TYPE = E.PLUGIN_TYPE,
  ALARM_CLS = "ks-editor-wordcount-alarm",

  defaultConfig = {
    total       : 50000,
    threshold   : 100
  };

  E.addPlugin("wordcount", {

    /**
     * 种类：状态栏插件
     */
    type: TYPE.STATUSBAR_ITEM,

    total: Infinity,

    remain: Infinity,

    threshold: 0,

    remainEl: null,

    /**
     * 初始化
     */
    init: function() {
      var config = Object.extend(Object.clone(defaultConfig), this.editor.config.pluginsConfig[this.name] || {});
      this.total = config["total"];
      this.threshold = config["threshold"];

      this.renderUI();
      this.bindUI();

      // 确保更新字数在内容加载完成后
      var self = this;
      setTimeout(function() {
        self.syncUI();
      }, 50);
    },

    renderUI: function() {
      this.domEl.innerHTML = this.lang["tmpl"]
      .replace("%remain%", "<em>" + this.total + "</em>");

      this.remainEl = this.domEl.getElementsByTagName("em")[0];
    },

    bindUI: function() {
      var editor = this.editor;
      //宋亮修改过这里，要检查一下是否有问题
      Element.observe(editor.textarea, "keyup", this.syncUI.bind(this));

      Element.observe(editor.contentDoc, "keyup", this.syncUI.bind(this));
      // TODO: 插入链接/表情等有问题
      Element.observe(editor.container, "click", this.syncUI.bind(this));
    },

    syncUI: function() {
      this.remain = this.total - this.editor.getData().length;
      this.remainEl.innerHTML = this.remain;

      if(this.remain <= this.threshold) {
        Element.addClassName(this.domEl, ALARM_CLS);
      } else {
        Element.removeClassName(this.domEl, ALARM_CLS);
      }
    }
  });

});

/**
 * TODO:
 *   - 考虑 GBK 编码下，一个中文字符长度为 2
 */

function init_rich_text_editor(){
  $$('textarea.rich-editor').each(function(textarea){
    if(textarea.visible()){
      textarea.setStyle({'width':'99%'});
//      new nicEditor({fullPanel : true}).panelInstance(textarea,{hasPanel : true});
      //此处的方法颇诡异呀，表单提交前先更新textarea的数据。
      //某editor不进行数据同步的问题
      var editor = KISSY.Editor(textarea,{'base':'/javascripts/kissy_editor/'});
      var form = textarea.form;
      var onsubmit = form.onsubmit;
      form.setAttribute('onsubmit', 'return false;')
      $(form).observe('submit',function(evt){textarea.value = editor.getData()});
      $(form).observe('submit',onsubmit);
    }
  })
}/* --------- /facebox/facebox.js --------- */ 
/*
 * Facebox (for jQuery)
 * version: 1.2 (05/05/2008)
 * @requires jQuery v1.2 or later
 *
 * Examples at http://famspam.com/facebox/
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2007, 2008 Chris Wanstrath [ chris@ozmm.org ]
 *
 * Usage:
 *  
 *  jQuery(document).ready(function() {
 *    jQuery('a[rel*=facebox]').facebox() 
 *  })
 *
 *  <a href="#terms" rel="facebox">Terms</a>
 *    Loads the #terms div in the box
 *
 *  <a href="terms.html" rel="facebox">Terms</a>
 *    Loads the terms.html page in the box
 *
 *  <a href="terms.png" rel="facebox">Terms</a>
 *    Loads the terms.png image in the box
 *
 *
 *  You can also use it programmatically:
 * 
 *    jQuery.facebox('some html')
 *
 *  The above will open a facebox with "some html" as the content.
 *    
 *    jQuery.facebox(function($) { 
 *      $.get('blah.html', function(data) { $.facebox(data) })
 *    })
 *
 *  The above will show a loading screen before the passed function is called,
 *  allowing for a better ajaxy experience.
 *
 *  The facebox function can also display an ajax page or image:
 *  
 *    jQuery.facebox({ ajax: 'remote.html' })
 *    jQuery.facebox({ image: 'dude.jpg' })
 *
 *  Want to close the facebox?  Trigger the 'close.facebox' document event:
 *
 *    jQuery(document).trigger('close.facebox')
 *
 *  Facebox also has a bunch of other hooks:
 *
 *    loading.facebox
 *    beforeReveal.facebox
 *    reveal.facebox (aliased as 'afterReveal.facebox')
 *    init.facebox
 *
 *  Simply bind a function to any of these hooks:
 *
 *   $(document).bind('reveal.facebox', function() { ...stuff to do after the facebox and contents are revealed... })
 *
 */
(function(prototype){

  // 据分析 data 可能是个 hash,function,string
  // 生成 Prototype.facebox() 方法
  prototype.facebox = function(data, klass) {
    var facebox = prototype.facebox
    facebox.loading()
    if (data.ajax) facebox.fill_facebox_from_ajax(data.ajax)
    else if (data.image) facebox.fill_facebox_from_image(data.image)
    else if (data.div) facebox.fill_facebox_from_href(data.div)
    else if (Object.isFunction(data)) data.call()
    else prototype.facebox.reveal(data, klass)
  }

  // 给 Prototype.facebox 增加属性
  Object.extend(prototype.facebox, {
    settings: {
      opacity      : 0.5,
      overlay      : true,
      loadingImage : '/facebox/loading.gif',
      closeImage   : '/facebox/closelabel.gif',
      imageTypes   : [ 'png', 'jpg', 'jpeg', 'gif' ],
      faceboxHtml  : '\
    <div id="facebox" class="hide"> \
      <div class="popup"> \
        <table> \
          <tbody> \
            <tr> \
              <td class="tl"/><td class="b"/><td class="tr"/> \
            </tr> \
            <tr> \
              <td class="b"/> \
              <td class="body"> \
                <div class="content"> \
                </div> \
                <div class="footer"> \
                  <a href="#" class="close"> \
                    <img src="/facebox/closelabel.gif" title="close" class="close_image" /> \
                  </a> \
                </div> \
              </td> \
              <td class="b"/> \
            </tr> \
            <tr> \
              <td class="bl"/><td class="b"/><td class="br"/> \
            </tr> \
          </tbody> \
        </table> \
      </div> \
    </div>'
    },
    // 把 驼峰 和 火车 类型 的属性 统一？
    mark_comatible: function(){
      var set = prototype.facebox.settings

      set.loadingImage = set.loading_image || set.loadingImage
      set.closeImage = set.close_image || set.closeImage
      set.imageTypes = set.image_types || set.imageTypes
      set.faceboxHtml = set.facebox_html || set.faceboxHtml
    },
    // 在页面第一次调用 facebox 时，会初始化
    init: function(settings){
      if (prototype.facebox.settings.inited){
        return
      }else{
        prototype.facebox.settings.inited = true
      }
      // 预留 事件回调
      $(document).fire('init.facebox')
      this.mark_comatible()

      var imageTypes = prototype.facebox.settings.imageTypes.join('|')
      prototype.facebox.settings.imageTypesRegexp = new RegExp('\.' + imageTypes + '$', 'i')

      if (settings) Object.extend(prototype.facebox.settings, settings)
      // facebox 是单例
      // 把 facebox 加到 body 的最后边
      new Insertion.Bottom($(document.body), prototype.facebox.settings.faceboxHtml)

      // 不知所以，先注释掉
      //    var preload = [ new Image(), new Image() ]
      //    preload[0].src = prototype.facebox.settings.closeImage
      //    preload[1].src = prototype.facebox.settings.loadingImage
      //
      //    $('#facebox').find('.b:first, .bl, .br, .tl, .tr').each(function() {
      //      preload.push(new Image())
      //      preload.slice(-1).src = $(this).css('background-image').replace(/url\((.+)\)/, '$1')
      //    })

      // 给 关闭 链接 注册事件
      $("facebox").down(".close").observe("click",function(){
        prototype.facebox.close()
      })
      // 美化 关闭按钮
      $("facebox").down(".close_image").setAttribute('src', prototype.facebox.settings.closeImage)
    },
    //------------
    skip_overlay: function(){
      (prototype.facebox.settings.overlay == false) || (prototype.facebox.settings.opacity === null)
    },
    show_overlay: function(){
      if (this.skip_overlay()) return

      if (!$('facebox_overlay')){
        new Insertion.Bottom($$("body")[0],'<div id="facebox_overlay" class="facebox_hide"></div>')
      }
      var facebox_overlay = $('facebox_overlay')
      facebox_overlay.addClassName("facebox_overlayBG")
      facebox_overlay.setStyle({
        'opacity': prototype.facebox.settings.opacity
      })
      facebox_overlay.observe("click",function(){
        prototype.facebox.close()
      })
    },
    hide_overlay: function(){
      if (this.skip_overlay()) return
      var facebox_overlay = $('facebox_overlay')
      facebox_overlay.removeClassName("facebox_overlayBG")
      facebox_overlay.addClassName("facebox_hide")
      facebox_overlay.remove()
    },
    loading: function() {
      this.init()
      if ($$('#facebox .loading').size() === 1) return
      // 初始化遮盖层？
      this.show_overlay()

      var facebox = $("facebox")
      // 把内容设为空
      facebox.down(".content").update("");
      // 增加 loading 提示
      // <div class="loading"><img src="prototype.facebox.settings.loadingImage"/></div>
      new Insertion.Bottom(facebox.down(".body"),
        Builder.node("div",{
          className: 'loading'
        },Builder.node("img",{
          src:prototype.facebox.settings.loadingImage
        })))

      var pageScroll = document.viewport.getScrollOffsets();
      facebox.setStyle({
        'top': pageScroll.top + (document.viewport.getHeight() / 10) + 'px',
        'left': document.viewport.getWidth() / 2 - (facebox.getWidth() / 2) + 'px'
      });

      $(document).observe('keydown.facebox', function(e) {
        if (e.keyCode == 27) prototype.facebox.close()
        return
      })
      // 预留 回调 方法
      $(document).fire('loading.facebox')
    },

    reveal: function(data, klass) {
      $(document).fire('beforeReveal.facebox')
      var facebox = $("facebox")
      facebox.removeClassName("hide")
      if (klass) facebox.down('.content').addClassName(klass)

      new Insertion.Bottom(facebox.down(".content"), data)
      facebox.down(".loading").remove()
      facebox.setStyle({
        'left':$(document.body).getWidth() / 2 - (facebox.down('table').getWidth() / 2)
      })
      $(document).fire('reveal.facebox')
      $(document).fire('afterReveal.facebox')
    },
    // --------------------------
    // 根据 href 的 类型，来显示不同的内容
    // href formats are:
    //   div: #id
    //   image: "/xx.png|jpg" 或者其他类型的图片
    //   ajax: anything else
    fill_facebox_from_href: function(href, klass) {
      // div
      if (href.match(/#/)) {
        var url    = window.location.href.split('#')[0]
        var target = href.replace(url,'')
        target = target.replace("#","")
        prototype.facebox.reveal($(target).clone(true), klass)

      // image
      } else if (href.match(prototype.facebox.settings.imageTypesRegexp)) {
        this.fill_facebox_from_image(href, klass)
      // ajax
      } else {
        this.fill_facebox_from_ajax(href, klass)
      }
    },

    fill_facebox_from_image: function(href, klass) {
      var image = new Image()
      image.onload = function() {
        prototype.facebox.reveal('<div class="image"><img src="' + image.src + '" /></div>', klass)
      }
      image.src = href
    },

    fill_facebox_from_ajax: function(href, klass) {
      new Ajax.Request(href,{
        method: 'get',
        onSuccess: function(transport){
          prototype.facebox.reveal(transport.responseText, klass)
        }
      })
    },
    // ---------------------------

    close: function() {
      var facebox = $("facebox")
      if(!facebox) return
      var content = facebox.down(".content")
      content.classNames().each(function(klass){
        content.removeClassName(klass)
      })
      content.addClassName("content")

      this.hide_overlay()
      var loading = facebox.down(".loading")
      if (loading) loading.remove()

      facebox.addClassName("hide")
    }
  });

  // 给 $(id) 对象 增加 facebox 方法
  Element.addMethods({
    facebox: function(ele,settings){
      prototype.facebox.init(settings)

      ele.observe("click",function(evt){
        prototype.facebox.loading()

        // support for rel="facebox.inline_popup" syntax, to add a class
        // also supports deprecated "facebox[.inline_popup]" syntax
        var klass = ele.rel.match(/facebox\[?\.(\w+)\]?/)
        if (klass) klass = klass[1]

        prototype.facebox.fill_facebox_from_href(ele.href, klass)
        evt.stop()
      })
    }
  });

  pie.load(function() {
    $$('a[rel*=facebox]').each(function(a){
      a.facebox()
    })
  })
})(Prototype);/* --------- /javascripts/views/markable_list_comments.js --------- */ 
/* 
 * ，markable list 的 直接评论显示
 */
MarkableListComments = Class.create({
  initialize : function(list,settings){
    this.list = $(list)
    this.init_settings(settings)
    this.observe_link_event()
  },
  init_settings: function(settings){
    this.markable = settings.markable
  },
  // 如果评论已经展开，则关闭，反之则展开
  observe_link_event : function(){
    this.list.observe('click',function(evt){
      var ele = evt.element();
      if(!ele.hasClassName("comments_link")){return}
      var li = ele.up("li")
      if(li.down(".newest_comments")){
        this.unfold_comments_dom(li);
      }else{
        this.fold_comments_dom(li);
      }
      evt.stop();
    }.bind(this));
  },

  // 收起评论
  unfold_comments_dom : function(li){
    li.down(".newest_comments").remove();
  },

  // 展开评论
  fold_comments_dom : function(li){
    var nc = Builder.node("div",{"class":"newest_comments quote_content"});
    nc.innerHTML="<div class='loadingbox'><div class='loading-img'></div></div>";
    new Insertion.Bottom(li,nc);
    var id = li.readAttribute("id").match(/_(.+)$/)[1];
    this.insert_comments_to_li_dom(nc,id);
  },

  // 添加评论内容到div中
  insert_comments_to_li_dom : function(nc,id){
    new Ajax.Request("/" + this.markable + "/" + id + "/comments/newest",{
      method : "get",
      onSuccess : function(response){
        nc.update(response.responseText);
        // 文本域动态展开效果
        pie.TextareaAdaptHeight.init();
      }
    })
  }

});/* --------- /javascripts/views/remark.js --------- */ 
RemarkManager = {
  reply_to:function(user_id,user_name){
    RemarkManager.cancel_reply()
    $$("form.comment_form").each(function(form){
      var div = Builder.node("div",{},[
        Builder.node("span",{
          "class":"user_name"
        },"回复 @" + user_name),
        Builder.node("a",{},"取消").observe("click",function(){
          RemarkManager.cancel_reply()
        })
        ]);
      var reply_user_div = form.down("div.reply_user")
      new Insertion.Top(reply_user_div,div)
      form.down("input[name*='[reply_to]']").value = user_id
    });
  },
  cancel_reply:function(){
    $$("form.comment_form").each(function(form){
      form.down("input[name*='[reply_to]']").value = ""
      var div = form.down("div.reply_user")
      div.update("")
    });
  },
  form_reset:function(){
    $$("form.comment_form").each(function(form){
      form.reset();
      form.down("textarea").fire("dom:value_change")
    });
  },

  form_submit_failure : function(form){
    text = form.down("textarea");
    if(text.value.blank()){
      this.show_effect(text);
      return false;
    }
    return true;
  },
  
  show_effect : function(text){
    out_div = text.up("div");
    out_div.setStyle({
      position:"relative"
    });
    var width = (text.getWidth()-3)+"px";
    var height = (text.getHeight()-3)+"px";
    out_div.insert("<div id='null_content_tip' style='position:absolute;background-color:#FFE2AF;width:"+width+";height:"+height+";top:"+(out_div.down("label").getHeight()+2)+"px;left:2px;'></div>");
    Effect.Pulsate($('null_content_tip'),{
      afterFinish : function(o){
        $('null_content_tip').remove();
      }
    });
  }

};/* --------- /javascripts/views/show_announcement.js --------- */ 
// 显示最新公告

ShowAnnouncement = Class.create({
  initialize : function(){
    var is_show = this.read_cookie("show_announcement");
    if(is_show == 'true'){
      this.show_announcement_box()
    }
  },

  show_announcement_box : function(){
    new pie.NoticeTip({
      width:'auto',
      height:'auto',
      position:'rightBottom',
      ajax:'/announcements/last',
      animate:{
        effect:'appear',
        params:{
          duration: 2.0
        }
      }
    });
  },

  read_cookie : function(name){
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
});

pie.load(function(){
  if(window.location.pathname != "/"){
    new ShowAnnouncement()
  }
});




/* --------- /javascripts/pie/notice_tip.js --------- */ 
/* 
 * 一个javascript组件，用于显示系统公告，或者其他提示信息
 */

pie.NoticeTip = Class.create({
  initialize : function(options){
    this.position = options.position || 'rightBottom';
    this.animate = options.animate;
    this.ajax = options.ajax;
    this.get_response_content(this.ajax);
    this.tip_width = options.width || 'auto';
    this.tip_height = options.height || 'auto';
  },

  // 发起ajax请求，得到相应内容
  get_response_content : function(){
    new Ajax.Request(this.ajax,{
      method : 'get',
      onSuccess : function(response){
        this.create_tip(response.responseText);
      }.bind(this)
    })
  },

  // 创建弹出框
  create_tip : function(content){
    this.tip = Builder.node("div",{
      'class':"tip_box",
      style:"left:0px;top:0px;display:none"
    },
    [Builder.node('div',{
      "class":"tip_container"
    },[
    [ Builder.node("span",{
      "class" : "close_button"
    },['关闭']).observe("click", function(){
      Effect.Fade(this.tip);
    }.bind(this)),
      Builder.node("div",{
        "class":"tip_content"
      })
      ]
      ])
    ]);
    this.tip.down(".tip_content").innerHTML = content;
    var width = document.viewport.getWidth();
    var height = document.viewport.getHeight();
    $(document.body).insert(this.tip);
    this.set_tip_style(width,height);
    this.show_tip_with_effect();
  },

  show_tip_with_effect : function(){
    var effect = this.animate.effect;
    Effect.Methods[effect](this.tip,this.animate.params);
  },

  // 设置tip的样式
  set_tip_style : function(width,height){
    
    var tip_container_width = "",tip_container_height = "";
    if(this.tip_width!="auto"){tip_container_width = this.tip_width+"px";}
    if(this.tip_height!="auto"){tip_container_height = this.tip_height+"px"; }
    this.tip.down("div.tip_container").setStyle({
      width : tip_container_width,
      height : tip_container_height
    })
    
    var position_point = this.get_position_point(width,height);
    this.tip.setStyle({
      top : position_point.top,
      left : position_point.left
    })
  },

  // 设置tip的位置
  get_position_point : function(width,height){
    
    var width_diff = width-this.tip.getWidth();
    var height_diff = height-this.tip.getHeight();
    var position_point = {
      left:"0px",
      top:"0px"
    }
    switch(this.position){
      case "leftTop":
        position_point.top = "0px";
        position_point.left = "0px";
        break;
      case "rightTop":
        position_point.top = "0px";
        position_point.left = width_diff+"px";
        break;
      case "leftBottom":
        position_point.top = height_diff+"px";
        position_point.left = "0px";
        break;
      case "rightBottom":
        position_point.top = height_diff+"px";
        position_point.left = width_diff+"px";
        break;
    }
    return position_point;
  }

});

/* --------- /javascripts/pie/pie_dragdrop.js --------- */ 
/** pielib Controller version 0.1
 *  (c) 2006-2008 MindPin.com - songliang
 *  
 *  require:
 *  scriptaculous 1.8.1 with prototype.js ver 1.6.0.1
 *  
 *  working on //W3C//DTD XHTML 1.0 Strict//EN"
 *
 *  For details, to the web site: http://www.mindpin.com/
 *--------------------------------------------------------------------------*/

pie.drag={};

/**
 * pie.drag.Base
 * 
 * 	包装了几乎所有与鼠标拖拽相关的方法（移动元素，改变元素大小，鼠标动作）之中涉及到
 * 的基本代码，以便于实现具体方法时减少编码量和出错可能。这个类已经封装了事件初始化，事
 * 件销毁，移动过程中鼠标信息获取等一些必要的操作，使用时只需要用Class.create()继承这
 * 个基类，填充几个“接口方法”之后就可以实现自定义的各种功能，具体说明如下：
 * </p>
 *  
 * 	创建自定义类：
 *	MyDraggable = Class.create(pie.drag.Base,{
 * 		attribute:"...",
 * 		...
 * 		onInit:function(){...},
 * 		beforeStart:function(){...},
 * 		onDragging:function(){...},
 * 		beforeFinish:function(){...}
 *	});
 *	
 *	使用自定义类：
 *  new MyDraggable(element,config={...}) element是被拖拽的目标对象，config中可任意传递参数
 * 
 *  “接口方法”说明：
 *  
 *	onInit:
 *	初始化时initialize()方法中间执行的方法，此处主要可以进行一些参数的设置
 *	此处可以通过this._config句柄来获取传入的config对象
 *
 *	beforeStart:
 *  触发拖拽过程时执行的方法，用来进行一些初始数据的获得，如某些DOM元素这一瞬间的状态等
 *  此处可通过this.cX,this.cY获得鼠标的初始坐标
 *  
 *  onDragging:
 *  拖拽过程中不断执行的方法，一般用来产生移动、缩放、轨迹绘制等特殊效果
 *  此处可通过this.cX，this.cY获得鼠标的初始坐标
 *  可以通过this.newX，this.newY获得鼠标的当前坐标
 *  可以通过this.distanceX，this.distanceY获得鼠标的位移量
 *  
 *  beforeFinish：
 *  拖拽过程结束时执行的方法，可用来执行一些后续处理的函数
 *  
 *  另外随时可以通过this.ondrag来获取拖放是否正在进行
 *  
 *  具体例子可以参考pie.drag.Simple
 */
pie.drag.Base=Class.create({
	initialize:function(el,config){
		this.el=$(el);
		this._config=config;

		this.onInit();
		
		//Handle
		this.mdh=this.mouseDownHandle.bindAsEventListener(this);
		this.mmh=this.mouseMoveHandle.bindAsEventListener(this);
		this.muh=this.mouseUpHandle.bindAsEventListener(this);

		//bind Handle
		this.el.observe("mousedown",this.mdh);
	},
	mouseDownHandle:function(evt){
		this.evtel=evt.element();
		if(this.isReady()==false) return false;
		evt.stop();
		if(!evt.isLeftClick()) return false;
		
		this.ondrag=false;
		
		//事件绑定
		document.observe("mousemove",this.mmh);
		document.observe("mouseup",this.muh);
		
		//初始坐标
	    this.cX = evt.pointerX();
	    this.cY = evt.pointerY();
		
		this.newX = this.cX;
		this.newY = this.cY;

		this.beforeStart();
		
		this.moveTimer = setInterval(function(){
			this.moveListener();
		}.bind(this), 10);
	},
	mouseMoveHandle:function(evt){
	    evt.stop();
		if (this.el == null) return false;
		this.ondrag = true;
		this.newX = evt.pointerX();
	    this.newY = evt.pointerY();
	},
	moveListener:function(){
    	if(!this.ondrag) return false;
		this.distanceX = this.newX - this.cX;
	    this.distanceY = this.newY - this.cY;

		this.onDragging();
	},
	mouseUpHandle:function(evt){
		if (this.ondrag) {
			this.ondrag = false
		};
		
		if(!this.el) return false;
		
		//停止绑定
		document.stopObserving("mousemove", this.mmh);
		document.stopObserving("mouseup", this.muh);

		this.beforeFinish();
		
		if(this.moveTimer) {
			clearInterval(this.moveTimer);
			this.moveTimer = null;
		}
	},
	onInit:function(){},
	isReady:function(){return true},
	beforeStart:function(){},
	onDragging:function(){},
	beforeFinish:function(){}
});

pie.drag.Simple=Class.create(pie.drag.Base,{
	onInit:function(){},
	beforeStart:function(){
		this.ileft = parseInt(this.el.style.left||0);
		this.itop = parseInt(this.el.style.top||0);
	},
	onDragging:function($super){
		var newLeft = this.ileft + this.distanceX;
        var newTop = this.itop + this.distanceY;
		this.el.setStyle({
			"top":newTop+"px",
			"left":newLeft+"px"
		})
	},
	beforeFinish:function(){}
});

pie.drag.Page=Class.create(pie.drag.Base,{
	onInit:function(){
		this.beforeDrag=this._config.beforeDrag||function(){};
	},
	isReady:function(){
		if(this.evtel.tagName=="INPUT"||this.evtel.tagName=="TEXTAREA") return false;
	},
	beforeStart: function(){
		this.beforeDrag();
		this.parent=this.el.parentNode;
		this.scrollX = this.parent.scrollLeft;
		this.scrollY = this.parent.scrollTop;
	},
	onDragging:function(){
		var newLeft = this.scrollX - this.distanceX;
    var newTop = this.scrollY - this.distanceY;
		this.parent.scrollLeft = newLeft;
		this.parent.scrollTop = newTop;
		this.xoff = newLeft;
		this.yoff = newTop;
	}
});/* --------- /javascripts/pie/work_board.js --------- */ 
/* 
 * pie.WorkBoard.show({
 *   width:300,
 *   height:300
 * })
 */

pie.WorkBoard = {
  template: '<div id="work_board" style="display:none;">\
               <div class="wb_wrap">\
                 <div class="wb_title">\
                   <a class="close">关闭</a>\
                 </div>\
                 <div class="wb_body">\
                    <a class="refurbish">刷新</a>\
                    <div class="wb_content"></div>\
                 </div>\
               </div>\
             </div>\
             ',
  settings: {
    width:300,
    height:300
  },
  show: function(settings){
    Object.extend(this.settings,settings)
    this._init()
    this._loading()

    this.work_board.setStyle({
      width: this.settings.width + "px",
      height: this.settings.height + "px"
    })

    var work_board = this.work_board
    var pageScroll = document.viewport.getScrollOffsets();
    work_board.setStyle({
      'top': pageScroll.top + (document.viewport.getHeight() / 10) + 'px',
      'left': document.viewport.getWidth() / 2 - (work_board.getWidth() / 2) + 'px'
    });
    this.work_board.appear({ 
      duration:0.5
    });
  },
  close:function(){
    this.work_board.fade({ 
      duration:0.5
    });
  },
  // 清除 work_board 中 除模板以外的内容
  _loading: function(){
    this.work_board.fire("dom:refurbish")
  },
  // 获得 work_board 元素
  _init: function(){
    if(this.work_board){
      return
    }
    new Insertion.Bottom($(document.body),this.template)
    this.work_board = $("work_board")
    // 使 标题可拖动
    new pie.WorkBoard.drag(this.work_board.down(".wb_title"))
    // 注册关闭事件
    this.work_board.down(".wb_title a.close").observe("click",function(){
      this.close()
    }.bind(this))
    // 刷新事件
    this.work_board.observe("dom:refurbish",function(){
      this.work_board.down(".wb_content").update("正在载入")
      new Ajax.Request("/users/" + this.settings.user_id +"/work_board", {
        method: 'get',
        onSuccess: function(transport) {
          this.work_board.down(".wb_content").update(transport.responseText)
        }.bind(this)
      });
    }.bind(this))
    this.work_board.down(".wb_body a.refurbish").observe("click",function(){
      this.work_board.fire("dom:refurbish")
    }.bind(this))
  }
}

pie.WorkBoard.drag = Class.create(pie.drag.Base,{
  onInit:function(){},
  beforeStart:function(){
    var work_board = this.el.up("#work_board")

    this.ileft = parseInt(work_board.getStyle("left")||0);
    this.itop = parseInt(work_board.getStyle("top")||0);
  },
  onDragging:function($super){
    var work_board = this.el.up("#work_board")
    var width = parseInt(work_board.getStyle("width"));
    var height = parseInt(work_board.getStyle("height"));

    var newLeft = this.ileft + this.distanceX;
    var newTop = this.itop + this.distanceY;

    var pageScroll = document.viewport.getScrollOffsets();

    var mintop = pageScroll.top
    var maxtop = pageScroll.top + document.viewport.getHeight() - height
    var minleft = pageScroll.left
    var maxleft = pageScroll.left + document.viewport.getWidth() - width

    if(newLeft < minleft){
      newLeft = minleft
    }
    if(newLeft > maxleft){
      newLeft = maxleft
    }

    if(newTop < mintop){
      newTop = mintop
    }
    if(newTop > maxtop){
      newTop = maxtop
    }

    work_board.setStyle({
      "top":newTop+"px",
      "left":newLeft+"px"
    })
  },
  beforeFinish:function(){}
});/* --------- /javascripts/pie/textarea_adapt_height.js --------- */ 
(function(){
  pie.TextareaAdaptHeight = function(a){
    var line_height = 18
    // 获得行数
    var lines_count = 1

    var match = a.readAttribute("rel").match(/adapt\[:(.*)\]/)
    if(match){
      lines_count = match[1]
    }

    // 根据行数获得高度
    var height = lines_count * line_height
    a.defaultHeight = height

    // 初始化 textarea 样式
    a.setStyle({
      overflow: "hidden",
      fontFamily: "Tahoma,宋体",
      borderStyle: "solid",
      borderWidth: "1px",
      wordWrap: "break-word",
      fontSize: "12px",
      lineHeight: line_height + "px",
      height: height + "px"
    })

    // 增加一个 value_change 事件
    a.observe("dom:value_change",function(){

      if(!a.virtual_textarea){
        a.virtual_textarea = get_virtual_textarea()
      }

      if(a.virtual_textarea.target!=a){
        set_virtual_textarea_by(a)
        a.virtual_textarea.target=a
      }
      a.virtual_textarea.value=a.value;
      snapHeight=Math.max(a.virtual_textarea.scrollHeight,a.defaultHeight);
      a.setStyle({
        height: snapHeight + "px"
      })
    })

    // 获取焦点 注册 时间监听器
    $(a).observe("focus",function(){
      if(pie.TextareaAdaptHeight.Executer){
        pie.TextareaAdaptHeight.Executer.stop();
      }
      pie.TextareaAdaptHeight.Executer = new PeriodicalExecuter(function(){
        a.fire("dom:value_change")
      },0.01);
    });

    // 失去焦点，销毁监听器
    $(a).observe("blur",function(){
      if(pie.TextareaAdaptHeight.Executer){
        pie.TextareaAdaptHeight.Executer.stop();
      }
    });
    // 清除 firefox 的 历史记录
    a.value = ""
  }

  function get_virtual_textarea(){
    var textarea = $("virtual_textarea")
    if(!textarea){
      textarea = Builder.node("textarea",{
        id:"virtual_textarea",
        style:"position:absolute;left:-1000px;top:-1000px;"
      })
      new Insertion.Bottom($(document.body),textarea)
    }
    return textarea
  }

  function set_virtual_textarea_by(a){
    var textarea = a.virtual_textarea
    textarea.setStyle({
      height:"0px",
      overflow:"hidden"
    })

    textarea.setStyle({
      fontFamily:a.getStyle("fontFamily")
    })
    textarea.setStyle({
      borderStyle:a.getStyle("borderStyle")
    })
    textarea.setStyle({
      borderWidth:a.getStyle("borderWidth")
    })
    textarea.setStyle({
      wordWrap:a.getStyle("wordWrap")
    })
    textarea.setStyle({
      fontSize:a.getStyle("fontSize")
    })
    textarea.setStyle({
      lineHeight:a.getStyle("lineHeight")
    })
  }
})();
pie.TextareaAdaptHeight.init = function(){
  $$('textarea[rel*=adapt]').each(function(a){
    if(a.hasClassName("adapt-packed")) return
    a.addClassName("adapt-packed")
    pie.TextareaAdaptHeight(a)
  })
};
pie.load(function() {
  pie.TextareaAdaptHeight.init()
});/* --------- /javascripts/lightview/js/lightview.js --------- */ 
//  Lightview 2.5.2 - 06-10-2009
//  Copyright (c) 2008-2009 Nick Stakenburg (http://www.nickstakenburg.com)
//
//  Licensed under a Creative Commons Attribution-Noncommercial-No Derivative Works 3.0 Unported License
//  http://creativecommons.org/licenses/by-nc-nd/3.0/

//  More information on this project:
//  http://www.nickstakenburg.com/projects/lightview/

var Lightview = {
  Version: '2.5.2',

  // Configuration
  options: {
    backgroundColor: '#ffffff',                            // Background color of the view
    border: 12,                                            // Size of the border
    buttons: {
      opacity: {                                           // Opacity of inner buttons
        disabled: 0.4,
        normal: 0.75,
        hover: 1
      },
      side: { display: true },                             // Toggle side buttons
      innerPreviousNext: { display: true },                // Toggle the inner previous and next button
      slideshow: { display: true },                        // Toggle slideshow button
      topclose: { side: 'right' }                          // 'right' or 'left'                    
    },
    controller: {                                          // The controller is used on sets
      backgroundColor: '#4d4d4d',
      border: 6,
      buttons: {
        innerPreviousNext: true,
        side: false
      },
      margin: 18,
      opacity: 0.7,
      radius: 6,
      setNumberTemplate: '#{position} of #{total}'
    },
    cyclic: false,                                         // Makes galleries cyclic, no end/begin
    images: '/javascripts/lightview/images/lightview/',    // The directory of the images, from this file
    // 2010年7月15日 宋亮 修改引用路径
    imgNumberTemplate: 'Image #{position} of #{total}',    // Want a different language? change it here
    keyboard: true,                                        // Toggle keyboard buttons
    menubarPadding: 6,                                     // Space between menubar and content in px
    overlay: {                                             // Overlay
      background: '#000',                                  // Background color, Mac Firefox & Mac Safari use overlay.png
      close: true,
      opacity: 0.85,
      display: true
    },
    preloadHover: false,                                   // Preload images on mouseover
    radius: 12,                                            // Corner radius of the border
    removeTitles: true,                                    // Set to false if you want to keep title attributes intact
    resizeDuration: 0.05,                                  // The duration of the resize effect in seconds
    slideshowDelay: 5,                                     // Delay in seconds before showing the next slide
    titleSplit: '::',                                      // The characters you want to split title with
    transition: function(pos) {                            // Or your own transition
      return ((pos/=0.5) < 1 ? 0.5 * Math.pow(pos, 4) :
        -0.5 * ((pos-=2) * Math.pow(pos,3) - 2));
    },
    viewport: true,                                        // Stay within the viewport, true is recommended
    zIndex: 5000,                                          // zIndex of #lightview, #overlay is this -1

    startDimensions: {                                     // Dimensions Lightview starts at
      width: 100,
      height: 100
    },
    closeDimensions: {                                     // Modify if you've changed the close button images
      large: { width: 77, height: 22 },
      small: { width: 25, height: 22 }
    },
    sideDimensions: {                                      // Modify if you've changed the side button images
      width: 16,
      height: 22
    },

    defaultOptions: {                                      // Default options for each type of view
      image: {
        menubar: 'bottom',
        closeButton: 'large'
      },
      gallery: {
        menubar: 'bottom',
        closeButton: 'large'
      },
      ajax:   {
        width: 400,
        height: 300,
        menubar: 'top',
        closeButton: 'small',
        overflow: 'auto'
      },
      iframe: {
        width: 400,
        height: 300,
        menubar: 'top',
        scrolling: true,
        closeButton: 'small'
      },
      inline: {
        width: 400,
        height: 300,
        menubar: 'top',
        closeButton: 'small',
        overflow: 'auto'
      },
      flash: {
        width: 400,
        height: 300,
        menubar: 'bottom',
        closeButton: 'large'
      },
      quicktime: {
        width: 480,
        height: 220,
        autoplay: true,
        controls: true,
        closeButton: 'large'
      }
    }
  },
  classids: {
    quicktime: 'clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B',
    flash: 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'
  },
  codebases: {
    quicktime: 'http://www.apple.com/qtactivex/qtplugin.cab#version=7,5,5,0',
    flash: 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,115,0'
  },
  errors: {
    requiresPlugin: "<div class='message'> The content your are attempting to view requires the <span class='type'>#{type}</span> plugin.</div><div class='pluginspage'><p>Please download and install the required plugin from:</p><a href='#{pluginspage}' target='_blank'>#{pluginspage}</a></div>"
  },
  mimetypes: {
    quicktime: 'video/quicktime',
    flash: 'application/x-shockwave-flash'
  },
  pluginspages: {
    quicktime: 'http://www.apple.com/quicktime/download',
    flash: 'http://www.adobe.com/go/getflashplayer'
  },
  // used with auto detection
  typeExtensions: {
    flash: 'swf',
    image: 'bmp gif jpeg jpg png',
    iframe: 'asp aspx cgi cfm htm html jsp php pl php3 php4 php5 phtml rb rhtml shtml txt',
    quicktime: 'avi mov mpg mpeg movie'
  }
};

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(n(){B l=!!19.aq("3y").5T,2G=1m.1Z.2F&&(n(a){B b=u 4A("9b ([\\\\d.]+)").al(a);J b?4J(b[1]):-1})(3b.4T)<7,2C=(1m.1Z.5a&&!19.45),32=3b.4T.24("6r")>-1&&4J(3b.4T.3T(/6r[\\/\\s](\\d+)/)[1])<3,4k=!!3b.4T.3T(/95/i)&&(2C||32);12.1l(Y,{aw:"1.6.1",bn:"1.8.2",R:{1a:"5u",3q:"V"},5x:n(a){m((bo 20[a]=="8M")||(9.5z(20[a].9m)<9.5z(9["8n"+a]))){9O("Y a9 "+a+" >= "+9["8n"+a]);}},5z:n(a){B v=a.2Z(/8w.*|\\./g,"");v=4w(v+"0".bq(4-v.1p));J a.24("8w")>-1?v-1:v},5G:n(){9.5x("1m");m(!!20.11&&!20.6E){9.5x("6E")}m(/^(9L?:\\/\\/|\\/)/.58(9.y.1e)){9.1e=9.y.1e}W{B b=/V(?:-[\\w\\d.]+)?\\.at(.*)/;9.1e=(($$("av[1t]").6N(n(s){J s.1t.3T(b)})||{}).1t||"").2Z(b,"")+9.y.1e}m(!l){m(19.5K>=8&&!19.6Q.3k){19.6Q.bs("3k","bA:bN-bQ-c2:c3","#5R#79")}W{19.1f("5Y:3P",n(){B a=19.9r();a.9B="3k\\\\:*{9I:3Q(#5R#79)}"})}}},60:n(){9.1z=9.y.1z;9.Q=(9.1z>9.y.Q)?9.1z:9.y.Q;9.1I=9.y.1I;9.1R=9.y.1R;9.4E()}});12.1l(Y,{7p:14,2a:n(){B a=3Z.aJ;a.61++;m(a.61==9.7p){$(19.2e).62("V:3P")}}});Y.2a.61=0;12.1l(Y,{4E:n(){9.V=u I("O",{2S:"V"});B d,3G,4N=1P(9.1R);m(2C){9.V.13=n(){9.F("1h:-3C;1b:-3C;1k:1Q;");J 9};9.V.18=n(){9.F("1k:1u");J 9};9.V.1u=n(){J(9.1H("1k")=="1u"&&4J(9.1H("1b").2Z("H",""))>-7K)}}$(19.2e).M(9.2B=u I("O",{2S:"7V"}).F({2Q:9.y.2Q-1,1a:(!(32||2G))?"4r":"35",29:4k?"3Q("+9.1e+"2B.1s) 1b 1h 3A":9.y.2B.29}).1n(4k?1:9.y.2B.1F).13()).M(9.V.F({2Q:9.y.2Q,1b:"-3C",1h:"-3C"}).1n(0).M(9.84=u I("O",{N:"bJ"}).M(9.4b=u I("3z",{N:"c1"}).M(9.8G=u I("1B",{N:"c7"}).F(3G=12.1l({1M:-1*9.1R.E+"H"},4N)).M(9.4Q=u I("O",{N:"6n"}).F(12.1l({1M:9.1R.E+"H"},4N)).M(u I("O",{N:"1D"})))).M(9.8E=u I("1B",{N:"9w"}).F(12.1l({8z:-1*9.1R.E+"H"},4N)).M(9.4O=u I("O",{N:"6n"}).F(3G).M(u I("O",{N:"1D"}))))).M(9.8x=u I("O",{N:"8v"}).M(9.4F=u I("O",{N:"6n 9Q"}).M(9.9S=u I("O",{N:"1D"})))).M(u I("3z",{N:"a8"}).M(u I("1B",{N:"8u ac"}).M(d=u I("O",{N:"ai"}).F({G:9.Q+"H"}).M(u I("3z",{N:"8r ar"}).M(u I("1B",{N:"8i"}).M(u I("O",{N:"2t"})).M(u I("O",{N:"38"}).F({1h:9.Q+"H"})))).M(u I("O",{N:"8h"})).M(u I("3z",{N:"8r az"}).M(u I("1B",{N:"8i"}).F("1N-1b: "+(-1*9.Q)+"H").M(u I("O",{N:"2t"})).M(u I("O",{N:"38"}).F("1h: "+(-1*9.Q)+"H")))))).M(9.4V=u I("1B",{N:"aP"}).F("G: "+(ba-9.Q)+"H").M(u I("O",{N:"bd"}).M(u I("O",{N:"8d"}).F("1N-1b: "+9.Q+"H").M(9.30=u I("O",{N:"bp"}).1n(0).F("3p: 0 "+9.Q+"H").M(9.85=u I("O",{N:"bz 38"})).M(9.1o=u I("O",{N:"bH 80"}).M(9.2c=u I("O",{N:"1D 7X"}).F(1P(9.y.1I.3e)).F({29:9.y.10}).1n(9.y.1A.1F.3f)).M(9.2P=u I("3z",{N:"8L"}).M(9.6b=u I("1B",{N:"94"}).M(9.1C=u I("O",{N:"97"})).M(9.2m=u I("O",{N:"9i"}))).M(9.6a=u I("O",{N:"9n"}).M(9.48=u I("1B",{N:"9u"}).M(u I("O"))).M(9.4Y=u I("1B",{N:"9x"}).M(9.9y=u I("O",{N:"1D"}).1n(9.y.1A.1F.3f).F({10:9.y.10}).1G(9.1e+"9D.1s",{10:9.y.10})).M(9.9E=u I("O",{N:"1D"}).1n(9.y.1A.1F.3f).F({10:9.y.10}).1G(9.1e+"9F.1s",{10:9.y.10}))).M(9.28=u I("1B",{N:"9K"}).M(9.34=u I("O",{N:"1D"}).1n(9.y.1A.1F.3f).F({10:9.y.10}).1G(9.1e+"7I.1s",{10:9.y.10})))))).M(9.7F=u I("O",{N:"9P "}))))).M(9.3v=u I("O",{N:"7E"}).M(9.9Y=u I("O",{N:"1D"}).F("29: 3Q("+9.1e+"3v.64) 1b 1h 4H-3A")))).M(u I("1B",{N:"8u aa"}).M(d.ab(26))).M(9.1V=u I("1B",{N:"aj"}).13().F("1N-1b: "+9.Q+"H; 29: 3Q("+9.1e+"ak.64) 1b 1h 3A"))))).M(u I("O",{2S:"41"}).13());B f=u 2f();f.1w=n(){f.1w=1m.2z;9.1R={E:f.E,G:f.G};B a=1P(9.1R),3G;9.4b.F({1X:0-(f.G/2).2o()+"H",G:f.G+"H"});9.8G.F(3G=12.1l({1M:-1*9.1R.E+"H"},a));9.4Q.F(12.1l({1M:a.E},a));9.8E.F(12.1l({8z:-1*9.1R.E+"H"},a));9.4O.F(3G);9.2a()}.U(9);f.1t=9.1e+"2u.1s";$w("30 1C 2m 48").3W(n(e){9[e].F({10:9.y.10})}.U(9));B g=9.84.2p(".2t");$w("7o 7n bl br").1d(n(a,i){m(9.1z>0){9.5Z(g[i],a)}W{g[i].M(u I("O",{N:"38"}))}g[i].F({E:9.Q+"H",G:9.Q+"H"}).7g("2t"+a.1K());9.2a()}.U(9));9.V.2p(".8h",".38",".8d").3F("F",{10:9.y.10});B S={};$w("2u 1c 2k").1d(n(s){9[s+"3i"].1J=s;B b=9.1e+s+".1s";m(s=="2k"){S[s]=u 2f();S[s].1w=n(){S[s].1w=1m.2z;9.1I[s]={E:S[s].E,G:S[s].G};B a=9.y.1A.2k.1J,27=12.1l({"5Q":a,1X:9.1I[s].G+"H"},1P(9.1I[s]));27["3p"+a.1K()]=9.Q+"H";9[s+"3i"].F(27);9.8x.F({G:S[s].G+"H",1b:-1*9.1I[s].G+"H"});9[s+"3i"].5N().1G(b).F(1P(9.1I[s]));9.2a()}.U(9);S[s].1t=9.1e+s+".1s"}W{9[s+"3i"].1G(b)}},9);B C={};$w("3e 5M").1d(n(a){C[a]=u 2f();C[a].1w=n(){C[a].1w=1m.2z;9.1I[a]={E:C[a].E,G:C[a].G};9.2a()}.U(9);C[a].1t=9.1e+"6T"+a+".1s"},9);B L=u 2f();L.1w=n(){L.1w=1m.2z;9.3v.F({E:L.E+"H",G:L.G+"H",1X:-0.5*L.G+0.5*9.Q+"H",1M:-0.5*L.E+"H"});9.2a()}.U(9);L.1t=9.1e+"3v.64";B h=u 2f();h.1w=n(a){h.1w=1m.2z;B b={E:h.E+"H",G:h.G+"H"};9.28.F(b);9.34.F(b);9.2a()}.U(9);h.1t=9.1e+"6P.1s";$w("2u 1c").1d(n(s){B S=s.1K(),i=u 2f();i.1w=n(){i.1w=1m.2z;9["3r"+S+"3s"].F({E:i.E+"H",G:i.G+"H"});9.2a()}.U(9);i.1t=9.1e+"9o"+s+".1s";9["3r"+S+"3s"].1V=s},9);$w("28 4Y 48").1d(n(c){9[c].13=9[c].13.1v(n(a,b){9.27.1a="35";a(b);J 9});9[c].18=9[c].18.1v(n(a,b){9.27.1a="9v";a(b);J 9})},9);9.V.2p("*").3F("F",{2Q:9.y.2Q+1});9.V.13();9.2a()},6K:n(){11.2J.2I("V").3W(n(e){e.6F()});9.1S=1E;m(9.q.1O()){9.6w=9.6q;m(9.X&&!9.X.1u()){9.X.F("1k:1Q").18();9.3g.1n(0)}}W{9.6w=1E;9.X.13()}m(4w(9.4F.1H("1X"))<9.1I.2k.G){9.5B(2H)}9.8H();9.8y();u 11.1i({R:9.R,1q:n(){$w("1b 3K").1d(n(a){B b=a.1K();9["3E"+b].2n();B c={};9["3E"+b]=u I("O",{N:"ad"+b}).13();c[a]=9["3E"+b];9.30.M(c)}.U(9))}.U(9)});9.5A();9.1j=1E},5y:n(){m(!9.3J||!9.3V){J}9.3V.M({2W:9.3J.F({2q:9.3J.87})});9.3V.2n();9.3V=1E},18:n(b){9.1y=1E;B c=12.7W(b);m(12.7N(b)||c){m(c&&b.3x("#")){9.18({1g:b,y:12.1l({55:26},3Z[1]||{})});J}9.1y=$(b);m(!9.1y){J}9.1y.aW();9.q=9.1y.22||u Y.3N(9.1y)}W{m(b.1g){9.1y=$(19.2e);9.q=u Y.3N(b)}W{m(12.7v(b)){9.1y=9.4j(9.q.1Y)[b];9.q=9.1y.22}}}m(!9.q.1g){J}9.6K();m(9.q.2i()||9.q.1O()){9.7r(9.q.1Y);9.1j=9.5s(9.q.1Y);m(9.q.1O()){9.2s=9.1j.1p>1?9.7e:0;9.2V=9.1j.bK(n(a){J a.2T()})}}9.3R();9.7c();m(9.q.1g!="#41"&&12.70(Y.4u).6W(" ").24(9.q.17)>=0){m(!Y.4u[9.q.17]){$("41").1x(u 4y(9.8U.8V).45({17:9.q.17.1K(),5l:9.5k[9.q.17]}));B d=$("41").2l();9.18({1g:"#41",1C:9.q.17.1K()+" 98 99",y:d});J 2H}}B e=12.1l({1o:"3K",2k:2H,5j:"9h",3X:9.q.2i()&&9.y.1A.3X.2q,5i:9.y.5i,28:(9.q.2i()&&9.y.1A.28.2q)||(9.2V),2A:"1Q",7Z:9.y.2B.9p,33:9.y.33},9.y.9t[9.q.17]||{});9.q.y=12.1l(e,9.q.y);m(9.q.1O()){9.q.y.2k=(9.1j.1p<=1)}m(!(9.q.1C||9.q.2m||(9.1j&&9.1j.1p>1))&&9.q.y.2k){9.q.y.1o=2H}9.1T="3E"+(9.q.y.1o=="1b"?"7M":"7G");m(9.q.2T()){m(!l&&!9.q.7w){9.q.7w=26;B f=u I("3k:2h",{1t:9.q.1g,2q:"9z"}).F("G:5h;E:5h;");$(19.2e).M(f);I.2n.2X(0.1,f)}m(9.q.2i()||9.q.1O()){9.1a=9.1j.24(9.q);9.74()}9.1W=9.q.4P;m(9.1W){9.4G()}W{9.5d();B f=u 2f();f.1w=n(){f.1w=1m.2z;9.4S();9.1W={E:f.E,G:f.G};9.4G()}.U(9);f.1t=9.q.1g}}W{m(9.q.1O()){9.1a=9.1j.24(9.q)}9.1W=9.q.y.6M?19.33.2l():{E:9.q.y.E,G:9.q.y.G};9.4G()}},4U:(n(){n 5c(a,b,c){a=$(a);B d=1P(c);a.1x(u I("82",{2S:"2w",1t:b,a6:"",a7:"4H"}).F(d))}B k=(n(){n 7f(a,b,c){a=$(a);B d=12.1l({"5Q":"1h"},1P(c));B e=u I("3k:2h",{1t:b,2S:"2w"}).F(d);a.1x(e);e.51=e.51}n 6Z(b,c,d){b=$(b);B f=1P(d),2h=u 2f();2h.1w=n(){3y=u I("3y",f);b.1x(3y);4c{B a=3y.5T("2d");a.ah(2h,0,0,d.E,d.G)}4e(e){5c(b,c,d)}}.U(9);2h.1t=c}m(1m.1Z.2F){J 7f}W{J 6Z}})();J n(){B c=9.8a(9.q.1g),2D=9.1S||9.1W;m(9.q.2T()){B d=1P(2D);9[9.1T].F(d);m(9.1S){k(9[9.1T],9.q.1g,2D)}W{5c(9[9.1T],9.q.1g,2D)}}W{m(9.q.5p()){59(9.q.17){2M"4f":B f=12.5f(9.q.y.4f)||{};B g=n(){9.4S();m(9.q.y.55){9[9.1T].F({E:"1L",G:"1L"});9.1W=9.5b(9[9.1T])}u 11.1i({R:9.R,1q:9.52.U(9)})}.U(9);m(f.4Z){f.4Z=f.4Z.1v(n(a,b){g();a(b)})}W{f.4Z=g}9.5d();u aF.aH(9[9.1T],9.q.1g,f);2v;2M"2x":m(9.1S){2D.G-=9.3a.G}9[9.1T].1x(9.2x=u I("2x",{b1:0,b9:0,1t:9.q.1g,2S:"2w",2b:"bc"+(6z.bf()*bg).2o(),6J:(9.q.y&&9.q.y.6J)?"1L":"4H"}).F(12.1l({Q:0,1N:0,3p:0},1P(2D))));2v;2M"4R":B h=9.q.1g,2g=$(h.5e(h.24("#")+1));m(!2g||!2g.47){J}B i=2g.2l();2g.M({by:9.3V=u I(2g.47).13()});2g.87=2g.1H("2q");9.3J=2g.18();9[9.1T].1x(9.3J);9[9.1T].2p("2p, 3t, 5g").1d(n(b){9.44.1d(n(a){m(a.1y==b){b.F({1k:a.1k})}})}.U(9));m(9.q.y.55){9.1W=i;u 11.1i({R:9.R,1q:9.52.U(9)})}2v}}W{B j={1U:"3t",2S:"2w",E:2D.E,G:2D.G};59(9.q.17){2M"40":12.1l(j,{5l:9.5k[9.q.17],3o:[{1U:"2y",2b:"88",2N:9.q.y.88},{1U:"2y",2b:"8k",2N:"8I"},{1U:"2y",2b:"X",2N:9.q.y.6p},{1U:"2y",2b:"9M",2N:26},{1U:"2y",2b:"1t",2N:9.q.1g},{1U:"2y",2b:"6s",2N:9.q.y.6s||2H}]});12.1l(j,1m.1Z.2F?{8N:9.8O[9.q.17],8P:9.8R[9.q.17]}:{2P:9.q.1g,17:9.6t[9.q.17]});2v;2M"3U":12.1l(j,{2P:9.q.1g,17:9.6t[9.q.17],8W:"8X",5j:9.q.y.5j,5l:9.5k[9.q.17],3o:[{1U:"2y",2b:"8Y",2N:9.q.1g},{1U:"2y",2b:"8Z",2N:"26"}]});m(9.q.y.6D){j.3o.3S({1U:"2y",2b:"96",2N:9.q.y.6D})}2v}9[9.1T].F(1P(2D)).1x(9.5m(j)).F("1k:1Q").18();m(9.q.4v()){(n(){4c{m("6O"6S $("2w")){$("2w").6O(9.q.y.6p)}}4e(e){}}.U(9)).9c()}}}}})(),5b:n(b){b=$(b);B d=b.9d(),5n=[],5o=[];d.3S(b);d.1d(n(c){m(c!=b&&c.1u()){J}5n.3S(c);5o.3S({2q:c.1H("2q"),1a:c.1H("1a"),1k:c.1H("1k")});c.F({2q:"9j",1a:"35",1k:"1u"})});B e={E:b.9k,G:b.9l};5n.1d(n(r,a){r.F(5o[a])});J e},4t:n(){B a=$("2w");m(a){59(a.47.4s()){2M"3t":m(1m.1Z.5a&&9.q.4v()){4c{a.71()}4e(e){}a.9q=""}m(a.72){a.2n()}W{a=1m.2z}2v;2M"2x":a.2n();m(1m.1Z.9s&&20.73.2w){5q 20.73.2w}2v;5R:a.2n();2v}}$w("7G 7M").1d(n(S){9["3E"+S].F("E:1L;G:1L;").1x("").13()},9)},77:1m.K,4G:n(){u 11.1i({R:9.R,1q:9.4o.U(9)})},4o:n(){9.3c();m(!9.q.5r()){9.4S()}m(!((9.q.y.55&&9.q.7h())||9.q.5r())){9.52()}m(!9.q.4l()){u 11.1i({R:9.R,1q:9.4U.U(9)})}m(9.q.y.2k){u 11.1i({R:9.R,1q:9.5B.U(9,26)})}},7l:n(){u 11.1i({R:9.R,1q:9.7q.U(9)});m(9.q.4l()){u 11.1i({2X:0.2,R:9.R,1q:9.4U.U(9)})}m(9.3n){u 11.1i({R:9.R,1q:9.7u.U(9)})}m(9.q.4v()||9.q.9J()){u 11.1i({R:9.R,2X:0.1,1q:I.F.U(9,9[9.1T],"1k:1u")})}},2K:n(){m(11.2J.2I(Y.R.3q).5t.1p){J}9.18(9.2O().2K)},1c:n(){m(11.2J.2I(Y.R.3q).5t.1p){J}9.18(9.2O().1c)},52:n(){9.77();B a=9.5v(),2Y=9.7P();m(9.q.y.33&&(a.E>2Y.E||a.G>2Y.G)){m(9.q.y.6M){9.1S=2Y;9.3c();a=2Y}W{B c=9.7S(),b=2Y;m(9.q.4W()){B d=[2Y.G/c.G,2Y.E/c.E,1].a4();9.1S={E:(9.1W.E*d).2o(),G:(9.1W.G*d).2o()}}W{9.1S={E:c.E>b.E?b.E:c.E,G:c.G>b.G?b.G:c.G}}9.3c();a=12.5f(9.1S);m(9.q.4W()){a.G+=9.3a.G}}}W{9.3c();9.1S=1E}9.5w(a)},3I:n(a){9.5w(a,{23:0})},5w:(n(){B e,4L,4K,8c,8e,2s,b;B f=(n(){B w,h;n 4I(p){w=(e.E+p*4L).3L(0);h=(e.G+p*4K).3L(0)}B a;m(2G){a=n(p){9.V.F({E:(e.E+p*4L).3L(0)+"H",G:(e.G+p*4K).3L(0)+"H"});9.4V.F({G:h-1*9.Q+"H"})}}W{m(32){a=n(p){B v=9.4C(),o=19.33.6o();9.V.F({1a:"35",1M:0,1X:0,E:w+"H",G:h+"H",1h:(o[0]+(v.E/2)-(w/2)).3M()+"H",1b:(o[1]+(v.G/2)-(h/2)).3M()+"H"});9.4V.F({G:h-1*9.Q+"H"})}}W{a=n(p){9.V.F({1a:"4r",E:w+"H",G:h+"H",1M:((0-w)/2).2o()+"H",1X:((0-h)/2-2s).2o()+"H"});9.4V.F({G:h-1*9.Q+"H"})}}}J n(p){4I.3w(9,p);a.3w(9,p)}})();J n(a){B c=3Z[1]||{};e=9.V.2l();b=2*9.Q;E=a.E?a.E+b:e.E;G=a.G?a.G+b:e.G;9.5C();m(e.E==E&&e.G==G){u 11.1i({R:9.R,1q:9.5D.U(9,a)});J}B d={E:E+"H",G:G+"H"};4L=E-e.E;4K=G-e.G;8c=4w(9.V.1H("1M").2Z("H",""));8e=4w(9.V.1H("1X").2Z("H",""));2s=9.X.1u()?(9.2s/2):0;m(!2G){12.1l(d,{1M:0-E/2+"H",1X:0-G/2+"H"})}m(c.23==0){f.3w(9,1)}W{9.5E=u 11.6u(9.V,0,1,12.1l({23:9.y.ax,R:9.R,6v:9.y.6v,1q:9.5D.U(9,a)},c),f.U(9))}}})(),5D:n(a){m(!9.3a){J}B b=9[9.1T],4p;m(9.q.y.2A=="1L"){4p=b.2l()}b.F({G:(a.G-9.3a.G)+"H",E:a.E+"H"});m(9.q.y.2A!="1Q"&&(9.q.5r()||9.q.7h())){m(1m.1Z.2F){m(9.q.y.2A=="1L"){B c=b.2l();b.F("2A:1u");B d={6x:"1Q",6y:"1Q"},5F=0,4n=15;m(4p.G>a.G){d.6y="1L";d.E=c.E-4n;d.aX="6A";5F=4n}m(4p.E-5F>a.E){d.6x="1L";d.G=c.G-4n;d.b2="6A"}b.F(d)}W{b.F({2A:9.q.y.2A})}}W{b.F({2A:9.q.y.2A})}}W{b.F("2A:1Q")}9.3R();9.5E=1E;9.7l()},7q:n(){u 11.1i({R:9.R,1q:9.5C.U(9)});u 11.1i({R:9.R,1q:n(){9[9.1T].18();9.3c();m(9.1o.1u()){9.1o.F("1k:1u").1n(1)}}.U(9)});u 11.b6([u 11.6B(9.30,{6C:26,4m:0,57:1}),u 11.53(9.4b,{6C:26})],{R:9.R,23:0.25,1q:n(){m(9.1y){9.1y.62("V:bh")}}.U(9)});m(9.q.2i()||(9.2V&&9.y.X.1A.1J)){u 11.1i({R:9.R,1q:9.6G.U(9)})}},8y:(n(){n 2W(){9.4t();9.4F.F({1X:9.1I.2k.G+"H"});9.5y()}n 6H(p){9.30.1n(p);9.4b.1n(p)}J n(){m(!9.V.1u()){9.30.1n(0);9.4b.1n(0);9.4t();J}u 11.6u(9.V,1,0,{23:0.2,R:9.R,1q:2W.U(9)},6H.U(9))}})(),6I:n(){$w("6a 2P 6b 1C 2m 48 4Y 28 2c").1d(n(a){I.13(9[a])},9);9.1o.F("1k:1Q").1n(0)},3c:n(){9.6I();m(!9.q.y.1o){9.3a={E:0,G:0};9.5H=0;9.1o.13()}W{9.1o.18()}m(9.q.1C||9.q.2m){9.6b.18();9.2P.18()}m(9.q.1C){9.1C.1x(9.q.1C).18()}m(9.q.2m){9.2m.1x(9.q.2m).18()}m(9.1j&&9.1j.1p>1){m(9.q.1O()){9.2r.1x(u 4y(9.y.X.6L).45({1a:9.1a+1,5I:9.1j.1p}));m(9.X.1H("1k")=="1Q"){9.X.F("1k:1u");m(9.5J){11.2J.2I("V").2n(9.5J)}9.5J=u 11.53(9.3g,{R:9.R,23:0.1})}}W{9.2P.18();m(9.q.2T()){9.6a.18();9.48.18().5N().1x(u 4y(9.y.bF).45({1a:9.1a+1,5I:9.1j.1p}));m(9.q.y.28){9.34.18();9.28.18()}}}}B a=9.q.1O();m((9.q.y.3X||a)&&9.1j.1p>1){B b={2u:(9.y.31||9.1a!=0),1c:(9.y.31||((9.q.2i()||a)&&9.2O().1c!=0))};$w("2u 1c").1d(n(z){B Z=z.1K(),3u=b[z]?"6R":"1L";m(a){9["X"+Z].F({3u:3u}).1n(b[z]?1:9.y.1A.1F.5L)}W{9["3r"+Z+"3s"].F({3u:3u}).1n(b[z]?9.y.1A.1F.3f:9.y.1A.1F.5L)}}.U(9));m(9.q.y.3X||9.y.X.3X){9.4Y.18()}}9.3O.1n(9.2V?1:9.y.1A.1F.5L).F({3u:9.2V?"6R":"1L"});9.6U();m(!9.1o.c4().6N(I.1u)){9.1o.13();9.q.y.1o=2H}9.6V()},6U:n(){B a=9.1I.5M.E,3e=9.1I.3e.E,3d=9.1S?9.1S.E:9.1W.E,4D=8J,E=0,2c=9.q.y.2c||"3e",29=9.y.8K;m(9.q.y.2k||9.q.1O()||!9.q.y.2c){29=1E}W{m(3d>=4D+a&&3d<4D+3e){29="5M";E=a}W{m(3d>=4D+3e){29=2c;E=9.1I[2c].E}}}m(E>0){9.2P.18();9.2c.F({E:E+"H"}).18()}W{9.2c.13()}m(29){9.2c.1G(9.1e+"6T"+29+".1s",{10:9.y.10})}9.5H=E},5d:n(){9.5O=u 11.53(9.3v,{23:0.2,4m:0,57:1,R:9.R})},4S:n(){m(9.5O){11.2J.2I("V").2n(9.5O)}u 11.6X(9.3v,{23:0.2,R:9.R,2X:0.2})},6Y:n(){m(!9.q.2T()){J}B a=(9.y.31||9.1a!=0),1c=(9.y.31||((9.q.2i()||9.q.1O())&&9.2O().1c!=0));9.4Q[a?"18":"13"]();9.4O[1c?"18":"13"]();B b=9.1S||9.1W;9.1V.F({G:b.G+"H",1X:9.Q+(9.q.y.1o=="1b"?9.1o.5P():0)+"H"});B c=((b.E/2-1)+9.Q).3M();m(a){9.1V.M(9.3j=u I("O",{N:"1D 8Q"}).F({E:c+"H"}));9.3j.1J="2u"}m(1c){9.1V.M(9.3h=u I("O",{N:"1D 8S"}).F({E:c+"H"}));9.3h.1J="1c"}m(a||1c){9.1V.18()}},6G:n(){m(!9.q||!9.y.1A.1J.2q||!9.q.2T()){J}9.6Y();9.1V.18()},5C:n(){9.1V.1x("").13();9.4Q.13().F({1M:9.1R.E+"H"});9.4O.13().F({1M:-1*9.1R.E+"H"})},7c:(n(){n 2W(){9.V.1n(1)}m(!2C){2W=2W.1v(n(a,b){a(b);9.V.18()})}J n(){m(9.V.1H("1F")!=0){J}m(9.y.2B.2q){u 11.53(9.2B,{23:0.2,4m:0,57:4k?1:9.y.2B.1F,R:9.R,8T:9.5S.U(9),1q:2W.U(9)})}W{2W.3w(9)}}})(),13:n(){m(1m.1Z.2F&&9.2x&&9.q.4l()){9.2x.2n()}m(2C&&9.q.4v()){B a=$$("3t#2w")[0];m(a){4c{a.71()}4e(e){}}}m(9.V.1H("1F")==0){J}9.2j();9.1V.13();m(!1m.1Z.2F||!9.q.4l()){9.30.13()}m(11.2J.2I("5U").5t.1p>0){J}11.2J.2I("V").1d(n(e){e.6F()});u 11.1i({R:9.R,1q:9.5y.U(9)});u 11.6B(9.V,{23:0.1,4m:1,57:0,R:{1a:"5u",3q:"5U"}});u 11.6X(9.2B,{23:0.16,R:{1a:"5u",3q:"5U"},1q:9.75.U(9)})},75:n(){9.4t();9.V.13();9.30.1n(0).18();9.1V.1x("").13();9.85.1x("").13();9.7F.1x("").13();9.5A();9.76();u 11.1i({R:9.R,1q:9.3I.U(9,9.y.90)});u 11.1i({R:9.R,1q:n(){m(9.1y){9.1y.62("V:1Q")}$w("1y 1j q 1S 2V 91 3E").3W(n(a){9[a]=1E}.U(9))}.U(9)})},6V:n(){9.1o.F("3p:0;");B a={},3d=9[(9.1S?"92":"i")+"93"].E;9.1o.F({E:3d+"H"});9.2P.F({E:3d-9.5H-1+"H"});a=9.5b(9.1o);m(9.q.y.1o){a.G+=9.y.5V;59(9.q.y.1o){2M"3K":9.1o.F("3p:"+9.y.5V+"H 0 0 0");2v;2M"1b":9.1o.F("3p: 0 0 "+9.y.5V+"H 0");2v}}9.1o.F({E:"78%"});9.3a=9.q.y.1o?a:{E:a.E,G:0}},3R:(n(){B a,2s;n 4I(){a=9.V.2l();2s=9.X.1u()?(9.2s/2):0}B b;m(2G){b=n(){9.V.F({1b:"50%",1h:"50%"})}}W{m(2C||32){b=n(){B v=9.4C(),o=19.33.6o();9.V.F({1M:0,1X:0,1h:(o[0]+(v.E/2)-(a.E/2)).3M()+"H",1b:(o[1]+(v.G/2)-(a.G/2)).3M()+"H"})}}W{b=n(){9.V.F({1a:"4r",1h:"50%",1b:"50%",1M:(0-a.E/2).2o()+"H",1X:(0-a.G/2-2s).2o()+"H"})}}}J n(){4I.3w(9);b.3w(9)}})(),7a:n(){9.2j();9.3n=26;9.1c.U(9).2X(0.25);9.34.1G(9.1e+"6P.1s",{10:9.y.10}).13();9.3O.1G(9.1e+"7b.1s",{10:9.y.X.10})},2j:n(){m(9.3n){9.3n=2H}m(9.5W){9a(9.5W)}9.34.1G(9.1e+"7I.1s",{10:9.y.10});9.3O.1G(9.1e+"7d.1s",{10:9.y.X.10})},5X:n(){m(9.q.1O()&&!9.2V){J}9[(9.3n?"4X":"60")+"9e"]()},7u:n(){m(9.3n){9.5W=9.1c.U(9).2X(9.y.9f)}},9g:n(){$$("a[2U~=V], 3B[2U~=V]").1d(n(a){B b=a.22;m(!b){J}m(b.3H){a.7i("1C",b.3H)}a.22=1E})},4j:n(a){B b=a.24("][");m(b>-1){a=a.5e(0,b+1)}J $$(\'a[1Y^="\'+a+\'"], 3B[1Y^="\'+a+\'"]\')},5s:n(a){J 9.4j(a).7j("22")},7k:n(){$(19.2e).1f("2L",9.7m.1r(9));$w("2R 3Y").1d(n(e){9.1V.1f(e,n(a){B b=a.3m("O");m(!b){J}m(9.3j&&9.3j==b||9.3h&&9.3h==b){9.54(a)}}.1r(9))}.U(9));9.1V.1f("2L",n(c){B d=c.3m("O");m(!d){J}B e=(9.3j&&9.3j==d)?"2K":(9.3h&&9.3h==d)?"1c":1E;m(e){9[e].1v(n(a,b){9.2j();a(b)}).U(9)()}}.1r(9));$w("2u 1c").1d(n(s){B S=s.1K(),2j=n(a,b){9.2j();a(b)},42=n(a,b){B c=b.1y().1V;m((c=="2u"&&(9.y.31||9.1a!=0))||(c=="1c"&&(9.y.31||((9.q.2i()||9.q.1O())&&9.2O().1c!=0)))){a(b)}};9[s+"3i"].1f("2R",9.54.1r(9)).1f("3Y",9.54.1r(9)).1f("2L",9[s=="1c"?s:"2K"].1v(2j).1r(9));9["3r"+S+"3s"].1f("2L",9[s=="1c"?s:"2K"].1v(42).1v(2j).1r(9)).1f("2R",I.1n.7s(9["3r"+S+"3s"],9.y.1A.1F.7t).1v(42).1r(9)).1f("3Y",I.1n.7s(9["3r"+S+"3s"],9.y.1A.1F.3f).1v(42).1r(9));9["X"+S].1f("2L",9[s=="1c"?s:"2K"].1v(42).1v(2j).1r(9))},9);B f=[9.2c,9.34];m(!2C){f.1d(n(b){b.1f("2R",I.1n.U(9,b,9.y.1A.1F.7t)).1f("3Y",I.1n.U(9,b,9.y.1A.1F.3f))},9)}W{f.3F("1n",1)}9.34.1f("2L",9.5X.1r(9));9.3O.1f("2L",9.5X.1r(9));m(2C||32){B g=n(a,b){m(9.V.1H("1b").63(0)=="-"){J}a(b)};1i.1f(20,"43",9.3R.1v(g).1r(9));1i.1f(20,"3I",9.3R.1v(g).1r(9))}m(32){1i.1f(20,"3I",9.5S.1r(9))}m(2G){n 65(){m(9.X){9.X.F({1h:((19.7x.9A||0)+19.33.7y()/2).2o()+"H"})}}1i.1f(20,"43",65.1r(9));1i.1f(20,"3I",65.1r(9))}m(9.y.9C){9.7z=n(a){B b=a.3m("a[2U~=V], 3B[2U~=V]");m(!b){J}a.4X();m(!b.22){u Y.3N(b)}9.7A(b)}.1r(9);$(19.2e).1f("2R",9.7z)}},5B:n(a){m(9.7B){11.2J.2I("9G").2n(9.9H)}B b={1X:(a?0:9.1I.2k.G)+"H"};9.7B=u 11.7C(9.4F,{27:b,23:0.16,R:9.R,2X:a?0.15:0})},7D:n(){B a={};$w("E G").1d(n(d){B D=d.1K(),4x=19.7x;a[d]=1m.1Z.2F?[4x["66"+D],4x["43"+D]].9N():1m.1Z.5a?19.2e["43"+D]:4x["43"+D]});J a},5S:n(){m(!32){J}9.2B.F(1P(9.7D()))},7m:(n(){B b=".7X, .8v .1D, .7E, .7H";J n(a){m(9.q&&9.q.y&&a.3m(b+(9.q.y.7Z?", #7V":""))){9.13()}}})(),54:n(a){B b=a.2g,1J=b.1J,w=9.1R.E,66=(a.17=="2R")?0:1J=="2u"?w:-1*w,27={1M:66+"H"};m(!9.46){9.46={}}m(9.46[1J]){11.2J.2I("7J"+1J).2n(9.46[1J])}9.46[1J]=u 11.7C(9[1J+"3i"],{27:27,23:0.2,R:{3q:"7J"+1J,9R:1},2X:(a.17=="3Y")?0.1:0})},2O:n(){m(!9.1j){J}B a=9.1a,1p=9.1j.1p;B b=(a<=0)?1p-1:a-1,1c=(a>=1p-1)?0:a+1;J{2K:b,1c:1c}},5Z:n(a,b){B c=3Z[2]||9.y,1z=c.1z,Q=c.Q;1a={1b:(b.63(0)=="t"),1h:(b.63(1)=="l")};m(l){B d=u I("3y",{N:"9T"+b.1K(),E:Q+"H",G:Q+"H"});d.F("5Q:1h");a.M(d);B e=d.5T("2d");e.9U=c.10;e.9V((1a.1h?1z:Q-1z),(1a.1b?1z:Q-1z),1z,0,6z.9W*2,26);e.9X();e.7L((1a.1h?1z:0),0,Q-1z,Q);e.7L(0,(1a.1b?1z:0),Q,Q-1z)}W{B f=u I("3k:9Z",{a0:c.10,a1:"5h",a2:c.10,a3:(1z/Q*0.5).3L(2)}).F({E:2*Q-1+"H",G:2*Q-1+"H",1a:"35",1h:(1a.1h?0:(-1*Q))+"H",1b:(1a.1b?0:(-1*Q))+"H"});a.M(f);f.51=f.51}},8H:(n(){n 67(){J $$("3t, 5g, 2p")}m(1m.1Z.2F&&19.5K>=8){67=n(){J 19.a5("3t, 5g, 2p")}}J n(){m(9.68){J}B a=67();9.44=[];7O(B i=0,1p=a.1p;i<1p;i++){B b=a[i];9.44.3S({1y:b,1k:b.27.1k});b.27.1k="1Q"}9.68=26}})(),76:n(){9.44.1d(n(a,i){a.1y.27.1k=a.1k});5q 9.44;9.68=2H},5v:n(){J{E:9.1W.E,G:9.1W.G+9.3a.G}},7S:n(){B i=9.5v(),b=2*9.Q;J{E:i.E+b,G:i.G+b}},7P:n(){B a=21,69=2*9.1R.G+a,v=9.4C();J{E:v.E-69,G:v.G-69}},4C:n(){B v=19.33.2l();m(9.X&&9.X.1u()&&9.1j&&9.1j.1p>1){v.G-=9.2s}J v}});(n(){n 7Q(a,b){m(!9.q){J}a(b)}$w("3c 4U").1d(n(a){9[a]=9[a].1v(7Q)},Y)})();n 1P(b){B c={};12.70(b).1d(n(a){c[a]=b[a]+"H"});J c}12.1l(Y,{7R:n(){m(!9.q.y.5i){J}9.4M=9.7T.1r(9);19.1f("7U",9.4M)},5A:n(){m(9.4M){19.ae("7U",9.4M)}},7T:n(a){B b=af.ag(a.2E).4s(),2E=a.2E,3D=(9.q.2i()||9.2V)&&!9.5E,28=9.q.y.28,49;m(9.q.4W()){a.4X();49=(2E==1i.7Y||["x","c"].6c(b))?"13":(2E==37&&3D&&(9.y.31||9.1a!=0))?"2K":(2E==39&&3D&&(9.y.31||9.2O().1c!=0))?"1c":(b=="p"&&28&&3D)?"7a":(b=="s"&&28&&3D)?"2j":1E;m(b!="s"){9.2j()}}W{49=(2E==1i.7Y)?"13":1E}m(49){9[49]()}m(3D){m(2E==1i.am&&9.1j.an()!=9.q){9.18(0)}m(2E==1i.ao&&9.1j.ap()!=9.q){9.18(9.1j.1p-1)}}}});Y.4o=Y.4o.1v(n(a,b){9.7R();a(b)});12.1l(Y,{7r:n(a){B b=9.4j(a);m(!b){J}b.3W(Y.4a)},74:n(){m(9.1j.1p==0){J}B a=9.2O();9.81([a.1c,a.2K])},81:n(c){B d=(9.1j&&9.1j.6c(c)||12.as(c))?9.1j:c.1Y?9.5s(c.1Y):1E;m(!d){J}B e=$A(12.7v(c)?[c]:c.17?[d.24(c)]:c).au();e.1d(n(a){B b=d[a];9.6d(b)},9)},83:n(a,b){a.4P={E:b.E,G:b.G}},6d:n(a){m(a.4P||a.4B||!a.1g){J}B P=u 2f();P.1w=n(){P.1w=1m.2z;a.4B=1E;9.83(a,P)}.U(9);a.4B=26;P.1t=a.1g},7A:n(a){B b=a.22;m(b&&b.4P||b.4B||!b.2T()){J}9.6d(b)}});I.ay({1G:n(a,b){a=$(a);B c=12.1l({86:"1b 1h",3A:"4H-3A",6e:"8k",10:""},3Z[2]||{});a.F(2G?{aA:"aB:aC.aD.aE(1t=\'"+b+"\'\', 6e=\'"+c.6e+"\')"}:{29:c.10+" 3Q("+b+") "+c.86+" "+c.3A});J a}});12.1l(Y,{6f:n(a,b){B c;$w("3U 2h 2x 40").1d(n(t){m(u 4A("\\\\.("+9.aG[t].2Z(/\\s+/g,"|")+")(\\\\?.*)?","i").58(a)){c=t}}.U(9));m(c){J c}m(a.3x("#")){J"4R"}m(19.89&&19.89!=(a).2Z(/(^.*\\/\\/)|(:.*)|(\\/.*)/g,"")){J"2x"}J"2h"},8a:n(a){B b=a.aI(/\\?.*/,"").3T(/\\.([^.]{3,4})$/);J b?b[1]:1E},5m:n(b){B c="<"+b.1U;7O(B d 6S b){m(!["3o","6g","1U"].6c(d)){c+=" "+d+\'="\'+b[d]+\'"\'}}m(u 4A("^(?:3B|aK|aL|br|aM|aN|aO|82|8b|aQ|aR|aS|2y|aT|aU|aV)$","i").58(b.1U)){c+="/>"}W{c+=">";m(b.3o){b.3o.1d(n(a){c+=9.5m(a)}.U(9))}m(b.6g){c+=b.6g}c+="</"+b.1U+">"}J c}});(n(){19.1f("5Y:3P",n(){B c=(3b.6h&&3b.6h.1p);n 4d(a){B b=2H;m(c){b=($A(3b.6h).7j("2b").6W(",").24(a)>=0)}W{4c{b=u aY(a)}4e(e){}}J!!b}m(c){20.Y.4u={3U:4d("aZ b0"),40:4d("6i")}}W{20.Y.4u={3U:4d("8f.8f"),40:4d("6i.6i")}}})})();Y.3N=b3.b4({b5:n(b){m(b.22){J}B c=12.7N(b);m(c&&!b.22){b.22=9;m(b.1C){b.22.3H=b.1C;m(Y.y.8g){b.b7("1C","")}}}9.1g=c?b.b8("1g"):b.1g;m(9.1g.24("#")>=0){9.1g=9.1g.5e(9.1g.24("#"))}B d=b.1Y;m(d){9.1Y=d;m(d.3x("4g")){9.17="4g"}W{m(d.3x("56")){m(d.bb("][")){B e=d.8j("]["),6j=e[1].3T(/([a-be-Z]*)/)[1];m(6j){9.17=6j;B f=e[0]+"]";b.7i("1Y",f);9.1Y=f}}W{9.17=Y.6f(9.1g)}}W{9.17=d}}}W{9.17=Y.6f(9.1g);9.1Y=9.17}$w("4f 3U 4g 2x 2h 4R 40 8l 8m 56").3W(n(a){B T=a.1K(),t=a.4s();m("2h 4g 8m 8l 56".24(a)<0){9["bi"+T]=n(){J 9.17==t}.U(9)}}.U(9));m(c&&b.22.3H){B g=b.22.3H.8j(Y.y.bj).3F("bk");m(g[0]){9.1C=g[0]}m(g[1]){9.2m=g[1]}B h=g[2];9.y=(h&&12.7W(h))?bm("({"+h+"})"):{}}W{9.1C=b.1C;9.2m=b.2m;9.y=b.y||{}}m(9.y.6k){9.y.4f=12.5f(9.y.6k);5q 9.y.6k}},2i:n(){J 9.17.3x("4g")},1O:n(){J 9.1Y.3x("56")},2T:n(){J(9.2i()||9.17=="2h")},5p:n(){J"2x 4R 4f".24(9.17)>=0},4W:n(){J!9.5p()}});Y.4a=n(a){B b=$(a);u Y.3N(a);J b};(n(){n 8o(a){B b=a.3m("a[2U~=V], 3B[2U~=V]");m(!b){J}a.4X();9.4a(b);9.18(b)}n 8p(a){B b=a.3m("a[2U~=V], 3B[2U~=V]");m(!b){J}9.4a(b)}n 8q(a){B b=a.2g,17=a.17,36=a.36;m(36&&36.47){m(17==="5G"||17==="bt"||(17==="2L"&&36.47.4s()==="8b"&&36.17==="bu")){b=36}}m(b.bv==bw.bx){b=b.72}J b}n 8s(a,b){m(!a){J}B c=a.N;J(c.1p>0&&(c==b||u 4A("(^|\\\\s)"+b+"(\\\\s|$)").58(c)))}n 8t(a){B b=8q(a);m(b&&8s(b,"V")){9.4a(b)}}19.1f("V:3P",n(){$(19.2e).1f("2L",8o.1r(Y));m(Y.y.8g&&1m.1Z.2F&&19.5K>=8){$(19.2e).1f("2R",8t.1r(Y))}W{$(19.2e).1f("2R",8p.1r(Y))}})})();12.1l(Y,{4z:n(){B b=9.y.X,Q=b.Q;$(19.2e).M(9.X=u I("O",{2S:"bB"}).F({2Q:9.y.2Q+1,bC:b.1N+"H",1a:"35",1k:"1Q"}).M(9.bD=u I("O",{N:"bE"}).M(u I("O",{N:"4q bG"}).F("1N-1h: "+Q+"H").M(u I("O",{N:"2t"}))).M(u I("O",{N:"6l"}).F({1N:"0 "+Q+"H",G:Q+"H"})).M(u I("O",{N:"4q bI"}).F("1N-1h: -"+Q+"H").M(u I("O",{N:"2t"})))).M(9.3l=u I("O",{N:"6m 80"}).M(9.3g=u I("3z",{N:"bL"}).F("1N: 0 "+Q+"H").M(u I("1B",{N:"bM"}).M(9.2r=u I("O"))).M(u I("1B",{N:"4h bO"}).M(9.bP=u I("O",{N:"1D"}).1G(9.1e+"8A.1s",{10:b.10}))).M(u I("1B",{N:"4h bR"}).M(9.bS=u I("O",{N:"1D"}).1G(9.1e+"bT.1s",{10:b.10}))).M(u I("1B",{N:"4h bU"}).M(9.3O=u I("O",{N:"1D"}).1G(9.1e+"7d.1s",{10:b.10}))).M(u I("1B",{N:"4h 7H"}).M(9.bV=u I("O",{N:"1D"}).1G(9.1e+"bW.1s",{10:b.10}))))).M(9.bX=u I("O",{N:"bY"}).M(u I("O",{N:"4q bZ"}).F("1N-1h: "+Q+"H").M(u I("O",{N:"2t"}))).M(u I("O",{N:"6l"}).F({1N:"0 "+Q+"H",G:Q+"H"})).M(u I("O",{N:"4q c0"}).F("1N-1h: -"+Q+"H").M(u I("O",{N:"2t"})))));$w("2u 1c").1d(n(s){B S=s.1K();9["X"+S].1V=s},9);m(2C){9.X.13=n(){9.F("1h:-3C;1b:-3C;1k:1Q;");J 9};9.X.18=n(){9.F("1k:1u");J 9};9.X.1u=n(){J(9.1H("1k")=="1u"&&4J(9.1H("1b").2Z("H",""))>-7K)}}9.X.2p(".4h O").3F("F",1P(9.8B));B c=9.X.2p(".2t");$w("7o 7n bl br").1d(n(a,i){m(b.1z>0){9.5Z(c[i],a,b)}W{c[i].M(u I("O",{N:"38"}))}c[i].F({E:b.Q+"H",G:b.Q+"H"}).7g("2t"+a.1K())},9);9.X.5N(".6m").F("E:78%;");9.X.F(2G?{1a:"35",1b:"1L",1h:""}:{1a:"4r",1b:"1L",1h:"50%"});9.X.2p(".6l",".6m",".1D",".38").3F("F",{10:b.10});9.2r.1x(u 4y(b.6L).45({1a:8C,5I:8C}));9.2r.F({E:9.2r.7y()+"H",G:9.3g.5P()+"H"});9.8D();9.2r.1x("");9.X.13().F("1k:1u");9.7k();9.2a()},8D:n(){B b,4i,X=9.y.X,Q=X.Q;m(2G){b=9.3g.2l(),4i=b.E+2*Q;9.3g.F({E:b.E+"H",1N:0});9.3l.F("E:1L;");9.3g.F({c5:Q+"H"});9.3l.F({E:4i+"H"});$w("1b 3K").1d(n(a){9["X"+a.1K()].F({E:4i+"H"})},9);9.X.F("1N-1h:-"+(4i/2).2o()+"H")}W{9.3l.F("E:1L");b=9.3l.2l();9.2r.c6().F({8F:b.G+"H",E:9.2r.2l().E+"H"});9.X.F({E:b.E+"H",1M:(0-(b.E/2).2o())+"H"});9.3l.F({E:b.E+"H"});$w("1b 3K").1d(n(a){9["X"+a.1K()].F({E:b.E+"H"})},9)}9.7e=X.1N+b.G+2*Q;9.6q=9.X.5P();9.2r.F({8F:b.G+"H"})}});Y.4z=Y.4z.1v(n(a,b){B c=u 2f();c.1w=n(){c.1w=1m.2z;9.8B={E:c.E,G:c.G};a(b)}.U(9);c.1t=9.1e+"8A.1s";B d=(u 2f()).1t=9.1e+"7b.1s"});Y.4E=Y.4E.1v(n(a,b){a(b);9.4z()});Y.13=Y.13.1v(n(a,b){m(9.q&&9.q.1O()){9.X.13();9.2r.1x("")}a(b)})})();Y.5G();19.1f("5Y:3P",Y.60.U(Y));',62,752,'|||||||||this|||||||||||||if|function|||view||||new||||options|||var|||width|setStyle|height|px|Element|return|||insert|className|div||border|queue|||bind|lightview|else|controller|Lightview||backgroundColor|Effect|Object|hide||||type|show|document|position|top|next|each|images|observe|href|left|Event|views|visibility|extend|Prototype|setOpacity|menubar|length|afterFinish|bindAsEventListener|png|src|visible|wrap|onload|update|element|radius|buttons|li|title|lv_Button|null|opacity|setPngBackground|getStyle|closeDimensions|side|capitalize|auto|marginLeft|margin|isSet|pixelClone|hidden|sideDimensions|scaledInnerDimensions|_contentPosition|tag|prevnext|innerDimensions|marginTop|rel|Browser|window||_view|duration|indexOf||true|style|slideshow|background|_lightviewLoadedEvent|name|closeButton||body|Image|target|image|isGallery|stopSlideshow|topclose|getDimensions|caption|remove|round|select|display|setNumber|controllerOffset|lv_Corner|prev|break|lightviewContent|iframe|param|emptyFunction|overflow|overlay|BROWSER_IS_WEBKIT_419|dimensions|keyCode|IE|BROWSER_IS_IE_LT7|false|get|Queues|previous|click|case|value|getSurroundingIndexes|data|zIndex|mouseover|id|isImage|class|isSetGallery|after|delay|bounds|replace|center|cyclic|BROWSER_IS_FIREFOX_LT3|viewport|slideshowButton|absolute|currentTarget||lv_Fill||menubarDimensions|navigator|fillMenuBar|imgWidth|large|normal|controllerCenter|nextButton|ButtonImage|prevButton|ns_vml|controllerMiddle|findElement|sliding|children|padding|scope|inner|Button|object|cursor|loading|call|startsWith|canvas|ul|repeat|area|9500px|staticGallery|content|invoke|sideNegativeMargin|_title|resize|inlineContent|bottom|toFixed|floor|View|controllerSlideshow|loaded|url|restoreCenter|push|match|flash|inlineMarker|_each|innerPreviousNext|mouseout|arguments|quicktime|lightviewError|blockInnerPrevNext|scroll|overlappingRestore|evaluate|sideEffect|tagName|imgNumber|action|Extend|sideButtons|try|detectPlugin|catch|ajax|gallery|lv_ButtonWrapper|finalWidth|getSet|FIX_OVERLAY_WITH_PNG|isIframe|from|scrollbarWidth|afterShow|contentDimensions|lv_controllerCornerWrapper|fixed|toLowerCase|clearContent|Plugin|isQuicktime|parseInt|ddE|Template|buildController|RegExp|isPreloading|getViewportDimensions|minimum|build|topcloseButtonImage|afterEffect|no|init|parseFloat|hdiff|wdiff|keyboardEvent|sideStyle|nextButtonImage|preloadedDimensions|prevButtonImage|inline|stopLoading|userAgent|insertContent|resizeCenter|isMedia|stop|innerPrevNext|onComplete||outerHTML|resizeWithinViewport|Appear|toggleSideButton|autosize|set|to|test|switch|WebKit|getHiddenDimensions|insertImageUsingHTML|startLoading|substr|clone|embed|1px|keyboard|wmode|pluginspages|pluginspage|createHTML|restore|styles|isExternal|delete|isAjax|getViews|effects|end|getInnerDimensions|_resize|require|restoreInlineContent|convertVersionString|disableKeyboardNavigation|toggleTopClose|hidePrevNext|_afterResize|resizing|corrected|load|closeButtonWidth|total|_controllerCenterEffect|documentMode|disabled|small|down|loadingEffect|getHeight|float|default|maxOverlay|getContext|lightview_hide|menubarPadding|slideTimer|toggleSlideshow|dom|createCorner|start|counter|fire|charAt|gif|centerControllerIELT7|offset|getOverlappingElements|preventingOverlap|safety|innerController|dataText|member|preloadImageDimensions|sizingMethod|detectType|html|plugins|QuickTime|relType|ajaxOptions|lv_controllerBetweenCorners|lv_controllerMiddle|lv_Wrapper|getScrollOffsets|controls|_controllerHeight|Firefox|loop|mimetypes|Tween|transition|controllerHeight|overflowX|overflowY|Math|15px|Opacity|sync|flashvars|Scriptaculous|cancel|showPrevNext|tween|hideData|scrolling|prepare|setNumberTemplate|fullscreen|find|SetControllerVisible|inner_slideshow_stop|namespaces|pointer|in|close_|setCloseButtons|setMenubarDimensions|join|Fade|setPrevNext|insertImageUsingCanvas|keys|Stop|parentNode|frames|preloadSurroundingImages|afterHide|showOverlapping|adjustDimensionsToView|100|VML|startSlideshow|controller_slideshow_stop|appear|controller_slideshow_play|_controllerOffset|insertImageUsingVML|addClassName|isInline|writeAttribute|pluck|addObservers|finishShow|delegateClose|tr|tl|_lightviewLoadedEvents|showContent|extendSet|curry|hover|nextSlide|isNumber|_VMLPreloaded|documentElement|getWidth|_preloadImageHover|preloadImageHover|_topCloseEffect|Morph|getScrollDimensions|lv_Loading|contentBottom|Top|lv_controllerClose|inner_slideshow_play|lightview_side|9500|fillRect|Bottom|isElement|for|getBounds|guard|enableKeyboardNavigation|getOuterDimensions|keyboardDown|keydown|lv_overlay|isString|lv_Close|KEY_ESC|overlayClose|clearfix|preloadFromSet|img|setPreloadedDimensions|container|contentTop|align|_inlineDisplayRestore|autoplay|domain|detectExtension|input|mleft|lv_WrapDown|mtop|ShockwaveFlash|removeTitles|lv_Filler|lv_CornerWrapper|split|scale|external|media|REQUIRED_|handleClick|handleMouseOver|elementIE8|lv_Half|hasClassNameIE8|handleMouseOverIE8|lv_Frame|lv_topButtons|_|topButtons|hideContent|marginRight|controller_prev|controllerButtonDimensions|999|_fixateController|nextSide|lineHeight|prevSide|hideOverlapping|tofit|180|borderColor|lv_Data|undefined|codebase|codebases|classid|lv_PrevButton|classids|lv_NextButton|beforeStart|errors|requiresPlugin|quality|high|movie|allowFullScreen|startDimensions|_openEffect|scaledI|nnerDimensions|lv_DataText|mac|FlashVars|lv_Title|plugin|required|clearTimeout|MSIE|defer|ancestors|Slideshow|slideshowDelay|updateViews|transparent|lv_Caption|block|clientWidth|clientHeight|Version|lv_innerController|inner_|close|innerHTML|createStyleSheet|Gecko|defaultOptions|lv_ImgNumber|relative|lv_NextSide|lv_innerPrevNext|innerPrevButton|none|scrollLeft|cssText|preloadHover|inner_prev|innerNextButton|inner_next|lightview_topCloseEffect|topCloseEffect|behavior|isFlash|lv_Slideshow|https|enablejavascript|max|throw|lv_contentBottom|lv_topcloseButtonImage|limit|topcloseButton|cornerCanvas|fillStyle|arc|PI|fill|loadingButton|roundrect|fillcolor|strokeWeight|strokeColor|arcSize|min|querySelectorAll|alt|galleryimg|lv_Frames|requires|lv_FrameBottom|cloneNode|lv_FrameTop|lv_content|stopObserving|String|fromCharCode|drawImage|lv_Liquid|lv_PrevNext|blank|exec|KEY_HOME|first|KEY_END|last|createElement|lv_HalfLeft|isArray|js|uniq|script|REQUIRED_Prototype|resizeDuration|addMethods|lv_HalfRight|filter|progid|DXImageTransform|Microsoft|AlphaImageLoader|Ajax|typeExtensions|Updater|gsub|callee|base|basefont|col|frame|hr|lv_Center|link|isindex|meta|range|spacer|wbr|blur|paddingRight|ActiveXObject|Shockwave|Flash|frameBorder|paddingBottom|Class|create|initialize|Parallel|setAttribute|getAttribute|hspace|150|include|lightviewContent_|lv_WrapUp|zA|random|99999|opened|is|titleSplit|strip||eval|REQUIRED_Scriptaculous|typeof|lv_WrapCenter|times||add|error|radio|nodeType|Node|TEXT_NODE|before|lv_contentTop|urn|lightviewController|marginBottom|controllerTop|lv_controllerTop|imgNumberTemplate|lv_controllerCornerWrapperTopLeft|lv_MenuBar|lv_controllerCornerWrapperTopRight|lv_Container|all|lv_controllerCenter|lv_controllerSetNumber|schemas|lv_controllerPrev|controllerPrev|microsoft|lv_controllerNext|controllerNext|controller_next|lv_controllerSlideshow|controllerClose|controller_close|controllerBottom|lv_controllerBottom|lv_controllerCornerWrapperBottomLeft|lv_controllerCornerWrapperBottomRight|lv_Sides|com|vml|childElements|paddingLeft|up|lv_PrevSide'.split('|'),0,{}));
