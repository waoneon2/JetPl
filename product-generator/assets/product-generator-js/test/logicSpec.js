import { expect } from 'chai'
import { isOptionShouldHide } from '../src/logic'


describe('Option Logic', () => {
  describe('Basic', () => {
    it('Return true if the logic hold', () => {
      let option =
        { logicType: 'any'
        , logicDisplay: 'hide'
        , logicRules: '12,34,45'
        }
      expect(isOptionShouldHide(option, [12])).to.equals(true);

      let option2 =
        { logicType: 'any'
        , logicDisplay: 'show'
        , logicRules: '12,34,45'
        }
      expect(isOptionShouldHide(option2, [12])).to.equals(false);
    });

    it('Return false if the logic dont hold', () => {
      let option =
        { logicType: 'any'
        , logicDisplay: 'hide'
        , logicRules: '12,34,45'
        }
      expect(isOptionShouldHide(option, [])).to.equals(false);
      expect(isOptionShouldHide(option, [13])).to.equals(false)
    });

  })
})