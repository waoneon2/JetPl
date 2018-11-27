/**
 * type Option r =
 *   { logicRules   :: String // comma separated options ids
 *   , logicType    :: 'all' | 'any'
 *   , logicDisplay :: 'hide' | 'show'
 *   } | r
 */
// isOptionShouldHide -> Option r -> Array Int -> Boolean
export function isOptionShouldHide(option, choosed) {
  // first split the ids
  let rules = option.logicRules.trim().split(',').map(x => parseInt(x, 10));

  if (option.logicType === 'any') {

    let a = rules.some(x => choosed.includes(x))
    return option.logicDisplay === 'hide' ? a : !a;
  } else {

    let b = rules.every(x => choosed.includes(x));
    return option.logicDisplay === 'hide' ? b : !b;
  }
}

export function isOptionShouldDisplayed(option, choosed) {
  return !isOptionShouldHide(option, choosed);
}