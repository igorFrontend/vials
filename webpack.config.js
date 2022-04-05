const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
const isBundleAnalyzer = process.env.BUNDLE === 'analyzer'

const optimization = () =>  isProd ? {
    minimizer: [
        new OptimizeCSSAssetsWebpackPlugin(),
        new TerserWebpackPlugin()
    ]
} : {}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: isProd ? 'production' : 'development',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            '@': path.resolve(__dirname, 'src/')
        }
    },
    entry: {
        main: ['@babel/polyfill', './index.tsx']
    },
    output: {
        filename: isProd ? '[name].js' : '[name].[hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(js)$/i,
                exclude: /(node_modules|webpack.config.js)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                            ],
                            plugins: [
                                '@babel/plugin-proposal-class-properties'
                            ]
                        }
                    },
                    ...(isProd ? [] : ['eslint-loader'])
                ]
            },
            {
                test: /\.(jsx)$/i,
                exclude: /node_modules/,
                loader: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [{
                    loader: MiniCSSExtractPlugin.loader,
                    options: {
                        hmr: !isProd,
                        reloadAll: !isProd,
                    }
                }, {
                    loader: 'css-loader',
                    options: {}
                }]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [{
                    loader: MiniCSSExtractPlugin.loader,
                    options: {
                        hmr: !isProd,
                        reloadAll: !isProd,
                    }
                }, {
                    loader: 'css-loader',
                    options: {}
                }, 'sass-loader']
            },
            {
                test: /\.(jpg|jpg|svg|gif)$/i,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/i,
                use: ['file-loader']
            }
        ]
    },
    devtool: isProd ? "" : "eval-cheap-module-source-map",
    devServer: {
        port: 2005,
        hot: !isProd
    },
    optimization: optimization(),
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            { from: path.resolve(__dirname, 'static'), to: path.resolve(__dirname, 'dist') }
        ]),
        new MiniCSSExtractPlugin({
            filename: '[name].[hash].css'
        }),
        ...(isProd ? [new WebpackBundleAnalyzer()] : [])
    ]
}
