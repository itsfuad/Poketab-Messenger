module.exports = {
    entry: './public/scripts/app.js',
    mode: 'production',
    output: {
        publicPath: '/',
        path: __dirname + '/public/scripts/bundle',
        filename: 'bundle.js'
    },
};