module.exports = {
	entry: './public/scripts/app/app.js',
	mode: 'production',
	output: {
		publicPath: '/',
		path: __dirname + '/public/scripts/app/bundle',
		filename: 'bundle.js'
	},
};