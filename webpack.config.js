const { env } = process;

const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin");

const config = require("./config");

const contentBase = path.join(__dirname, "htdocs");

module.exports = {
    mode: env.NODE_ENV || "development",
    context: __dirname,
    entry: {
        "styles": [
            "font-awesome/scss/font-awesome.scss",
            "./frontend/index.scss"
        ],
        "app": [
            "babel-polyfill",
            "intersection-observer",
            "whatwg-fetch",
            "./frontend/index.js"
        ],
        "metadata": [
            "./frontend/parzival-metadata.js"
        ],
        "transcript": [
            "./frontend/parzival-transcript.js"
        ]
    },
    output: {
        path: contentBase,
        filename: "[name].[hash].js",
        publicPath: "/"
    },
    resolve: {
        extensions: [".coffee", ".js"],
        alias: {
            //"vue$": "vue/dist/vue.esm.js"
            "vue$": "vue/dist/vue.common.js",
            "vuex$": "vuex/dist/vuex.common.js",
            "vue-match-media": "vue-match-media/dist/index.js",
            "vue-router$": "vue-router/dist/vue-router.common.js"
        }
    },
    module: {
        rules: [{
            test: /\.coffee$/,
            include: [
                path.resolve(__dirname, "frontend"),
                path.resolve(__dirname, "lib")
            ],
            use: "coffee-loader"
        },{
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
            test: /\.html$/,
            use: ["raw-loader"]
        }, {
            test: /\.(png|jpg|gif)$/,
            use: {
                loader: "url-loader",
                options: { limit: 8192 }
            }
        }, {
            test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            use: {
                loader: "url-loader",
                options: { limit: 8192 }
            }
        }, {
            test: /\.(otf|ttf|eot|svg)(\?[\s\S]+)?$/,
            use: {
                loader: "url-loader",
                options: { limit: 8192 }
            }
        }, {
            test: /\.pug$/,
            use: ["babel-loader", "pug-loader"]
        }]
    },
    devtool: "source-map",
    devServer: {
        contentBase,
        historyApiFallback: true,
        proxy: [{
            context: ["/iiif"],
            target: process.env.PARZIVAL_PROXY_TARGET ||
                "https://parzival.pagina-dh.de",
            changeOrigin: true,
            logLevel: "debug",
            secure: false,
            auth: [config.parzival.http.user, config.parzival.http.password]
                .filter(c => c).join(":") || undefined
        }]
    },
    plugins: [
        new CopyPlugin([
            {
                from: path.join(__dirname, "node_modules/openseadragon/build/openseadragon/images"),
                to: path.join(__dirname, "htdocs/openseadragon/images")
            },
            {
                from: path.join(__dirname, "frontend", "quire-icons"),
                to: path.join(__dirname, "htdocs", "quire-icons")
            },
            {
                from: path.join(__dirname, "frontend", "img"),
                to: path.join(__dirname, "htdocs", "img")
            }
        ]),
        new HtmlWebpackPlugin({
            template: "frontend/html.pug",
            inject: false,
            alwaysWriteToDisk: true
        }),
        new HtmlWebpackHarddiskPlugin()

    ]
};