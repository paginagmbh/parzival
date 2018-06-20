const { env } = process;

const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");
const ClosureCompilerPlugin = require("webpack-closure-compiler");

const contentBase = path.join(__dirname, "htdocs");

module.exports = {
    mode: env.NODE_ENV || "development",
    context: __dirname,
    entry: {
        "index": [
            "font-awesome/scss/font-awesome.scss",
            "./frontend/index.scss",
            "babel-polyfill",
            "./frontend/index.js"
        ]
    },
    output: {
        path: contentBase,
        filename: "[name].[hash].js",
        publicPath: ""
    },
    resolve: {
        alias: {
            //"vue$": "vue/dist/vue.esm.js"
            "vue$": "vue/dist/vue.common.js",
            "vuex$": "vuex/dist/vuex.common.js",
            "vue-router$": "vue-router/dist/vue-router.common.js"
        }
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: [
                path.resolve(__dirname, "frontend"),
                path.resolve(__dirname, "lib")
            ],
            use: "babel-loader"
        }, {
            test: /\.s[ca]ss$/,
            use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
        }, {
            test: /\.css$/,
            use: ["style-loader", "css-loader", "postcss-loader"]
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
            use: ["babel-loader", "pug-loader"]
        }]
    },
    devServer: { contentBase, historyApiFallback: true },
    plugins: [
        new CopyPlugin([
            {
                from: path.join(__dirname, "node_modules/openseadragon/build/openseadragon/images"),
                to: path.join(__dirname, "htdocs/openseadragon/images")
            },
            {
                from: path.join(__dirname, "frontend", "quire-icons"),
                to: path.join(__dirname, "htdocs", "quire-icons")
            }
        ]),
        new StyleLintPlugin({ quiet: false }),
        new HtmlWebpackPlugin({
            template: "frontend/html.pug",
            inject: false,
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin()

    ].concat(
        env.NODE_ENV == "production"
            ? [
                new ClosureCompilerPlugin({ concurrency: 3 })
            ]
        : []
    )
};