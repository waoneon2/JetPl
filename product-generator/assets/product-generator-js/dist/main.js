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
            console.log(series);
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
        console.log(err);
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