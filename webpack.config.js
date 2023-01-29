export default {
	entry: './public/scripts/app/app.js',
	mode: 'production',
	output: {
		publicPath: '/',
		path: process.cwd() + '/public/scripts/app/bundle',
		filename: 'bundle.js'
	},
};