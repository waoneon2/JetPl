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
  } else {

    var b = rules.every(function (x) {
      return choosed.includes(x);
    });
    return option.logicDisplay === 'hide' ? b : !b;
  }
}

function isOptionShouldDisplayed(option, choosed) {
  return !isOptionShouldHide(option, choosed);
}