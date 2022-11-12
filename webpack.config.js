const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    plugins: [new CompressionPlugin()],
    entry: './public/scripts/app.js',
    mode: 'production',
    output: {
        publicPath: '/',
        path: __dirname + '/public/scripts/bundle',
        filename: 'bundle.js'
    },
};