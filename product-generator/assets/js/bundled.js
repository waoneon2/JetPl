(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.eqDefault = undefined;
exports.head = head;
exports.tail = tail;
exports.span = span;
exports.lines = lines;
exports.unlines = unlines;
exports.reverse = reverse;
exports.append = append;
exports.splitAt = splitAt;
exports.nub = nub;
exports.nubBy = nubBy;
exports.findIndex = findIndex;
exports.concatMap = concatMap;
exports.takeWhile = takeWhile;
exports.repeat = repeat;
exports.accumulate = accumulate;
exports.iterate = iterate;
exports.itakeWhile = itakeWhile;
exports.range = range;
exports.foldl = foldl;
exports.intersectBy = intersectBy;

var _maybe = require("folktale/maybe");

function _const(x) {
  return function () {
    return x;
  };
}

function _uncons(empty, f, xs) {
  return xs.length === 0 ? empty() : f(xs[0], xs.slice(1));
}

// Array a -> Maybe a
function head(xs) {
  return _uncons(_maybe.Nothing, function (x) {
    return (0, _maybe.Just)(x);
  }, xs);
}

function tail(xs) {
  return _uncons(_maybe.Nothing, function (_, tail) {
    return (0, _maybe.Just)(tail);
  }, xs);
}

function span(f, xs) {
  function go() {
    var i = 0;
    while (true) {
      if (i > xs.length) {
        return (0, _maybe.Nothing)();
      }
      if (f(xs[i])) {
        i++;
        continue;
      } else {
        return (0, _maybe.Just)(i);
      }
    }
  }
  return go().matchWith({
    Nothing: function Nothing() {
      return { init: xs, rest: [] };
    },
    Just: function Just(_ref) {
      var value = _ref.value;

      return value === 0 ? { init: [], rest: xs } : /** otherwise */{ init: xs.slice(0, value), rest: xs.slice(value, xs.length) };
    }
  });
}

function lines(xs) {}

function unlines(xs) {
  return concatMap(function (x) {
    return x + "\n";
  }, xs);
}

function reverse(xs) {
  return xs.slice().reverse();
}

function append(xs, ys) {
  if (xs.length === 0) return ys;
  if (ys.length === 0) return xs;
  return xs.concat(ys);
}

function splitAt(n, xs) {
  if (n <= 0) return [[], xs];
  var ls = xs.slice(0, n);
  var rs = xs.slice(n, xs.length);
  return [ls, rs];
}

function nub(xs) {
  return nubBy(function (x, y) {
    return x === y;
  }, xs);
}

function nubBy(f, xs) {
  return _uncons(_const([]), function (h, t) {
    return [h].concat(nubBy(f, t.filter(function (x) {
      return !f(h, x);
    })));
  }, xs);
}

function findIndex(f, xs) {
  for (var i = 0, len = xs.length; i < len; i++) {
    if (f(xs[i])) return (0, _maybe.Just)(i);
  }
  return (0, _maybe.Nothing)();
}

function concatMap(f, xs) {
  var result = [];
  for (var i = 0, l = xs.length; i < l; i++) {
    Array.prototype.push.apply(result, f(xs[i]));
  }
  return result;
}

function takeWhile(f, xs) {
  var idx = 0;
  var len = xs.length;
  while (idx < len && f(xs[idx])) {
    idx += 1;
  }
  return xs.slice(0, idx);
}

function* repeat(target) {
  var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!times) {
    while (true) {
      yield target;
    }
  } else {
    for (var i = 0; i < times; i++) {
      yield target;
    }
  }
}

function* accumulate(iterator) {
  var func = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (a, b) {
    return a + b;
  };

  var item = iterator.next();
  if (item.done) return;
  var total = item.value;
  yield total;
  while (true) {
    item = iterator.next();
    if (item.done) break;
    total = func(total, item.value);
    yield total;
  }
}

// return iterator that yield (x, f(x), f(f(x)), ...)
function iterate(func, x) {
  return accumulate(repeat(x), function (fx, _) {
    return func(fx);
  });
}

function itakeWhile(f, iterator) {
  var results = [];
  while (true) {
    var _iterator$next = iterator.next(),
        done = _iterator$next.done,
        value = _iterator$next.value;

    if (done) break;
    var ret = f(value);
    if (!ret) break;
    results.push(value);
  }
  return results;
}

function range(lo, hi) {
  var result = [];
  for (var i = lo; i < hi; i++) {
    result.push(i);
  }
  return result;
}

function foldl(f, init, xs) {
  var acc = init;
  var len = xs.length;
  for (var i = 0; i < len; i++) {
    acc = f(acc, xs[i]);
  }
  return acc;
}

function intersectBy(fn, xs, ys) {
  var ret = [];

  // console.log('xs', xs);
  // console.log('ys', ys);
  // console.log('ret', ret);

  if (xs.length > ys.length) {
    for (var i = 0, len = ys.length; i < len; i++) {
      if (indexBy(fn, ys[i], xs) !== -1) ret.push(ys[i]);
    }
  } else {
    for (var _i = 0, _len = xs.length; _i < _len; _i++) {
      if (indexBy(fn, xs[_i], ys) !== -1) ret.push(xs[_i]);
    }
  }
  return ret;
}

var eqDefault = exports.eqDefault = function eqDefault(x, y) {
  return x === y;
};

function indexBy(fn, x, xs) {
  for (var i = 0, len = xs.length; i < len; i++) {
    if (fn(x, xs[i])) return i;
  }
  return -1;
}
},{"folktale/maybe":38}],2:[function(require,module,exports){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.frontendComponent = frontendComponent;

var _compose = require('folktale/core/lambda/compose');

var compose = _interopRequireWildcard(_compose);

var _map = require('folktale/fantasy-land/map');

var _map2 = _interopRequireDefault(_map);

var _maybe = require('folktale/maybe');

var _stream = require('mithril/stream');

var _stream2 = _interopRequireDefault(_stream);

var _redraw = require('mithril/redraw');

var _redraw2 = _interopRequireDefault(_redraw);

var _hyperscript = require('mithril/render/hyperscript');

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _request = require('mithril/request/request');

var _request2 = _interopRequireDefault(_request);

var _stream3 = require('./stream');

var _array = require('./array');

var A = _interopRequireWildcard(_array);

var _treeZipper = require('./tree-zipper');

var Z = _interopRequireWildcard(_treeZipper);

var _tree = require('./tree');

var T = _interopRequireWildcard(_tree);

var _logic = require('./logic');

var _urlDetection = require('./url-detection');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var http = (0, _request2['default'])(window, Promise);

// ACTIONS
var PRODUCTCHOOSED = 0;
var OPTION2CHOOSED = 1;
var OPTION3CHOOSED = 2;
var STEPMOVED = 3;
var SKIPOPTION = 4;
var NEXTSTEP = 5;
var LISTOPTIONCHOOSED = 6;
var LISTOPTIONUNCHOOSED = 7;
var STEP6BACK = 8;
var STEP6NEXT = 9;
var STEP6SELECT = 10;
var USERLOGGEDIN = 11;


function layoutemplate(title, page, pagination, state) {
  return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Please choose ', (0, _hyperscript2['default'])('b', title)])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [pagination])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', page)]);
}

function updateFrontendComponent(state, action) {
  switch (action.type) {
    case PRODUCTCHOOSED:
      var ix = getTreeIx(action.id, state.trees);
      var zipper = Z.fromTree(state.trees[ix]);

      return extend(state, { zipper: zipper, step: state.step + 1, stepped: [1, 2], choosed: [_extends({ parent: state.trees[ix].label }, state.trees[ix].label)] });

    case OPTION2CHOOSED:
      var stepped = state.stepped.slice();
      stepped.push(2);

      return extend(state, { step: state.step + 1,
        stepped: A.nub(stepped),
        choosed: addChoosedOption(action.option, action.parent, state.choosed)
      });

    case OPTION3CHOOSED:
      var stepped = state.stepped.slice();
      stepped.push(3);

      return extend(state, { step: state.step + 1,
        stepped: A.nub(stepped),
        choosed: addChoosedOption(action.option, action.parent, state.choosed)
      });

    case STEPMOVED:
      return extend(state, {
        step: action.step,
        index: -1
      });

    case NEXTSTEP:
      var stepped = state.stepped.slice();
      stepped.push(state.step + 1);

      return extend(state, { step: state.step + 1,
        stepped: stepped,
        index: -1
      });

    // case SKIPOPTION:
    //   return Z.childAt(state.step - 2, state.zipper).matchWith({
    //     Nothing: function Nothing() {
    //       return updateFrontendComponent(state, { type: NEXTSTEP });
    //     },
    //     Just: function Just(_ref) {
    //       var value = _ref.value;

    //       var parent = value.content.tree.label;
    //       var stepped = state.stepped.slice();
    //       stepped.push(state.step + 1);

    //       return extend(state, {
    //         step: state.step + 1,
    //         index: -1,
    //         stepped: stepped,
    //         choosed: state.choosed.filter(function (x) {
    //           return x.parent.id !== action.parent.id;
    //         })
    //       });
    //     }
    //   });


    //edited skip option
    case SKIPOPTION:
      return Z.childAt(state.step - 2, state.zipper).matchWith({
        Nothing: function Nothing() {
          return updateFrontendComponent(state, { type: NEXTSTEP });
        },
        Just: function Just(_ref) {
          var value = _ref.value;

          var parent = value.content.tree.label;
          var stepped = state.stepped.slice(this);
          stepped.push(state.step + 1);

          console.log("step", stepped);
          console.log("state", state.choosed);

          return extend(state, {
            step: state.step + 1,
            index: -1,
            stepped: stepped,
            choosed: state.choosed.filter(function (x) {
              return x.parent.id !== action.parent.id;
            })
          });
        }
      });


    case LISTOPTIONCHOOSED:
      return extend(state, {
        choosed: addChoosedOption(action.option, action.parent, state.choosed)
      });

    case LISTOPTIONUNCHOOSED:
      var choosed = state.choosed.filter(function (el) {
        return el.id !== action.option.id;
      });
      return extend(state, { choosed: choosed
      });

    case STEP6BACK:
      return extend(state, {
        index: -1
      });

    case STEP6NEXT:
      return extend(state, {
        index: state.index + 1
      });

    case STEP6SELECT:
      return extend(state, {
        index: action.index
      });

    case USERLOGGEDIN:
      return extend(state, {
        userId: action.userId
      });

    default:
      return state;
  }
}

// -----------------------------------------------------------------------------
// -- Step Vnode ---------------------------------------------------------------
// -----------------------------------------------------------------------------
function archivePageVnode(dispatch, state) {
  return layoutemplate('products size', state.trees.map(function (tree, i) {
    var product = tree.label;
    var thumbnail = product.imageUrlFull ? (0, _hyperscript2['default'])('.thumbnail', [(0, _hyperscript2['default'])('a', { href: '#', onclick: productChoosed(dispatch, product.id) }, [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull })])]) : '';

    return (0, _hyperscript2['default'])('div.col1of4.center', [(0, _hyperscript2['default'])('h4', product.title), thumbnail]);
  }), paginationStatic(dispatch), state);
}

function step2Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: function Nothing() {
      return (0, _hyperscript2['default'])('div', 'step ' + state.step + ' isnt available');
    },
    Just: function Just(_ref2) {
      var value = _ref2.value;
      // console.log('step2');
      var forest = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      var parent = value.content.tree.label;
      var sproduct = state.choosed.length > 0 ? state.choosed[0] : {};

      return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Please choose ', (0, _hyperscript2['default'])('b', parent.title)])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [paginationVnode(dispatch, state)])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col1of4', [(0, _hyperscript2['default'])('h4.prgen_side_title', sproduct.title), (0, _hyperscript2['default'])('.prgen_side_desc', [(0, _hyperscript2['default'])('p', [(0, _hyperscript2['default'])('b', 'Glossary'), (0, _hyperscript2['default'])('p', sproduct.description)])]), (0, _hyperscript2['default'])('.thumbnail.left', [(0, _hyperscript2['default'])('img', { src: sproduct.imageUrlFull })])]), (0, _hyperscript2['default'])('.col3of4.prgen_overauto', forest.map(function (tree, ix) {
        var child = tree.label;
        var onclick = option3Choosed(dispatch, child, parent);
        var thumbnail = child.imageUrlFull ? (0, _hyperscript2['default'])('.thumbnail.left', [(0, _hyperscript2['default'])('a', { href: '#', onclick: onclick }, [(0, _hyperscript2['default'])('img', { src: child.imageUrlFull })])]) : '';
        return (0, _hyperscript2['default'])('.col1of3.step3.prgen_overauto', [thumbnail, (0, _hyperscript2['default'])('.prgen_product_title', [(0, _hyperscript2['default'])('a', { href: '#', onclick: onclick }, [(0, _hyperscript2['default'])('span', sproduct.title), (0, _hyperscript2['default'])('h4', child.title)])])]);
      }))])]);
    }
  });
}


function step3Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: function Nothing() {
      return (0, _hyperscript2['default'])('div', 'step ' + state.step + ' isnt available');
    },
    Just: function Just(_ref3) {
      var value = _ref3.value;
     
      // console.log('step3');
     
      var product = state.zipper.content.tree.label;
      var forest = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      var parent = value.content.tree.label;
      var s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      var s3product = state.choosed.length > 1 ? state.choosed[1] : {};
      // var lastChoose = state.choosed.length > 0 ? state.choosed[state.choosed.length - 1] : {};

      // var allOptions = forest.map(function (x) {
      //   return x.label;
      // });
      // var optionSelected = parent.force == 1 ? A.intersectBy(optionEqual, state.choosed, allOptions).length > 0 : true;

      // var check_multiple = state.choosed[state.choosed.length - 1].parent.multiple;
      // var check_force = state.choosed[state.choosed.length - 1].parent.force;
      // var check_require = state.choosed[state.choosed.length - 1].parent.require;
      // console.log( 'mul', check_multiple, 'req', check_require,  'force', check_force );
      

      var optionSelected = void 0;
      if (parent.require && parent.multiple) {
        
        var allOptions = getAllOption(forest, 1);

        optionSelected = allOptions.every(function (x) {
          var selected = A.intersectBy(optionEqual, state.choosed, Array.isArray(x) ? x : [x]).length > 0;
          return selected;
        });
       
      } 
      else {
        optionSelected = parent.force == 1 ? A.intersectBy(optionEqual, state.choosed, getAllOption(forest)).length > 0 : true;
      }

      //tambahan
      var lastChoose;
      var disclaim;

      if (state.choosed.length > 0) 
      {
          
          var check_sidenote = state.choosed[state.choosed.length - 1].sideNote;
          var check_sidenote_parent = state.choosed[state.choosed.length - 1].parent.sideNote;

          var check_img = state.choosed[state.choosed.length - 1].imageNoteUrlFull;
          var check_img_parent = state.choosed[state.choosed.length - 1].parent.imageNoteUrlFull;

          var check_disclaim = state.choosed[state.choosed.length - 1].disclaimer;
          var check_disclaim_parent = state.choosed[state.choosed.length - 1].parent.disclaimer;

          //check sidenote text and image
          if ( check_sidenote == "" && check_img == "") 
          {
              if ( check_sidenote_parent != "" || check_img_parent != "" ) 
              {
                  lastChoose = state.choosed[state.choosed.length - 1].parent;
              }
              
              else 
              {
                  lastChoose = { sideNote : " ", imageNoteUrlFull : "" };
                  // lastChoose = {};
              }
          }
          else
          {
              lastChoose = state.choosed[state.choosed.length - 1];
          }

          //check disclaimer
          if (check_disclaim == "") 
          {
            
            if (check_disclaim_parent != "") 
            {
                disclaim = state.choosed[state.choosed.length - 1].parent;
            }
            else
            {
                disclaim = { disclaimer : "" };
            }

          }
          else
          {
              disclaim = state.choosed[state.choosed.length - 1];
          } 

      }

      else 
      {
          lastChoose = {};
      }

      return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Please choose ', (0, _hyperscript2['default'])('b', parent.title)])]), 
        (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, optionSelected ? [paginationVnode(dispatch, state)] : [DisabledpaginationVnode(dispatch, state)]) 

        ])]), buildBreadcrumbWith(state), 
      (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col3of3', [(0, _hyperscript2['default'])('.sidenote', [(0, _hyperscript2['default']) ('span', disclaim.disclaimer)], [(0, _hyperscript2['default']) ('br')], [(0, _hyperscript2['default']) ('br')], [(0, _hyperscript2['default']) ('span', lastChoose.sideNote)]), (0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: lastChoose.imageNoteUrlFull })])]), (0, _hyperscript2['default'])('.col2of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
        return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
      }))])]), (0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.prgen_list_option', [(0, _hyperscript2['default'])('.list-up', [(0, _hyperscript2['default'])('span', s2product.title), (0, _hyperscript2['default'])('h4', s3product.title),

      parent.require == 1 && parent.multiple == 1 ?
        (0, _hyperscript2['default']) ('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')])
        :
        optionSelected ? 
        (0, _hyperscript2['default']) ('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')]) :
        (0, _hyperscript2['default']) ('a', [(0, _hyperscript2['default'])('h4.prgen_side_title.disabled', 'SKIP OPTION >>')] )
        
      , 
      (0, _hyperscript2['default'])('.line_bottom', [])]), (0, _hyperscript2['default'])('.list-middle', [(0, _hyperscript2['default'])('p', parent.description)].concat(renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1), (0, _hyperscript2['default'])('.line_bottom', []), (0, _hyperscript2['default']) ('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1)}, [(0, _hyperscript2['default'])('h4.prgen_prev', '<< BACK')]), 

        optionSelected ? 
        (0, _hyperscript2['default'])('a', { href: '#', onclick: handleNextStep(dispatch) }, [(0, _hyperscript2['default'])('h4.prgen_next', 'NEXT >>')]) : 
        (0, _hyperscript2['default'])('a', [(0, _hyperscript2['default'])('h4.prgen_next.disabled', 'NEXT >>')])  

        ))])])])]);


    }
  });
}

function step4Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: function Nothing() {
      return (0, _hyperscript2['default'])('div', 'step ' + state.step + ' isnt available');
    },
    Just: function Just(_ref4) {
      var value = _ref4.value;

      // console.log('step4');

      var product = state.zipper.content.tree.label;
      var forest = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      var parent = value.content.tree.label;
      var s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      var s3product = state.choosed.length > 1 ? state.choosed[1] : {};

      return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Please choose ', (0, _hyperscript2['default'])('b', parent.title)])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [paginationVnode(dispatch, state)])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col2of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
        return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
      }))])]), (0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.prgen_list_option', [(0, _hyperscript2['default'])('.list-up', [(0, _hyperscript2['default'])('span', s2product.title), (0, _hyperscript2['default'])('h4', s3product.title), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')]), (0, _hyperscript2['default'])('.line_bottom', [])]), (0, _hyperscript2['default'])('.list-middle', [(0, _hyperscript2['default'])('p', parent.description)].concat(renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1), (0, _hyperscript2['default'])('.line_bottom', []), (0, _hyperscript2['default'])('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1) }, [(0, _hyperscript2['default'])('h4.prgen_prev', '<< BACK')]), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleNextStep(dispatch) }, [(0, _hyperscript2['default'])('h4.prgen_next', 'NEXT >>')])))])])])]);
    }

  });
}


function step6RenderOptionForIndex(dispatch, state, zipper, cstate) {
  return Z.childAt(state.index, zipper).matchWith({
    Nothing: function Nothing() {
      return (0, _hyperscript2['default'])('div', 'No options available');
    },
    Just: function Just(_ref5) {
      var value = _ref5.value;
      
      //const parent = value.content.tree.label;
      // FIX For step 6 multiple select
      var parent = zipper.content.tree.label;
      var forest = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);

      return (0, _hyperscript2['default'])('.list-middle', [(0, _hyperscript2['default'])('p', parent.description)].concat(renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1), (0, _hyperscript2['default'])('.line_bottom', []), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleStep6Back(dispatch) }, [(0, _hyperscript2['default'])('h4.prgen_prev', '<< BACK')]), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleStep6Next(dispatch, zipper, state) }, [(0, _hyperscript2['default'])('h4.prgen_next', 'NEXT >>')])));
    }
  });
}

function step6RenderListOption(dispatch, state, zipper) {
  var parent = zipper.content.tree;
  var forest = filterOptionByLogic(Z.forest(Z.children(zipper)), state.choosed).filter(function (tree) {
    return tree.subforest.length > 0;
  });

  return (0, _hyperscript2['default'])('div', { className: 'list-middle' }, [(0, _hyperscript2['default'])('p', parent.description), (0, _hyperscript2['default'])('ul', { className: 'middle' }, forest.map(function (tree, ix) {
    var coption = tree.label;
    return (0, _hyperscript2['default'])('li.list_items', [(0, _hyperscript2['default'])('.list_select', [(0, _hyperscript2['default'])('a', { href: '#', onclick: handleStep6Select(dispatch, ix) }, coption.title)])]);
  }), (0, _hyperscript2['default'])('.line_bottom', []), (0, _hyperscript2['default'])('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1) }, [(0, _hyperscript2['default'])('h4.prgen_prev', '<< BACK')]), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleNextStep(dispatch) }, [(0, _hyperscript2['default'])('h4.prgen_next', 'NEXT >>')]))]);
}

// function step6Vnode(dispatch, state) {
//   return Z.childAt(state.step - 2, state.zipper).matchWith({
//     Nothing: function Nothing() {
//       return (0, _hyperscript2['default'])('div', 'step ' + state.step + ' isnt available');
//     },
//     Just: function Just(_ref6) {
//       var value = _ref6.value;
      
//       var product = state.zipper.content.tree.label;
//       //const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
//       var parent = value.content.tree.label;
//       var s2product = state.choosed.length > 0 ? state.choosed[0] : {};
//       var s3product = state.choosed.length > 1 ? state.choosed[1] : {};
//       // var lastChoose = state.choosed.length > 0 ? state.choosed[state.choosed.length - 1] : {};

//       //tambahan
//       var lastChoose;
//       var disclaim;

//       if (state.choosed.length > 0) 
//       {
//           i=i+1;
//           var check_sidenote = state.choosed[state.choosed.length - 1].sideNote;
//           var check_sidenote_parent = state.choosed[state.choosed.length - 1].parent.sideNote;

//           var check_img = state.choosed[state.choosed.length - 1].imageNoteUrlFull;
//           var check_img_parent = state.choosed[state.choosed.length - 1].parent.imageNoteUrlFull;

//           var check_disclaim = state.choosed[state.choosed.length - 1].disclaimer;
//           var check_disclaim_parent = state.choosed[state.choosed.length - 1].parent.disclaimer;

//           //check sidenote text and image
//           if ( check_sidenote == "" && check_img == "") 
//           {
//               if ( check_sidenote_parent != "" || check_img_parent != "" ) 
//               {
//                   lastChoose = state.choosed[state.choosed.length - 1].parent;
//               }
              
//               else 
//               {
//                   lastChoose = { sideNote : " ", imageNoteUrlFull : "" };
//                   // lastChoose = {};
//               }
//           }
//           else
//           {
//               lastChoose = state.choosed[state.choosed.length - 1];
//           }

//           //check disclaimer
//           if (check_disclaim == "") 
//           {
//             if (check_disclaim_parent != "") 
//             {
//                 disclaim = state.choosed[state.choosed.length - 1].parent;
//             }
//             else
//             {
//                 disclaim = { disclaimer : "" };
//             }

//           }
//           else
//           {
//               disclaim = state.choosed[state.choosed.length - 1];
//           } 

//       }

//       else 
//       {
//           lastChoose = {};
//       }

//       return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step+1) + '. Please choose ', (0, _hyperscript2['default'])('b', parent.title)])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [paginationVnode(dispatch, state)])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col3of3', [(0, _hyperscript2['default'])('.sidenote', [(0, _hyperscript2['default']) ('span', disclaim.disclaimer)], [(0, _hyperscript2['default']) ('br')], [(0, _hyperscript2['default']) ('br')], [(0, _hyperscript2['default'])('span', lastChoose.sideNote)]), (0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: lastChoose.imageNoteUrlFull })])]), (0, _hyperscript2['default'])('.col2of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
//         return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
//       }))])]), (0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.prgen_list_option', [(0, _hyperscript2['default'])('.list-up', [(0, _hyperscript2['default'])('span', s2product.title), (0, _hyperscript2['default'])('h4', s3product.title), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')]), (0, _hyperscript2['default'])('.line_bottom', [])]), state.index < 0 ? step6RenderListOption(dispatch, state, value) : step6RenderOptionForIndex(dispatch, state, value, state.index)])])])]);
    
//     }
//   });
// }



//edited step6
function step6Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: function Nothing() {
      return (0, _hyperscript2['default'])('div', 'step ' + state.step + ' isnt available');
    },
    Just: function Just(_ref3) {
      var value = _ref3.value;

      // console.log('step6node');
      
      var product = state.zipper.content.tree.label;
      var forest = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      var parent = value.content.tree.label;
      var s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      var s3product = state.choosed.length > 1 ? state.choosed[1] : {};
      // var lastChoose = state.choosed.length > 0 ? state.choosed[state.choosed.length - 1] : {};

      var optionSelected = void 0;
      if (parent.require && parent.multiple) {
        var allOptions = getAllOption(forest, 1);
        optionSelected = allOptions.every(function (x) {
          var selected = A.intersectBy(optionEqual, state.choosed, Array.isArray(x) ? x : [x]).length > 0;
          return selected;
        });
      } else {
        optionSelected = parent.force == 1 ? A.intersectBy(optionEqual, state.choosed, getAllOption(forest)).length > 0 : true;
      }

      //tambahan
      var lastChoose;
      var disclaim;

      if (state.choosed.length > 0) 
      {
          var check_sidenote = state.choosed[state.choosed.length - 1].sideNote;
          var check_sidenote_parent = state.choosed[state.choosed.length - 1].parent.sideNote;

          var check_img = state.choosed[state.choosed.length - 1].imageNoteUrlFull;
          var check_img_parent = state.choosed[state.choosed.length - 1].parent.imageNoteUrlFull;

          var check_disclaim = state.choosed[state.choosed.length - 1].disclaimer;
          var check_disclaim_parent = state.choosed[state.choosed.length - 1].parent.disclaimer;

          //check sidenote text and image
          if ( check_sidenote == "" && check_img == "") 
          {
              if ( check_sidenote_parent != "" || check_img_parent != "" ) 
              {
                  lastChoose = state.choosed[state.choosed.length - 1].parent;
              }
              
              else 
              {
                  lastChoose = { sideNote : " ", imageNoteUrlFull : "" };
                  // lastChoose = {};
              }
          }
          else
          {
              lastChoose = state.choosed[state.choosed.length - 1];
          }

          //check disclaimer
          if (check_disclaim == "") 
          {
            
            if (check_disclaim_parent != "") 
            {
                disclaim = state.choosed[state.choosed.length - 1].parent;
            }
            else
            {
                disclaim = { disclaimer : "" };
            }

          }
          else
          {
              disclaim = state.choosed[state.choosed.length - 1];
          } 

      }

      else 
      {
          lastChoose = {};
      }

      return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Please choose ', (0, _hyperscript2['default'])('b', parent.title)])]), 
        (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, optionSelected ? [paginationVnode(dispatch, state)] : [DisabledpaginationVnode(dispatch, state)]) 
        ])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col3of3', [(0, _hyperscript2['default'])('.sidenote', [(0, _hyperscript2['default']) ('span', disclaim.disclaimer)], [(0, _hyperscript2['default']) ('br')], [(0, _hyperscript2['default']) ('br')], [(0, _hyperscript2['default']) ('span', lastChoose.sideNote)]), (0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: lastChoose.imageNoteUrlFull })])]), (0, _hyperscript2['default'])('.col2of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
        return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
      }))])]), (0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.prgen_list_option', [(0, _hyperscript2['default'])('.list-up', [(0, _hyperscript2['default'])('span', s2product.title), (0, _hyperscript2['default'])('h4', s3product.title),
       
      // optionSelected ? 
      // (0, _hyperscript2['default']) ('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')]) :
      // (0, _hyperscript2['default']) ('a', [(0, _hyperscript2['default'])('h4.prgen_side_title.disabled', 'SKIP OPTION >>')] ) 

        parent.require == 1 && parent.multiple == 1 ?
          (0, _hyperscript2['default']) ('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')])
        :
          optionSelected ? 
          (0, _hyperscript2['default']) ('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')]) :
          (0, _hyperscript2['default']) ('a', [(0, _hyperscript2['default'])('h4.prgen_side_title.disabled', 'SKIP OPTION >>')] )
      , 
      (0, _hyperscript2['default'])('.line_bottom', [])]), (0, _hyperscript2['default'])('.list-middle', [(0, _hyperscript2['default'])('p', parent.description)].concat(renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1), (0, _hyperscript2['default'])('.line_bottom', []), (0, _hyperscript2['default'])('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1)}, [(0, _hyperscript2['default'])('h4.prgen_prev', '<< BACK')]), 
       
        optionSelected ? 
        (0, _hyperscript2['default'])('a', { href: '#', onclick: handleNextStep(dispatch) }, [(0, _hyperscript2['default'])('h4.prgen_next', 'NEXT >>') ]) : 
        (0, _hyperscript2['default'])('a', [(0, _hyperscript2['default'])('h4.prgen_next.disabled', 'NEXT >>')]) 

        ))])])])]);


    }
  });
}

function saveStepVnode(dispatch, state) {
  var product = state.zipper.content.tree.label;
  var stateChoosed = state.choosed.slice(1);

  return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Save product configuration'])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [paginationVnode(dispatch, state)])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
    return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
  }))]), state.userId === 0 ? (0, _hyperscript2['default'])(LoginRegister, { dispatch: dispatch }) : saveButton(dispatch, state)]), (0, _hyperscript2['default'])('.col2of3', [state.choosed.length === 0 ? (0, _hyperscript2['default'])('div', ['No options choosen']) : (0, _hyperscript2['default'])('table.product-configs-results', [(0, _hyperscript2['default'])('tr', [(0, _hyperscript2['default'])('th', 'Product Name'), (0, _hyperscript2['default'])('th', 'Thumbnail'), (0, _hyperscript2['default'])('th', 'Disclaimer'), (0, _hyperscript2['default'])('th', 'Action')]), 
    (0, _hyperscript2['default'])
      ('tr', [(0, _hyperscript2['default'])
        ('td.center', [(0, _hyperscript2['default'])('h4', 'Product Size - ' + state.choosed[0].title)]), 
          (0, _hyperscript2['default'])
            ('td.images', [(0, _hyperscript2['default'])('.thumbnail.center', [(0, _hyperscript2['default'])('img', { src: state.choosed[0].imageUrlFull })] )]), 
              (0, _hyperscript2['default'])('td.td-actions.center', [])])].concat(stateChoosed.map(function (option, ix) {
    return (0, _hyperscript2['default'])('tr', [(0, _hyperscript2['default'])('td.center', [(0, _hyperscript2['default'])('h4', option.title)]), (0, _hyperscript2['default'])('td.images', [(0, _hyperscript2['default'])('.thumbnail.center', [(0, _hyperscript2['default'])('img.frame', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull })])]), 
      (0, _hyperscript2['default'])('td.center', [(0, _hyperscript2['default'])('p', option.disclaimer)] ), 
      (0, _hyperscript2['default'])('td.td-actions.center', [ix == 0 ? '' : (0, _hyperscript2['default'])('button', { onclick: handleListOptionUnChoosed(dispatch, takeOption(option), option.parent) }, 'Delete') ])
       ]);
  }
  )))])])]);
}

var LoginRegister = {
  handleLoginSubmit: function handleLoginSubmit(e) {
    e.preventDefault();
    _handleLoginSubmit(this.state.username || '', this.state.password || '', this.attrs.dispatch);
  },
  handleRegisterSubmit: function handleRegisterSubmit(e) {
    e.preventDefault();
    _handleRegisterSubmit({ username: this.state.rusername || '',
      email: this.state.remail || '',
      password: this.state.rpassword || '',
      password2: this.state.rconfirmpassword || ''
    }, this.attrs.dispatch);
  },
  view: function view(vnode) {
    return (0, _hyperscript2['default'])('div', { className: 'prgen-login-reg' }, [(0, _hyperscript2['default'])('h2', 'Login'), (0, _hyperscript2['default'])('form.login-form', { autocomplete: 'off' }, [(0, _hyperscript2['default'])('container', [(0, _hyperscript2['default'])('label', [(0, _hyperscript2['default'])('b', 'Username / Email')]), (0, _hyperscript2['default'])('input', { type: 'text',
      value: vnode.state.username,
      oninput: function oninput(e) {
        return vnode.state.username = e.target.value;
      },
      onchange: function onchange(e) {
        return vnode.state.username = e.target.value;
      },
      placeholder: "username / email"
    }), (0, _hyperscript2['default'])('label', [(0, _hyperscript2['default'])('b', 'Password')]), (0, _hyperscript2['default'])('input', { type: 'password',
      value: vnode.state.password,
      password: 'Password',
      oninput: function oninput(e) {
        return vnode.state.password = e.target.value;
      },
      onchange: function onchange(e) {
        return vnode.state.password = e.target.value;
      },
      placeholder: "password"
    }), (0, _hyperscript2['default'])('button', { onclick: LoginRegister.handleLoginSubmit.bind(vnode) }, 'Login')])]), (0, _hyperscript2['default'])('.line_bottom', []), (0, _hyperscript2['default'])('h2', 'Register'), (0, _hyperscript2['default'])('form.register-form', { autocomplete: 'off' }, [(0, _hyperscript2['default'])('.container', [(0, _hyperscript2['default'])('label', [(0, _hyperscript2['default'])('b', 'Username')]), (0, _hyperscript2['default'])('input', { type: 'text',
      value: vnode.state.rusername,
      oninput: function oninput(e) {
        return vnode.state.rusername = e.target.value;
      },
      onchange: function onchange(e) {
        return vnode.state.rusername = e.target.value;
      },
      placeholder: "username"
    }), (0, _hyperscript2['default'])('label', [(0, _hyperscript2['default'])('b', 'Email')]), (0, _hyperscript2['default'])('input', { type: 'email',
      value: vnode.state.remail,
      oninput: function oninput(e) {
        return vnode.state.remail = e.target.value;
      },
      onchange: function onchange(e) {
        return vnode.state.remail = e.target.value;
      },
      placeholder: "email"
    }), (0, _hyperscript2['default'])('label', [(0, _hyperscript2['default'])('b', 'Password')]), (0, _hyperscript2['default'])('input', { type: 'password',
      value: vnode.state.rpassword,
      oninput: function oninput(e) {
        return vnode.state.rpassword = e.target.value;
      },
      onchange: function onchange(e) {
        return vnode.state.rpassword = e.target.value;
      },
      placeholder: "password"
    }), (0, _hyperscript2['default'])('label', [(0, _hyperscript2['default'])('b', 'Confirm Password')]), (0, _hyperscript2['default'])('input', { type: 'password',
      value: vnode.state.rconfirmpassword,
      oninput: function oninput(e) {
        return vnode.state.rconfirmpassword = e.target.value;
      },
      onchange: function onchange(e) {
        return vnode.state.rconfirmpassword = e.target.value;
      },
      placeholder: "confirm password",
      className: vnode.state.rpassword !== vnode.state.rconfirmpassword ? 'invalid' : 'valid'
    }), (0, _hyperscript2['default'])('button', { onclick: LoginRegister.handleRegisterSubmit.bind(vnode)
    }, 'Register')])])]);
  }
};

function saveButton(dispatch, state) {
  return (0, _hyperscript2['default'])('div', [(0, _hyperscript2['default'])('button', { className: 'save-button', onclick: handleSaveConfiguration(dispatch, state) }, 'Save')]);
}

function renderOptionRecursive(dispatch, state, parent, forest, multi) {
  return forest.map(function (tree) {
    var option = tree.label;
    if (tree.subforest.length === 0) {
      var ix = A.findIndex(optionIdEq.bind(null, option), state.choosed);
      return (0, _hyperscript2['default'])('ul.middle', [(0, _hyperscript2['default'])('li', { className: _maybe.Nothing.hasInstance(ix) ? '' : 'active' }, [(0, _hyperscript2['default'])('div', { className: 'list_select' }, [(0, _hyperscript2['default'])('a', { onclick: _maybe.Nothing.hasInstance(ix) ? handleListOptionClicked(dispatch, option, parent) : handleListOptionUnChoosed(dispatch, option, parent)
      }, [option.color ? (0, _hyperscript2['default'])('div', { style: 'background-color:' + option.color + ';', className: 'thumbnails left' }) : (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull, className: 'thumbnails left' })]), (0, _hyperscript2['default'])('p', option.title)])])]);
    } else {
      return (0, _hyperscript2['default'])('ul.middle', [(0, _hyperscript2['default'])('li', { className: 'list_header' }, (0, _hyperscript2['default'])('p', option.title), renderOptionRecursive(dispatch, state, multi ? option : parent, filterOptionByLogic(tree.subforest, state.choosed), multi))]);
    }
  });
}

function getAllOption(forest) {
  var requireMulti = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  var options = forest.map(function (tree) {
    var option = tree.label;
    return tree.subforest.length === 0 ? option : getAllOption(tree.subforest);
  });

  return requireMulti ? options : Array.prototype.concat.apply([], options);
}
// -----------------------------------------------------------------------------
// -- Pagination ---------------------------------------------------------------
// -----------------------------------------------------------------------------
function paginationStatic(dispatch) {
  var ranges = [1, 2, 3, 4, 5, 6];
  return (0, _hyperscript2['default'])('ul.prgen_step_num', ranges.map(function (i) {
    return (0, _hyperscript2['default'])('li', {
      onclick: i === 1 ? paginationClicked(dispatch, 0) : doNothing,
      key: 'static-' + i, className: i === 2 ? 'active' : ''
    }, i);
  }));
}

function paginationVnode(dispatch, state) {
  var childs = Z.forest(Z.children(state.zipper));
  var ranges = A.range(1, childs.length + 4);
  var stepplus = state.step + 1;

  return (0, _hyperscript2['default'])('ul.prgen_step_num', ranges.map(function (i) {
    return (0, _hyperscript2['default'])('li', { key: 'dinamic-' + i,
      className: i === stepplus ? 'active' : '',
      href: '#',
      onclick: canMoveNextStep(state, i - 1) ? paginationClicked(dispatch, i - 1) : doNothing
    }, i);
  }));
}

function DisabledpaginationVnode(dispatch, state) {
  var childs = Z.forest(Z.children(state.zipper));
  var ranges = A.range(1, childs.length + 4);
  var stepplus = state.step + 1;

  return (0, _hyperscript2['default'])('ul.prgen_step_num', ranges.map(function (i) {
    return (0, _hyperscript2['default'])('li', { key: 'dinamic-' + i,
      className: i === stepplus ? 'active' : '',
      href: '#',
      onclick: doNothing
    }, i);
  }));
}

function frontendComponent(vnode) {
  var actions = (0, _stream2['default'])(),
      initialState = vnode.attrs.initialState,
      model = (0, _stream3.reduceStream)(updateFrontendComponent, initialState, actions);

  var vnodeStream = (0, _map2['default'])(model, function (state) {
    switch (state.step) {
      case 0:

        window.location.href = prgen_frontend_settings.prgenPageURL;
        return;

      case 1:
        return archivePageVnode(actions, state);

      case 2:
        return step2Vnode(actions, state);

      // step 4 and 5 have same layout, so let's just use it
      case 3:

      case 4:
        return checkSavePage(state) ? saveStepVnode(actions, state) : step3Vnode(actions, state);

      case 5:
        return checkSavePage(state) ? saveStepVnode(actions, state) : step6Vnode(actions, state);

      default:
        return checkSavePage(state) ? saveStepVnode(actions, state) : step3Vnode(actions, state);
    }
  });

  return {
    oninit: function oninit() {
      return model(initialState);
    },
    view: function view() {
      return vnodeStream();
    }
  };
}

function buildBreadcrumbWith(state) {
  if (state.step === 1) {
    return (0, _hyperscript2['default'])('ul.breadcrump', [(0, _hyperscript2['default'])('li', 'Choose a product')]);
  }
  var forest = Z.forest(Z.children(state.zipper));
  forest = forest.slice(0, state.step - 1);
  return (0, _hyperscript2['default'])('ul.breadcrump', [(0, _hyperscript2['default'])('li', 'Choose a product')].concat(forest.map(function (tree) {
    var prod = tree.label;
    return (0, _hyperscript2['default'])('li', prod.title);
  })));
}

// -----------------------------------------------------------------------------
// -- Listener -----------------------------------------------------------------
// -----------------------------------------------------------------------------
function productChoosed(dispatch, id) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: PRODUCTCHOOSED, id: id });
  };
}

function option2Choosed(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: OPTION2CHOOSED, option: option, parent: parent });
  };
}

function option3Choosed(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: OPTION3CHOOSED, option: option, parent: parent });
  };
}

function paginationClicked(dispatch, i) {
  return function (e) {
    e.preventDefault();
    if (i == 0) {
      var r = confirm('Step 1 is a base product and will reset your config progress. Is that ok?');
      if (r == false) return;
    }
    dispatch({ type: STEPMOVED, step: i });
  };
}

function handleSkipOption(dispatch, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: SKIPOPTION, parent: parent });
  };
}

function handleNextStep(dispatch) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: NEXTSTEP });
  };
}


function handleListOptionClicked(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: LISTOPTIONCHOOSED, option: option, parent: parent });
  };
}

function handleListOptionUnChoosed(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: LISTOPTIONUNCHOOSED, option: option, parent: parent });
  };
}

function handleStep6Back(dispatch) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: STEP6BACK });
  };
}

function handleStep6Next(dispatch, zipper, state) {
  return function (e) {
    e.preventDefault();
    return Z.childAt(state.index + 1, zipper).matchWith({
      Nothing: function Nothing() {
        dispatch({ type: NEXTSTEP });
      }, Just: function Just(_ref7) {
        var value = _ref7.value;

        var forest = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
        var shouldskip = forest.every(function (tree) {
          return tree.subforest.length === 0;
        });
        if (shouldskip) {
          dispatch({ type: NEXTSTEP });
        } else {
          dispatch({ type: STEP6NEXT });
        }
      }
    });
  };
}

function handleStep6Select(dispatch, index) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: STEP6SELECT, index: index });
  };
}

function _handleLoginSubmit(username, password, dispatch) {
  var formdata = new FormData();
  formdata.append('username', username);
  formdata.append('password', btoa(password));
  formdata.append('security', prgen_frontend_settings.loginNonce);
  http.request({
    method: 'POST',
    url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_frontend_user_login',
    background: true,
    withCredentials: true,
    data: formdata
  }).then(function (response) {
    if (response.success) {
      dispatch({ type: USERLOGGEDIN, userId: response.data.user });
      _redraw2['default'].redraw();
      location.reload();

    } else {
      // alert(response.data.message);
      alert('invalid username or password');
    }
  }, function (err) {
     alert('an error occured during login. Try again or contact our admin');
  });
}

function _handleRegisterSubmit(_ref8, dispatch) {
  var username = _ref8.username,
      email = _ref8.email,
      password = _ref8.password,
      password2 = _ref8.password2;

  if (password !== password2) {
      alert('password does not match');
      return;
  }

  var formdata = new FormData();
  formdata.append('username', username);
  formdata.append('email', email);
  formdata.append('password', btoa(password));
  formdata.append('password2', btoa(password2));
  formdata.append('security', prgen_frontend_settings.registerNonce);
  http.request({
    method: 'POST',
    url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_frontend_user_register',
    background: true,
    withCredentials: true,
    data: formdata
  }).then(function (response) {
    if (response.success) {
      dispatch({ type: USERLOGGEDIN, userId: response.data.user });
      _redraw2['default'].redraw();
      location.reload();
    } else {
      alert(response.data.message);
    }
  }, function (err) {
    alert('an error occured during register. Try again or contact our admin');
  });
}

function handleSaveConfiguration(dispatch, state) {
  return function (e) {
    e.preventDefault();
    var formdata = new FormData();
    formdata.append('frontend_state', JSON.stringify(state));
    state.choosed.forEach(function (option) {
      formdata.append('option[]', option.id);
      formdata.append('parent[]', option.parent.id);
    });
    var product = state.zipper.content.tree.label;
    formdata.append('product_id', product.id);
    formdata.append('product_series', state.series);
    formdata.append('security', prgen_frontend_settings.saveNonce);
    (0, _urlDetection.getProductConfiguration)(location.href).matchWith({
      Nothing: function Nothing() {
        return {};
      },
      Just: function Just(_ref9) {
        var value = _ref9.value;
        return formdata.append('config_id', value);
      }
    });
    http.request({
      method: 'POST',
      url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_frontend_save_configuration',
      data: formdata,
      background: true,
      withCredentials: true
    }).then(function (response) {
      if (response.success && prgen_frontend_settings.myAccount) {
        window.location.href = prgen_frontend_settings.myAccount + '&oid=' + response.data.id;
      } else {
        alert(response.data.message);
      }
    }, function (err) {
      alert('an error occured during save configuration. Try again or contact our admin');
    });
  };
}

// -----------------------------------------------------------------------------
// -- Utility ------------------------------------------------------------------
// -----------------------------------------------------------------------------
function getTreeIx(id, trees) {
  var len = trees.length,
      i = 0;
  while (i < len) {
    var tree = trees[i];
    if (tree.label.id === id) {
      return i;
    }
    i++;
  }
  return;
}

function extend(original, update) {
  function rec(a, b) {
    var k;
    for (k in b) {
      a[k] = b[k];
    }
    return a;
  }
  return rec(rec({}, original), update);
}

function optionIdEq(a, b) {
  return a.id === b.id;
}

function addChoosedOption(option, parent, choosed) {
  var cho = choosed.slice();
  var ix = A.findIndex(function (x) {
    return x.parent.id === parent.id;
  }, choosed);
  return ix.matchWith({
    Nothing: function Nothing() {
      cho.push(_extends({ parent: parent }, option));

      return cho;
    },
    Just: function Just(_ref10) {
      var value = _ref10.value;

      cho[value] = _extends({ parent: parent }, option);

      return cho;
    }
  });
}

function filterOptionByLogic(forest, choosed) {
  var choose = choosed.map(function (x) {
    return [x.id, x.parent.id];
  });
  choose = Array.prototype.concat.apply([], choose);
  return forest.filter(function (tree) {
    var prod = tree.label;
    return (0, _logic.isOptionShouldDisplayed)(prod, choose);
  });
}

function canMoveNextStep(state, i) {
  return state.step > i ? true : Array.isArray(state.stepped) && state.stepped.includes(i);
}

function checkSavePage(state) {
  var len = Z.forest(Z.children(state.zipper)).length + 2;
  return len === state.step;
}

function doNothing() {}

function takeOption(opts) {
  var keys = Object.keys(opts);
  var results = Object.create(null);
  for (var i = 0, len = keys.length; i < len; i++) {
    if (keys[i] !== 'parent') {
      results[keys[i]] = opts[keys[i]];
    }
  }
  return results;
}

function optionEqual(opt1, opt2) {
  return opt1.id === opt2.id;
}
},{"./array":1,"./logic":3,"./stream":5,"./tree":7,"./tree-zipper":6,"./url-detection":8,"folktale/core/lambda/compose":22,"folktale/fantasy-land/map":27,"folktale/maybe":38,"mithril/redraw":46,"mithril/render/hyperscript":47,"mithril/request/request":50,"mithril/stream":51}],3:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.isOptionShouldHide = isOptionShouldHide;
exports.isOptionShouldDisplayed = isOptionShouldDisplayed;
/**
 * type Option r =
 *   { logicRules   :: String // comma separated options ids
 *   , logicType    :: 'all' | 'any'
 *   , logicDisplay :: 'hide' | 'show'
 *   } | r
 */
// isOptionShouldHide -> Option r -> Array Int -> Boolean
function isOptionShouldHide(option, choosed) {
  // first split the ids
  var rules = option.logicRules.trim().split(',').map(function (x) {
    return parseInt(x, 10);
  });

  if (option.logicType === 'any') {

    var a = rules.some(function (x) {
      return choosed.includes(x);
    });
    return option.logicDisplay === 'hide' ? a : !a;
  } 
  else {

    var b = rules.every(function (x) {
      return choosed.includes(x);
    });
    return option.logicDisplay === 'hide' ? b : !b;
  }
}

function isOptionShouldDisplayed(option, choosed) {
  return !isOptionShouldHide(option, choosed);
}
},{}],4:[function(require,module,exports){
'use strict';

var _request = require('mithril/request/request');

var _request2 = _interopRequireDefault(_request);

var _mount = require('mithril/mount');

var _mount2 = _interopRequireDefault(_mount);

var _hyperscript = require('mithril/render/hyperscript');

var _hyperscript2 = _interopRequireDefault(_hyperscript);

var _tree = require('./tree');

var _treeZipper = require('./tree-zipper');

var Z = _interopRequireWildcard(_treeZipper);

var _component = require('./component');

var _urlDetection = require('./url-detection');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var http = (0, _request2['default'])(window, Promise);

function takeOptions(opts) {
  var keys = Object.keys(opts);
  var results = Object.create(null);
  for (var i = 0, len = keys.length; i < len; i++) {
    if (keys[i] !== 'childs') {
      results[keys[i]] = opts[keys[i]];
    }
  }
  return results;
}

function buildTree(opts) {
  return [takeOptions(opts), opts.childs];
}

function getProductId() {
  var cls = document.body.className.split(' ').filter(function (x) {
    return x.includes('postid-');
  });

  return cls.length === 0 ? null : parseInt(cls[0].replace('postid-', ''));
}

function getSpace(id, trees) {
  var len = trees.length,
      i = 0;
  while (i < len) {
    var tree = trees[i];
    if (tree.label.id === id) {
      return i;
    }
    i++;
  }
  return;
}

function initState(trees, series, getProduct) {
  var page = prgen_frontend_settings.page;
  var state = { series: series,
    trees: trees,
    stepped: [],
    zipper: null,
    step: page === 'archive' ? 1 : 1,
    index: -1,
    userId: parseInt(prgen_frontend_settings.userId, 10),
    choosed: []
  };
  if (page === 'archive') {
    var productId = getProduct(),
        ix = getSpace(productId, state.trees),
        ts = Z.fromTree(state.trees[ix]);

    state.zipper = ts;
    state.stepped = [1, 2];
  }
  return state;
}

function normalizeStep(product) {
  var prod = Object.assign({}, product);
  prod.childs = product.childs.filter(function (x) {
    return x.childs.length > 0;
  });
  return prod;
}

function getProductAchiveData(series) {
  return http.request({
    method: 'GET',
    url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_get_product_archive_json&cat_name=' + series,
    background: true,
    withCredentials: true
  });
}

function getConfigurationData(id) {
  return http.request({
    method: 'GET',
    url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_get_product_configuration&id=' + id,
    background: true,
    withCredentials: true
  });
}

function getProductSeries(id) {
  return http.request({
    method: 'GET',
    url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_get_product_series&id=' + id,
    background: true,
    withCredentials: true
  });
}

function waitNextAnimationFrame(data) {
  return new Promise(function (resolve) {
    requestAnimationFrame(function () {
      return resolve(data);
    });
  });
}

function mainProduct(series) {
  return getProductAchiveData(series).then(function (resp) {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        resolve(resp.data.products);
      });
    });
  }).then(function (products) {
    var trees = products.map(function (product) {
      return (0, _tree.unfoldTree)(buildTree, normalizeStep(product));
    });
    var state = initState(trees, series, getProductId);
    var container = document.querySelector('.prgenapp');
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      (0, _mount2['default'])(container, {
        view: function view() {
          return (0, _hyperscript2['default'])(_component.frontendComponent, { initialState: state });
        }
      });
    }
  });
}

//
function main(series) {
  return (0, _urlDetection.getProductConfiguration)(location.href).matchWith({
    Nothing: function Nothing() {
      if (!series) {
        return waitNextAnimationFrame().then(function (_) {
          return Promise.resolve(getProductId());
        }).then(function (id) {
          return id != null ? getProductSeries(id) : Promise.reject();
        }).then(function (series) {
          return series.success ? Promise.resolve(series.data.series) : Promise.reject();
        }).then(function (data) {
          var series = data.series;
          if (series.length > 0) {
            // console.log(series);
            mainProduct(series[0]);
          }
        }).then(null, function () {});
      }
      //
      return mainProduct(series);
    },
    Just: function Just(_ref) {
      var configid = _ref.value;

      return getConfigurationData(configid).then(function (configdata) {
        return configdata.success ? Promise.resolve(configdata.data) : Promise.reject();
      }).then(function (configdata) {
        return getProductAchiveData(configdata.series).then(function (archive) {
          return archive.success ? Promise.resolve([archive.data, configdata]) : Promise.reject();
        });
      }).then(waitNextAnimationFrame).then(function (_ref2) {
        var archive = _ref2[0],
            configdata = _ref2[1];

        var trees = archive.products.map(function (product) {
          return (0, _tree.unfoldTree)(buildTree, normalizeStep(product));
        });
        var state = initState(trees, configdata.series, getProductId);
        var productId = getProductId(),
            ix = getSpace(productId, state.trees),
            ts = Z.fromTree(state.trees[ix]);
        state.zipper = ts;
        state.stepped = configdata.frontend_state.stepped;
        state.choosed = configdata.frontend_state.choosed.filter(function (x) {
          return configdata.option_parts.includes(x.id);
        });
        state.step = configdata.frontend_state.step;
        var container = document.querySelector('.prgenapp');
        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          (0, _mount2['default'])(container, {
            view: function view() {
              return (0, _hyperscript2['default'])(_component.frontendComponent, { initialState: state });
            }
          });
        }
      }).then(null, function (err) {
        // console.log(err);
        alert('invalid request');
      });
    }
  });
}

// run
main();
window.mithrilMain = function (series) {
  return main(series);
};
},{"./component":2,"./tree":7,"./tree-zipper":6,"./url-detection":8,"mithril/mount":44,"mithril/render/hyperscript":47,"mithril/request/request":50}],5:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.reduceStream = reduceStream;

var _stream = require('mithril/stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function reduceStream(f, acc, s) {
  var current = _stream2['default'].combine(function (s) {
    acc = f(current() || acc, s());
    return acc;
  }, [s]);
  return current;
}
},{"mithril/stream":51}],6:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.Full = exports.Empty = exports.Pos = undefined;
exports.Pair3 = Pair3;
exports.TreeZiper = TreeZiper;
exports.prev = prev;
exports.next = next;
exports.forest = forest;
exports.parent = parent;
exports.root = root;
exports.prevSpace = prevSpace;
exports.prevTree = prevTree;
exports.nextSpace = nextSpace;
exports.nextTree = nextTree;
exports.children = children;
exports.first = first;
exports.last = last;
exports.spaceAt = spaceAt;
exports.firstChild = firstChild;
exports.lastChild = lastChild;
exports.childAt = childAt;
exports.fromTree = fromTree;
exports.toTree = toTree;

var _union = require('folktale/adt/union');

var _maybe = require('folktale/maybe');

var _map = require('folktale/fantasy-land/map');

var _map2 = _interopRequireDefault(_map);

var _tree = require('./tree');

var _array = require('./array');

var A = _interopRequireWildcard(_array);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function Pair3(a, b, c) {
  if (!(this instanceof Pair3)) {
    return new Pair3(a, b, c);
  }
  this.fst = a;
  this.snd = b;
  this.tre = c;
}

// data TreeZiper a = TreeZiper (Pos a) (Forest a) (Forest a) [Pair3 (Forest a) a (Forest a)]
function TreeZiper(ta, before, after, parents) {
  if (!(this instanceof TreeZiper)) {
    return new TreeZiper(ta, before, after, parents);
  }
  this.content = ta;
  this.before = before;
  this.after = after;
  this.parents = parents;
}

var Pos = exports.Pos = (0, _union.union)('prgen:Pos', {
  Empty: function Empty() {},
  Full: function Full(tree) {
    return { tree: tree };
  }
});

var Empty = Pos.Empty,
    Full = Pos.Full;

// the sibling before this location

exports.Empty = Empty;
exports.Full = Full;
function prev(loc) {
  return loc.content.matchWith({
    Empty: function Empty() {
      return (0, _map2['default'])(prevTree(loc), function (x) {
        return (0, _map2['default'])(x, prevSpace);
      });
    },
    Full: function Full() {
      return prevTree(prevSpace(loc));
    }
  });
}

// The sibling after this location.
function next(loc) {
  return loc.content.matchWith({
    Empty: function Empty() {
      return (0, _map2['default'])(nextTree(loc), function (x) {
        return (0, _map2['default'])(x, nextSpace);
      });
    },
    Full: function Full() {
      return nextTree(nextSpace(loc));
    }
  });
}

// All trees at this location
function forest(loc) {
  return loc.content.matchWith({
    Empty: function Empty() {
      return loc.before.reduce(function (a, b) {
        return [b].concat(a);
      }, loc.after);
    },
    Full: function Full(ta) {
      return loc.before.reduce(function (a, b) {
        return [b].concat(a);
      }, [ta.tree].concat(loc.after));
    }
  });
}

// The parent of the given location
// parent :: TreeZiper a -> Maybe (TreeZiper a)
function parent(loc) {
  if (loc.parents.length === 0) {
    return (0, _maybe.Nothing)();
  }
  var item = loc.parents[0];
  return (0, _maybe.Just)(TreeZiper(Full((0, _tree.Tree)(item.snd, forest(loc))), item.fst, item.tre, loc.parents.slice(1)));
}

function root(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('root should be called when content is full');
  }

  return parent(loc).matchWith({
    Nothing: function Nothing() {
      return loc;
    },
    Just: function Just(_ref) {
      var value = _ref.value;
      return root(value);
    }
  });
}

// The space immediately before this location.
function prevSpace(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('prevSpace should be called when content is full');
  }

  return TreeZiper(Empty(), loc.before, [loc.content.tree].concat(loc.after), loc.parents);
}

// prevTree :: TreePos Empty a -> Maybe (TreePos Full a)
function prevTree(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('prevTree should be called when content is empty');
  }

  if (loc.before.length === 0) {
    return (0, _maybe.Nothing)();
  }
  var item = loc.before[0];
  return (0, _maybe.Just)(TreeZiper(Full(item), loc.before.slice(1), loc.after, loc.parents));
}

// The space immediately after this location.
function nextSpace(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('nextSpace should be called when content is full');
  }

  return TreeZiper(Empty(), loc.before, [loc.content.tree].concat(loc.after), loc.parents);
}

function nextTree(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('nextTree should be called when content is empty');
  }

  if (loc.after.length === 0) {
    return (0, _maybe.Nothing)();
  }

  return (0, _maybe.Just)(TreeZiper(Full(loc.after[0]), loc.before, loc.after.slice(1), loc.parents));
}

function children(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('children should be called when content is full');
  }

  return TreeZiper(Empty(), [], loc.content.tree.subforest, [Pair3(loc.before, loc.content.tree.label, loc.after)].concat(loc.parents));
}

function first(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('first should be called when content is empty');
  }

  return TreeZiper(Empty(), [], A.append(A.reverse(loc.before), loc.after), loc.parents);
}

// The last space in the current forest.
function last(loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('last should be called when content is empty');
  }

  return TreeZiper(Empty(), A.append(A.reverse(loc.after), loc.before), [], loc.parents);
}

function spaceAt(n, loc) {
  if (Full.hasInstance(loc.content)) {
    throw new Error('spaceAt should be called when content is empty');
  }

  var _A$splitAt = A.splitAt(n, forest(loc)),
      as = _A$splitAt[0],
      bs = _A$splitAt[1];

  return TreeZiper(Empty(), A.reverse(as), bs, loc.parents);
}

function firstChild(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('firstChild should be called when content is Full');
  }

  return nextTree(children(loc));
}

function lastChild(loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('firstChild should be called when content is Full');
  }

  return prevTree(last(children(loc)));
}

function childAt(n, loc) {
  if (Empty.hasInstance(loc.content)) {
    throw new Error('childAt should be called when content is Full');
  }

  if (n < 0) return (0, _maybe.Nothing)();

  return nextTree(spaceAt(n, children(loc)));
}

function fromTree(tree) {
  return TreeZiper(Full(tree), [], [], []);
}

function toTree(loc) {
  var tree = root(loc);
  return tree.content.tree;
}
},{"./array":1,"./tree":7,"folktale/adt/union":13,"folktale/fantasy-land/map":27,"folktale/maybe":38}],7:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.Tree = Tree;
exports.unfoldTree = unfoldTree;
exports.unfoldForest = unfoldForest;
exports.levels = levels;
exports.listTree = listTree;

var _map = require('folktale/fantasy-land/map');

var map = _interopRequireWildcard(_map);

var _array = require('./array');

var A = _interopRequireWildcard(_array);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

// type Forest a = [Tree a]
// data Tree a = Tree a [Tree a]
function Tree(a, subforest) {
  if (!(this instanceof Tree)) {
    return new Tree(a, subforest);
  }
  this.label = a;
  this.subforest = subforest;
}

Tree.prototype['fantasy-land/map'] = function (f) {
  return new Tree(f(this.label), this.forest.map(function (item) {
    return map.curried(f, item);
  }));
};

// unfoldTree :: (b -> [a, [b]]) -> b -> Tree a
function unfoldTree(f, b) {
  var _f = f(b),
      a = _f[0],
      bs = _f[1];

  return Tree(a, unfoldForest(f, bs));
}

// unfoldForest :: (b -> [a, [b]]) -> [b] -> Forest a
function unfoldForest(f, bs) {
  return bs.map(function (x) {
    return unfoldTree(f, x);
  });
}

function levels(tree) {
  var ret = A.itakeWhile(function (x) {
    return x.length > 0;
  }, A.iterate(A.concatMap.bind(null, subForest), [tree]));
  return ret.map(function (t) {
    return t.map(function (x) {
      return x.label;
    });
  });
}

function listTree(tree) {
  function go(ret, tr) {
    if (tr.subforest.length === 0) return [ret.concat([tr.label])];
    return A.concatMap(go.bind(null, ret.concat([tr.label])), tr.subforest);
  }
  return go([], tree);
}

function subForest(x) {
  return x.subforest;
}
},{"./array":1,"folktale/fantasy-land/map":27}],8:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.getProductConfiguration = getProductConfiguration;

var _maybe = require('folktale/maybe');

function getProductConfiguration(url) {
  if (url.includes('?')) {
    var _url$split = url.split('?'),
        path = _url$split[0],
        params = _url$split[1];

    var parts = params.split('&');
    var mconfig = parts.filter(function (item) {
      return item.substr(0, 7) === 'config=';
    });
    if (mconfig.length > 0) {
      var id = parseInt(mconfig[0].split('=')[1], 10);
      return isNaN(id) ? (0, _maybe.Nothing)() : (0, _maybe.Just)(id);
    }
    return (0, _maybe.Nothing)();
  }
  return (0, _maybe.Nothing)();
}
},{"folktale/maybe":38}],9:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var _require = require('../union'),
    tagSymbol = _require.tagSymbol,
    typeSymbol = _require.typeSymbol;

// --[ Helpers ]--------------------------------------------------------
/*~
 * type: (Object Any) => String
 */


var objectToKeyValuePairs = function objectToKeyValuePairs(object) {
  return Object.keys(object).map(function (key) {
    return key + ': ' + showValue(object[key]);
  }).join(', ');
};

/*~
 * type: (Object Any).() => String
 */
var plainObjectToString = function plainObjectToString() {
  return '{ ' + objectToKeyValuePairs(this) + ' }';
};

/*~
 * type: (Array Any).() => String
 */
var arrayToString = function arrayToString() {
  return '[' + this.map(showValue).join(', ') + ']';
};

/*~
 * type: (Function) => String
 */
var functionNameToString = function functionNameToString(fn) {
  return fn.name !== '' ? ': ' + fn.name : '';
};

/*~
 * type: (Function) => String
 */
var functionToString = function functionToString(fn) {
  return '[Function' + functionNameToString(fn) + ']';
};

/*~
 * type: () => String
 */
var nullToString = function nullToString() {
  return 'null';
};

/*~
 * type: (Null | Object Any) => String
 */
var objectToString = function objectToString(object) {
  return object === null ? nullToString : Array.isArray(object) ? arrayToString : object.toString() === {}.toString() ? plainObjectToString : /* otherwise */object.toString;
};

/*~
 * type: (Any) => String
 */
var showValue = function showValue(value) {
  return typeof value === 'undefined' ? 'undefined' : typeof value === 'function' ? functionToString(value) : (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'symbol' ? value.toString() : (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? objectToString(value).call(value) : /* otherwise */JSON.stringify(value);
};

// --[ Implementation ]------------------------------------------------

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (Variant, Union) => Void
 */
var debugRepresentation = function debugRepresentation(variant, adt) {
  // eslint-disable-line max-statements
  var typeName = adt[typeSymbol];
  var variantName = adt[typeSymbol] + '.' + variant.prototype[tagSymbol];

  // (for Object.prototype.toString)
  adt[Symbol.toStringTag] = typeName;
  variant.prototype[Symbol.toStringTag] = variantName;

  // (regular JavaScript representations)
  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   () => String
   */
  adt.toString = function () {
    return typeName;
  };

  /*~
   * stability: experimental
   * mmodule: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   () => String
   */
  variant.toString = function () {
    return variantName;
  };

  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   (Union).() => String
   */
  variant.prototype.toString = function () {
    return variantName + '(' + plainObjectToString.call(this) + ')';
  };

  // (Node REPL representations)
  adt.inspect = adt.toString;
  variant.inspect = variant.toString;
  variant.prototype.inspect = variant.prototype.toString;

  return variant;
};

// --[ Exports ]-------------------------------------------------------
module.exports = debugRepresentation;
},{"../union":14}],10:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var assertType = require('../../../helpers/assert-type');
var flEquals = require('../../../fantasy-land/equals');
var fl = require('../../../helpers/fantasy-land');
var provideAliases = require('../../../helpers/provide-fantasy-land-aliases');
var copyDocs = require('../../../helpers/copy-documentation');

var _require = require('../union'),
    tagSymbol = _require.tagSymbol,
    typeSymbol = _require.typeSymbol;

var toString = Object.prototype.toString;
var prototypeOf = Object.getPrototypeOf;

// --[ Helpers ]--------------------------------------------------------

/*~
 * type: (Any) => Boolean
 */
var isSetoid = function isSetoid(value) {
  return value != null && (typeof value[fl.equals] === 'function' || typeof value.equals === 'function');
};

/*~
 * type: (Variant, Variant) => Boolean
 */
var sameType = function sameType(a, b) {
  return a[typeSymbol] === b[typeSymbol] && a[tagSymbol] === b[tagSymbol];
};

var isPlainObject = function isPlainObject(object) {
  if (Object(object) !== object) return false;

  return !prototypeOf(object) || !object.toString || toString.call(object) === object.toString();
};

var deepEquals = function deepEquals(a, b) {
  if (a === b) return true;

  var leftSetoid = isSetoid(a);
  var rightSetoid = isSetoid(b);
  if (leftSetoid) {
    if (rightSetoid) return flEquals(a, b);else return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every(function (x, i) {
      return deepEquals(x, b[i]);
    });
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    var keysA = Object.keys(a);
    var keysB = Object.keys(b);
    var setB = new Set(keysB);
    return keysA.length === keysB.length && prototypeOf(a) === prototypeOf(b) && keysA.every(function (k) {
      return setB.has(k) && a[k] === b[k];
    });
  }

  return false;
};

// --[ Implementation ]------------------------------------------------
/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (('a, 'a) => Boolean) => (Variant, Union) => Void
 */
var createDerivation = function createDerivation(valuesEqual) {
  /*~
   * type: ('a, 'a) => Boolean
   */
  var equals = function equals(a, b) {
    // identical objects must be equal
    if (a === b) return true;

    // we require both values to be setoids if one of them is
    var leftSetoid = isSetoid(a);
    var rightSetoid = isSetoid(b);
    if (leftSetoid) {
      if (rightSetoid) return flEquals(a, b);else return false;
    }

    // fall back to the provided equality
    return valuesEqual(a, b);
  };

  /*~
   * type: (Object Any, Object Any, Array String) => Boolean
   */
  var compositesEqual = function compositesEqual(a, b, keys) {
    for (var i = 0; i < keys.length; ++i) {
      var keyA = a[keys[i]];
      var keyB = b[keys[i]];
      if (!equals(keyA, keyB)) {
        return false;
      }
    }
    return true;
  };

  var derivation = function derivation(variant, adt) {
    /*~
     * stability: experimental
     * module: null
     * authors:
     *   - "@boris-marinov"
     *   - Quildreen Motta
     * 
     * type: |
     *   forall S, a:
     *     (S a).(S a) => Boolean
     *   where S is Setoid
     */
    variant.prototype.equals = function (value) {
      assertType(adt)(this[tagSymbol] + '#equals', value);
      return sameType(this, value) && compositesEqual(this, value, Object.keys(this));
    };
    provideAliases(variant.prototype);
    return variant;
  };
  copyDocs(createDerivation, derivation, {
    type: '(Variant, Union) => Void'
  });

  return derivation;
};

// --[ Exports ]-------------------------------------------------------

/*~~inheritsMeta: createDerivation */
module.exports = createDerivation(deepEquals);

module.exports.withCustomComparison = createDerivation;
},{"../../../fantasy-land/equals":26,"../../../helpers/assert-type":29,"../../../helpers/copy-documentation":30,"../../../helpers/fantasy-land":33,"../../../helpers/provide-fantasy-land-aliases":34,"../union":14}],11:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: experimental
 * name: module folktale/adt/union/derivations
 */
module.exports = {
  serialization: require('./serialization'),
  equality: require('./equality'),
  debugRepresentation: require('./debug-representation')
};
},{"./debug-representation":9,"./equality":10,"./serialization":12}],12:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var _require = require('../union'),
    tagSymbol = _require.tagSymbol,
    typeSymbol = _require.typeSymbol;

var mapValues = require('../../../core/object/map-values');
var values = require('../../../core/object/values');
var extend = require('../../../helpers/extend');

// --[ Constants ]------------------------------------------------------
var typeJsonKey = '@@type';
var tagJsonKey = '@@tag';
var valueJsonKey = '@@value';

// --[ Helpers ]--------------------------------------------------------

/*~
 * type: ((Object 'a) => 'b) => ([Object 'a]) => Object 'b  
 */
var arrayToObject = function arrayToObject(extractKey) {
  return function (array) {
    return array.reduce(function (object, element) {
      object[extractKey(element)] = element;
      return object;
    }, {});
  };
};

/*~
 * type: (String) => (Object 'a) => 'a | None 
 */
var property = function property(propertyName) {
  return function (object) {
    return object[propertyName];
  };
};

/*~
 * type: ([Object 'a]) => Object 'a 
 */
var indexByType = arrayToObject(property(typeSymbol));

/*~
 * type: (String, String) => Bool
 */
var assertType = function assertType(given, expected) {
  if (expected !== given) {
    throw new TypeError('\n       The JSON structure was generated from ' + expected + '.\n       You are trying to parse it as ' + given + '. \n    ');
  }
};

/*~
 * type: |
 *   type JSONSerialisation = {
 *     "@@type":  String,
 *     "@@tag":   String,
 *     "@@value": Object Any
 *   }
 *   type JSONParser = {
 *     fromJSON: (JSONSerialisation, Array JSONParser) => Variant
 *   }
 * 
 *   (Object JSONParser) => (JSONSerialisation) => Any
 */
var parseValue = function parseValue(parsers) {
  return function (value) {
    if (value !== null && typeof value[typeJsonKey] === 'string') {
      var type = value[typeJsonKey];
      if (parsers[type]) {
        return parsers[type].fromJSON(value, parsers, true);
      } else {
        return value;
      }
    } else {
      return value;
    }
  };
};

/*~
 * type: ('a) => JSON
 */
var serializeValue = function serializeValue(value) {
  return value === undefined ? null : value !== null && typeof value.toJSON === 'function' ? value.toJSON() : /* otherwise */value;
};

// --[ Implementation ]-------------------------------------------------

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   (Variant, ADT) => Void 
 */
var serialization = function serialization(variant, adt) {
  var typeName = adt[typeSymbol];
  var tagName = variant.prototype[tagSymbol];

  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   type JSONSerialisation = {
   *     "@@type":  String,
   *     "@@tag":   String,
   *     "@@value": Object Any
   *   }
   * 
   *   Variant . () => JSONSerialisation
   */
  variant.prototype.toJSON = function () {
    var _ref;

    return _ref = {}, _defineProperty(_ref, typeJsonKey, typeName), _defineProperty(_ref, tagJsonKey, tagName), _defineProperty(_ref, valueJsonKey, mapValues(this, serializeValue)), _ref;
  };

  /*~
   * stability: experimental
   * module: null
   * authors:
   *   - "@boris-marinov"
   * 
   * type: |
   *   type JSONSerialisation = {
   *     "@@type":  String,
   *     "@@tag":   String,
   *     "@@value": Object Any
   *   }
   *   type JSONParser = {
   *     fromJSON: (JSONSerialisation, Array JSONParser) => Variant
   *   }
   * 
   *   (JSONSerialisation, Array JSONParser) => Variant
   */
  adt.fromJSON = function (value) {
    var parsers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defineProperty({}, typeName, adt);
    var keysIndicateType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var valueTypeName = value[typeJsonKey];
    var valueTagName = value[tagJsonKey];
    var valueContents = value[valueJsonKey];
    assertType(typeName, valueTypeName);
    var parsersByType = keysIndicateType ? parsers : /*otherwise*/indexByType(values(parsers));

    var parsedValue = mapValues(valueContents, parseValue(parsersByType));
    return extend(Object.create(adt[valueTagName].prototype), parsedValue);
  };
};

// --[ Exports ]--------------------------------------------------------
module.exports = serialization;
},{"../../../core/object/map-values":24,"../../../core/object/values":25,"../../../helpers/extend":32,"../union":14}],13:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: experimental
 * name: module folktale/adt/union
 */
module.exports = {
  union: require('./union'),
  derivations: require('./derivations')
};
},{"./derivations":11,"./union":14}],14:[function(require,module,exports){
'use strict';

function _defineEnumerableProperties(obj, descs) { for (var key in descs) { var desc = descs[key]; desc.configurable = desc.enumerable = true; if ("value" in desc) desc.writable = true; Object.defineProperty(obj, key, desc); } return obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// --[ Dependencies ]---------------------------------------------------
var warnDeprecation = require('../../helpers/warn-deprecation');
var extend = require('../../helpers/extend');

// --[ Constants and Aliases ]------------------------------------------
var TYPE = Symbol.for('@@folktale:adt:type');
var TAG = Symbol.for('@@folktale:adt:tag');
var META = Symbol.for('@@meta:magical');

var keys = Object.keys;

// --[ Helpers ]--------------------------------------------------------

//
// Returns an array of own enumerable values in an object.
//
function values(object) {
  return keys(object).map(function (key) {
    return object[key];
  });
}

//
// Transforms own enumerable key/value pairs.
//
function mapObject(object, transform) {
  return keys(object).reduce(function (result, key) {
    result[key] = transform(key, object[key]);
    return result;
  }, {});
}

// --[ Variant implementation ]-----------------------------------------

//
// Defines the variants given a set of patterns and an ADT namespace.
//
function defineVariants(typeId, patterns, adt) {
  return mapObject(patterns, function (name, constructor) {
    var _constructor, _ref, _extend, _mutatorMap, _tag, _type, _constructor2, _extend2, _mutatorMap2;

    // ---[ Variant Internals ]-----------------------------------------
    function InternalConstructor() {}
    InternalConstructor.prototype = Object.create(adt);

    extend(InternalConstructor.prototype, (_extend = {}, _defineProperty(_extend, TAG, name), _constructor = 'constructor', _mutatorMap = {}, _mutatorMap[_constructor] = _mutatorMap[_constructor] || {}, _mutatorMap[_constructor].get = function () {
      return constructor;
    }, _ref = 'is' + name, _mutatorMap[_ref] = _mutatorMap[_ref] || {}, _mutatorMap[_ref].get = function () {
      warnDeprecation('.is' + name + ' is deprecated. Use ' + name + '.hasInstance(value)\ninstead to check if a value belongs to the ADT variant.');
      return true;
    }, _defineProperty(_extend, 'matchWith', function matchWith(pattern) {
      return pattern[name](this);
    }), _defineEnumerableProperties(_extend, _mutatorMap), _extend));

    function makeInstance() {
      var result = new InternalConstructor(); // eslint-disable-line prefer-const
      extend(result, constructor.apply(undefined, arguments) || {});
      return result;
    }

    extend(makeInstance, (_extend2 = {}, _defineProperty(_extend2, META, constructor[META]), _tag = 'tag', _mutatorMap2 = {}, _mutatorMap2[_tag] = _mutatorMap2[_tag] || {}, _mutatorMap2[_tag].get = function () {
      return name;
    }, _type = 'type', _mutatorMap2[_type] = _mutatorMap2[_type] || {}, _mutatorMap2[_type].get = function () {
      return typeId;
    }, _constructor2 = 'constructor', _mutatorMap2[_constructor2] = _mutatorMap2[_constructor2] || {}, _mutatorMap2[_constructor2].get = function () {
      return constructor;
    }, _defineProperty(_extend2, 'prototype', InternalConstructor.prototype), _defineProperty(_extend2, 'hasInstance', function hasInstance(value) {
      return Boolean(value) && adt.hasInstance(value) && value[TAG] === name;
    }), _defineEnumerableProperties(_extend2, _mutatorMap2), _extend2));

    return makeInstance;
  });
}

// --[ ADT Implementation ]--------------------------------------------

/*~
 * authors:
 *   - Quildreen Motta
 * 
 * stability: experimental
 * type: |
 *   (String, Object (Array String)) => Union
 */
var union = function union(typeId, patterns) {
  var _extend3;

  var UnionNamespace = Object.create(Union);
  var variants = defineVariants(typeId, patterns, UnionNamespace);

  extend(UnionNamespace, variants, (_extend3 = {}, _defineProperty(_extend3, TYPE, typeId), _defineProperty(_extend3, 'variants', values(variants)), _defineProperty(_extend3, 'hasInstance', function hasInstance(value) {
    return Boolean(value) && value[TYPE] === this[TYPE];
  }), _extend3));

  return UnionNamespace;
};

/*~ ~belongsTo : union */
var Union = {
  /*~
   * type: |
   *   Union . (...(Variant, Union) => Any) => Union
   */
  derive: function derive() {
    var _this = this;

    for (var _len = arguments.length, derivations = Array(_len), _key = 0; _key < _len; _key++) {
      derivations[_key] = arguments[_key];
    }

    derivations.forEach(function (derivation) {
      _this.variants.forEach(function (variant) {
        return derivation(variant, _this);
      });
    });
    return this;
  }
};

// --[ Exports ]--------------------------------------------------------
union.Union = Union;
union.typeSymbol = TYPE;
union.tagSymbol = TAG;

module.exports = union;
},{"../../helpers/extend":32,"../../helpers/warn-deprecation":37}],15:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../result/result'),
    Error = _require.Error,
    Ok = _require.Ok;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Maybe a, b) => Result b a
 */


var maybeToResult = function maybeToResult(aMaybe, failureValue) {
  return aMaybe.matchWith({
    Nothing: function Nothing() {
      return Error(failureValue);
    },
    Just: function Just(_ref) {
      var value = _ref.value;
      return Ok(value);
    }
  });
};

module.exports = maybeToResult;
},{"../result/result":40}],16:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../validation/validation'),
    Success = _require.Success,
    Failure = _require.Failure;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Maybe a, b) => Validation b a
 */


var maybeToValidation = function maybeToValidation(aMaybe, failureValue) {
  return aMaybe.matchWith({
    Nothing: function Nothing() {
      return Failure(failureValue);
    },
    Just: function Just(_ref) {
      var value = _ref.value;
      return Success(value);
    }
  });
};

module.exports = maybeToValidation;
},{"../validation/validation":41}],17:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../maybe/maybe'),
    Nothing = _require.Nothing,
    Just = _require.Just;

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 * 
 * type: |
 *   forall a:
 *     (a or None) => Maybe a
 */


var nullableToMaybe = function nullableToMaybe(a) {
  return a != null ? Just(a) : /*else*/Nothing();
};

module.exports = nullableToMaybe;
},{"../maybe/maybe":39}],18:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../maybe/maybe'),
    Just = _require.Just,
    Nothing = _require.Nothing;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 *
 * type: |
 *   forall a, b:
 *     (Result a b) => Maybe b
 */


var resultToMaybe = function resultToMaybe(aResult) {
  return aResult.matchWith({
    Error: function Error(_ref) {
      var _ = _ref.value;
      return Nothing();
    },
    Ok: function Ok(_ref2) {
      var value = _ref2.value;
      return Just(value);
    }
  });
};

module.exports = resultToMaybe;
},{"../maybe/maybe":39}],19:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../validation/validation'),
    Success = _require.Success,
    Failure = _require.Failure;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Result a b) => Validation a b
 */


var resultToValidation = function resultToValidation(aResult) {
  return aResult.matchWith({
    Error: function Error(_ref) {
      var value = _ref.value;
      return Failure(value);
    },
    Ok: function Ok(_ref2) {
      var value = _ref2.value;
      return Success(value);
    }
  });
};

module.exports = resultToValidation;
},{"../validation/validation":41}],20:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../maybe/maybe'),
    Just = _require.Just,
    Nothing = _require.Nothing;

/*~
 * stability: stable
 * authors: 
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *     (Validation a b) => Maybe b
 */


var validationToMaybe = function validationToMaybe(aValidation) {
  return aValidation.matchWith({
    Failure: function Failure() {
      return Nothing();
    },
    Success: function Success(_ref) {
      var value = _ref.value;
      return Just(value);
    }
  });
};

module.exports = validationToMaybe;
},{"../maybe/maybe":39}],21:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../result/result'),
    Error = _require.Error,
    Ok = _require.Ok;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 * 
 * type: |
 *   forall a, b:
 *      (Validation a b) => Result a b
 */


var validationToResult = function validationToResult(aValidation) {
  return aValidation.matchWith({
    Failure: function Failure(_ref) {
      var value = _ref.value;
      return Error(value);
    },
    Success: function Success(_ref2) {
      var value = _ref2.value;
      return Ok(value);
    }
  });
};

module.exports = validationToResult;
},{"../result/result":40}],22:[function(require,module,exports){
"use strict";

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 *
 * signature: compose(f, g)(value)
 * type: |
 *   (('b) => 'c, ('a) => 'b) => (('a) => 'c)
 */
var compose = function compose(f, g) {
  return function (value) {
    return f(g(value));
  };
};

// --[ Convenience ]---------------------------------------------------

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 *
 * type: |
 *   (('b) => 'c) . (('a) => 'b) => (('a) => 'c)
 */
compose.infix = function (that) {
  return compose(that, this);
};

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 *
 * type: |
 *   (Function...) -> Function
 */
compose.all = function () {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  /* eslint-disable no-magic-numbers */
  if (fns.length < 1) {
    // eslint-disable-next-line prefer-rest-params
    throw new TypeError("compose.all requires at least one argument, " + arguments.length + " given.");
  }
  return fns.reduce(compose);
}; /* eslint-enable no-magic-numbers */

// --[ Exports ]-------------------------------------------------------
module.exports = compose;
},{}],23:[function(require,module,exports){
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: experimental
 * authors:
 *   - Quildreen Motta
 *
 * type: |
 *   (Number, (Any...) => 'a) => Any... => 'a or ((Any...) => 'a)
 */
var curry = function curry(arity, fn) {
  var curried = function curried(oldArgs) {
    return function () {
      for (var _len = arguments.length, newArgs = Array(_len), _key = 0; _key < _len; _key++) {
        newArgs[_key] = arguments[_key];
      }

      var allArgs = oldArgs.concat(newArgs);
      var argCount = allArgs.length;

      return argCount < arity ? curried(allArgs) : /* otherwise */fn.apply(undefined, _toConsumableArray(allArgs));
    };
  };

  return curried([]);
};

// --[ Exports ]-------------------------------------------------------
module.exports = curry;
},{}],24:[function(require,module,exports){
"use strict";

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 *
 * complexity: O(n), n is the number of own enumerable properties.
 * type: |
 *   (Object 'a, ('a) => 'b) => Object 'b
 */
var mapValues = function mapValues(object, transformation) {
  var keys = Object.keys(object);
  var result = {};

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    result[key] = transformation(object[key]);
  }

  return result;
};

// --[ Convenience ]---------------------------------------------------

/*~
 * stability: stable
 * authors:
 *   - Quildreen Motta
 * 
 * complexity: O(n), n is the number of own enumerable properties.
 * type: |
 *   (Object 'a) . (('a) => 'b) => Object 'b
 */
mapValues.infix = function (transformation) {
  return mapValues(this, transformation);
};

// --[ Exports ]-------------------------------------------------------
module.exports = mapValues;
},{}],25:[function(require,module,exports){
"use strict";

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

/*~
 * stability : stable
 * authors:
 *   - Quildreen Motta
 *
 * complexity : O(n), n is the number of own enumerable properties.
 * type: |
 *   (Object 'a) => Array 'a
 */
var values = function values(object) {
  return Object.keys(object).map(function (k) {
    return object[k];
  });
};

// --[ Exports ]-------------------------------------------------------
module.exports = values;
},{}],26:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../helpers/fantasy-land'),
    flEquals = _require.equals;

var curry = require('../core/lambda/curry');
var warn = require('../helpers/warn-deprecated-method')('equals');
var unsupported = require('../helpers/unsupported-method')('equals');

var isNew = function isNew(a) {
  return typeof a[flEquals] === 'function';
};
var isOld = function isOld(a) {
  return typeof a.equals === 'function';
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a, S a) => Boolean
 *   where S is Setoid
 */
var equals = function equals(setoidLeft, setoidRight) {
  return isNew(setoidLeft) ? setoidLeft[flEquals](setoidRight) : isOld(setoidLeft) ? warn(setoidLeft.equals(setoidRight)) : /*otherwise*/unsupported(setoidLeft);
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a) => (S a) => Boolean
 *   where S is Setoid
 */
equals.curried = curry(2, function (setoidRight, setoidLeft) {
  return (// eslint-disable-line no-magic-numbers
    equals(setoidLeft, setoidRight)
  );
});

/*~
 * stability: experimental
 * authors:
 *   - Quildreen Motta
 * 
 * type: |
 *   forall S, a:
 *     (S a).(S a) => Boolean
 *   where S is Setoid
 */
equals.infix = function (aSetoid) {
  return equals(this, aSetoid);
};

module.exports = equals;
},{"../core/lambda/curry":23,"../helpers/fantasy-land":33,"../helpers/unsupported-method":35,"../helpers/warn-deprecated-method":36}],27:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../helpers/fantasy-land'),
    flMap = _require.map;

var curry = require('../core/lambda/curry');
var warn = require('../helpers/warn-deprecated-method')('map');
var unsupported = require('../helpers/unsupported-method')('map');

var isNew = function isNew(a) {
  return typeof a[flMap] === 'function';
};
var isOld = function isOld(a) {
  return typeof a.map === 'function';
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall F, a, b:
 *     (F a, (a) => b) => F b
 *   where F is Functor
 */
var map = function map(functor, transformation) {
  return isNew(functor) ? functor[flMap](transformation) : isOld(functor) ? warn(functor.map(transformation)) : /*otherwise*/unsupported(functor);
};

/*~
 * stability: experimental
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * type: |
 *   forall F, a, b:
 *     ((a) => b) => (F a) => F b
 *   where F is Functor
 */
map.curried = curry(2, function (transformation, functor) {
  return (// eslint-disable-line no-magic-numbers
    map(functor, transformation)
  );
});

/*~
 * stability: experimental
 * authors:
 *   - Quildreen Motta
 * 
 * type: |
 *   forall F, a, b:
 *     (F a).((a) => b) => F b
 *   where F is Functor
 */
map.infix = function (transformation) {
  return map(this, transformation);
};

module.exports = map;
},{"../core/lambda/curry":23,"../helpers/fantasy-land":33,"../helpers/unsupported-method":35,"../helpers/warn-deprecated-method":36}],28:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

module.exports = function (method, transformation) {
  if (typeof transformation !== 'function') {
    throw new TypeError(method + ' expects a function, but was given ' + transformation + '.');
  }
};
},{}],29:[function(require,module,exports){
(function (process){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var _require = require('../adt/union/union'),
    typeSymbol = _require.typeSymbol;

module.exports = function (type) {
  return function (method, value) {
    var typeName = type[typeSymbol];
    if (process.env.FOLKTALE_ASSERTIONS !== 'none' && !type.isPrototypeOf(value)) {
      console.warn(typeName + '.' + method + ' expects a value of the same type, but was given ' + value + '.');

      if (process.env.FOLKTALE_ASSERTIONS !== 'minimal') {
        console.warn('\nThis could mean that you\'ve provided the wrong value to the method, in\nwhich case this is a bug in your program, and you should try to track\ndown why the wrong value is getting here.\n\nBut this could also mean that you have more than one ' + typeName + ' library\ninstantiated in your program. This is not **necessarily** a bug, it\ncould happen for several reasons:\n\n 1) You\'re loading the library in Node, and Node\'s cache didn\'t give\n    you back the same instance you had previously requested.\n\n 2) You have more than one Code Realm in your program, and objects\n    created from the same library, in different realms, are interacting.\n\n 3) You have a version conflict of folktale libraries, and objects\n    created from different versions of the library are interacting.\n\nIf your situation fits the cases (1) or (2), you are okay, as long as\nthe objects originate from the same version of the library. Folktale\ndoes not rely on reference checking, only structural checking. However\nyou\'ll want to watch out if you\'re modifying the ' + typeName + '\'s prototype,\nbecause you\'ll have more than one of them, and you\'ll want to make\nsure you do the same change in all of them \u2014 ideally you shouldn\'t\nbe modifying the object, though.\n\nIf your situation fits the case (3), you are *probably* okay if the\nversion difference isn\'t a major one. However, at this point the\nbehaviour of your program using ' + typeName + ' is undefined, and you should\ntry looking into why the version conflict is happening.\n\nParametric modules can help ensuring your program only has a single\ninstance of the folktale library. Check out the Folktale Architecture\ndocumentation for more information.\n      ');
      }
    }
  };
};
}).call(this,require('_process'))
},{"../adt/union/union":14,"_process":53}],30:[function(require,module,exports){
(function (process){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var mm = Symbol.for('@@meta:magical');

var copyDocumentation = function copyDocumentation(source, target) {
  var extensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (process.env.FOLKTALE_DOCS !== 'false') {
    target[mm] = Object.assign({}, source[mm] || {}, extensions);
  }
};

module.exports = copyDocumentation;
}).call(this,require('_process'))
},{"_process":53}],31:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var copyDocs = require('./copy-documentation');

var defineAdtMethod = function defineAdtMethod(adt, definitions) {
  Object.keys(definitions).forEach(function (name) {
    var methods = definitions[name];
    adt.variants.forEach(function (variant) {
      var method = methods[variant.tag];
      if (!method) {
        throw new TypeError('Method ' + name + ' not defined for ' + variant.tag);
      }
      copyDocs(methods, method);
      variant.prototype[name] = method;
    });
  });
};

module.exports = defineAdtMethod;
},{"./copy-documentation":30}],32:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var keys = Object.keys;
var symbols = Object.getOwnPropertySymbols;
var defineProperty = Object.defineProperty;
var property = Object.getOwnPropertyDescriptor;

/*
 * Extends an objects with own enumerable key/value pairs from other sources.
 *
 * This is used to define objects for the ADTs througout this file, and there
 * are some important differences from Object.assign:
 *
 *   - This code is only concerned with own enumerable property *names*.
 *   - Additionally this code copies all own symbols (important for tags).
 *
 * When copying, this function copies **whole property descriptors**, which
 * means getters/setters are not executed during the copying. The only
 * exception is when the property name is `prototype`, which is not
 * configurable in functions by default.
 *
 * This code only special cases `prototype` because any other non-configurable
 * property is considered an error, and should crash the program so it can be
 * fixed.
 */
function extend(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (source) {
    keys(source).forEach(function (key) {
      if (key === 'prototype') {
        target[key] = source[key];
      } else {
        defineProperty(target, key, property(source, key));
      }
    });
    symbols(source).forEach(function (symbol) {
      defineProperty(target, symbol, property(source, symbol));
    });
  });
  return target;
}

module.exports = extend;
},{}],33:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

module.exports = {
  equals: 'fantasy-land/equals',
  concat: 'fantasy-land/concat',
  empty: 'fantasy-land/empty',
  map: 'fantasy-land/map',
  ap: 'fantasy-land/ap',
  of: 'fantasy-land/of',
  reduce: 'fantasy-land/reduce',
  traverse: 'fantasy-land/traverse',
  chain: 'fantasy-land/chain',
  chainRec: 'fantasy-land/chainRec',
  extend: 'fantasy-land/extend',
  extract: 'fantasy-land/extract',
  bimap: 'fantasy-land/bimap',
  promap: 'fantasy-land/promap'
};
},{}],34:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------


var aliases = {
  equals: {
    /*~
     * module: null
     * type: |
     *   ('S 'a).('S 'a) => Boolean
     *   where 'S is Setoid
     */
    'fantasy-land/equals': function fantasyLandEquals(that) {
      return this.equals(that);
    }
  },

  concat: {
    /*~
     * module: null
     * type: |
     *   ('S 'a).('S 'a) => 'S 'a
     *   where 'S is Semigroup
     */
    'fantasy-land/concat': function fantasyLandConcat(that) {
      return this.concat(that);
    }
  },

  empty: {
    /*~
     * module: null
     * type: |
     *   ('M).() => 'M a
     *   where 'M is Monoid
     */
    'fantasy-land/empty': function fantasyLandEmpty() {
      return this.empty();
    }
  },

  map: {
    /*~
     * module: null
     * type: |
     *   ('F 'a).(('a) => 'b) => 'F 'b
     *   where 'F is Functor
     */
    'fantasy-land/map': function fantasyLandMap(transformation) {
      return this.map(transformation);
    }
  },

  apply: {
    /*~
     * module: null
     * type: |
     *   ('F ('a) => b).('F 'a) => 'F 'b
     *   where 'F is Apply
     */
    ap: function ap(that) {
      return this.apply(that);
    },


    /*~
     * module: null
     * type: |
     *   ('F 'a).('F ('a) => 'b) => 'F 'b
     *   where 'F is Apply
     */
    'fantasy-land/ap': function fantasyLandAp(that) {
      return that.apply(this);
    }
  },

  of: {
    /*~
     * module: null
     * type: |
     *   forall F, a:
     *     (F).(a) => F a
     *   where F is Applicative 
     */
    'fantasy-land/of': function fantasyLandOf(value) {
      return this.of(value);
    }
  },

  reduce: {
    /*~
     * module: null
     * type: |
     *   forall F, a, b:
     *     (F a).((b, a) => b, b) => b
     *   where F is Foldable  
     */
    'fantasy-land/reduce': function fantasyLandReduce(combinator, initial) {
      return this.reduce(combinator, initial);
    }
  },

  traverse: {
    /*~
     * module: null
     * type: |
     *   forall F, T, a, b:
     *     (T a).((a) => F b, (c) => F c) => F (T b)
     *   where F is Apply, T is Traversable
     */
    'fantasy-land/traverse': function fantasyLandTraverse(transformation, lift) {
      return this.traverse(transformation, lift);
    }
  },

  chain: {
    /*~
     * module: null
     * type: |
     *   forall M, a, b:
     *     (M a).((a) => M b) => M b
     *   where M is Chain
     */
    'fantasy-land/chain': function fantasyLandChain(transformation) {
      return this.chain(transformation);
    }
  },

  chainRecursively: {
    /*~
     * module: null
     * type: |
     *   forall M, a, b, c:
     *     (M).(
     *       Step:    ((a) => c, (b) => c, a) => M c,
     *       Initial: a
     *     ) => M b
     *   where M is ChainRec 
     */
    chainRec: function chainRec(step, initial) {
      return this.chainRecursively(step, initial);
    },


    /*~
     * module: null
     * type: |
     *   forall M, a, b, c:
     *     (M).(
     *       Step:    ((a) => c, (b) => c, a) => M c,
     *       Initial: a
     *     ) => M b
     *   where M is ChainRec 
     */
    'fantasy-land/chainRec': function fantasyLandChainRec(step, initial) {
      return this.chainRecursively(step, initial);
    }
  },

  extend: {
    /*~
     * module: null
     * type: |
     *   forall W, a, b:
     *     (W a).((W a) => b) => W b
     *   where W is Extend
     */
    'fantasy-land/extend': function fantasyLandExtend(transformation) {
      return this.extend(transformation);
    }
  },

  extract: {
    /*~
     * module: null
     * type: |
     *   forall W, a, b:
     *     (W a).() => a
     *   where W is Comonad
     */
    'fantasy-land/extract': function fantasyLandExtract() {
      return this.extract();
    }
  },

  bimap: {
    /*~
     * module: null
     * type: |
     *   forall F, a, b, c, d:
     *     (F a b).((a) => c, (b) => d) => F c d
     *   where F is Bifunctor
     */
    'fantasy-land/bimap': function fantasyLandBimap(f, g) {
      return this.bimap(f, g);
    }
  },

  promap: {
    /*~
     * module: null
     * type: |
     *   forall P, a, b, c, d:
     *     (P a b).((c) => a, (b) => d) => P c d
     */
    'fantasy-land/promap': function fantasyLandPromap(f, g) {
      return this.promap(f, g);
    }
  }
};

var provideAliases = function provideAliases(structure) {
  Object.keys(aliases).forEach(function (method) {
    if (typeof structure[method] === 'function') {
      Object.keys(aliases[method]).forEach(function (alias) {
        structure[alias] = aliases[method][alias];
      });
    }
  });
};

module.exports = provideAliases;
},{}],35:[function(require,module,exports){
"use strict";

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

module.exports = function (methodName) {
  return function (object) {
    throw new TypeError(object + " does not have a method '" + methodName + "'.");
  };
};
},{}],36:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var deprecated = require('./warn-deprecation');

module.exports = function (methodName) {
  return function (result) {
    deprecated('Type.' + methodName + '() is being deprecated in favour of Type[\'fantasy-land/' + methodName + '\'](). \n    Your data structure is using the old-style fantasy-land methods,\n    and these won\'t be supported in Folktale 3');
    return result;
  };
};
},{"./warn-deprecation":37}],37:[function(require,module,exports){
(function (process){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var BLAME_FUNCTION_INDEX = 3; // [current, parent, *error*, caller to blame, …]

function warnDeprecation(reason) {
  // eslint-disable-line max-statements
  if (process.env.FOLKTALE_ASSERTIONS !== 'none') {
    var stack = new Error('').stack;
    var offender = void 0;
    if (stack) {
      var lines = stack.split('\n');
      offender = lines[BLAME_FUNCTION_INDEX];
    }

    if (offender) {
      console.warn(reason + '\n    Blame: ' + offender.trim());
    } else {
      console.warn(reason);
    }
  }
}

module.exports = warnDeprecation;
}).call(this,require('_process'))
},{"_process":53}],38:[function(require,module,exports){
'use strict';

var _module$exports;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------


var Maybe = require('./maybe');

var _require = require('../adt/union/union'),
    typeSymbol = _require.typeSymbol;

/*~
 * stability: stable
 * authors:
 *   - "@boris-marinov"
 *   - Quildreen Motta
 * 
 * name: module folktale/maybe
 */


module.exports = (_module$exports = {
  Just: Maybe.Just,
  Nothing: Maybe.Nothing,
  hasInstance: Maybe.hasInstance,
  of: Maybe.of,
  empty: Maybe.empty,
  fromJSON: Maybe.fromJSON
}, _defineProperty(_module$exports, typeSymbol, Maybe[typeSymbol]), _defineProperty(_module$exports, 'fantasy-land/of', Maybe['fantasy-land/of']), _defineProperty(_module$exports, 'fromNullable', function fromNullable(aNullable) {
  return require('../conversions/nullable-to-maybe')(aNullable);
}), _defineProperty(_module$exports, 'fromResult', function fromResult(aResult) {
  return require('../conversions/result-to-maybe')(aResult);
}), _defineProperty(_module$exports, 'fromValidation', function fromValidation(aValidation) {
  return require('../conversions/validation-to-maybe')(aValidation);
}), _module$exports);
},{"../adt/union/union":14,"../conversions/nullable-to-maybe":17,"../conversions/result-to-maybe":18,"../conversions/validation-to-maybe":20,"./maybe":39}],39:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var assertType = require('../helpers/assert-type');
var assertFunction = require('../helpers/assert-function');

var _require = require('../adt/union'),
    union = _require.union,
    derivations = _require.derivations;

var provideAliases = require('../helpers/provide-fantasy-land-aliases');
var warnDeprecation = require('../helpers/warn-deprecation');
var adtMethods = require('../helpers/define-adt-methods');
var extend = require('../helpers/extend');

var equality = derivations.equality,
    debugRepresentation = derivations.debugRepresentation,
    serialization = derivations.serialization;

/*~ stability: stable */

var Maybe = union('folktale:Maybe', {
  /*~
   * type: |
   *   forall a: () => Maybe a
   */
  Nothing: function Nothing() {},


  /*~
   * type: |
   *   forall a: (a) => Maybe a
   */
  Just: function Just(value) {
    return { value: value };
  }
}).derive(equality, debugRepresentation, serialization);

var Nothing = Maybe.Nothing,
    _Just = Maybe.Just;

var assertMaybe = assertType(Maybe);

extend(_Just.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a: get (Maybe a) => a
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Maybe.Just');
  }
});

/*~~belongsTo: Maybe */
adtMethods(Maybe, {
  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Maybe a).((a) => b) => Maybe b
   */
  map: {
    /*~*/
    Nothing: function map(transformation) {
      assertFunction('Maybe.Nothing#map', transformation);
      return this;
    },

    /*~*/
    Just: function map(transformation) {
      assertFunction('Maybe.Just#map', transformation);
      return _Just(transformation(this.value));
    }
  },

  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Maybe (a) => b).(Maybe a) => Maybe b
   */
  apply: {
    /*~*/
    Nothing: function apply(aMaybe) {
      assertMaybe('Maybe.Nothing#apply', aMaybe);
      return this;
    },

    /*~*/
    Just: function apply(aMaybe) {
      assertMaybe('Maybe.Just#apply', aMaybe);
      return aMaybe.map(this.value);
    }
  },

  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Maybe a).((a) => Maybe b) => Maybe b
   */
  chain: {
    /*~*/
    Nothing: function chain(transformation) {
      assertFunction('Maybe.Nothing#chain', transformation);
      return this;
    },

    /*~*/
    Just: function chain(transformation) {
      assertFunction('Maybe.Just#chain', transformation);
      return transformation(this.value);
    }
  },

  /*~
   * type: |
   *   forall a: (Maybe a).() => a :: (throws TypeError)
   */
  unsafeGet: {
    /*~*/
    Nothing: function unsafeGet() {
      throw new TypeError('Can\'t extract the value of a Nothing.\n\n    Since Nothing holds no values, it\'s not possible to extract one from them.\n    You might consider switching from Maybe#get to Maybe#getOrElse, or some other method\n    that is not partial.\n      ');
    },

    /*~*/
    Just: function unsafeGet() {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a: (Maybe a).(a) => a
   */
  getOrElse: {
    /*~*/
    Nothing: function getOrElse(_default) {
      return _default;
    },

    /*~*/
    Just: function getOrElse(_default) {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a: (Maybe a).((a) => Maybe a) => Maybe a
   */
  orElse: {
    /*~*/
    Nothing: function orElse(handler) {
      assertFunction('Maybe.Nothing#orElse', handler);
      return handler(this.value);
    },

    /*~*/
    Just: function orElse(handler) {
      assertFunction('Maybe.Nothing#orElse', handler);
      return this;
    }
  },

  /*~
   * authors:
   *   - "@diasbruno"
   * type: |
   *   forall a: (Maybe a).(Maybe a) => Maybe a
   *   where a is Semigroup
   */
  concat: {
    /*~*/
    Nothing: function concat(aMaybe) {
      assertMaybe('Maybe.Nothing#concat', aMaybe);
      return aMaybe;
    },

    /*~*/
    Just: function concat(aMaybe) {
      var _this = this;

      assertMaybe('Maybe.Just#concat', aMaybe);
      return aMaybe.matchWith({
        Nothing: function Nothing() {
          return _Just(_this.value);
        },
        Just: function Just(a) {
          return _Just(_this.value.concat(a.value));
        }
      });
    }
  },

  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .matchWith(pattern)
   * 
   * type: |
   *   forall a, b:
   *     (Maybe a).({
   *       Nothing: () => b,
   *       Just: (a) => b
   *     }) => b
   */
  cata: {
    /*~*/
    Nothing: function cata(pattern) {
      warnDeprecation('`.cata(pattern)` is deprecated. Use `.matchWith(pattern)` instead.');
      return pattern.Nothing();
    },

    /*~*/
    Just: function cata(pattern) {
      warnDeprecation('`.cata(pattern)` is deprecated. Use `.matchWith(pattern)` instead.');
      return pattern.Just(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b: (Maybe a).(() => b, (a) => b) => b
   */
  fold: {
    /*~*/
    Nothing: function Nothing(transformNothing, transformJust) {
      assertFunction('Maybe.Nothing#fold', transformNothing);
      assertFunction('Maybe.Nothing#fold', transformJust);
      return transformNothing();
    },

    /*~*/
    Just: function Just(transformNothing, transformJust) {
      assertFunction('Maybe.Just#fold', transformNothing);
      assertFunction('Maybe.Just#fold', transformJust);
      return transformJust(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a: (Maybe a).((a) => Boolean) => Maybe a
   */
  filter: {
    /*~*/
    Nothing: function filter(predicate) {
      assertFunction('Maybe.Nothing#filter', predicate);
      return this;
    },

    /*~*/
    Just: function filter(predicate) {
      assertFunction('Maybe.Just#filter', predicate);
      return predicate(this.value) ? this : Nothing();
    }
  }
});

Object.assign(Maybe, {
  /*~
   * stability: stable
   * type: |
   *   forall a: (a) => Maybe a
   */
  of: function of(value) {
    return _Just(value);
  },


  /*~
   * authors:
   *   - "@diasbruno"
   * type: |
   *   forall a: () => Maybe a
   */
  empty: function empty() {
    return Nothing();
  },


  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .unsafeGet()
   * type: |
   *   forall a: (Maybe a).() => a :: (throws TypeError)
   */
  'get': function get() {
    warnDeprecation('`.get()` is deprecated, and has been renamed to `.unsafeGet()`.');
    return this.unsafeGet();
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Maybe a).(b) => Result b a
   */
  toResult: function toResult(fallbackValue) {
    return require('../conversions/maybe-to-result')(this, fallbackValue);
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Maybe a).(b) => Result b a
   */
  toValidation: function toValidation(fallbackValue) {
    return require('../conversions/maybe-to-validation')(this, fallbackValue);
  }
});

provideAliases(_Just.prototype);
provideAliases(Nothing.prototype);
provideAliases(Maybe);

module.exports = Maybe;
},{"../adt/union":13,"../conversions/maybe-to-result":15,"../conversions/maybe-to-validation":16,"../helpers/assert-function":28,"../helpers/assert-type":29,"../helpers/define-adt-methods":31,"../helpers/extend":32,"../helpers/provide-fantasy-land-aliases":34,"../helpers/warn-deprecation":37}],40:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var assertType = require('../helpers/assert-type');
var assertFunction = require('../helpers/assert-function');

var _require = require('../adt/union'),
    union = _require.union,
    derivations = _require.derivations;

var provideAliases = require('../helpers/provide-fantasy-land-aliases');
var adtMethods = require('../helpers/define-adt-methods');
var extend = require('../helpers/extend');
var warnDeprecation = require('../helpers/warn-deprecation');

var equality = derivations.equality,
    debugRepresentation = derivations.debugRepresentation,
    serialization = derivations.serialization;

/*~ stability: experimental */

var Result = union('folktale:Result', {
  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (a) => Result a b
   */
  Error: function Error(value) {
    return { value: value };
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (b) => Result a b
   */
  Ok: function Ok(value) {
    return { value: value };
  }
}).derive(equality, debugRepresentation, serialization);

var Error = Result.Error,
    Ok = Result.Ok;


var assertResult = assertType(Result);

extend(Error.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Result a b) => a
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Result.Error');
  }
});

extend(Ok.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Result a b) => b
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Result.Ok');
  }
});

/*~
 * ~belongsTo: Result
 */
adtMethods(Result, {
  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((b) => c) => Result a c
   */
  map: {
    /*~*/
    Error: function map(f) {
      assertFunction('Result.Error#map', f);
      return this;
    },

    /*~*/
    Ok: function map(f) {
      assertFunction('Result.Ok#map', f);
      return Ok(f(this.value));
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a ((b) => c)).(Result a b) => Result a c
   */
  apply: {
    /*~*/
    Error: function apply(anResult) {
      assertResult('Result.Error#apply', anResult);
      return this;
    },

    /*~*/
    Ok: function apply(anResult) {
      assertResult('Result.Ok#apply', anResult);
      return anResult.map(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((b) => Result a c) => Result a c
   */
  chain: {
    /*~*/
    Error: function chain(f) {
      assertFunction('Result.Error#chain', f);
      return this;
    },

    /*~*/
    Ok: function chain(f) {
      assertFunction('Result.Ok#chain', f);
      return f(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => b :: throws TypeError
   */
  unsafeGet: {
    /*~*/
    Error: function unsafeGet() {
      throw new TypeError('Can\'t extract the value of an Error.\n\nError does not contain a normal value - it contains an error.\nYou might consider switching from Result#unsafeGet to Result#getOrElse,\nor some other method that is not partial.\n      ');
    },

    /*~*/
    Ok: function unsafeGet() {
      return this.value;
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).(b) => b
   */
  getOrElse: {
    /*~*/
    Error: function getOrElse(_default) {
      return _default;
    },

    /*~*/
    Ok: function getOrElse(_default) {
      return this.value;
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((a) => Result c b) => Result c b
   */
  orElse: {
    /*~*/
    Error: function orElse(handler) {
      assertFunction('Result.Error#orElse', handler);
      return handler(this.value);
    },

    /*~*/
    Ok: function orElse(handler) {
      assertFunction('Result.Ok#orElse', handler);
      return this;
    }
  },

  /*~
   * stability: stable
   * type: |
   *   forall a, b: (Result a b).(Result a b) => Result a b
   *   where b is Semigroup
   */
  concat: {
    /*~*/
    Error: function concat(aResult) {
      assertResult('Result.Error#concat', aResult);
      return this;
    },

    /*~*/
    Ok: function concat(aResult) {
      var _this = this;

      assertResult('Result.Ok#concat', aResult);
      return aResult.map(function (xs) {
        return _this.value.concat(xs);
      });
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((a) => c, (b) => c) => c
   */
  fold: {
    /*~*/
    Error: function fold(f, g) {
      assertFunction('Result.Error#fold', f);
      assertFunction('Result.Error#fold', g);
      return f(this.value);
    },

    /*~*/
    Ok: function fold(f, g) {
      assertFunction('Result.Ok#fold', f);
      assertFunction('Result.Ok#fold', g);
      return g(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => Result b a
   */
  swap: {
    /*~*/
    Error: function swap() {
      return Ok(this.value);
    },

    /*~*/
    Ok: function swap() {
      return Error(this.value);
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   (Result a b).((a) => c, (b) => d) => Result c d
   */
  bimap: {
    /*~*/
    Error: function bimap(f, g) {
      assertFunction('Result.Error#bimap', f);
      assertFunction('Result.Error#bimap', g);
      return Error(f(this.value));
    },

    /*~*/
    Ok: function bimap(f, g) {
      assertFunction('Result.Ok#bimap', f);
      assertFunction('Result.Ok#bimap', g);
      return Ok(g(this.value));
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a, b, c:
   *     (Result a b).((a) => c) => Result c b
   */
  mapError: {
    /*~*/
    Error: function mapError(f) {
      assertFunction('Result.Error#mapError', f);
      return Error(f(this.value));
    },

    /*~*/
    Ok: function mapError(f) {
      assertFunction('Result.Ok#mapError', f);
      return this;
    }
  },

  /*~
   * stability: experimental
   * type: |
   *   forall a: (Maybe a).((a) => Boolean) => Maybe a
   */
  filter: {
    /*~*/
    Error: function filter(predicate) {
      assertFunction('Result.Error#filter', predicate);
      return this;
    },

    /*~*/
    Ok: function filter(predicate) {
      assertFunction('Result.Ok#filter', predicate);
      return predicate(this.value) ? this : Error();
    }
  }
});

Object.assign(Result, {
  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (b) => Result a b
   */
  of: function of(value) {
    return Ok(value);
  },


  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .unsafeGet()
   * type: |
   *   forall a, b: (Result a b).() => b :: (throws TypeError)
   */
  'get': function get() {
    warnDeprecation('`.get()` is deprecated, and has been renamed to `.unsafeGet()`.');
    return this.unsafeGet();
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => a or b
   */
  merge: function merge() {
    return this.value;
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => Validation a b
   */
  toValidation: function toValidation() {
    return require('../conversions/result-to-validation')(this);
  },


  /*~
   * stability: experimental
   * type: |
   *   forall a, b: (Result a b).() => Maybe b
   */
  toMaybe: function toMaybe() {
    return require('../conversions/result-to-maybe')(this);
  }
});

provideAliases(Error.prototype);
provideAliases(Ok.prototype);
provideAliases(Result);

module.exports = Result;
},{"../adt/union":13,"../conversions/result-to-maybe":18,"../conversions/result-to-validation":19,"../helpers/assert-function":28,"../helpers/assert-type":29,"../helpers/define-adt-methods":31,"../helpers/extend":32,"../helpers/provide-fantasy-land-aliases":34,"../helpers/warn-deprecation":37}],41:[function(require,module,exports){
'use strict';

//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

var assertType = require('../helpers/assert-type');
var assertFunction = require('../helpers/assert-function');

var _require = require('../adt/union'),
    union = _require.union,
    derivations = _require.derivations;

var provideAliases = require('../helpers/provide-fantasy-land-aliases');
var adtMethods = require('../helpers/define-adt-methods');
var extend = require('../helpers/extend');
var warnDeprecation = require('../helpers/warn-deprecation');

var equality = derivations.equality,
    debugRepresentation = derivations.debugRepresentation,
    serialization = derivations.serialization;

/*~ stability: experimental */

var Validation = union('folktale:Validation', {
  /*~
   * type: |
   *   forall a, b: (a) => Validation a b
   */
  Failure: function Failure(value) {
    return { value: value };
  },


  /*~
   * type: |
   *   forall a, b: (b) => Validation a b
   */
  Success: function Success(value) {
    return { value: value };
  }
}).derive(equality, debugRepresentation, serialization);

var Success = Validation.Success,
    Failure = Validation.Failure;

var assertValidation = assertType(Validation);

extend(Failure.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Validation a b) => a
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Validation.Failure');
  }
});

extend(Success.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a, b: get (Validation a b) => b
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Validation.Success');
  }
});

/*~~belongsTo: Validation */
adtMethods(Validation, {
  /*~
   * type: |
   *   forall a, b, c: (Validation a b).((b) => c) => Validation a c
   */
  map: {
    /*~*/
    Failure: function map(transformation) {
      assertFunction('Validation.Failure#map', transformation);
      return this;
    },

    /*~*/
    Success: function map(transformation) {
      assertFunction('Validation.Success#map', transformation);
      return Success(transformation(this.value));
    }
  },

  /*~
   * type: |
   *   forall a, b, c: (Validation (b) => c).(Validation a b) => Validation a c
   */
  apply: {
    /*~*/
    Failure: function apply(aValidation) {
      assertValidation('Failure#apply', aValidation);
      return Failure.hasInstance(aValidation) ? Failure(this.value.concat(aValidation.value)) : /* otherwise */this;
    },

    /*~*/
    Success: function apply(aValidation) {
      assertValidation('Success#apply', aValidation);
      return Failure.hasInstance(aValidation) ? aValidation : /* otherwise */aValidation.map(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b: (Validation a b).() => b :: throws TypeError
   */
  unsafeGet: {
    /*~*/
    Failure: function unsafeGet() {
      throw new TypeError('Can\'t extract the value of a Failure.\n\n    Failure does not contain a normal value - it contains an error.\n    You might consider switching from Validation#get to Validation#getOrElse, or some other method\n    that is not partial.\n      ');
    },

    /*~*/
    Success: function unsafeGet() {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a, b: (Validation a b).(b) => b
   */
  getOrElse: {
    /*~*/
    Failure: function getOrElse(_default) {
      return _default;
    },

    /*~*/
    Success: function getOrElse(_default) {
      return this.value;
    }
  },

  /*~
   * type: |
   *   forall a, b, c:
   *     (Validation a b).((a) => Validation c b) => Validation c b
   */
  orElse: {
    /*~*/
    Failure: function orElse(handler) {
      assertFunction('Validation.Failure#orElse', handler);
      return handler(this.value);
    },

    /*~*/
    Success: function orElse(handler) {
      assertFunction('Validation.Success#orElse', handler);
      return this;
    }
  },

  /*~
   * type: |
   *   forall a, b:
   *     (Validation a b).(Validation a b) => Validation a b
   *   where a is Semigroup
   */
  concat: {
    /*~*/
    Failure: function concat(aValidation) {
      assertValidation('Validation.Failure#concat', aValidation);
      if (Failure.hasInstance(aValidation)) {
        return Failure(this.value.concat(aValidation.value));
      } else {
        return this;
      }
    },

    /*~*/
    Success: function concat(aValidation) {
      assertValidation('Validation.Success#concat', aValidation);
      return aValidation;
    }
  },

  /*~
   * type: |
   *   forall a, b, c:
   *     (Validation a b).((a) => c, (b) => c) => c
   */
  fold: {
    /*~*/
    Failure: function fold(failureTransformation, successTransformation) {
      assertFunction('Validation.Failure#fold', failureTransformation);
      assertFunction('Validation.Failure#fold', successTransformation);
      return failureTransformation(this.value);
    },

    /*~*/
    Success: function fold(failureTransformation, successTransformation) {
      assertFunction('Validation.Success#fold', failureTransformation);
      assertFunction('Validation.Success#fold', successTransformation);
      return successTransformation(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b: (Validation a b).() => Validation b a
   */
  swap: {
    /*~*/
    Failure: function swap() {
      return Success(this.value);
    },

    /*~*/
    Success: function swap() {
      return Failure(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b, c, d:
   *     (Validation a b).((a) => c, (b) => d) => Validation c d
   */
  bimap: {
    /*~*/
    Failure: function bimap(failureTransformation, successTransformation) {
      assertFunction('Validation.Failure#fold', failureTransformation);
      assertFunction('Validation.Failure#fold', successTransformation);
      return Failure(failureTransformation(this.value));
    },

    /*~*/
    Success: function bimap(failureTransformation, successTransformation) {
      assertFunction('Validation.Success#fold', failureTransformation);
      assertFunction('Validation.Success#fold', successTransformation);
      return Success(successTransformation(this.value));
    }
  },

  /*~
   * type: |
   *   forall a, b, c:
   *     (Validation a b).((a) => c) Validation c b
   */
  mapFailure: {
    /*~*/
    Failure: function mapFailure(transformation) {
      assertFunction('Validation.Failure#mapFailure', transformation);
      return Failure(transformation(this.value));
    },

    /*~*/
    Success: function mapFailure(transformation) {
      assertFunction('Validation.Failure#mapFailure', transformation);
      return this;
    }
  }
});

Object.assign(Validation, {
  /*~
   * type: |
   *   forall a, b: (b) => Validation a b
   */
  of: function of(value) {
    return Success(value);
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => b :: throws TypeError
   */
  'get': function get() {
    warnDeprecation('`.get()` is deprecated, and has been renamed to `.unsafeGet()`.');
    return this.unsafeGet();
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => a or b
   */
  merge: function merge() {
    return this.value;
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => Result a b
   */
  toResult: function toResult() {
    return require('../conversions/validation-to-result')(this);
  },


  /*~
   * type: |
   *   forall a, b: (Validation a b).() => Maybe b
   */
  toMaybe: function toMaybe() {
    return require('../conversions/validation-to-maybe')(this);
  }
});

provideAliases(Success.prototype);
provideAliases(Failure.prototype);
provideAliases(Validation);

module.exports = Validation;
},{"../adt/union":13,"../conversions/validation-to-maybe":20,"../conversions/validation-to-result":21,"../helpers/assert-function":28,"../helpers/assert-type":29,"../helpers/define-adt-methods":31,"../helpers/extend":32,"../helpers/provide-fantasy-land-aliases":34,"../helpers/warn-deprecation":37}],42:[function(require,module,exports){
"use strict"

var Vnode = require("../render/vnode")

module.exports = function(redrawService) {
  return function(root, component) {
    if (component === null) {
      redrawService.render(root, [])
      redrawService.unsubscribe(root)
      return
    }
    
    if (component.view == null && typeof component !== "function") throw new Error("m.mount(element, component) expects a component, not a vnode")
    
    var run = function() {
      redrawService.render(root, Vnode(component))
    }
    redrawService.subscribe(root, run)
    redrawService.redraw()
  }
}

},{"../render/vnode":49}],43:[function(require,module,exports){
"use strict"

var coreRenderer = require("../render/render")

function throttle(callback) {
  //60fps translates to 16.6ms, round it down since setTimeout requires int
  var time = 16
  var last = 0, pending = null
  var timeout = typeof requestAnimationFrame === "function" ? requestAnimationFrame : setTimeout
  return function() {
    var now = Date.now()
    if (last === 0 || now - last >= time) {
      last = now
      callback()
    }
    else if (pending === null) {
      pending = timeout(function() {
        pending = null
        callback()
        last = Date.now()
      }, time - (now - last))
    }
  }
}

module.exports = function($window) {
  var renderService = coreRenderer($window)
  renderService.setEventCallback(function(e) {
    if (e.redraw === false) e.redraw = undefined
    else redraw()
  })

  var callbacks = []
  function subscribe(key, callback) {
    unsubscribe(key)
    callbacks.push(key, throttle(callback))
  }
  function unsubscribe(key) {
    var index = callbacks.indexOf(key)
    if (index > -1) callbacks.splice(index, 2)
  }
  function redraw() {
    for (var i = 1; i < callbacks.length; i += 2) {
      callbacks[i]()
    }
  }
  return {subscribe: subscribe, unsubscribe: unsubscribe, redraw: redraw, render: renderService.render}
}

},{"../render/render":48}],44:[function(require,module,exports){
"use strict"

var redrawService = require("./redraw")

module.exports = require("./api/mount")(redrawService)

},{"./api/mount":42,"./redraw":46}],45:[function(require,module,exports){
"use strict"

module.exports = function(object) {
  if (Object.prototype.toString.call(object) !== "[object Object]") return ""

  var args = []
  for (var key in object) {
    destructure(key, object[key])
  }

  return args.join("&")

  function destructure(key, value) {
    if (Array.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        destructure(key + "[" + i + "]", value[i])
      }
    }
    else if (Object.prototype.toString.call(value) === "[object Object]") {
      for (var i in value) {
        destructure(key + "[" + i + "]", value[i])
      }
    }
    else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
  }
}

},{}],46:[function(require,module,exports){
"use strict"

module.exports = require("./api/redraw")(window)

},{"./api/redraw":43}],47:[function(require,module,exports){
"use strict"

var Vnode = require("../render/vnode")

var selectorParser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g
var selectorCache = {}
var hasOwn = {}.hasOwnProperty

function compileSelector(selector) {
  var match, tag = "div", classes = [], attrs = {}
  while (match = selectorParser.exec(selector)) {
    var type = match[1], value = match[2]
    if (type === "" && value !== "") tag = value
    else if (type === "#") attrs.id = value
    else if (type === ".") classes.push(value)
    else if (match[3][0] === "[") {
      var attrValue = match[6]
      if (attrValue) attrValue = attrValue.replace(/\\(["'])/g, "$1").replace(/\\\\/g, "\\")
      if (match[4] === "class") classes.push(attrValue)
      else attrs[match[4]] = attrValue === "" ? attrValue : attrValue || true
    }
  }
  if (classes.length > 0) attrs.className = classes.join(" ")
  return selectorCache[selector] = {tag: tag, attrs: attrs}
}

function execSelector(state, attrs, children) {
  var hasAttrs = false, childList, text
  var className = attrs.className || attrs.class

  for (var key in state.attrs) {
    if (hasOwn.call(state.attrs, key)) {
      attrs[key] = state.attrs[key]
    }
  }

  if (className !== undefined) {
    if (attrs.class !== undefined) {
      attrs.class = undefined
      attrs.className = className
    }

    if (state.attrs.className != null) {
      attrs.className = state.attrs.className + " " + className
    }
  }

  for (var key in attrs) {
    if (hasOwn.call(attrs, key) && key !== "key") {
      hasAttrs = true
      break
    }
  }

  if (Array.isArray(children) && children.length === 1 && children[0] != null && children[0].tag === "#") {
    text = children[0].children
  } else {
    childList = children
  }

  return Vnode(state.tag, attrs.key, hasAttrs ? attrs : undefined, childList, text)
}

function hyperscript(selector) {
  // Because sloppy mode sucks
  var attrs = arguments[1], start = 2, children

  if (selector == null || typeof selector !== "string" && typeof selector !== "function" && typeof selector.view !== "function") {
    throw Error("The selector must be either a string or a component.");
  }

  if (typeof selector === "string") {
    var cached = selectorCache[selector] || compileSelector(selector)
  }

  if (attrs == null) {
    attrs = {}
  } else if (typeof attrs !== "object" || attrs.tag != null || Array.isArray(attrs)) {
    attrs = {}
    start = 1
  }

  if (arguments.length === start + 1) {
    children = arguments[start]
    if (!Array.isArray(children)) children = [children]
  } else {
    children = []
    while (start < arguments.length) children.push(arguments[start++])
  }

  var normalized = Vnode.normalizeChildren(children)

  if (typeof selector === "string") {
    return execSelector(cached, attrs, normalized)
  } else {
    return Vnode(selector, attrs.key, attrs, normalized)
  }
}

module.exports = hyperscript

},{"../render/vnode":49}],48:[function(require,module,exports){
"use strict"

var Vnode = require("../render/vnode")

module.exports = function($window) {
  var $doc = $window.document
  var $emptyFragment = $doc.createDocumentFragment()

  var nameSpace = {
    svg: "http://www.w3.org/2000/svg",
    math: "http://www.w3.org/1998/Math/MathML"
  }

  var onevent
  function setEventCallback(callback) {return onevent = callback}

  function getNameSpace(vnode) {
    return vnode.attrs && vnode.attrs.xmlns || nameSpace[vnode.tag]
  }

  //create
  function createNodes(parent, vnodes, start, end, hooks, nextSibling, ns) {
    for (var i = start; i < end; i++) {
      var vnode = vnodes[i]
      if (vnode != null) {
        createNode(parent, vnode, hooks, ns, nextSibling)
      }
    }
  }
  function createNode(parent, vnode, hooks, ns, nextSibling) {
    var tag = vnode.tag
    if (typeof tag === "string") {
      vnode.state = {}
      if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
      switch (tag) {
        case "#": return createText(parent, vnode, nextSibling)
        case "<": return createHTML(parent, vnode, nextSibling)
        case "[": return createFragment(parent, vnode, hooks, ns, nextSibling)
        default: return createElement(parent, vnode, hooks, ns, nextSibling)
      }
    }
    else return createComponent(parent, vnode, hooks, ns, nextSibling)
  }
  function createText(parent, vnode, nextSibling) {
    vnode.dom = $doc.createTextNode(vnode.children)
    insertNode(parent, vnode.dom, nextSibling)
    return vnode.dom
  }
  function createHTML(parent, vnode, nextSibling) {
    var match = vnode.children.match(/^\s*?<(\w+)/im) || []
    var parent1 = {caption: "table", thead: "table", tbody: "table", tfoot: "table", tr: "tbody", th: "tr", td: "tr", colgroup: "table", col: "colgroup"}[match[1]] || "div"
    var temp = $doc.createElement(parent1)

    temp.innerHTML = vnode.children
    vnode.dom = temp.firstChild
    vnode.domSize = temp.childNodes.length
    var fragment = $doc.createDocumentFragment()
    var child
    while (child = temp.firstChild) {
      fragment.appendChild(child)
    }
    insertNode(parent, fragment, nextSibling)
    return fragment
  }
  function createFragment(parent, vnode, hooks, ns, nextSibling) {
    var fragment = $doc.createDocumentFragment()
    if (vnode.children != null) {
      var children = vnode.children
      createNodes(fragment, children, 0, children.length, hooks, null, ns)
    }
    vnode.dom = fragment.firstChild
    vnode.domSize = fragment.childNodes.length
    insertNode(parent, fragment, nextSibling)
    return fragment
  }
  function createElement(parent, vnode, hooks, ns, nextSibling) {
    var tag = vnode.tag
    var attrs = vnode.attrs
    var is = attrs && attrs.is

    ns = getNameSpace(vnode) || ns

    var element = ns ?
      is ? $doc.createElementNS(ns, tag, {is: is}) : $doc.createElementNS(ns, tag) :
      is ? $doc.createElement(tag, {is: is}) : $doc.createElement(tag)
    vnode.dom = element

    if (attrs != null) {
      setAttrs(vnode, attrs, ns)
    }

    insertNode(parent, element, nextSibling)

    if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
      setContentEditable(vnode)
    }
    else {
      if (vnode.text != null) {
        if (vnode.text !== "") element.textContent = vnode.text
        else vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
      }
      if (vnode.children != null) {
        var children = vnode.children
        createNodes(element, children, 0, children.length, hooks, null, ns)
        setLateAttrs(vnode)
      }
    }
    return element
  }
  function initComponent(vnode, hooks) {
    var sentinel
    if (typeof vnode.tag.view === "function") {
      vnode.state = Object.create(vnode.tag)
      sentinel = vnode.state.view
      if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
      sentinel.$$reentrantLock$$ = true
    } else {
      vnode.state = void 0
      sentinel = vnode.tag
      if (sentinel.$$reentrantLock$$ != null) return $emptyFragment
      sentinel.$$reentrantLock$$ = true
      vnode.state = (vnode.tag.prototype != null && typeof vnode.tag.prototype.view === "function") ? new vnode.tag(vnode) : vnode.tag(vnode)
    }
    vnode._state = vnode.state
    if (vnode.attrs != null) initLifecycle(vnode.attrs, vnode, hooks)
    initLifecycle(vnode._state, vnode, hooks)
    vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
    if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
    sentinel.$$reentrantLock$$ = null
  }
  function createComponent(parent, vnode, hooks, ns, nextSibling) {
    initComponent(vnode, hooks)
    if (vnode.instance != null) {
      var element = createNode(parent, vnode.instance, hooks, ns, nextSibling)
      vnode.dom = vnode.instance.dom
      vnode.domSize = vnode.dom != null ? vnode.instance.domSize : 0
      insertNode(parent, element, nextSibling)
      return element
    }
    else {
      vnode.domSize = 0
      return $emptyFragment
    }
  }

  //update
  function updateNodes(parent, old, vnodes, recycling, hooks, nextSibling, ns) {
    if (old === vnodes || old == null && vnodes == null) return
    else if (old == null) createNodes(parent, vnodes, 0, vnodes.length, hooks, nextSibling, ns)
    else if (vnodes == null) removeNodes(old, 0, old.length, vnodes)
    else {
      if (old.length === vnodes.length) {
        var isUnkeyed = false
        for (var i = 0; i < vnodes.length; i++) {
          if (vnodes[i] != null && old[i] != null) {
            isUnkeyed = vnodes[i].key == null && old[i].key == null
            break
          }
        }
        if (isUnkeyed) {
          for (var i = 0; i < old.length; i++) {
            if (old[i] === vnodes[i]) continue
            else if (old[i] == null && vnodes[i] != null) createNode(parent, vnodes[i], hooks, ns, getNextSibling(old, i + 1, nextSibling))
            else if (vnodes[i] == null) removeNodes(old, i, i + 1, vnodes)
            else updateNode(parent, old[i], vnodes[i], hooks, getNextSibling(old, i + 1, nextSibling), recycling, ns)
          }
          return
        }
      }
      recycling = recycling || isRecyclable(old, vnodes)
      if (recycling) {
        var pool = old.pool
        old = old.concat(old.pool)
      }

      var oldStart = 0, start = 0, oldEnd = old.length - 1, end = vnodes.length - 1, map
      while (oldEnd >= oldStart && end >= start) {
        var o = old[oldStart], v = vnodes[start]
        if (o === v && !recycling) oldStart++, start++
        else if (o == null) oldStart++
        else if (v == null) start++
        else if (o.key === v.key) {
          var shouldRecycle = (pool != null && oldStart >= old.length - pool.length) || ((pool == null) && recycling)
          oldStart++, start++
          updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), shouldRecycle, ns)
          if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
        }
        else {
          var o = old[oldEnd]
          if (o === v && !recycling) oldEnd--, start++
          else if (o == null) oldEnd--
          else if (v == null) start++
          else if (o.key === v.key) {
            var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
            updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
            if (recycling || start < end) insertNode(parent, toFragment(o), getNextSibling(old, oldStart, nextSibling))
            oldEnd--, start++
          }
          else break
        }
      }
      while (oldEnd >= oldStart && end >= start) {
        var o = old[oldEnd], v = vnodes[end]
        if (o === v && !recycling) oldEnd--, end--
        else if (o == null) oldEnd--
        else if (v == null) end--
        else if (o.key === v.key) {
          var shouldRecycle = (pool != null && oldEnd >= old.length - pool.length) || ((pool == null) && recycling)
          updateNode(parent, o, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), shouldRecycle, ns)
          if (recycling && o.tag === v.tag) insertNode(parent, toFragment(o), nextSibling)
          if (o.dom != null) nextSibling = o.dom
          oldEnd--, end--
        }
        else {
          if (!map) map = getKeyMap(old, oldEnd)
          if (v != null) {
            var oldIndex = map[v.key]
            if (oldIndex != null) {
              var movable = old[oldIndex]
              var shouldRecycle = (pool != null && oldIndex >= old.length - pool.length) || ((pool == null) && recycling)
              updateNode(parent, movable, v, hooks, getNextSibling(old, oldEnd + 1, nextSibling), recycling, ns)
              insertNode(parent, toFragment(movable), nextSibling)
              old[oldIndex].skip = true
              if (movable.dom != null) nextSibling = movable.dom
            }
            else {
              var dom = createNode(parent, v, hooks, ns, nextSibling)
              nextSibling = dom
            }
          }
          end--
        }
        if (end < start) break
      }
      createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
      removeNodes(old, oldStart, oldEnd + 1, vnodes)
    }
  }
  function updateNode(parent, old, vnode, hooks, nextSibling, recycling, ns) {
    var oldTag = old.tag, tag = vnode.tag
    if (oldTag === tag) {
      vnode.state = old.state
      vnode._state = old._state
      vnode.events = old.events
      if (!recycling && shouldNotUpdate(vnode, old)) return
      if (typeof oldTag === "string") {
        if (vnode.attrs != null) {
          if (recycling) {
            vnode.state = {}
            initLifecycle(vnode.attrs, vnode, hooks)
          }
          else updateLifecycle(vnode.attrs, vnode, hooks)
        }
        switch (oldTag) {
          case "#": updateText(old, vnode); break
          case "<": updateHTML(parent, old, vnode, nextSibling); break
          case "[": updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns); break
          default: updateElement(old, vnode, recycling, hooks, ns)
        }
      }
      else updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns)
    }
    else {
      removeNode(old, null)
      createNode(parent, vnode, hooks, ns, nextSibling)
    }
  }
  function updateText(old, vnode) {
    if (old.children.toString() !== vnode.children.toString()) {
      old.dom.nodeValue = vnode.children
    }
    vnode.dom = old.dom
  }
  function updateHTML(parent, old, vnode, nextSibling) {
    if (old.children !== vnode.children) {
      toFragment(old)
      createHTML(parent, vnode, nextSibling)
    }
    else vnode.dom = old.dom, vnode.domSize = old.domSize
  }
  function updateFragment(parent, old, vnode, recycling, hooks, nextSibling, ns) {
    updateNodes(parent, old.children, vnode.children, recycling, hooks, nextSibling, ns)
    var domSize = 0, children = vnode.children
    vnode.dom = null
    if (children != null) {
      for (var i = 0; i < children.length; i++) {
        var child = children[i]
        if (child != null && child.dom != null) {
          if (vnode.dom == null) vnode.dom = child.dom
          domSize += child.domSize || 1
        }
      }
      if (domSize !== 1) vnode.domSize = domSize
    }
  }
  function updateElement(old, vnode, recycling, hooks, ns) {
    var element = vnode.dom = old.dom
    ns = getNameSpace(vnode) || ns

    if (vnode.tag === "textarea") {
      if (vnode.attrs == null) vnode.attrs = {}
      if (vnode.text != null) {
        vnode.attrs.value = vnode.text //FIXME handle multiple children
        vnode.text = undefined
      }
    }
    updateAttrs(vnode, old.attrs, vnode.attrs, ns)
    if (vnode.attrs != null && vnode.attrs.contenteditable != null) {
      setContentEditable(vnode)
    }
    else if (old.text != null && vnode.text != null && vnode.text !== "") {
      if (old.text.toString() !== vnode.text.toString()) old.dom.firstChild.nodeValue = vnode.text
    }
    else {
      if (old.text != null) old.children = [Vnode("#", undefined, undefined, old.text, undefined, old.dom.firstChild)]
      if (vnode.text != null) vnode.children = [Vnode("#", undefined, undefined, vnode.text, undefined, undefined)]
      updateNodes(element, old.children, vnode.children, recycling, hooks, null, ns)
    }
  }
  function updateComponent(parent, old, vnode, hooks, nextSibling, recycling, ns) {
    if (recycling) {
      initComponent(vnode, hooks)
    } else {
      vnode.instance = Vnode.normalize(vnode._state.view.call(vnode.state, vnode))
      if (vnode.instance === vnode) throw Error("A view cannot return the vnode it received as argument")
      if (vnode.attrs != null) updateLifecycle(vnode.attrs, vnode, hooks)
      updateLifecycle(vnode._state, vnode, hooks)
    }
    if (vnode.instance != null) {
      if (old.instance == null) createNode(parent, vnode.instance, hooks, ns, nextSibling)
      else updateNode(parent, old.instance, vnode.instance, hooks, nextSibling, recycling, ns)
      vnode.dom = vnode.instance.dom
      vnode.domSize = vnode.instance.domSize
    }
    else if (old.instance != null) {
      removeNode(old.instance, null)
      vnode.dom = undefined
      vnode.domSize = 0
    }
    else {
      vnode.dom = old.dom
      vnode.domSize = old.domSize
    }
  }
  function isRecyclable(old, vnodes) {
    if (old.pool != null && Math.abs(old.pool.length - vnodes.length) <= Math.abs(old.length - vnodes.length)) {
      var oldChildrenLength = old[0] && old[0].children && old[0].children.length || 0
      var poolChildrenLength = old.pool[0] && old.pool[0].children && old.pool[0].children.length || 0
      var vnodesChildrenLength = vnodes[0] && vnodes[0].children && vnodes[0].children.length || 0
      if (Math.abs(poolChildrenLength - vnodesChildrenLength) <= Math.abs(oldChildrenLength - vnodesChildrenLength)) {
        return true
      }
    }
    return false
  }
  function getKeyMap(vnodes, end) {
    var map = {}, i = 0
    for (var i = 0; i < end; i++) {
      var vnode = vnodes[i]
      if (vnode != null) {
        var key = vnode.key
        if (key != null) map[key] = i
      }
    }
    return map
  }
  function toFragment(vnode) {
    var count = vnode.domSize
    if (count != null || vnode.dom == null) {
      var fragment = $doc.createDocumentFragment()
      if (count > 0) {
        var dom = vnode.dom
        while (--count) fragment.appendChild(dom.nextSibling)
        fragment.insertBefore(dom, fragment.firstChild)
      }
      return fragment
    }
    else return vnode.dom
  }
  function getNextSibling(vnodes, i, nextSibling) {
    for (; i < vnodes.length; i++) {
      if (vnodes[i] != null && vnodes[i].dom != null) return vnodes[i].dom
    }
    return nextSibling
  }

  function insertNode(parent, dom, nextSibling) {
    if (nextSibling && nextSibling.parentNode) parent.insertBefore(dom, nextSibling)
    else parent.appendChild(dom)
  }

  function setContentEditable(vnode) {
    var children = vnode.children
    if (children != null && children.length === 1 && children[0].tag === "<") {
      var content = children[0].children
      if (vnode.dom.innerHTML !== content) vnode.dom.innerHTML = content
    }
    else if (vnode.text != null || children != null && children.length !== 0) throw new Error("Child node of a contenteditable must be trusted")
  }

  //remove
  function removeNodes(vnodes, start, end, context) {
    for (var i = start; i < end; i++) {
      var vnode = vnodes[i]
      if (vnode != null) {
        if (vnode.skip) vnode.skip = false
        else removeNode(vnode, context)
      }
    }
  }
  function removeNode(vnode, context) {
    var expected = 1, called = 0
    if (vnode.attrs && typeof vnode.attrs.onbeforeremove === "function") {
      var result = vnode.attrs.onbeforeremove.call(vnode.state, vnode)
      if (result != null && typeof result.then === "function") {
        expected++
        result.then(continuation, continuation)
      }
    }
    if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeremove === "function") {
      var result = vnode._state.onbeforeremove.call(vnode.state, vnode)
      if (result != null && typeof result.then === "function") {
        expected++
        result.then(continuation, continuation)
      }
    }
    continuation()
    function continuation() {
      if (++called === expected) {
        onremove(vnode)
        if (vnode.dom) {
          var count = vnode.domSize || 1
          if (count > 1) {
            var dom = vnode.dom
            while (--count) {
              removeNodeFromDOM(dom.nextSibling)
            }
          }
          removeNodeFromDOM(vnode.dom)
          if (context != null && vnode.domSize == null && !hasIntegrationMethods(vnode.attrs) && typeof vnode.tag === "string") { //TODO test custom elements
            if (!context.pool) context.pool = [vnode]
            else context.pool.push(vnode)
          }
        }
      }
    }
  }
  function removeNodeFromDOM(node) {
    var parent = node.parentNode
    if (parent != null) parent.removeChild(node)
  }
  function onremove(vnode) {
    if (vnode.attrs && typeof vnode.attrs.onremove === "function") vnode.attrs.onremove.call(vnode.state, vnode)
    if (typeof vnode.tag !== "string" && typeof vnode._state.onremove === "function") vnode._state.onremove.call(vnode.state, vnode)
    if (vnode.instance != null) onremove(vnode.instance)
    else {
      var children = vnode.children
      if (Array.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
          var child = children[i]
          if (child != null) onremove(child)
        }
      }
    }
  }

  //attrs
  function setAttrs(vnode, attrs, ns) {
    for (var key in attrs) {
      setAttr(vnode, key, null, attrs[key], ns)
    }
  }
  function setAttr(vnode, key, old, value, ns) {
    var element = vnode.dom
    if (key === "key" || key === "is" || (old === value && !isFormAttribute(vnode, key)) && typeof value !== "object" || typeof value === "undefined" || isLifecycleMethod(key)) return
    var nsLastIndex = key.indexOf(":")
    if (nsLastIndex > -1 && key.substr(0, nsLastIndex) === "xlink") {
      element.setAttributeNS("http://www.w3.org/1999/xlink", key.slice(nsLastIndex + 1), value)
    }
    else if (key[0] === "o" && key[1] === "n" && typeof value === "function") updateEvent(vnode, key, value)
    else if (key === "style") updateStyle(element, old, value)
    else if (key in element && !isAttribute(key) && ns === undefined && !isCustomElement(vnode)) {
      if (key === "value") {
        var normalized = "" + value // eslint-disable-line no-implicit-coercion
        //setting input[value] to same value by typing on focused element moves cursor to end in Chrome
        if ((vnode.tag === "input" || vnode.tag === "textarea") && vnode.dom.value === normalized && vnode.dom === $doc.activeElement) return
        //setting select[value] to same value while having select open blinks select dropdown in Chrome
        if (vnode.tag === "select") {
          if (value === null) {
            if (vnode.dom.selectedIndex === -1 && vnode.dom === $doc.activeElement) return
          } else {
            if (old !== null && vnode.dom.value === normalized && vnode.dom === $doc.activeElement) return
          }
        }
        //setting option[value] to same value while having select open blinks select dropdown in Chrome
        if (vnode.tag === "option" && old != null && vnode.dom.value === normalized) return
      }
      // If you assign an input type that is not supported by IE 11 with an assignment expression, an error will occur.
      if (vnode.tag === "input" && key === "type") {
        element.setAttribute(key, value)
        return
      }
      element[key] = value
    }
    else {
      if (typeof value === "boolean") {
        if (value) element.setAttribute(key, "")
        else element.removeAttribute(key)
      }
      else element.setAttribute(key === "className" ? "class" : key, value)
    }
  }
  function setLateAttrs(vnode) {
    var attrs = vnode.attrs
    if (vnode.tag === "select" && attrs != null) {
      if ("value" in attrs) setAttr(vnode, "value", null, attrs.value, undefined)
      if ("selectedIndex" in attrs) setAttr(vnode, "selectedIndex", null, attrs.selectedIndex, undefined)
    }
  }
  function updateAttrs(vnode, old, attrs, ns) {
    if (attrs != null) {
      for (var key in attrs) {
        setAttr(vnode, key, old && old[key], attrs[key], ns)
      }
    }
    if (old != null) {
      for (var key in old) {
        if (attrs == null || !(key in attrs)) {
          if (key === "className") key = "class"
          if (key[0] === "o" && key[1] === "n" && !isLifecycleMethod(key)) updateEvent(vnode, key, undefined)
          else if (key !== "key") vnode.dom.removeAttribute(key)
        }
      }
    }
  }
  function isFormAttribute(vnode, attr) {
    return attr === "value" || attr === "checked" || attr === "selectedIndex" || attr === "selected" && vnode.dom === $doc.activeElement
  }
  function isLifecycleMethod(attr) {
    return attr === "oninit" || attr === "oncreate" || attr === "onupdate" || attr === "onremove" || attr === "onbeforeremove" || attr === "onbeforeupdate"
  }
  function isAttribute(attr) {
    return attr === "href" || attr === "list" || attr === "form" || attr === "width" || attr === "height"// || attr === "type"
  }
  function isCustomElement(vnode){
    return vnode.attrs.is || vnode.tag.indexOf("-") > -1
  }
  function hasIntegrationMethods(source) {
    return source != null && (source.oncreate || source.onupdate || source.onbeforeremove || source.onremove)
  }

  //style
  function updateStyle(element, old, style) {
    if (old === style) element.style.cssText = "", old = null
    if (style == null) element.style.cssText = ""
    else if (typeof style === "string") element.style.cssText = style
    else {
      if (typeof old === "string") element.style.cssText = ""
      for (var key in style) {
        element.style[key] = style[key]
      }
      if (old != null && typeof old !== "string") {
        for (var key in old) {
          if (!(key in style)) element.style[key] = ""
        }
      }
    }
  }

  //event
  function updateEvent(vnode, key, value) {
    var element = vnode.dom
    var callback = typeof onevent !== "function" ? value : function(e) {
      var result = value.call(element, e)
      onevent.call(element, e)
      return result
    }
    if (key in element) element[key] = typeof value === "function" ? callback : null
    else {
      var eventName = key.slice(2)
      if (vnode.events === undefined) vnode.events = {}
      if (vnode.events[key] === callback) return
      if (vnode.events[key] != null) element.removeEventListener(eventName, vnode.events[key], false)
      if (typeof value === "function") {
        vnode.events[key] = callback
        element.addEventListener(eventName, vnode.events[key], false)
      }
    }
  }

  //lifecycle
  function initLifecycle(source, vnode, hooks) {
    if (typeof source.oninit === "function") source.oninit.call(vnode.state, vnode)
    if (typeof source.oncreate === "function") hooks.push(source.oncreate.bind(vnode.state, vnode))
  }
  function updateLifecycle(source, vnode, hooks) {
    if (typeof source.onupdate === "function") hooks.push(source.onupdate.bind(vnode.state, vnode))
  }
  function shouldNotUpdate(vnode, old) {
    var forceVnodeUpdate, forceComponentUpdate
    if (vnode.attrs != null && typeof vnode.attrs.onbeforeupdate === "function") forceVnodeUpdate = vnode.attrs.onbeforeupdate.call(vnode.state, vnode, old)
    if (typeof vnode.tag !== "string" && typeof vnode._state.onbeforeupdate === "function") forceComponentUpdate = vnode._state.onbeforeupdate.call(vnode.state, vnode, old)
    if (!(forceVnodeUpdate === undefined && forceComponentUpdate === undefined) && !forceVnodeUpdate && !forceComponentUpdate) {
      vnode.dom = old.dom
      vnode.domSize = old.domSize
      vnode.instance = old.instance
      return true
    }
    return false
  }

  function render(dom, vnodes) {
    if (!dom) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.")
    var hooks = []
    var active = $doc.activeElement
    var namespace = dom.namespaceURI

    // First time rendering into a node clears it out
    if (dom.vnodes == null) dom.textContent = ""

    if (!Array.isArray(vnodes)) vnodes = [vnodes]
    updateNodes(dom, dom.vnodes, Vnode.normalizeChildren(vnodes), false, hooks, null, namespace === "http://www.w3.org/1999/xhtml" ? undefined : namespace)
    dom.vnodes = vnodes
    for (var i = 0; i < hooks.length; i++) hooks[i]()
    // document.activeElement can return null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
    if (active != null && $doc.activeElement !== active) active.focus()
  }

  return {render: render, setEventCallback: setEventCallback}
}

},{"../render/vnode":49}],49:[function(require,module,exports){
"use strict"

function Vnode(tag, key, attrs, children, text, dom) {
  return {tag: tag, key: key, attrs: attrs, children: children, text: text, dom: dom, domSize: undefined, state: undefined, _state: undefined, events: undefined, instance: undefined, skip: false}
}
Vnode.normalize = function(node) {
  if (Array.isArray(node)) return Vnode("[", undefined, undefined, Vnode.normalizeChildren(node), undefined, undefined)
  if (node != null && typeof node !== "object") return Vnode("#", undefined, undefined, node === false ? "" : node, undefined, undefined)
  return node
}
Vnode.normalizeChildren = function normalizeChildren(children) {
  for (var i = 0; i < children.length; i++) {
    children[i] = Vnode.normalize(children[i])
  }
  return children
}

module.exports = Vnode

},{}],50:[function(require,module,exports){
"use strict"

var buildQueryString = require("../querystring/build")

var FILE_PROTOCOL_REGEX = new RegExp("^file://", "i")

module.exports = function($window, Promise) {
  var callbackCount = 0

  var oncompletion
  function setCompletionCallback(callback) {oncompletion = callback}

  function finalizer() {
    var count = 0
    function complete() {if (--count === 0 && typeof oncompletion === "function") oncompletion()}

    return function finalize(promise) {
      var then = promise.then
      promise.then = function() {
        count++
        var next = then.apply(promise, arguments)
        next.then(complete, function(e) {
          complete()
          if (count === 0) throw e
        })
        return finalize(next)
      }
      return promise
    }
  }
  function normalize(args, extra) {
    if (typeof args === "string") {
      var url = args
      args = extra || {}
      if (args.url == null) args.url = url
    }
    return args
  }

  function request(args, extra) {
    var finalize = finalizer()
    args = normalize(args, extra)

    var promise = new Promise(function(resolve, reject) {
      if (args.method == null) args.method = "GET"
      args.method = args.method.toUpperCase()

      var useBody = (args.method === "GET" || args.method === "TRACE") ? false : (typeof args.useBody === "boolean" ? args.useBody : true)

      if (typeof args.serialize !== "function") args.serialize = typeof FormData !== "undefined" && args.data instanceof FormData ? function(value) {return value} : JSON.stringify
      if (typeof args.deserialize !== "function") args.deserialize = deserialize
      if (typeof args.extract !== "function") args.extract = extract

      args.url = interpolate(args.url, args.data)
      if (useBody) args.data = args.serialize(args.data)
      else args.url = assemble(args.url, args.data)

      var xhr = new $window.XMLHttpRequest(),
        aborted = false,
        _abort = xhr.abort


      xhr.abort = function abort() {
        aborted = true
        _abort.call(xhr)
      }

      xhr.open(args.method, args.url, typeof args.async === "boolean" ? args.async : true, typeof args.user === "string" ? args.user : undefined, typeof args.password === "string" ? args.password : undefined)

      if (args.serialize === JSON.stringify && useBody && !(args.headers && args.headers.hasOwnProperty("Content-Type"))) {
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
      }
      if (args.deserialize === deserialize && !(args.headers && args.headers.hasOwnProperty("Accept"))) {
        xhr.setRequestHeader("Accept", "application/json, text/*")
      }
      if (args.withCredentials) xhr.withCredentials = args.withCredentials

      for (var key in args.headers) if ({}.hasOwnProperty.call(args.headers, key)) {
        xhr.setRequestHeader(key, args.headers[key])
      }

      if (typeof args.config === "function") xhr = args.config(xhr, args) || xhr

      xhr.onreadystatechange = function() {
        // Don't throw errors on xhr.abort().
        if(aborted) return

        if (xhr.readyState === 4) {
          try {
            var response = (args.extract !== extract) ? args.extract(xhr, args) : args.deserialize(args.extract(xhr, args))
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || FILE_PROTOCOL_REGEX.test(args.url)) {
              resolve(cast(args.type, response))
            }
            else {
              var error = new Error(xhr.responseText)
              for (var key in response) error[key] = response[key]
              reject(error)
            }
          }
          catch (e) {
            reject(e)
          }
        }
      }

      if (useBody && (args.data != null)) xhr.send(args.data)
      else xhr.send()
    })
    return args.background === true ? promise : finalize(promise)
  }

  function jsonp(args, extra) {
    var finalize = finalizer()
    args = normalize(args, extra)

    var promise = new Promise(function(resolve, reject) {
      var callbackName = args.callbackName || "_mithril_" + Math.round(Math.random() * 1e16) + "_" + callbackCount++
      var script = $window.document.createElement("script")
      $window[callbackName] = function(data) {
        script.parentNode.removeChild(script)
        resolve(cast(args.type, data))
        delete $window[callbackName]
      }
      script.onerror = function() {
        script.parentNode.removeChild(script)
        reject(new Error("JSONP request failed"))
        delete $window[callbackName]
      }
      if (args.data == null) args.data = {}
      args.url = interpolate(args.url, args.data)
      args.data[args.callbackKey || "callback"] = callbackName
      script.src = assemble(args.url, args.data)
      $window.document.documentElement.appendChild(script)
    })
    return args.background === true? promise : finalize(promise)
  }

  function interpolate(url, data) {
    if (data == null) return url

    var tokens = url.match(/:[^\/]+/gi) || []
    for (var i = 0; i < tokens.length; i++) {
      var key = tokens[i].slice(1)
      if (data[key] != null) {
        url = url.replace(tokens[i], data[key])
      }
    }
    return url
  }

  function assemble(url, data) {
    var querystring = buildQueryString(data)
    if (querystring !== "") {
      var prefix = url.indexOf("?") < 0 ? "?" : "&"
      url += prefix + querystring
    }
    return url
  }

  function deserialize(data) {
    try {return data !== "" ? JSON.parse(data) : null}
    catch (e) {throw new Error(data)}
  }

  function extract(xhr) {return xhr.responseText}

  function cast(type, data) {
    if (typeof type === "function") {
      if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
          data[i] = new type(data[i])
        }
      }
      else return new type(data)
    }
    return data
  }

  return {request: request, jsonp: jsonp, setCompletionCallback: setCompletionCallback}
}

},{"../querystring/build":45}],51:[function(require,module,exports){
"use strict"

module.exports = require("./stream/stream")

},{"./stream/stream":52}],52:[function(require,module,exports){
/* eslint-disable */
;(function() {
"use strict"
/* eslint-enable */

var guid = 0, HALT = {}
function createStream() {
  function stream() {
    if (arguments.length > 0 && arguments[0] !== HALT) updateStream(stream, arguments[0])
    return stream._state.value
  }
  initStream(stream)

  if (arguments.length > 0 && arguments[0] !== HALT) updateStream(stream, arguments[0])

  return stream
}
function initStream(stream) {
  stream.constructor = createStream
  stream._state = {id: guid++, value: undefined, state: 0, derive: undefined, recover: undefined, deps: {}, parents: [], endStream: undefined, unregister: undefined}
  stream.map = stream["fantasy-land/map"] = map, stream["fantasy-land/ap"] = ap, stream["fantasy-land/of"] = createStream
  stream.valueOf = valueOf, stream.toJSON = toJSON, stream.toString = valueOf

  Object.defineProperties(stream, {
    end: {get: function() {
      if (!stream._state.endStream) {
        var endStream = createStream()
        endStream.map(function(value) {
          if (value === true) {
            unregisterStream(stream)
            endStream._state.unregister = function(){unregisterStream(endStream)}
          }
          return value
        })
        stream._state.endStream = endStream
      }
      return stream._state.endStream
    }}
  })
}
function updateStream(stream, value) {
  updateState(stream, value)
  for (var id in stream._state.deps) updateDependency(stream._state.deps[id], false)
  if (stream._state.unregister != null) stream._state.unregister()
  finalize(stream)
}
function updateState(stream, value) {
  stream._state.value = value
  stream._state.changed = true
  if (stream._state.state !== 2) stream._state.state = 1
}
function updateDependency(stream, mustSync) {
  var state = stream._state, parents = state.parents
  if (parents.length > 0 && parents.every(active) && (mustSync || parents.some(changed))) {
    var value = stream._state.derive()
    if (value === HALT) return false
    updateState(stream, value)
  }
}
function finalize(stream) {
  stream._state.changed = false
  for (var id in stream._state.deps) stream._state.deps[id]._state.changed = false
}

function combine(fn, streams) {
  if (!streams.every(valid)) throw new Error("Ensure that each item passed to stream.combine/stream.merge is a stream")
  return initDependency(createStream(), streams, function() {
    return fn.apply(this, streams.concat([streams.filter(changed)]))
  })
}

function initDependency(dep, streams, derive) {
  var state = dep._state
  state.derive = derive
  state.parents = streams.filter(notEnded)

  registerDependency(dep, state.parents)
  updateDependency(dep, true)

  return dep
}
function registerDependency(stream, parents) {
  for (var i = 0; i < parents.length; i++) {
    parents[i]._state.deps[stream._state.id] = stream
    registerDependency(stream, parents[i]._state.parents)
  }
}
function unregisterStream(stream) {
  for (var i = 0; i < stream._state.parents.length; i++) {
    var parent = stream._state.parents[i]
    delete parent._state.deps[stream._state.id]
  }
  for (var id in stream._state.deps) {
    var dependent = stream._state.deps[id]
    var index = dependent._state.parents.indexOf(stream)
    if (index > -1) dependent._state.parents.splice(index, 1)
  }
  stream._state.state = 2 //ended
  stream._state.deps = {}
}

function map(fn) {return combine(function(stream) {return fn(stream())}, [this])}
function ap(stream) {return combine(function(s1, s2) {return s1()(s2())}, [stream, this])}
function valueOf() {return this._state.value}
function toJSON() {return this._state.value != null && typeof this._state.value.toJSON === "function" ? this._state.value.toJSON() : this._state.value}

function valid(stream) {return stream._state }
function active(stream) {return stream._state.state === 1}
function changed(stream) {return stream._state.changed}
function notEnded(stream) {return stream._state.state !== 2}

function merge(streams) {
  return combine(function() {
    return streams.map(function(s) {return s()})
  }, streams)
}

function scan(reducer, seed, stream) {
  var newStream = combine(function (s) {
    return seed = reducer(seed, s._state.value)
  }, [stream])

  if (newStream._state.state === 0) newStream(seed)

  return newStream
}

function scanMerge(tuples, seed) {
  var streams = tuples.map(function(tuple) {
    var stream = tuple[0]
    if (stream._state.state === 0) stream(undefined)
    return stream
  })

  var newStream = combine(function() {
    var changed = arguments[arguments.length - 1]

    streams.forEach(function(stream, idx) {
      if (changed.indexOf(stream) > -1) {
        seed = tuples[idx][1](seed, stream._state.value)
      }
    })

    return seed
  }, streams)

  return newStream
}

createStream["fantasy-land/of"] = createStream
createStream.merge = merge
createStream.combine = combine
createStream.scan = scan
createStream.scanMerge = scanMerge
createStream.HALT = HALT

if (typeof module !== "undefined") module["exports"] = createStream
else if (typeof window.m === "function" && !("stream" in window.m)) window.m.stream = createStream
else window.m = {stream : createStream}

}());

},{}],53:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[4]);
