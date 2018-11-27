var http = require('http');
var fs   = require('fs');

function handleIndex(resp) {
  var stream = fs.createReadStream(__dirname + '/index.html');
  resp.writeHead(200, {
    'content-type': 'text/html'
  })
  stream.pipe(resp)
}

function handleAjax(resp) {
  var json = {"success":true,"data":{"products":[{"id":1266,"title":"Sepeda","description":"","imageId":"1267","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_1000px_rev081315_AllBlackWithFlatBlackFrame_01-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_1000px_rev081315_AllBlackWithFlatBlackFrame_01.png","disclaimer":"An automated WordPress update has failed to complete","partNumber":"1","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[{"id":1286,"title":"Body","description":"","imageId":"1312","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-FlatBlack_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-FlatBlack_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[{"id":1287,"title":"Hitam","description":"","imageId":"1312","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-FlatBlack_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-FlatBlack_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"all","logicRules":"","childs":[{"id":1289,"title":"insert title here","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"show","logicType":"any","logicRules":"","childs":[]},{"id":1290,"title":"insert title here","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"show","logicType":"any","logicRules":"","childs":[]},{"id":1291,"title":"insert title here","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"show","logicType":"any","logicRules":"","childs":[]},{"id":1292,"title":"insert title here","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"show","logicType":"any","logicRules":"","childs":[]},{"id":1293,"title":"insert title here","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"show","logicType":"any","logicRules":"","childs":[]}]},{"id":1288,"title":"Hijau","description":"","imageId":"1313","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-NeonGreen_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-NeonGreen_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]},{"id":1314,"title":"Orange","description":"","imageId":"1315","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-Orange_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Frame-Orange_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]}]},{"id":1309,"title":"Roda","description":"","imageId":"1310","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/wheel-307316_960_720-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/wheel-307316_960_720.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[{"id":1311,"title":"Hitam","description":"","imageId":"1316","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Wheels-Black_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Wheels-Black_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]},{"id":1317,"title":"Hijau","description":"","imageId":"1318","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Wheels-Green_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Wheels-Green_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]},{"id":1319,"title":"Orange","description":"","imageId":"1320","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Wheels-Orange_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Wheels-Orange_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]}]},{"id":1268,"title":"Rantai","description":"An automated WordPress update has failed to complete","imageId":"1322","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Black_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Black_1000px.png","disclaimer":"An automated WordPress update has failed to complete","partNumber":"An automated WordPress update has failed to complete","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[{"id":1284,"title":"Hitam","description":"title2","imageId":"1322","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Black_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Black_1000px.png","disclaimer":"title","partNumber":"title","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]},{"id":1285,"title":"Hijau","description":"title2","imageId":"1323","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Green_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Green_1000px.png","disclaimer":"title2","partNumber":"title2","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]},{"id":1324,"title":"Orange","description":"","imageId":"1325","imageUrl":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Orange_1000px-150x150.png","imageUrlFull":"http:\/\/jetty.eresources.id\/wp-content\/uploads\/2017\/10\/5003_StreetKing_Chain-Orange_1000px.png","disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]}]}]},{"id":1297,"title":"Bistro Line","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[{"id":1298,"title":"Mt. Chuckanut 4'","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[{"id":1308,"title":"insert title here","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]}]},{"id":1299,"title":"Fuel Configuration","description":"","imageId":"","imageUrl":false,"imageUrlFull":false,"disclaimer":"","partNumber":"","open":false,"logicDisplay":"hide","logicType":"any","logicRules":"","childs":[]}]}]}}
  json = JSON.stringify(json);
  resp.writeHead(200, {
    'content-type': 'text/json'
  });
  resp.end(json);
}

function handleCSS(resp) {
  var stream = fs.createReadStream(__dirname + '/style.css');
  resp.writeHead(200, {
    'content-type': 'text/css'
  });
  stream.pipe(resp);
}

function handleJS(resp) {
  var stream = fs.createReadStream(__dirname + '/bundle.js');
  resp.writeHead(200, {
    'content-type': 'text/javascript'
  });
  stream.pipe(resp);
}

function connectionHandler(req, resp) {
  var fullPath = req.url;
  var path = fullPath;
  if (path.includes('?')) {
    var paths = path.split('?');
    path = paths[0];
  }
  switch (path) {
    case '/':
      return handleIndex(resp);
    case '/ajax':
      return handleAjax(resp);
    case '/bundle.js':
      return handleJS(resp);
    case '/style.css':
      return handleCSS(resp);
    default:
      resp.writeHead(404);
      return resp.end('Invalid request');
  }
}

var server = http.createServer(connectionHandler)
server.listen(2048)