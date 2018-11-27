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

    case SKIPOPTION:
      return Z.childAt(state.step - 2, state.zipper).matchWith({
        Nothing: function Nothing() {
          return updateFrontendComponent(state, { type: NEXTSTEP });
        },
        Just: function Just(_ref) {
          var value = _ref.value;

          var parent = value.content.tree.label;
          var stepped = state.stepped.slice();
          stepped.push(state.step + 1);

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

      var product = state.zipper.content.tree.label;
      var forest = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      var parent = value.content.tree.label;
      var s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      var s3product = state.choosed.length > 1 ? state.choosed[1] : {};
      var lastChoose = state.choosed.length > 0 ? state.choosed[state.choosed.length - 1] : {};

      return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Please choose ', (0, _hyperscript2['default'])('b', parent.title)])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [paginationVnode(dispatch, state)])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col3of3', [(0, _hyperscript2['default'])('.sidenote', [(0, _hyperscript2['default'])('span', lastChoose.sideNote)]), (0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: lastChoose.imageNoteUrlFull })])]), (0, _hyperscript2['default'])('.col2of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
        return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
      }))])]), (0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.prgen_list_option', [(0, _hyperscript2['default'])('.list-up', [(0, _hyperscript2['default'])('span', s2product.title), (0, _hyperscript2['default'])('h4', s3product.title), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')]), (0, _hyperscript2['default'])('.line_bottom', [])]), (0, _hyperscript2['default'])('.list-middle', [(0, _hyperscript2['default'])('p', parent.description)].concat(renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1), (0, _hyperscript2['default'])('.line_bottom', []), (0, _hyperscript2['default'])('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1) }, [(0, _hyperscript2['default'])('h4.prgen_prev', '<< BACK')]), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleNextStep(dispatch) }, [(0, _hyperscript2['default'])('h4.prgen_next', 'NEXT >>')])))])])])]);
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

function step6Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: function Nothing() {
      return (0, _hyperscript2['default'])('div', 'step ' + state.step + ' isnt available');
    },
    Just: function Just(_ref6) {
      var value = _ref6.value;

      var product = state.zipper.content.tree.label;
      //const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      var parent = value.content.tree.label;
      var s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      var s3product = state.choosed.length > 1 ? state.choosed[1] : {};
      var lastChoose = state.choosed.length > 0 ? state.choosed[state.choosed.length - 1] : {};

      return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Please choose ', (0, _hyperscript2['default'])('b', parent.title)])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [paginationVnode(dispatch, state)])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col3of3', [(0, _hyperscript2['default'])('.sidenote', [(0, _hyperscript2['default'])('span', lastChoose.sideNote)]), (0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: lastChoose.imageNoteUrlFull })])]), (0, _hyperscript2['default'])('.col2of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
        return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
      }))])]), (0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.prgen_list_option', [(0, _hyperscript2['default'])('.list-up', [(0, _hyperscript2['default'])('span', s2product.title), (0, _hyperscript2['default'])('h4', s3product.title), (0, _hyperscript2['default'])('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [(0, _hyperscript2['default'])('h4.prgen_side_title', 'SKIP OPTION >>')]), (0, _hyperscript2['default'])('.line_bottom', [])]), state.index < 0 ? step6RenderListOption(dispatch, state, value) : step6RenderOptionForIndex(dispatch, state, value, state.index)])])])]);
    }
  });
}

function saveStepVnode(dispatch, state) {
  var product = state.zipper.content.tree.label;
  var stateChoosed = state.choosed.slice(1);

  return (0, _hyperscript2['default'])('div', { className: 'prgen' }, [, (0, _hyperscript2['default'])('div', { className: 'prgen_header ' }, [(0, _hyperscript2['default'])('div', { className: 'prgen_header_title' }, [(0, _hyperscript2['default'])('h1', 'Build Your Oven')]), (0, _hyperscript2['default'])('div.prgen_header_step.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('h4', ['STEP ' + (state.step + 1) + '. Save product configuration'])]), (0, _hyperscript2['default'])('.col1of3', { style: "float: none;" }, [paginationVnode(dispatch, state)])])]), buildBreadcrumbWith(state), (0, _hyperscript2['default'])('.prgen_body.prgen_overauto', [(0, _hyperscript2['default'])('.col1of3', [(0, _hyperscript2['default'])('.preview', [(0, _hyperscript2['default'])('img', { src: product.imageUrlFull }), (0, _hyperscript2['default'])('span.selected', state.choosed.map(function (option) {
    return (0, _hyperscript2['default'])('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull });
  }))]), state.userId === 0 ? (0, _hyperscript2['default'])(LoginRegister, { dispatch: dispatch }) : saveButton(dispatch, state)]), (0, _hyperscript2['default'])('.col2of3', [state.choosed.length === 0 ? (0, _hyperscript2['default'])('div', ['No options choosen']) : (0, _hyperscript2['default'])('table.product-configs-results', [(0, _hyperscript2['default'])('tr', [(0, _hyperscript2['default'])('th', 'Product Name'), (0, _hyperscript2['default'])('th', 'Thumbnail'), (0, _hyperscript2['default'])('th', 'Action')]), (0, _hyperscript2['default'])('tr', [(0, _hyperscript2['default'])('td.center', [(0, _hyperscript2['default'])('h4', 'Product Size - ' + state.choosed[0].title)]), (0, _hyperscript2['default'])('td.images', [(0, _hyperscript2['default'])('.thumbnail.center', [(0, _hyperscript2['default'])('img', { src: state.choosed[0].imageUrlFull })])]), (0, _hyperscript2['default'])('td.td-actions.center', [])])].concat(stateChoosed.map(function (option, ix) {
    return (0, _hyperscript2['default'])('tr', [(0, _hyperscript2['default'])('td.center', [(0, _hyperscript2['default'])('h4', option.title)]), (0, _hyperscript2['default'])('td.images', [(0, _hyperscript2['default'])('.thumbnail.center', [(0, _hyperscript2['default'])('img.frame', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull })])]), (0, _hyperscript2['default'])('td.td-actions.center', [ix == 0 ? '' : (0, _hyperscript2['default'])('button', { onclick: handleListOptionUnChoosed(dispatch, takeOption(option), option.parent) }, 'Delete')])]);
  })))])])]);
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
    return (0, _hyperscript2['default'])('div', [(0, _hyperscript2['default'])('h2', 'Login'), (0, _hyperscript2['default'])('form.login-form', { autocomplete: 'off' }, [(0, _hyperscript2['default'])('container', [(0, _hyperscript2['default'])('label', [(0, _hyperscript2['default'])('b', 'Username / email')]), (0, _hyperscript2['default'])('input', { type: 'text',
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
  return (0, _hyperscript2['default'])('div', [(0, _hyperscript2['default'])('button', { onclick: handleSaveConfiguration(dispatch, state) }, 'Save')]);
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

  if (password !== password2) return;
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
      // alert('an error occured during save configuration. Try again or contact our admin');
      // alert('please refresh page and try again');
      location.reload();
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