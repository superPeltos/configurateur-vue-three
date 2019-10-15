module.exports = {
  publicPath:'/',
  filenameHashing : false,
  chainWebpack(config) {
    config.output.filename("js/[name].js");
  }
};
