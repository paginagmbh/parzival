const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    context: __dirname,
    entry: {
        "browser-update": ["./src/browser-update.js"],
        "setup": ["modernizr-loader!./src/modernizrrc.js", "babel-polyfill", "./src/setup.js"],
        "index": [
            "font-awesome/scss/font-awesome.scss",
            "./src/frontend.scss",
            "./src/frontend.js"
        ]
    },
    output: {
        path: path.join(__dirname, "htdocs"),
        filename: "[name].js",
        publicPath: ""
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
    plugins: [
        new CopyPlugin([
            {
                from: path.join(__dirname, "node_modules/openseadragon/build/openseadragon/images"),
                to: path.join(__dirname, "htdocs/openseadragon/images")
            }
        ]),
        new ExtractTextPlugin({ filename: "styles.css" }),
        new StyleLintPlugin({ quiet: false })
    ]
};
