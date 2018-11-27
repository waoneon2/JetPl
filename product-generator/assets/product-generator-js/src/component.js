import * as compose from 'folktale/core/lambda/compose'
import map from 'folktale/fantasy-land/map';
import { Nothing } from 'folktale/maybe'
import stream from 'mithril/stream'
import redrawService from 'mithril/redraw'
import m from 'mithril/render/hyperscript'
import rawRequest from 'mithril/request/request';

import { reduceStream } from './stream'
import * as A from './array'
import * as Z from './tree-zipper'
import * as T from './tree'
import { isOptionShouldDisplayed } from './logic'
import { getProductConfiguration } from './url-detection'

const http = rawRequest(window, Promise)

// ACTIONS
const PRODUCTCHOOSED    = 0;
const OPTION2CHOOSED    = 1;
const OPTION3CHOOSED    = 2;
const STEPMOVED         = 3;
const SKIPOPTION        = 4;
const NEXTSTEP          = 5;
const LISTOPTIONCHOOSED = 6;
const LISTOPTIONUNCHOOSED = 7;
const STEP6BACK = 8;
const STEP6NEXT = 9;
const STEP6SELECT = 10;
const USERLOGGEDIN = 11;

function layoutemplate(title, page, pagination, state) {
  return m('div', { className: 'prgen' }, [
    , m('div', { className: 'prgen_header '}, [
        m('div', { className: 'prgen_header_title' }, [
          m('h1', 'Build Your Oven')
        ]),
        m('div.prgen_header_step.prgen_overauto', [
          m('.col1of3', [
            m('h4', ['STEP ' + (state.step + 1) + '. Please choose ', m('b', title)]),
          ]),
          m('.col1of3', {style: "float: none;"}, [pagination]),
        ])
      ])
    , buildBreadcrumbWith(state)
    , m('.prgen_body.prgen_overauto', page)
  ]);
}

function updateFrontendComponent(state, action) {
  switch (action.type) {
    case PRODUCTCHOOSED:
      let ix = getTreeIx(action.id, state.trees);
      let zipper = Z.fromTree(state.trees[ix]);

      return extend(state,{ zipper: zipper, step: state.step + 1, stepped: [1, 2], choosed: [{parent:state.trees[ix].label, ...state.trees[ix].label}] });

    case OPTION2CHOOSED:
      var stepped = state.stepped.slice();
      stepped.push(2);

      return extend(state,
        { step: state.step + 1
        , stepped: A.nub(stepped)
        , choosed: addChoosedOption(action.option, action.parent, state.choosed)
        });

    case OPTION3CHOOSED:
      var stepped = state.stepped.slice();
      stepped.push(3);

      return extend(state,
        { step: state.step + 1
        , stepped: A.nub(stepped)
        , choosed: addChoosedOption(action.option, action.parent, state.choosed)
        });

    case STEPMOVED:
      return extend(state, {
        step: action.step,
        index: -1
      })

    case NEXTSTEP:
      var stepped = state.stepped.slice();
      stepped.push(state.step + 1);

      return extend(state,
        { step: state.step + 1
        , stepped: stepped
        , index: -1
        });

    case SKIPOPTION:
      return Z.childAt(state.step - 2, state.zipper).matchWith({
        Nothing: () => updateFrontendComponent(state, { type: NEXTSTEP }),
        Just: ({ value }) => {
          const parent = value.content.tree.label;
          var stepped = state.stepped.slice();
          stepped.push(state.step + 1);

          return extend(state, {
            step: state.step + 1,
            index: -1,
            stepped: stepped,
            choosed: state.choosed.filter(x => x.parent.id !== action.parent.id)
          })
        }
      })

    case LISTOPTIONCHOOSED:
      return extend(state, {
        choosed: addChoosedOption(action.option, action.parent, state.choosed)
      });

    case LISTOPTIONUNCHOOSED:
      let choosed  = state.choosed.filter(el => el.id !== action.option.id)
      return extend(state,
        { choosed: choosed
        })

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
      })

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
    var thumbnail = product.imageUrlFull ? m('.thumbnail', [
      m('a', { href : '#', onclick: productChoosed(dispatch, product.id) }, [
        m('img', { src: product.imageUrlFull })
      ])
    ])
    : '';

    return m('div.col1of4.center', [
      m('h4', product.title),
      thumbnail
    ]);

  }), paginationStatic(dispatch), state)
}

function step2Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: () => m('div', 'step ' + state.step + ' isnt available'),
    Just: ({ value }) => {
      const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      const parent = value.content.tree.label;
      const sproduct = state.choosed.length > 0 ? state.choosed[0] : {};

      return m('div', { className: 'prgen' }, [
        , m('div', { className: 'prgen_header '}, [
            m('div', { className: 'prgen_header_title' }, [
              m('h1', 'Build Your Oven')
            ]),
            m('div.prgen_header_step.prgen_overauto', [
              m('.col1of3', [
                m('h4', ['STEP ' + (state.step + 1) + '. Please choose ', m('b', parent.title)]),
              ]),
              m('.col1of3', {style: "float: none;"}, [paginationVnode(dispatch, state)]),
            ])
          ])
        , buildBreadcrumbWith(state)
        , m('.prgen_body.prgen_overauto', [
            m('.col1of4', [
               m('h4.prgen_side_title', sproduct.title),
                m('.prgen_side_desc', [
                  m('p', [
                    m('b', 'Glossary'),
                    m('p', sproduct.description)
                  ])
                ]),
                m('.thumbnail.left', [
                  m('img', { src: sproduct.imageUrlFull })
                ])
              ])
            , m('.col3of4.prgen_overauto', forest.map(function (tree, ix) {
                var child = tree.label;
                const onclick = option3Choosed(dispatch, child, parent);
                var thumbnail = child.imageUrlFull ? m('.thumbnail.left', [
                  m('a', { href : '#', onclick: onclick }, [
                  m('img', { src: child.imageUrlFull })
                  ])
                ])
                : '';
                return m('.col1of3.step3.prgen_overauto', [
                  thumbnail,
                  m('.prgen_product_title', [
                    m('a', { href: '#', onclick: onclick }, [
                    m('span', sproduct.title)
                    , m('h4', child.title)
                    ])
                  ])
                ]);
              }))
          ])
      ]);
    }
  })
}

function step3Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: () => m('div', 'step ' + state.step + ' isnt available'),
    Just: ({ value }) => {
      const product = state.zipper.content.tree.label;
      const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      const parent = value.content.tree.label;
      const s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      const s3product = state.choosed.length > 1 ? state.choosed[1] : {};
      const lastChoose = state.choosed.length > 0 ? state.choosed[state.choosed.length - 1] : {};

      return m('div', { className: 'prgen' }, [
        , m('div', { className: 'prgen_header '}, [
            m('div', { className: 'prgen_header_title' }, [
              m('h1', 'Build Your Oven')
            ]),
            m('div.prgen_header_step.prgen_overauto', [
              m('.col1of3', [
                m('h4', ['STEP ' + (state.step + 1) + '. Please choose ', m('b', parent.title)]),
              ]),
              m('.col1of3', {style: "float: none;"}, [paginationVnode(dispatch, state)]),
            ])
          ])
        , buildBreadcrumbWith(state)
        , m('.prgen_body.prgen_overauto', [
            m('.col3of3', [
              m('.sidenote', [
                m('span', lastChoose.sideNote)
              ]) ,
              m('.preview', [
                m('img', { src: lastChoose.imageNoteUrlFull })
              ])
            ])
            , m('.col2of3', [
              m('.preview', [
                m('img', { src: product.imageUrlFull })
                , m('span.selected', state.choosed.map(option => {
                    return m('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull })
                }))
              ])
            ])
            , m('.col1of3', [
                m('.prgen_list_option', [
                  m('.list-up', [
                    m('span', s2product.title)
                  , m('h4', s3product.title)
                  , m('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [
                      m('h4.prgen_side_title', 'SKIP OPTION >>')
                    ])
                  , m('.line_bottom', [])
                  ])
                  , m('.list-middle', [
                        m('p', parent.description)
                      ].concat(
                        renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1)
                        , m('.line_bottom', [])
                        , m('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1) }, [
                            m('h4.prgen_prev', '<< BACK')
                          ])
                        , m('a', { href: '#', onclick: handleNextStep(dispatch) }, [
                            m('h4.prgen_next', 'NEXT >>')
                          ])
                      )
                    )
                ])
            ])
        ])
      ]);
    }
  });
}

function step4Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: () => m('div', 'step ' + state.step + ' isnt available'),
    Just: ({ value }) => {
      const product = state.zipper.content.tree.label;
      const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      const parent = value.content.tree.label;
      const s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      const s3product = state.choosed.length > 1 ? state.choosed[1] : {};

      return m('div', { className: 'prgen' }, [
        , m('div', { className: 'prgen_header '}, [
            m('div', { className: 'prgen_header_title' }, [
              m('h1', 'Build Your Oven')
            ]),
            m('div.prgen_header_step.prgen_overauto', [
              m('.col1of3', [
                m('h4', ['STEP ' + (state.step + 1) + '. Please choose ', m('b', parent.title)]),
              ]),
              m('.col1of3', {style: "float: none;"}, [paginationVnode(dispatch, state)]),
            ])
          ])
        , buildBreadcrumbWith(state)
        , m('.prgen_body.prgen_overauto', [
            m('.col2of3', [
              m('.preview', [
                m('img', { src: product.imageUrlFull })
                , m('span.selected', state.choosed.map(option => {
                    return m('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull })
                }))
              ])
            ])
            , m('.col1of3', [
                m('.prgen_list_option', [
                  m('.list-up', [
                    m('span', s2product.title)
                  , m('h4', s3product.title)
                  , m('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [
                      m('h4.prgen_side_title', 'SKIP OPTION >>')
                    ])
                  , m('.line_bottom', [])
                  ])
                  , m('.list-middle', [
                        m('p', parent.description)
                      ].concat(
                        renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1)
                        , m('.line_bottom', [])
                        , m('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1) }, [
                            m('h4.prgen_prev', '<< BACK')
                          ])
                        , m('a', { href: '#', onclick: handleNextStep(dispatch) }, [
                            m('h4.prgen_next', 'NEXT >>')
                          ])
                      )
                    )
                ])
            ])
        ])
      ]);
    }
  });
}

function step6RenderOptionForIndex(dispatch, state, zipper, cstate) {
  return Z.childAt(state.index, zipper).matchWith({
    Nothing: () => m('div', 'No options available'),
    Just: ({ value }) => {
      //const parent = value.content.tree.label;
      // FIX For step 6 multiple select
      const parent = zipper.content.tree.label;
      const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);

      return m('.list-middle', [
          m('p', parent.description)
          ].concat(
            renderOptionRecursive(dispatch, state, parent, forest, parent.multiple == 1)
            , m('.line_bottom', [])
            , m('a', { href: '#', onclick: handleStep6Back(dispatch) }, [
              m('h4.prgen_prev', '<< BACK')
            ])
            , m('a', { href: '#', onclick: handleStep6Next(dispatch, zipper, state) }, [
              m('h4.prgen_next', 'NEXT >>')
            ])
        )
      )
    }
  })
}

function step6RenderListOption(dispatch, state, zipper) {
  const parent = zipper.content.tree;
  const forest = filterOptionByLogic(Z.forest(Z.children(zipper)), state.choosed).filter(tree => tree.subforest.length > 0);
  return m('div', {className: 'list-middle' }, [
      m('p', parent.description)
      , m('ul', { className: 'middle' }, forest.map((tree, ix) => {
        const coption = tree.label;
        return m('li.list_items', [
          m('.list_select', [
            m('a', { href: '#', onclick: handleStep6Select(dispatch, ix) }, coption.title)
          ])
        ])
      })
      , m('.line_bottom', [])
      , m('a', { href: '#', onclick: paginationClicked(dispatch, state.step - 1) }, [
          m('h4.prgen_prev', '<< BACK')
        ])
      , m('a', { href: '#', onclick: handleNextStep(dispatch) }, [
        m('h4.prgen_next', 'NEXT >>')
      ])
    )
  ])
}

function step6Vnode(dispatch, state) {
  return Z.childAt(state.step - 2, state.zipper).matchWith({
    Nothing: () => m('div', 'step ' + state.step + ' isnt available'),
    Just: ({ value }) => {
      const product = state.zipper.content.tree.label;
      //const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
      const parent = value.content.tree.label;
      const s2product = state.choosed.length > 0 ? state.choosed[0] : {};
      const s3product = state.choosed.length > 1 ? state.choosed[1] : {};
      const lastChoose = state.choosed.length > 0 ? state.choosed[state.choosed.length - 1] : {};
     
      return m('div', { className: 'prgen' }, [
        , m('div', { className: 'prgen_header '}, [
            m('div', { className: 'prgen_header_title' }, [
              m('h1', 'Build Your Oven')
            ]),
            m('div.prgen_header_step.prgen_overauto', [
              m('.col1of3', [
                m('h4', ['STEP ' + (state.step+1) + '. Please choose ', m('b', parent.title)]),
              ]),
              m('.col1of3', {style: "float: none;"}, [paginationVnode(dispatch, state)]),
            ])
          ])
        , buildBreadcrumbWith(state)
        , m('.prgen_body.prgen_overauto', [
            m('.col3of3', [
              m('.sidenote', [
                m('span', lastChoose.sideNote)
              ]) ,
              m('.preview', [
                m('img', { src: lastChoose.imageNoteUrlFull })
              ])
            ])  
            , m('.col2of3', [
              m('.preview', [
                m('img', { src: product.imageUrlFull })
                , m('span.selected', state.choosed.map(option => {
                    return m('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull })
                }))
              ])
            ])
            , m('.col1of3', [
                m('.prgen_list_option', [
                  m('.list-up', [
                    m('span', s2product.title)
                  , m('h4', s3product.title)
                  , m('a', { href: '#', onclick: handleSkipOption(dispatch, parent) }, [
                      m('h4.prgen_side_title', 'SKIP OPTION >>')
                    ])
                  , m('.line_bottom', [])
                  ])
                  , state.index < 0 ? step6RenderListOption(dispatch, state, value)
                    :                 step6RenderOptionForIndex(dispatch, state, value, state.index)
                ])
            ])
        ])
      ]);
    }
  })
}

function saveStepVnode(dispatch, state) {
  const product = state.zipper.content.tree.label;
  var stateChoosed = state.choosed.slice(1);

  return m('div', { className: 'prgen' }, [
    , m('div', { className: 'prgen_header '}, [
        m('div', { className: 'prgen_header_title' }, [
          m('h1', 'Build Your Oven')
        ]),
        m('div.prgen_header_step.prgen_overauto', [
          m('.col1of3', [
            m('h4', [`STEP ${(state.step + 1)}. Save product configuration`]),
          ]),
          m('.col1of3', {style: "float: none;"}, [paginationVnode(dispatch, state)]),
        ])
      ])
    , buildBreadcrumbWith(state)
    , m('.prgen_body.prgen_overauto', [
        m('.col1of3', [
          m('.preview', [
            m('img', { src: product.imageUrlFull })
            , m('span.selected', state.choosed.map(option => {
                return m('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull })
            }))
          ]),
          state.userId === 0 ? m(LoginRegister, { dispatch }) : saveButton(dispatch, state)
        ])
        , m('.col2of3', [
          state.choosed.length === 0 ? m('div', ['No options choosen'])
          : m('table.product-configs-results', [
            m('tr', [
              m('th', 'Product Name')
              , m('th', 'Thumbnail')
              , m('th', 'Action')
            ]),
            m('tr', [
              m('td.center', [
                m('h4', 'Product Size - ' + state.choosed[0].title)
              ])
              , m('td.images', [
                  m('.thumbnail.center', [
                    m('img', {src:  state.choosed[0].imageUrlFull })
                  ])
              ])
              , m('td.td-actions.center', [])
            ])
          ].concat(stateChoosed.map((option, ix) => {
              return m('tr', [
                m('td.center', [
                  m('h4', option.title)
                ])
                , m('td.images', [
                    m('.thumbnail.center', [
                      m('img.frame', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull })
                    ])
                ])
                , m('td.td-actions.center', [
                    ix == 0 ? '' : m('button', { onclick: handleListOptionUnChoosed(dispatch, takeOption(option), option.parent) }, 'Delete')
                ])
              ])
          })))
        ])
    ])
  ]);
}

const LoginRegister = {
  handleLoginSubmit(e) {
    e.preventDefault();
    handleLoginSubmit(this.state.username || '', this.state.password || '', this.attrs.dispatch)
  },
  handleRegisterSubmit(e) {
    e.preventDefault();
    handleRegisterSubmit({ username: this.state.rusername || ''
                        , email: this.state.remail || ''
                        , password: this.state.rpassword || ''
                        , password2: this.state.rconfirmpassword || ''
                        }, this.attrs.dispatch)
  },
  view(vnode) {
    return m('div', [
      m('h2', 'Login')
      , m('form.login-form', {autocomplete : 'off'}, [
          m('container', [
            m('label', [ m('b', 'Username / email') ])
            , m('input',
                { type: 'text'
                , value: vnode.state.username
                , oninput: (e) => vnode.state.username = e.target.value
                , onchange: (e) => vnode.state.username = e.target.value
                , placeholder: "username / email"
                })
            , m('label', [ m('b', 'Password') ])
            , m('input',
                { type: 'password'
                , value: vnode.state.password
                , password: 'Password'
                , oninput: e => vnode.state.password = e.target.value
                , onchange: e => vnode.state.password = e.target.value
                , placeholder: "password"
                })
            , m('button', { onclick: LoginRegister.handleLoginSubmit.bind(vnode) }, 'Login')
          ])
      ])
    , m('.line_bottom', [])
    , m('h2', 'Register')
    , m('form.register-form', {autocomplete : 'off'}, [
        m('.container', [
          m('label', [ m('b', 'Username') ])
          , m('input',
                { type: 'text'
                , value: vnode.state.rusername
                , oninput: (e) => vnode.state.rusername = e.target.value
                , onchange: (e) => vnode.state.rusername = e.target.value
                , placeholder: "username"
                })
          , m('label', [ m('b', 'Email') ])
          , m('input',
              { type: 'email'
              , value: vnode.state.remail
              , oninput: e => vnode.state.remail = e.target.value
              , onchange: e => vnode.state.remail = e.target.value
              , placeholder: "email"
              })
          , m('label', [ m('b', 'Password') ])
          , m('input',
              { type: 'password'
              , value: vnode.state.rpassword
              , oninput: e => vnode.state.rpassword = e.target.value
              , onchange: e => vnode.state.rpassword = e.target.value
              , placeholder: "password"
              })
          , m('label', [ m('b', 'Confirm Password') ])
          , m('input',
              { type: 'password'
              , value: vnode.state.rconfirmpassword
              , oninput: e => vnode.state.rconfirmpassword = e.target.value
              , onchange: e => vnode.state.rconfirmpassword = e.target.value
              , placeholder: "confirm password"
              , className: vnode.state.rpassword !== vnode.state.rconfirmpassword ? 'invalid' : 'valid'
              })
          , m('button', { onclick: LoginRegister.handleRegisterSubmit.bind(vnode)
                        }, 'Register')
        ])
      ])
    ])
  }
}

function saveButton(dispatch, state) {
  return m('div', [
    m('button', { onclick: handleSaveConfiguration(dispatch, state) }, 'Save')
  ])
}

function renderOptionRecursive(dispatch, state, parent, forest, multi) {
  return forest.map(tree => {
    const option = tree.label
    if (tree.subforest.length === 0) {
      const ix = A.findIndex(optionIdEq.bind(null, option), state.choosed)
      return m('ul.middle', [
        m('li', { className: Nothing.hasInstance(ix) ? '' : 'active' }, [
          m('div', { className: 'list_select' }, [
            m('a',
                { onclick: Nothing.hasInstance(ix)
                           ? handleListOptionClicked(dispatch, option, parent)
                           : handleListOptionUnChoosed(dispatch, option, parent)
                },
                [
                  option.color
                  ? m('div', { style:'background-color:'+option.color+';', className: 'thumbnails left' })
                  : m('img', { src: option.imageUrlFull === false ? prgen_frontend_settings.defaultIcon : option.imageUrlFull, className: 'thumbnails left' })
                ]
            )
            , m('p', option.title)
          ])
        ])
      ])
    } else {
      return m('ul.middle', [
          m('li', { className: 'list_header' }, m('p', option.title),
            renderOptionRecursive(dispatch, state, multi ? option : parent, filterOptionByLogic(tree.subforest, state.choosed), multi))
        ]
      )
    }
  })
}

// -----------------------------------------------------------------------------
// -- Pagination ---------------------------------------------------------------
// -----------------------------------------------------------------------------
function paginationStatic(dispatch) {
  var ranges = [1, 2, 3, 4, 5, 6];
  return m('ul.prgen_step_num', ranges.map(function (i) {
      return m('li', {
        onclick: i === 1 ? paginationClicked(dispatch, 0) : doNothing,
        key: 'static-' + i, className: i === 2 ? 'active' : ''
      }, i)
    })
  )
}

function paginationVnode(dispatch, state) {
  let childs = Z.forest(Z.children(state.zipper));
  let ranges = A.range(1, childs.length + 4);
  let stepplus = state.step + 1;
  return m('ul.prgen_step_num', ranges.map(function (i) {
      return m('li',
        { key: 'dinamic-' + i
        , className: i === stepplus ? 'active' : ''
        , href: '#'
        , onclick: canMoveNextStep(state, i - 1) ? paginationClicked(dispatch, i - 1) : doNothing
        }
      , i)
    })
  )
}

export function frontendComponent(vnode) {
  let actions = stream(),
      initialState = vnode.attrs.initialState,
      model   = reduceStream(updateFrontendComponent, initialState, actions);

  const vnodeStream = map(model, function (state) {
    switch (state.step) {
      case 0:

        window.location.href = prgen_frontend_settings.prgenPageURL
        return;

      case 1:
        return archivePageVnode(actions, state);

      case 2:
        return step2Vnode(actions, state);

      // step 4 and 5 have same layout, so let's just use it
      case 3:
      case 4:
        return checkSavePage(state) ? saveStepVnode(actions, state)
                                    : step3Vnode(actions, state);

      case 5:
        return checkSavePage(state) ? saveStepVnode(actions, state)
                                  : step6Vnode(actions, state)

      default:
        return checkSavePage(state) ? saveStepVnode(actions, state)
                                    : step3Vnode(actions, state);
    }
  });

  return {
    oninit: () => model(initialState)
    , view: () => vnodeStream()
  }
}

function buildBreadcrumbWith(state) {
  if (state.step === 1) {
    return m('ul.breadcrump', [
      m('li', 'Choose a product')
    ])
  }
  let forest = Z.forest(Z.children(state.zipper));
  forest = forest.slice(0, state.step - 1);
  return m('ul.breadcrump', [ m('li', 'Choose a product') ].concat(forest.map(tree => {
    let prod = tree.label;
    return m('li', prod.title)
  })))
}

// -----------------------------------------------------------------------------
// -- Listener -----------------------------------------------------------------
// -----------------------------------------------------------------------------
function productChoosed(dispatch, id) {
  return function (e) {
    e.preventDefault()
    dispatch({ type: PRODUCTCHOOSED, id })
  }
}

function option2Choosed(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: OPTION2CHOOSED, option, parent })
  }
}

function option3Choosed(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: OPTION3CHOOSED, option, parent })
  }
}

function paginationClicked(dispatch,  i) {
  return function (e) {
    e.preventDefault();
    if (i == 0) {
      var r = confirm('Step 1 is a base product and will reset your config progress. Is that ok?');
      if (r == false) return;
    } 
    dispatch({ type: STEPMOVED, step: i })
  }
}

function handleSkipOption(dispatch, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: SKIPOPTION, parent })
  }
}

function handleNextStep(dispatch) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: NEXTSTEP })
  }
}

function handleListOptionClicked(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: LISTOPTIONCHOOSED, option, parent })
  }
}

function handleListOptionUnChoosed(dispatch, option, parent) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: LISTOPTIONUNCHOOSED, option, parent })
  }
}

function handleStep6Back(dispatch) {
  return function (e) {
    e.preventDefault()
    dispatch({ type: STEP6BACK })
  }
}

function handleStep6Next(dispatch, zipper, state) {
  return function (e) {
    e.preventDefault();
    return Z.childAt(state.index + 1, zipper).matchWith({
      Nothing: () => {
        dispatch({ type: NEXTSTEP })
      }, Just: ({ value }) => {
        const forest  = filterOptionByLogic(Z.forest(Z.children(value)), state.choosed);
        const shouldskip = forest.every(tree => tree.subforest.length === 0);
        if (shouldskip) {
          dispatch({ type: NEXTSTEP })
        } else {
          dispatch({ type: STEP6NEXT })
        }
      }
    })
  }
}

function handleStep6Select(dispatch, index) {
  return function (e) {
    e.preventDefault();
    dispatch({ type: STEP6SELECT, index })
  }
}

function handleLoginSubmit(username, password, dispatch) {
  let formdata = new FormData();
  formdata.append('username', username);
  formdata.append('password', btoa(password));
  formdata.append('security', prgen_frontend_settings.loginNonce)
  http.request({
    method: 'POST',
    url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_frontend_user_login',
    background: true,
    withCredentials: true,
    data: formdata
  }).then(response => {
    if (response.success) {
      dispatch({ type: USERLOGGEDIN, userId: response.data.user})
      redrawService.redraw()
    } else {
      // alert(response.data.message);
      alert('invalid username or password');
    }
  }, err => {
    alert('an error occured during login. Try again or contact our admin')
  })
}

function handleRegisterSubmit({ username, email, password, password2 }, dispatch) {
  if (password !== password2) return;
  let formdata = new FormData();
  formdata.append('username', username);
  formdata.append('email', email);
  formdata.append('password', btoa(password));
  formdata.append('password2', btoa(password2))
  formdata.append('security', prgen_frontend_settings.registerNonce);
  http.request({
    method: 'POST',
    url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_frontend_user_register',
    background: true,
    withCredentials: true,
    data: formdata
  }).then(response => {
    if (response.success) {
      dispatch({ type: USERLOGGEDIN, userId: response.data.user})
      redrawService.redraw()
    } else {
      alert(response.data.message)
    }
  }, err => {
    alert('an error occured during register. Try again or contact our admin')
  })
}

function handleSaveConfiguration(dispatch, state) {
  return function (e) {
    e.preventDefault();
    let formdata = new FormData();
    formdata.append('frontend_state', JSON.stringify(state))
    state.choosed.forEach(option => {
      formdata.append('option[]', option.id)
      formdata.append('parent[]', option.parent.id)
    });
    let product = state.zipper.content.tree.label;
    formdata.append('product_id', product.id);
    formdata.append('product_series', state.series);
    formdata.append('security', prgen_frontend_settings.saveNonce);
    getProductConfiguration(location.href).matchWith({
      Nothing: ()       => ({}),
      Just: ({ value }) => formdata.append('config_id', value)
    })
    http.request({
      method: 'POST',
      url: prgen_frontend_settings.ajaxurl + '?action=prgen_ajax_frontend_save_configuration',
      data: formdata,
      background: true,
      withCredentials: true
    }).then(response => {
      if (response.success && prgen_frontend_settings.myAccount) {
        window.location.href = `${prgen_frontend_settings.myAccount}&oid=${response.data.id}`;
      } else {
        alert(response.data.message);
      }
    }, err => {
      // alert('an error occured during save configuration. Try again or contact our admin');
      // alert('please refresh page and try again');
      location.reload();
    })
  }
}

// -----------------------------------------------------------------------------
// -- Utility ------------------------------------------------------------------
// -----------------------------------------------------------------------------
function getTreeIx(id, trees) {
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

function extend(original, update) {
  function rec(a, b) {
    var k;
    for (k in b) {
      a[k] = b[k]
    }
    return a
  }
  return rec(rec({}, original), update)
}

function optionIdEq(a, b) {
  return a.id === b.id
}

function addChoosedOption(option, parent, choosed) {
  let cho = choosed.slice();
  let ix = A.findIndex(x => x.parent.id === parent.id, choosed);
  return ix.matchWith({
    Nothing: () => {
      cho.push({ parent: parent, ...option });

      return cho;
    },
    Just: ({ value }) => {
      cho[value] = { parent: parent, ...option };

      return cho;
    }
  })
}

function filterOptionByLogic(forest, choosed) {
  let choose = choosed.map(x => [x.id, x.parent.id]);
  choose = Array.prototype.concat.apply([], choose)
  return forest.filter(tree => {
    let prod = tree.label;
    return isOptionShouldDisplayed(prod, choose)
  });
}

function canMoveNextStep(state, i) {
  return state.step > i ? true : (Array.isArray(state.stepped) && state.stepped.includes(i))
}

function checkSavePage(state) {
  var len  = Z.forest(Z.children(state.zipper)).length + 2;
  return len === state.step;
}

function doNothing() {}

function takeOption(opts) {
  var keys = Object.keys(opts);
  var results = Object.create(null)
  for (var i = 0, len = keys.length; i < len; i++) {
    if (keys[i] !== 'parent') {
      results[keys[i]] = opts[keys[i]]
    }
  }
  return results
}