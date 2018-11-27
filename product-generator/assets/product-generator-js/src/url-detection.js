import { Nothing, Just } from 'folktale/maybe'

export function getProductConfiguration(url) {
  if (url.includes('?')) {
    let [path, params] = url.split('?');
    let parts = params.split('&');
    let mconfig = parts.filter(item => item.substr(0, 7) === 'config=');
    if (mconfig.length > 0) {
      let id = parseInt(mconfig[0].split('=')[1], 10);
      return isNaN(id) ? Nothing() : Just(id);
    }
    return Nothing();
  }
  return Nothing();
}