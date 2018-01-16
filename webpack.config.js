const path = require("path");

const webpack = require("webpack");

const { DefinePlugin, LoaderOptionsPlugin } = webpack;
const { CommonsChunkPlugin, UglifyJsPlugin } = webpack.optimize;

const CopyPlugin = require("copy-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");

const NODE_ENV = process.env.NODE_ENV || "development";

const contentBase = path.join(__dirname, "htdocs");

module.exports = {
    context: __dirname,
    entry: {
        "bo": ["./src/browser-update.js"],
        "setup": ["babel-polyfill", "./src/setup.js"],
        "index": [
            "font-awesome/scss/font-awesome.scss",
            "./src/frontend.scss",
            "./src/frontend"
        ]
    },
    output: {
        path: contentBase,
        filename: "[name].[hash].js",
        publicPath: ""
    },
    resolve: {
        alias: {
            "vue$": "vue/dist/vue.common.js",
            "vuex$": "vuex/dist/vuex.common.js",
            "vue-router$": "vue-router/dist/vue-router.common.js"
        }
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: [ path.resolve(__dirname, "src") ],
            use: "babel-loader"
        },{
            test: /\.s[ca]ss$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: ["css-loader", "postcss-loader", "sass-loader"]
            })
        },{
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: ["css-loader", "postcss-loader"]
            })
        }, {
            test: /\.(png|jpg|gif)$/,
            use: {
                loader: "url-loader",
                options: { limit: 8192 }
            }
        }, {
            test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            use: "url-loader"
        }, {
            test: /\.(otf|ttf|eot|svg)(\?[\s\S]+)?$/,
            use: "file-loader"
        }, {
            test: /\.pug$/,
            use: "pug-loader"
        }]
    },
    devServer: { contentBase, historyApiFallback: true },
    devtool: NODE_ENV == "development" ? "#eval-source-map" : "#source-map",
    plugins: [
        new DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
        }),
        new CopyPlugin([
            {
                from: path.join(__dirname, "node_modules/openseadragon/build/openseadragon/images"),
                to: path.join(__dirname, "htdocs/openseadragon/images")
            }
        ]),
        new ExtractTextPlugin({ filename: "styles.[hash].css" }),
        new StyleLintPlugin({ quiet: false }),
        new CommonsChunkPlugin({ name: "commons", minChunks: 2 }),
        new HtmlWebpackPlugin({
            template: "src/index.pug",
            inject: false,
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin()

    ]
};

switch (NODE_ENV) {
case "development":
    module.exports.plugins = module.exports.plugins.concat([
        //new BundleAnalyzerPlugin()
    ]);
    break;
case "production":
    module.exports.plugins = module.exports.plugins.concat([
        new LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        })
    ]);
    break;
}