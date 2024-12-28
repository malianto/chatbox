/**
 * Base webpack config for web
 */

import webpack from 'webpack'
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin'
import webpackPaths from './webpack.paths'

const configuration: webpack.Configuration = {
    stats: 'errors-only',

    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        compilerOptions: {
                            module: 'esnext',
                        },
                    },
                },
            },
        ],
    },

    output: {
        path: webpackPaths.srcPath,
        library: {
            type: 'umd',
        },
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
        modules: [webpackPaths.srcPath, 'node_modules'],
        plugins: [new TsconfigPathsPlugins()],
        fallback: {
            path: require.resolve('path-browserify'),
            fs: false,
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            util: require.resolve('util/'),
            process: require.resolve('process/browser'),
        },
    },

    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
            CHATBOX_BUILD_TARGET: 'web',
            CHATBOX_BUILD_PLATFORM: 'web',
            USE_LOCAL_API: '',
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
}

export default configuration
