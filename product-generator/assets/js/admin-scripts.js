;(function ($, m) {
  ("use strict");
  var slice = Array.prototype.slice,
    toString = Object.prototype.toString,
    toArray = function(a) {
      return slice.call(a);
    },
    tail = function(a) {
      return slice.call(a, 1);
    };
  // return the arity of function
  function functionLength(fun) {
    return fun._length || fun.length;
  }
  // return the name of function
  function functionName(fun) {
    return fun._name || fun.name;
  }
  //
  function getInstance(self, ctor) {
    return self instanceof ctor ? self : Object.create(ctor.prototype);
  }
  //
  function bind(fun) {
    function curriedBind(context) {
      var args = slice.call(arguments, 1),
        g = fun.bind.apply(fun, [context].concat(args));

      g._name = functionName(fun);
      g._length = Math.max(functionLength(fun) - args.length, 0);

      return g;
    }
    return arguments.length > 1 ? curriedBind.apply(this, slice.call(arguments, 1)) : curriedBind;
  }
  // fn, [value] -> fn
  //-- create a curried function, incorporating any number of
  //-- pre-existing arguments (e.g. if you're further currying a function).
  var createFn = function(fn, args, totalArity) {
    var remainingArity = totalArity - args.length;
    switch (remainingArity) {
      case 0:
        return function() {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 1:
        return function(a) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 2:
        return function(a, b) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 3:
        return function(a, b, c) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 4:
        return function(a, b, c, d) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 5:
        return function(a, b, c, d, e) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 6:
        return function(a, b, c, d, e, f) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 7:
        return function(a, b, c, d, e, f, g) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 8:
        return function(a, b, c, d, e, f, g, h) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 9:
        return function(a, b, c, d, e, f, g, h, i) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      case 10:
        return function(a, b, c, d, e, f, g, h, i, j) {
          return processInvocation(fn, concatArgs(args, arguments), totalArity);
        };
      default:
        return createEvalFn(fn, args, remainingArity);
    }
  };
  // [value], arguments -> [value]
  //-- concat new arguments onto old arguments array
  function concatArgs(args1, args2) {
    return args1.concat(toArray(args2));
  }
  // fn, [value], int -> fn
  //-- create a function of the correct arity by the use of eval,
  //-- so that curry can handle functions of any arity
  function createEvalFn(fn, args, arity) {
    var argList = makeArgList(arity);
    //-- hack for IE's faulty eval parsing -- http://stackoverflow.com/a/6807726
    var fnStr = "false||" + "function(" + argList + "){ return processInvocation(fn, concatArgs(args, arguments), arity); }";
    return eval(fnStr);
  }
  function makeArgList(len) {
    var a = [];
    for (var i = 0; i < len; i += 1) a.push("a" + i.toString());
    return a.join(",");
  }
  function trimArrLength(arr, length) {
    if (arr.length > length) return arr.slice(0, length);
    else return arr;
  }
  // fn, [value] -> value
  //-- handle a function being invoked.
  //-- if the arg list is long enough, the function will be called
  //-- otherwise, a new curried version is created.
  function processInvocation(fn, argsArr, totalArity) {
    argsArr = trimArrLength(argsArr, totalArity);

    if (argsArr.length === totalArity) return fn.apply(null, argsArr);
    return createFn(fn, argsArr, totalArity);
  }
  // fn -> fn
  //-- curries a function! <3
  function curry(fn) {
    return createFn(fn, [], fn.length);
  }
  // num, fn -> fn
  //-- curries a function to a certain arity! <33
  curry.to = curry(function(arity, fn) {
    return createFn(fn, [], arity);
  });
  // num, fn -> fn
  //-- adapts a function in the context-first style
  //-- to a curried version. <3333
  curry.adaptTo = curry(function(num, fn) {
    return curry.to(num, function(context) {
      var args = tail(arguments).concat(context);
      return fn.apply(this, args);
    });
  });
  // fn -> fn
  //-- adapts a function in the context-first style to
  //-- a curried version. <333
  curry.adapt = function(fn) {
    return curry.adaptTo(fn.length, fn);
  };
  // helpers
  function type(x) {
    return toString.call(x).slice(8, -1);
  }
  function isTypeRaw(tp, v) {
    return type(v) === tp;
  }
  isTypeRaw._name = "isType";
  var isType = curry(isTypeRaw);
  function singletonRaw(k, v) {
    const obj = {};
    obj[k] = v;
    return obj;
  }
  var singleton = curry(singletonRaw);
  function extendRaw(original, update) {
    function rec(a, b) {
      var k;
      for (k in b) {
        a[k] = b[k];
      }
      return a;
    }
    return rec(rec({}, original), update);
  }
  var extend = curry(extendRaw);
  // combinatoric
  // return its argument
  function identity(x) {
    return x;
  }
  // take 2 arguments but return the first one
  var constant = curry.to(2, identity);
  // composition
  function composeRaw(f, g, x) {
    return f(g(x));
  }
  composeRaw._name = "compose";
  var compose = curry(composeRaw);
  function propertyRaw(key, obj) {
    return obj[key];
  }
  var property = curry(propertyRaw);
  property._name = "property";
  function flipRaw(fun, a, b) {
    return fun(b, a);
  }
  var flip = curry(flipRaw);
  // type
  var isString = isType("String"),
    isNumber = isType("Number"),
    isBoolean = isType("Boolean"),
    isFunction = isType("Function");
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
  }
  var isArray = Array.isArray || isType("Array");
  var mapConstrToFn = function(group, constr) {
    return constr === String ? isString : constr === Number ? isNumber : constr === Boolean ? isBoolean : constr === Object ? isObject : constr === Array ? isArray : constr === Function ? isFunction : constr === undefined ? group : constr;
  };
  var numToStr = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
  var validate = function(group, validators, name, args) {
    var validator, v, i;
    if (args.length > validators.length) {
      throw new TypeError("too many arguments supplied to constructor " + name + " (expected " + validators.length + " but got " + args.length + ")");
    }
    for (i = 0; i < args.length; ++i) {
      v = args[i];
      validator = mapConstrToFn(group, validators[i]);
      if (Type.check === true && (validator.prototype === undefined || !validator.prototype.isPrototypeOf(v)) && (typeof validator !== "function" || !validator(v))) {
        var strVal = typeof v === "string" ? "'" + v + "'" : v;
        throw new TypeError("bad value " + strVal + " passed as " + numToStr[i] + " argument to constructor " + name);
      }
    }
  };
  function valueToArray(value) {
    var i,
      arr = [];
    for (i = 0; i < value._keys.length; ++i) {
      arr.push(value[value._keys[i]]);
    }
    return arr;
  }
  function extractValues(keys, obj) {
    var arr = [],
      i;
    for (i = 0; i < keys.length; ++i) {
      arr[i] = obj[keys[i]];
    }
    return arr;
  }
  function constructor(group, name, fields) {
    var validators,
      keys = Object.keys(fields),
      i;
    if (isArray(fields)) {
      validators = fields;
    } else {
      validators = extractValues(keys, fields);
    }
    function construct() {
      var val = Object.create(group.prototype),
        i;
      val._keys = keys;
      val._name = name;
      if (Type.check === true) {
        validate(group, validators, name, arguments);
      }
      for (i = 0; i < arguments.length; ++i) {
        val[keys[i]] = arguments[i];
      }
      return val;
    }
    group[name] = curry.to(keys.length, construct);
    if (keys !== undefined) {
      group[name + "Of"] = function(obj) {
        return construct.apply(undefined, extractValues(keys, obj));
      };
    }
  }
  function rawCase(type, cases, value, arg) {
    var wildcard = false;
    var handler = cases[value._name];
    if (handler === undefined) {
      handler = cases["_"];
      wildcard = true;
    }
    if (Type.check === true) {
      if (!type.prototype.isPrototypeOf(value)) {
        throw new TypeError("wrong type passed to case");
      } else if (handler === undefined) {
        throw new Error("non-exhaustive patterns in a function");
      }
    }
    var args = wildcard === true ? [arg] : arg !== undefined ? valueToArray(value).concat(
              [arg]
            ) : valueToArray(value);
    return handler.apply(undefined, args);
  }
  var typeCase = curry.to(3, rawCase);
  var caseOn = curry.to(4, rawCase);
  function createIterator() {
    return { idx: 0, val: this, next: function() {
        var keys = this.val._keys;
        return this.idx === keys.length ? { done: true } : { value: this.val[keys[this.idx++]] };
      } };
  }
  function Type(desc) {
    var key,
      res,
      obj = {};
    obj.case = typeCase(obj);
    obj.caseOn = caseOn(obj);

    obj.prototype = {};
    obj.prototype[Symbol ? Symbol.iterator : "@@iterator"] = createIterator;
    obj.prototype.case = function(cases) {
      return obj.case(cases, this);
    };
    obj.prototype.caseOn = function(cases) {
      return obj.caseOn(cases, this);
    };

    for (key in desc) {
      res = constructor(obj, key, desc[key]);
    }
    return obj;
  }
  Type.check = true;
  // Store
  var Store = (function() {
    function extract(store) {
      return function extractor() {
        return store.set(store.get());
      };
    }
    function extend(store) {
      return function extender(fun) {
        function setter(k) {
          return fun(Store(
              store.set,
              function() {
                return k;
              }
            ));
        }
        return Store(setter, store.get);
      };
    }
    function map(store) {
      return function mapper(fun) {
        return store.extend(function(c) {
          return fun(store.get());
        });
      };
    }
    function over(store) {
      return function overer(fun) {
        return store.set(fun(store.get()));
      };
    }
    function Store(set, get) {
      // initialize as POJO
      var obj = {};
      // add the methods
      obj.set = set;
      obj.get = get;
      obj.extract = extract(obj);
      obj.extend = extend(obj);
      obj.map = map(obj);
      obj.over = over(obj);
      obj._name = "Store";

      return obj;
    }
    return curry(Store);
  })();
  // Either
  var Either = (function() {
    var Either = Type({
      Left: [constant(true)],
      Right: [constant(true)]
    });
    Either.either = curry(either);
    function either(onLeft, onRight, either) {
      return Either.case({ Left: onLeft, Right: onRight }, either);
    }
    Either.isLeft = Either.either(constant(true), constant(false));
    Either.isRight = Either.either(constant(false), constant(true));
    Either.prototype.map = map;
    function map(fn) {
      return Either.case({ Left: Either.Left, Right: compose( Either.Right, fn ) }, this);
    }
    Either.prototype.chain = chain;
    function chain(fun) {
      return Either.case({ Left: Either.Left, Right: fun }, this);
    }
    Either.prototype.ap = ap;
    function ap(b) {
      return Either.case({ Left: Either.Left, Right: function(a) {
            b.map(a);
          } }, this);
    }
    const bimap = curry(rawBimap);
    Either.prototype.bimap = function(f, g) {
      return g !== undefined ? bimap(this, f, g) : bimap(this, f);
    };
    function rawBimap(value, f, g) {
      return Either.case({ Left: f, Right: g }, value);
    }
    return Either;
  })();
  // Maybe
  var Maybe = (function() {
    var Maybe = Type({
      Nothing: [],
      Just: [constant(true)]
    });
    Maybe.of = Maybe.Just;
    Maybe.maybe = curry(maybeFun);
    function maybeFun(def, fun, maybe) {
      return Maybe.case({ Nothing: function() {
            return def;
          }, Just: fun }, maybe);
    }
    Maybe.prototype.map = map;
    function map(fn) {
      return Maybe.case({ Nothing: Maybe.Nothing, Just: compose( Maybe.Just, fn ) }, this);
    }
    Maybe.prototype.chain = chain;
    function chain(fun) {
      return Maybe.case({ Nothing: Maybe.Nothing, Just: fun }, this);
    }
    Maybe.prototype.ap = ap;
    function ap(b) {
      return Maybe.case({ Nothing: Maybe.Nothing, Just: function(a) {
            b.map(a);
          } }, this);
    }
    return Maybe;
  })();

  // lenses, based on http://hackage.haskell.org/package/lens
  var Lens = (function() {
    function composer(lens) {
      return function composeIt(b) {
        return Lens(function(target) {
          var c = b.run(target),
            d = lens.run(c.get());
          return Store(compose( c.set, d.set ), d.get);
        });
      };
    }
    function andThen(lens) {
      return function then(b) {
        return b.compose(lens);
      };
    }
    function Lens(run) {
      var obj = {};
      // constructor
      obj.run = run;
      obj.compose = composer(obj);
      obj.andThen = andThen(obj);

      return obj;
    }
    Lens.id = id;
    function id() {
      return Lens(function(target) {
        return Store(identity, function() {
          return target;
        });
      });
    }
    Lens.object = objectLens;
    function objectLens(property) {
      function runner(object) {
        return Store(function(s) {
            return extend(object, singleton(property, s));
          }, function() {
            return object[property];
          });
      }
      return Lens(runner);
    }
    Lens.array = arrayLens;
    function arrayLens(index) {
      function runner(arr) {
        return Store(function(s) {
            var copy = arr.concat();
            copy[index] = s;
            return copy;
          }, function() {
            return arr[index];
          });
      }
      return Lens(runner);
    }
    return Lens;
  })();

  function reduceStream(f, acc, s) {
    var current = m.prop.combine(
      function(s) {
        acc = f(current() || acc, s());
        return acc;
      },
      [s]
    );
    return current;
  }
  function component(Comp) {
    var vnode = {};
    vnode.oninit = function(v) {
      v.state.onupdate = m.prop();
      v.state.view = Comp(v);
    };
    vnode.view = function(v) {
      return v.state.view();
    };
    vnode.onupdate = function(vnode) {
      return vnode.state.onupdate(vnode);
    };
    vnode.onbeforeupdate = function(vnode, old) {
      return old.instance != vnode.state.view();
    };
    return vnode;
  }
  function relaxedNumber(v) {
    if (v.length === 0) {
      return false;
    }
    var num = Number(v);
    if (!isNumber(num) || (!window.isFinite(num) && window.isNaN(parseFloat(num)))) {
      return false;
    }
    return true;
  }
  var Model = Type({
    Option: {
      title: String,
      description: String,
      sideNote: String,
      imageId: relaxedNumber,
      imageUrl: String,
      imageNoteId: relaxedNumber,
      imageNoteUrl: String,
      id: relaxedNumber,
      childs: Array
    },
    Child: {
      title: String,
      description: String,
      sideNote: String,
      imageId: relaxedNumber,
      imageUrl: String,
      imageNoteId: relaxedNumber,
      imageNoteUrl: String,
      id: relaxedNumber,
      disclaimer: String,
      partNumber: String,
      multiple: relaxedNumber,
      force: relaxedNumber,
      require: relaxedNumber,
      color: String,
      childs: Array
    }
  });

  function MainApp(vnode) {
    var properties = "title description sideNote imageId imageUrl imageNoteId imageNoteUrl id disclaimer partNumber multiple force require color childs open step logicDisplay logicType logicRules",
      objectLens = properties
        .split(" ")
        .reduce(function(pre, cur) {
          pre[cur] = Lens.object(cur);
          return pre;
        }, {});

    function setImageLens(object) {
      return Store(function(attachment) {
          let ob = extend(object, {
            imageId: attachment.id,
            imageUrl: attachment.url
          });

          return ob;
        }, function() {
          var obj = {};
          return { imageId: object.imageId, imageUrl: object.imageUrl };
        });
    }

    // Lens - set imageNote
    function setImageNoteLens(object) {
      return Store(function(attachment) {
          let ob = extend(object, {
            imageNoteId: attachment.id,
            imageNoteUrl: attachment.url
          });

          return ob;
        }, function() {
          var obj = {};
          return { imageNoteId: object.imageNoteId, imageNoteUrl: object.imageNoteUrl };
        });
    }

    var actions = m.prop();
    var model = reduceStream(update, [], actions);
    function update(options, action) {
      var store;
      switch (action.type) {
        case "AddOption":
          var newOptions = options.slice();
          newOptions.push(action.option);
          return newOptions;
        case "RemoveOption":
          return options.filter(function(
            option
          ) {
            return (
              action.option.id !== option.id
            );
          });
        case "AddChild":
          store = action.store.run(options);
          return store.over(function(
            childs
          ) {
            var copy = childs.slice();
            copy.push(action.child);
            return copy;
          });
        case "RemoveChild":
          store = action.store.run(options);
          return store.over(function(
            childs
          ) {
            return childs.filter(function(
              child
            ) {
              return (
                child.id !== action.child.id
              );
            });
          });
        case "UpdateAttr":
        case "UpdateAttrColor":
          store = action.store.run(options);
          return store.set(action.event.target.value);
        case "ClearAttrColor":
          store = action.store.run(options);
          return store.set("");
        case "InputChecked":
          store = action.store.run(options);
          return store.set(action.checked ? 1 : 0);

        case "ForceChoose":
          store = action.store.run(options);
          return store.set(action.checked ? 1 : 0);

        case "RequireChoose":
          store = action.store.run(options);
          return store.set(action.checked ? 1 : 0);

        case "ToggleContent":
          store = action.store.run(options);
          return store.over(function(open) {
            return !open;
          });
        case "SetImage":
          store = action.store.run(options);
          return store.set(action.attachment);
        default:
          return options;
      }
    }
    function stopPropagation(e) {
      e.stopPropagation();
      e.preventDefault();
    }
    function AddOption(options) {
      return function addOp(event) {
        event.preventDefault();
        $.ajax({
          data: {
            post_id: $("#post_ID").val(),
            order: options.map(
              property("id")
            ),
            action:
              "prgen_ajax_save_product_option",
            nonce:
              prgenAdminParams.save_product_option_nonce
          },
          type: "POST",
          url: ajaxurl,
          success: function(res) {
            if (!res.success) {
              return;
            }
            var option = { title: "", description: "", sideNote: "", imageId: 0, imageUrl: "", imageId: 0, imageUrl: "", id: res.data.id, disclaimer: "", partNumber: "", multiple: 0, force: 0, require: 0, color: "", childs: [] };
            actions({
              type: "AddOption",
              option: option,
              res: res.data
            });
            m.redraw();
          },
          error: function(res) {
            alert("error");
          }
        });
        actions({
          type: "Noop",
          event: event
        });
      };
    }
    function RemoveOption(option) {
      return function remove(event) {
        event.preventDefault();
        var ok = confirm("Permanent Delete");
        if (ok) {
          $.ajax({
            data: {
              action:
                "prgen_ajax_delete_product_option",
              post_id: option.id,
              nonce:
                prgenAdminParams.delete_product_option_nonce
            },
            type: "post",
            dataType: "json",
            async: true,
            url: ajaxurl,
            success: function(res) {
              if (!res.success) return;
              actions({
                type: "RemoveOption",
                option: option,
                event: event
              });
              m.redraw();
            }
          });
        }
        actions({
          type: "Noop",
          event: event
        });
      };
    }
    function AddChild(option, parentStore) {
      return function(event) {
        event.preventDefault();
        $.ajax({
          data: {
            action:
              "prgen_ajax_save_product_option",
            post_id: option.id,
            order: option.childs.map(
              property("id")
            ),
            nonce:
              prgenAdminParams.save_product_option_nonce
          },
          type: "POST",
          url: ajaxurl,
          success: function(res) {
            if (!res.success) {
              return;
            }
            var child = { title: "", description: "", sideNote: "", imageId: 0, imageUrl: "", imageNoteId: 0, imageNoteUrl: "", id: res.data.id, disclaimer: "", partNumber: "", multiple: 0, force: 0, require: 0, color: "", logicDisplay: "hide", logicType: "any", logicRules: "", childs: [] };
            actions({
              type: "AddChild",
              store: parentStore,
              child: child,
              event: event
            });
            m.redraw();
            // make it sortable
            childSortable();
          },
          error: function(res) {
            alert("error");
          }
        });
        actions({
          type: "Noop",
          event: event
        });
      };
    }
    function RemoveChild(child, parentStore) {
      return function(event) {
        event.preventDefault();
        var ok = confirm("Permanent Delete");
        if (ok) {
          $.ajax({
            data: {
              action:
                "prgen_ajax_delete_product_option",
              post_id: child.id,
              nonce:
                prgenAdminParams.delete_product_option_nonce
            },
            type: "post",
            dataType: "json",
            async: true,
            url: ajaxurl,
            success: function(res) {
              if (!res.success) return;
              actions({
                type: "RemoveChild",
                store: parentStore,
                child: child,
                event: event
              });
              m.redraw();
            },
            error: function() {
              console.log("error");
            }
          });
        }
        actions({
          type: "Noop",
          event: event
        });
      };
    }
    function UpdateAttr(prop, parentStore) {
      return function(event) {
        var store = parentStore.andThen(objectLens[prop]);
        actions({
          type: "UpdateAttr",
          event: event,
          store: store
        });
      };
    }
    function UpdateAttrColor(prop, parentStore) {
      return function(event) {
        requestAnimationFrame(function() {
          var store = parentStore.andThen(objectLens[prop]);
          actions({
            type: "UpdateAttrColor",
            event: event,
            store: store
          });
        });
      };
    }
    function ClearAttrColor(prop, parentStore) {
      return function(event) {
        requestAnimationFrame(function() {
          var store = parentStore.andThen(objectLens[prop]);
          actions({
            type: "ClearAttrColor",
            event: event,
            store: store
          });
        });
      };
    }
    function InputChecked(prop, parentStore) {
      return function(event) {
        event.preventDefault();

        var store = parentStore.andThen(objectLens[prop]);
        actions({
          type: "InputChecked",
          checked: event.target.checked,
          store: store
        });

      };
    }

    //tambahan
    function ForceChoose(prop, parentStore)
    {
        return function(event)
        {
          event.preventDefault();
          var store = parentStore.andThen(objectLens[prop]);
          actions({
            type: "ForceChoose",
            checked: event.target.checked,
            store: store
          });
        }
    }

    function RequireChoose(prop, parentStore)
    {
        return function(event)
        {
          event.preventDefault();

          var store = parentStore.andThen(objectLens[prop]);
          actions({
            type: "RequireChoose",
            checked: event.target.checked,
            store: store
          });
        }
    }

    function ToggleContent(parentStore) {
      return function(event) {
        event.preventDefault();
        var store = parentStore.andThen(objectLens["open"]);
        actions({
          type: "ToggleContent",
          event: event,
          store: store
        });
      };
    }

    function SetImage(parentStore) {
      return function(event) {
        event.preventDefault();
        var store = parentStore.andThen(Lens(setImageLens));
        var uploader = wp
          .media({
            title: "Please set the picture",
            button: {
              text: "Select picture(s)"
            },
            multiple: false
          })
          .on("select", function() {
            var selection = uploader
              .state()
              .get("selection");
            selection.map(function(
              attachment
            ) {
              attachment = attachment.toJSON();
              actions({
                type: "SetImage",
                store: store,
                event: event,
                attachment: attachment
              });
            });
            // not mithril event, so redraw it
            m.redraw();
          })
          .open();
        actions({
          type: "DoNothing",
          event: event
        });
      };
    }

    // new image note function
    function SetImageNote(parentStore) {
      return function(event) {
        event.preventDefault();
        var store = parentStore.andThen(Lens(setImageNoteLens));
        var uploader = wp
          .media({
            title: "Please set the picture",
            button: {
              text: "Select picture(s)"
            },
            multiple: false
          })
          .on("select", function() {
            var selection = uploader
              .state()
              .get("selection");
            selection.map(function(
              attachment
            ) {
              attachment = attachment.toJSON();
              actions({
                type: "SetImage",
                store: store,
                event: event,
                attachment: attachment
              });
            });
            // not mithril event, so redraw it
            m.redraw();
          })
          .open();
        actions({
          type: "DoNothing",
          event: event
        });
      };
    }
    function RemoveImage(parentStore) {
      return function(event) {
        event.preventDefault();
        var store = parentStore.andThen(Lens(setImageLens));
        actions({
          type: "SetImage",
          store: store,
          event: event,
          attachment: {
            id: 0,
            url: ""
          }
        });
      };
    }
    function RemoveImageNote(parentStore) {
      return function(event) {
        event.preventDefault();
        var store = parentStore.andThen(Lens(setImageNoteLens));
        actions({
          type: "SetImage",
          store: store,
          event: event,
          attachment: {
            id: 0,
            url: ""
          }
        });
      };
    }
    function ShowModal(option) {
      return function show(event) {
        event.preventDefault();
        $("#mithril-modal-" + option.id).modal("show");
        if ($("#mithril-modal-" + option.id).width() > 768) {
          $("#mithril-modal-" + option.id)
            .find(".modal-wide-auto")
            .css("width", "80%");
          $("#mithril-modal-" + option.id)
            .find(".modal-wide-auto")
            .css("margin-left", "170px");
        } else {
          $("#mithril-modal-" + option.id)
            .find(".modal-wide-auto")
            .css("width", "600px");
        }
        return actions({
          type: "Noop",
          option: option,
          event: event
        });
      };
    }

    function BindColorPicker(prop, store, vnode) {
      if (vnode.state.color_mounted == undefined) {
        $(vnode.dom).wpColorPicker({
          change: UpdateAttrColor(
            prop,
            store
          ),
          clear: ClearAttrColor(prop, store)
        });
      }
      vnode.state.color_mounted = true;
    }

    function childModalView(id, parentStore) {
      return function modalContent(child, index) {

        var store = parentStore.andThen(Lens.array(index));

        return m(
          "div",
          {
            className:
              "ui-sortable-handle product-generator-option prgen-metabox " +
              (child.open
                ? "open"
                : "closed"),
            id: child.id
          },
          [
            m(
              "h3",
              {
                onclick: ToggleContent(
                  store
                )
              },
              [
                m(
                  "a",
                  {
                    className:
                      "remove-product-option delete",
                    onclick: RemoveChild(
                      child,
                      parentStore
                    )
                  },
                  "Remove"
                ),
                m(
                  "div",
                  {
                    className: "handlediv"
                  },
                  []
                ),
                m(
                  "div",
                  {
                    className: "Tips sort"
                  },
                  []
                ),
                m(
                  "strong",
                  "#" +
                    child.id +
                    " - " +
                    child.title +
                    " "
                ),
                m("input", {
                  type: "hidden",
                  value: child.id,
                  name:
                    "prgen_top_op[op][" +
                    id +
                    "][ID][]"
                })
              ]
            ),
            m(
              "div",
              {
                className:
                  "product-generator-option-content pgen-metabox-content"
              },
              [
                m(
                  "div",
                  { className: "data" },
                  [
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-first upload_image"
                      },
                      [
                        m(
                          "a",
                          {
                            className:
                              "upload_image_button tips" +
                              (child.imageUrl &&
                              child.imageId
                                ? " remove"
                                : ""),
                            onclick:
                              child.imageUrl &&
                              child.imageId
                                ? RemoveImage(
                                    store
                                  )
                                : SetImage(
                                    store
                                  )
                          },
                          [
                            m("input", {
                              type:
                                "hidden",
                              name:
                                "prgen_top_op[op][" +
                                id +
                                "][img][]",
                              value:
                                child.imageId
                            }),
                            child.imageUrl &&
                            child.imageId
                              ? m(
                                  "img",
                                  {
                                    width:
                                      "150",
                                    height:
                                      "150",
                                    src:
                                      child.imageUrl
                                  },
                                  ""
                                )
                              : m("span")
                          ]
                        ),
                        m("input", {
                          type: "text",
                          id:
                            "prgen-option-color-" +
                            child.id,
                          value:
                            child.color,
                          className:
                            "color-field",
                          name:
                            "prgen_top_op[op][" +
                            id +
                            "][color][]",
                          oncreate: BindColorPicker.bind(
                            null,
                            "color",
                            store
                          )
                        })
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-field form-row form-row-last option_title"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prgen-option-title-" +
                              child.id
                          },
                          "Title"
                        ),
                        m("input", {
                          oninput: UpdateAttr(
                            "title",
                            store
                          ),
                          type: "text",
                          id:
                            "prgen-option-title-" +
                            child.id,
                          value:
                            child.title,
                          name:
                            "prgen_top_op[op][" +
                            id +
                            "][name][]"
                        })
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-full options"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prgen-option-desc-" +
                              child.id
                          },
                          "Description"
                        ),
                        m("textarea", {
                          oninput: UpdateAttr(
                            "description",
                            store
                          ),
                          id:
                            "prgen-option-desc-" +
                            child.id,
                          value:
                            child.description,
                          name:
                            "prgen_top_op[op][" +
                            id +
                            "][desc][]"
                        })
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-first"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prgen-option-disclaimer-" +
                              child.id
                          },
                          "Disclaimer"
                        ),
                        m("textarea", {
                          oninput: UpdateAttr(
                            "disclaimer",
                            store
                          ),
                          id:
                            "prgen-option-disclaimer-" +
                            child.id,
                          value:
                            child.disclaimer,
                          name:
                            "prgen_top_op[op][" +
                            id +
                            "][disclaimer][]"
                        })
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-last"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prgen-option-part-number-" +
                              child.id
                          },
                          "Part Number 1"
                        ),
                        m("input", {
                          oninput: UpdateAttr(
                            "partNumber",
                            store
                          ),
                          type: "text",
                          className:
                            "short",
                          id:
                            "prgen-option-part-number-" +
                            child.id,
                          value:
                            child.partNumber,
                          name:
                            "prgen_top_op[op][" +
                            id +
                            "][part_number][]"
                        })
                      ]
                    ),
                    // side-note
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-first upload_image"
                      },
                      [
                        m(
                          "a",
                          {
                            className:
                              "upload_image_button tips" +
                              (child.imageNoteUrl &&
                              child.imageNoteId
                                ? " on_remove"
                                : ""),
                            onclick:
                              child.imageNoteUrl &&
                              child.imageNoteId
                                ? RemoveImageNote(
                                    store
                                  )
                                : SetImageNote(
                                    store
                                  )
                          },
                          [
                            m("input", {
                              type:
                                "hidden",
                              name:
                                "prgen_top_op[op][" +
                                id +
                                "][img_note][]",
                              value:
                                child.imageNoteId
                            }),
                            child.imageNoteUrl &&
                            child.imageNoteId
                              ? m(
                                  "img",
                                  {
                                    width:
                                      "150",
                                    height:
                                      "150",
                                    src:
                                      child.imageNoteUrl
                                  },
                                  ""
                                )
                              : m("span")
                          ]
                        )
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-field form-row form-row-last option_title"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prgen-option-side-note-" +
                              child.id
                          },
                          "Side Note"
                        ),
                        m("input", {
                          oninput: UpdateAttr(
                            "sideNote",
                            store
                          ),
                          type: "text",
                          id:
                            "prgen-option-side-note-" +
                            child.id,
                          value:
                            child.sideNote,
                          name:
                            "prgen_top_op[op][" +
                            id +
                            "][side_note][]"
                        })
                      ]
                    ),
                    // end of side-note
                    m("p", {
                      className: "clearfix"
                    }),
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-have-3 form-row-first"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prgen-option-logic-display-" +
                              child.id
                          },
                          "Action: "
                        ),
                        m(
                          "select",
                          {
                            onselect: UpdateAttr(
                              "logicDisplay",
                              store
                            ),
                            name:
                              "prgen_top_op[op][" +
                              id +
                              "][logic_display][]",
                            id:
                              "prgen-option-logic-display-" +
                              child.id
                          },
                          [
                            m(
                              "option",
                              {
                                value:
                                  "hide",
                                selected:
                                  child.logicDisplay ===
                                  "hide"
                              },
                              "Hide"
                            ),
                            m(
                              "option",
                              {
                                value:
                                  "show",
                                selected:
                                  child.logicDisplay ===
                                  "show"
                              },
                              "Show"
                            )
                          ]
                        )
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-have-3 form-row-second"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prge-option-logic-type-" +
                              child.id
                          },
                          "Logical conditions: "
                        ),
                        m(
                          "select",
                          {
                            onselect: UpdateAttr(
                              "logicType",
                              store
                            ),
                            name:
                              "prgen_top_op[op][" +
                              id +
                              "][logic_type][]",
                            id:
                              "prge-option-logic-type-" +
                              child.id
                          },
                          [
                            m(
                              "option",
                              {
                                value:
                                  "any",
                                selected:
                                  child.logicType ===
                                  "any"
                              },
                              "Any"
                            ),
                            m(
                              "option",
                              {
                                value:
                                  "all",
                                selected:
                                  child.logicType ===
                                  "all"
                              },
                              "All"
                            )
                          ]
                        )
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-have-3 form-row-last"
                      },
                      [
                        m(
                          "label",
                          {
                            for:
                              "prgen-option-logic-rules"
                          },
                          "Applied to: comma separated option ids"
                        ),
                        m("input", {
                          oninput: UpdateAttr(
                            "logicRules",
                            store
                          ),
                          value:
                            child.logicRules,
                          name:
                            "prgen_top_op[op][" +
                            id +
                            "][logic_rules][]",
                          type: "text",
                          className: "short"
                        })
                      ]
                    ),
                    m(
                      "p",
                      {
                        className:
                          "form-row form-row-full"
                      },
                      [
                        m(
                          "a",
                          {
                            className:
                              "button parents",
                            onclick: ShowModal(
                              child
                            )
                          },
                          "Option"
                        )
                      ]
                    )
                  ]
                )
              ]
            )
          ]
        );
      };
    }

    function modalView(parentStore) {
      return function modalBody(option, index) {
        var modelLens = parentStore ? parentStore.andThen(Lens.array(index)) : Lens.array(index);
        var childsLens = modelLens.andThen(objectLens.childs);
        var viewContent = childModalView(option.id, childsLens);
        function modal() {
          return m(
            "div",
            {
              className:
                "modal fade modal-wide",
              id:
                "mithril-modal-" +
                option.id,
              role: "dialog"
            },
            [
              m(
                "div",
                {
                  className:
                    "modal-dialog modal-lg modal-wide-auto"
                },
                [
                  m(
                    "div",
                    {
                      className:
                        "modal-content"
                    },
                    [
                      m(
                        "div",
                        {
                          className:
                            "modal-header"
                        },
                        [
                          m(
                            "button",
                            {
                              type:
                                "button",
                              className:
                                "close",
                              "data-dismiss":
                                "modal"
                            },
                            "x"
                          ),
                          m(
                            "h4",
                            {
                              className:
                                "modal-title"
                            },
                            "Options"
                          )
                        ]
                      ),
                      m(
                        "div",
                        {
                          className:
                            "modal-body"
                        },
                        [
                          m(
                            "div",
                            {
                              className:
                                "prgen-child-options-product-wrapper ui-sortable childs"
                            },
                            option.childs.map(
                              viewContent
                            )
                          ),
                          m("p", [
                            m(
                              "a",
                              {
                                className:
                                  "button",
                                id:
                                  "add-row-modal",
                                onclick: AddChild(
                                  option,
                                  childsLens
                                )
                              },
                              "Add component"
                            )
                          ])
                        ]
                      )
                    ]
                  )
                ]
              )
            ]
          );
        }
        return [modal()].concat(option.childs.map(modalView(childsLens)));
      };
    }

    function optionView(option, index) {
      var store = Lens.array(index);
      // console.log("debug: store");
      // console.log(store);
      // console.log("debug: option");
      // console.log(option);
      // console.log("debug: index");
      // console.log(index);
      return m(
        "div",
        {
          className:
            "ui-sortable-handle product-generator-option prgen-metabox " +
            (option.open
              ? "open"
              : "closed"),
          id: option.id
        },
        [
          m(
            "h3",
            {
              onclick: ToggleContent(store)
            },
            [
              m(
                "a",
                {
                  className:
                    "remove-product-option delete",
                  onclick: RemoveOption(
                    option
                  )
                },
                "Remove"
              ),
              m(
                "div",
                { className: "handlediv" },
                []
              ),
              m(
                "div",
                { className: "Tips sort" },
                []
              ),
              m(
                "strong",
                "#" +
                  option.id +
                  " - " +
                  option.title +
                  " "
              ),
              m("input", {
                type: "hidden",
                value: option.id,
                name: "prgen_top_op[ID][]"
              })
            ]
          ),
          m(
            "div",
            {
              className:
                "product-generator-option-content pgen-metabox-content"
            },
            [
              m(
                "div",
                { className: "data" },
                [
                  m(
                    "p",
                    {
                      className:
                        "form-row form-row-first upload_image"
                    },
                    [
                      m(
                        "a",
                        {
                          className:
                            "upload_image_button tips" +
                            (option.imageUrl &&
                            option.imageId
                              ? " remove"
                              : ""),
                          onclick:
                            option.imageUrl &&
                            option.imageId
                              ? RemoveImage(
                                  store
                                )
                              : SetImage(
                                  store
                                )
                        },
                        [
                          m("input", {
                            type: "hidden",
                            onclick: SetImage(
                              store
                            ),
                            name:
                              "prgen_top_op[img][]",
                            value:
                              option.imageId
                          }),
                          option.imageUrl &&
                          option.imageId
                            ? m(
                                "img",
                                {
                                  width:
                                    "150",
                                  height:
                                    "150",
                                  src:
                                    option.imageUrl
                                },
                                ""
                              )
                            : m("span")
                        ]
                      )
                    ]
                  ),
                  m(
                    "p",
                    {
                      className:
                        "form-field form-row form-row-last option_title"
                    },
                    [
                      m(
                        "label",
                        {
                          for:
                            "prgen-option-title-" +
                            option.id
                        },
                        "Title"
                      ),
                      m("input", {
                        oninput: UpdateAttr(
                          "title",
                          store
                        ),
                        className: "short",
                        type: "text",
                        id:
                          "prgen-option-title-" +
                          option.id,
                        value: option.title,
                        name:
                          "prgen_top_op[name][]"
                      })
                    ]
                  ),
                  m(
                    "p",
                    {
                      className:
                        "form-row form-row-full options"
                    },
                    [
                      m(
                        "label",
                        {
                          for:
                            "prgen-option-desc-" +
                            option.id
                        },
                        "Description"
                      ),
                      m("textarea", {
                        oninput: UpdateAttr(
                          "description",
                          store
                        ),
                        id:
                          "prgen-option-desc-" +
                          option.id,
                        value:
                          option.description,
                        name:
                          "prgen_top_op[desc][]"
                      })
                    ]
                  ),
                  m(
                    "p",
                    {
                      className:
                        "form-row form-row-first"
                    },
                    [
                      m(
                        "label",
                        {
                          for:
                            "prgen-option-disclaimer-" +
                            option.id
                        },
                        "Disclaimer"
                      ),
                      m("textarea", {
                        oninput: UpdateAttr(
                          "disclaimer",
                          store
                        ),
                        id:
                          "prgen-option-disclaimer-" +
                          option.id,
                        value:
                          option.disclaimer,
                        name:
                          "prgen_top_op[disclaimer][]"
                      })
                    ]
                  ),
                  m(
                    "p",
                    {
                      className:
                        "form-field form-row form-row-last"
                    },
                    [
                      m(
                        "label",
                        {
                          for:
                            "prgen-option-part-number-" +
                            option.id
                        },
                        "Part Number"
                      ),
                      m("input", {
                        oninput: UpdateAttr(
                          "partNumber",
                          store
                        ),
                        type: "text",
                        className: "short",
                        id:
                          "prgen-option-part-number-" +
                          option.id,
                        value:
                          option.partNumber,
                        name:
                          "prgen_top_op[part_number][]"
                      })
                    ]
                  ),
                  m(
                    "p",
                    {
                      className:
                        // "form-field form-row form-row-first"
                        "form-field form-row form-row-full"
                    },
                    [
                      m(
                        "label",
                        {
                          for:
                            "prgen-option-multiple-" +
                            option.id
                        },
                        "Multiple Option Select"
                      ),
                      m("input", {
                        onchange:
                          InputChecked(
                            "multiple",
                            store
                          ),
                        type: "checkbox",
                        className: "short",
                        id:
                          "prgen-option-multiple-" +
                          option.id,
                        value: 1,
                        checked:
                          option.multiple ==
                            1 ||
                          option.multiple ==
                            "1",
                        name:
                          "prgen_top_op[multiple_ui][]"
                      }),
                      m("input", {
                        type: "hidden",
                        value:
                          option.multiple,
                        name:
                          "prgen_top_op[multiple][]"
                      }),

                        // ************************************************
                        // =========== require option ===========
                     
                      (option.multiple == 1 || option.multiple == "1") ?
                      //true
                       m(
                          "span",
                          {
                            className: "conteiner-req",
                            id: "container-req-id-" + option.id,
                            style:"margin-left: 2%;"
                          },
                          [
                              m(
                                "label",
                                {
                                  for: "prgen-option-multiple-req-" + option.id,
                                  
                                },
                                "Require 1 Selection from Each Set of Options"
                              ),
                              m("input", {
                                onchange:
                                 RequireChoose(
                                  "require",
                                  store
                                ), 
                                type: "checkbox",
                                className: "short",
                                id: "prgen-option-multiple-req-" + option.id,
                                value: 1,
                                checked: 
                                  option.require == 1 || 
                                  option.require == "1",
                                name:
                                  "prgen_top_op[require_ui][]"
                              }),
                              m("input", {
                                type: "hidden",
                                value:
                                  option.require,
                                name:
                                  "prgen_top_op[require][]"
                              })
                           ]
                        )
                       : 
                       //false
                        m("input", {
                          type: "hidden",
                          value:
                            option.require,
                          name:
                            "prgen_top_op[require][]"
                        }),
                    ]
                  ),

                  // ============ Force one item ==============
                m(
                    "p",
                    {
                      className:
                        "form-field form-row form-row-first"
                    },
                    [
                      m(
                        "label",
                        {
                          for:
                            "prgen-option-multiple-force-" +
                            option.id
                        },
                        "Force One Item to be Selected"
                      ),
                      m("input", {
                        onchange: ForceChoose(
                          "force",
                          store
                        ),
                        type: "checkbox",
                        className: "short",
                        id: "prgen-option-multiple-force-" + option.id,
                        value: 1,
                        checked:
                          option.force == 1 ||
                          option.force == "1",
                        name: "prgen_top_op[force_ui][]"
                      }),
                      m("input", {
                        type: "hidden",
                        value:
                          option.force,
                        name:
                          "prgen_top_op[force][]"
                      })
                    ]
                  ),
                // =============
                  m(
                    "p",
                    {
                      className:
                        "form-row form-row-full"
                    },
                    [
                      m(
                        "a",
                        {
                          className:
                            "button parents",
                          onclick: ShowModal(
                            option
                          )
                        },
                        "Option"
                      )
                    ]
                  )
                ]
              )
            ]
          )
        ]
      );
    }

    model(prgenOptionsPreload.preload);
    model.map(console.log.bind(console))
    var view = model
      .map(function(options) {
        return m(
          "div",
          {
            className:
              "prgen-metaboxes-wrapper"
          },
          [
            m(
              "div",
              {
                className:
                  "prgen-options-product-wrapper ui-sortable parents"
              },
              options.map(optionView)
            ),
            m("p", [
              m(
                "a",
                {
                  href: "#",
                  className: "button",
                  onclick: AddOption(
                    options
                  )
                },
                "Add component"
              )
            ]),
            m(
              "div",
              { className: "secret-modal" },
              options.map(modalView())
            )
          ]
        );
      })
      .catch(function(e) {
        return m("div", m("p.error", e.message), m("pre", e.stack.toString()), m("a", { href: window.location.href }, "Reload?"));
      });
    return view;
  }
  function main() {
    m.mount(document.querySelector("#prgen_repeatable_fields .inside"), component(MainApp));
    parentSortable();
    childSortable();
  }

  function childSortable() {
    $(".ui-sortable-handle").css("cursor", "move");
    $(".ui-sortable.childs").sortable({
      update: function(event, ui) {
        var data = $(".ui-sortable.childs")
          .sortable("toArray", {
            attribute: "id"
          })
          .toString();
        var opts = {
          url: ajaxurl, // ajaxurl is defined by WordPress and points to /wp-admin/admin-ajax.php
          type: "post",
          async: true,
          cache: false,
          dataType: "json",
          data: {
            action:
              "prgen_ajax_sort_product_options", // Tell WordPress how to handle this ajax request
            order: data, // Passes ID's of list items in  1,3,2 format
            nonce:
              prgenAdminParams.sort_options_nonce
          }
        };
        $.ajax(opts);
      }
    });
  }
  function parentSortable() {
    $(".ui-sortable-handle").css("cursor", "move");
    $(".ui-sortable.parents").sortable({
      update: function(event, ui) {
        var data = $(".ui-sortable.parents")
          .sortable("toArray", {
            attribute: "id"
          })
          .toString();
        var opts = {
          url: ajaxurl, // ajaxurl is defined by WordPress and points to /wp-admin/admin-ajax.php
          type: "post",
          async: true,
          cache: false,
          dataType: "json",
          data: {
            action:
              "prgen_ajax_sort_product_options", // Tell WordPress how to handle this ajax request
            order: data, // Passes ID's of list items in  1,3,2 format
            nonce:
              prgenAdminParams.sort_options_nonce
          },
          success: function(response) {
            //console.log(response);
          },
          error: function(
            xhr,
            textStatus,
            e
          ) {}
        };
        $.ajax(opts);
      }
    });
  }
  $(document).ready(main);
})(jQuery, m)