'use strict';
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

global.config = require(path.resolve(process.cwd(), 'config.json'));

module.exports = {
	entry: {
		bundle: path.resolve('src/index.js'),
		upload: path.resolve('src/upload')
	},
	output: {
		filename: '[name].js',
		path: path.resolve('dist'),
		publicPath: '/'
	},
	target: 'web',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
			{
				test: /\.js$/,
				include: /@lemonce/,
				use: ['babel-loader'],
			},
			{
				test: /\.less$/,
				use: ExtractTextPlugin.extract(['css-loader', 'less-loader'])
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'upload.html',
			template: path.resolve(__dirname, './template/upload.html'),
			chunks: ['upload'],
			inject: 'head'
		}),
		new ExtractTextPlugin('style.css')
	],
	node: false
};