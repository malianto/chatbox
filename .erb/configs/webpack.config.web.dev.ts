import 'webpack-dev-server'
import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { merge } from 'webpack-merge'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import baseConfig from './webpack.config.web.base'
import webpackPaths from './webpack.paths'

const port = process.env.PORT || 1212

const configuration: webpack.Configuration = {
    devtool: 'inline-source-map',
    mode: 'development',
    target: 'web',

    entry: [
        path.join(webpackPaths.srcRendererPath, 'index.tsx'),
    ],

    output: {
        path: webpackPaths.distRendererPath,
        publicPath: '/',
        filename: 'renderer.web.js',
        library: {
            type: 'umd',
        },
    },

    module: {
        rules: [
            {
                test: /\.s?(c|a)ss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            sourceMap: true,
                            importLoaders: 1,
                        },
                    },
                    'sass-loader',
                ],
                include: /\.module\.s?(c|a)ss$/,
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
                exclude: /\.module\.s?(c|a)ss$/,
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: '@svgr/webpack',
                        options: {
                            prettier: false,
                            svgo: false,
                            svgoConfig: {
                                plugins: [{ removeViewBox: false }],
                            },
                            titleProp: true,
                            ref: true,
                        },
                    },
                ],
            },
        ],
    },

    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
        new ReactRefreshWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: path.join('index.html'),
            template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
            },
            isBrowser: true,
            env: process.env.NODE_ENV,
            isDevelopment: process.env.NODE_ENV !== 'production',
            nodeModules: webpackPaths.appNodeModulesPath,
        }),
    ],

    devServer: {
        port,
        compress: true,
        hot: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        static: {
            directory: webpackPaths.srcRendererPath,
            publicPath: '/',
        },
        historyApiFallback: true,
        host: '0.0.0.0',
        allowedHosts: 'all',
        client: {
            webSocketURL: 'auto://0.0.0.0:0/ws',
        },
    },
}

export default merge(baseConfig, configuration)
