import rawRequest from 'mithril/request/request';
import mount from 'mithril/mount'
import m from 'mithril/render/hyperscript'

import { unfoldTree } from './tree'
import * as Z from './tree-zipper'
import { frontendComponent } from './component'
import { getProductConfiguration } from './url-detection'

const http = rawRequest(window, Promise)

function takeOptions(opts) {
  var keys = Object.keys(opts);
  var results = Object.create(null)
  for (var i = 0, len = keys.length; i < len; i++) {
    if (keys[i] !== 'childs') {
      results[keys[i]] = opts[keys[i]]
    }
  }
  return results
}

function buildTree(opts) {
  return [
    takeOptions(opts)
    , opts.childs
  ]
}

function getProductId() {
  var cls = document.body.className.split(' ').filter(function (x) {
    return x.includes('postid-')
  });

  return cls.length === 0 ? null : parseInt(cls[0].replace('postid-', ''));
}

function getSpace(id, trees) {
  var len = trees.length,
      i   = 0;
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
  const page = prgen_frontend_settings.page;
  let state =
    { series
    , trees
    , stepped: []
    , zipper: null
    , step: page === 'archive' ? 1 : 1
    , index: -1
    , userId: parseInt(prgen_frontend_settings.userId, 10)
    , choosed: []
    }
  if (page === 'archive') {
    var productId = getProduct(),
        ix        = getSpace(productId, state.trees),
        ts        = Z.fromTree(state.trees[ix])

    state.zipper  = ts
    state.stepped = [1, 2]
  }
  return state;
}

function normalizeStep(product) {
  var prod = Object.assign({}, product);
  prod.childs = product.childs.filter(x => x.childs.length > 0);
  return prod
}

function getProductAchiveData(series) {
  return http.request({
    method: 'GET',
    url: `${prgen_frontend_settings.ajaxurl}?action=prgen_ajax_get_product_archive_json&cat_name=${series}`,
    background: true,
    withCredentials: true
  });
}

function getConfigurationData(id) {
  return http.request({
    method: 'GET',
    url: `${prgen_frontend_settings.ajaxurl}?action=prgen_ajax_get_product_configuration&id=${id}`,
    background: true,
    withCredentials: true
  });
}

function getProductSeries(id) {
  return http.request({
    method: 'GET',
    url: `${prgen_frontend_settings.ajaxurl}?action=prgen_ajax_get_product_series&id=${id}`,
    background: true,
    withCredentials: true
  });
}

function waitNextAnimationFrame(data) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve(data))
  })
}

function mainProduct(series) {
  return getProductAchiveData(series).then(function (resp) {
    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        resolve(resp.data.products)
      })
    })
  }).then(function (products) {
    const trees = products.map(product => unfoldTree(buildTree, normalizeStep(product)))
    const state = initState(trees, series, getProductId);
    let container = document.querySelector('.prgenapp')
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      mount(
        container,
        {
          view: () => m(frontendComponent, { initialState: state })
        }
      )
    }
  });
}

//
function main(series) {
  return getProductConfiguration(location.href).matchWith({
    Nothing: () => {
      if (!series) {
        return waitNextAnimationFrame()
            .then(_ => Promise.resolve(getProductId()))
            .then(id => id != null ? getProductSeries(id) : Promise.reject())
            .then(series => series.success ? Promise.resolve(series.data.series) : Promise.reject())
            .then(data => {
              const series = data.series;
              if (series.length > 0) {
                console.log(series);
                mainProduct(series[0]);
              }
            }).then(null, function () {

            });
      }
      //
      return mainProduct(series);
    },
    Just: ({ value: configid }) => {
      return getConfigurationData(configid)
        .then(configdata =>
          configdata.success ? Promise.resolve(configdata.data) : Promise.reject()
        ).then(configdata =>
          getProductAchiveData(configdata.series).then(archive =>
            archive.success ? Promise.resolve([archive.data, configdata]) : Promise.reject())
        ).then(waitNextAnimationFrame)
        .then(([archive, configdata]) => {
          const trees = archive.products.map(product => unfoldTree(buildTree, normalizeStep(product)));
          let state = initState(trees, configdata.series, getProductId);
          let productId = getProductId(),
            ix        = getSpace(productId, state.trees),
            ts        = Z.fromTree(state.trees[ix])
          state.zipper  = ts;
          state.stepped = configdata.frontend_state.stepped;
          state.choosed = configdata.frontend_state.choosed.filter(x => {
            return configdata.option_parts.includes(x.id)
          });
          state.step = configdata.frontend_state.step;
          let container = document.querySelector('.prgenapp')
          if (container) {
            while (container.firstChild) {
              container.removeChild(container.firstChild)
            }
            mount(
              container,
              {
                view: () => m(frontendComponent, { initialState: state })
              }
            )
          }
        }).then(null, function (err) {
          console.log(err);
          alert('invalid request')
        });
    }
  });
}

// run
main();
window.mithrilMain = (series) => {
  return main(series);
}