/* eslint no-console: off */
const path = require("path");
const express = require("express");
const expressStaticGzip = require("express-static-gzip");
const charon = require("./src/server/charon");
const globals = require("./src/server/globals");

/* documentation in the static site! */

const devServer = process.argv.indexOf("dev") !== -1;
globals.setGlobals({
  localData: process.argv.indexOf("localData") !== -1
});

/* if we are in dev-mode, we need to import specific libraries & set flags */
let webpack, config, webpackDevMiddleware, webpackHotMiddleware;
if (devServer) {
  webpack = require("webpack"); // eslint-disable-line
  config = require("./webpack.config.dev"); // eslint-disable-line
  webpackDevMiddleware = require("webpack-dev-middleware"); // eslint-disable-line
  webpackHotMiddleware = require("webpack-hot-middleware"); // eslint-disable-line
}

const app = express();
app.set('port', process.env.PORT || 4000);

if (devServer) {
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
  }));
  app.use(webpackHotMiddleware(compiler));
} else {
  app.use("/dist", expressStaticGzip("dist"));
  app.use(express.static(path.join(__dirname, "dist")));
}

/* redirect www.nextstrain.org to nextstrain.org */
app.use(require('express-naked-redirect')({reverse: true}));

app.get("/favicon.png", (req, res) => {
  res.sendFile(path.join(__dirname, "favicon.png"));
});

charon.applyCharonToApp(app);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const server = app.listen(app.get('port'), () => {
  console.log("-----------------------------------");
  console.log("Olmsted server started on port " + server.address().port);
  console.log(devServer ? "Serving dev bundle with hot-reloading enabled" : "Serving compiled bundle from /dist");
  console.log(global.LOCAL_DATA ? "Data is being sourced from /data" : "Dataset JSONs are being sourced from S3, narratives via the static github repo");
  console.log("-----------------------------------\n\n");
});
