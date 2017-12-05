const gulp = require("gulp");

const webpack = require("webpack");

const stats = require("gulp-stats");
const del = require("del");
const data = require("gulp-data");
const pug = require("gulp-pug");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const rsync = require("gulp-rsync");

stats(gulp);

gulp.task("clean", () => del("htdocs"));

gulp.task("site", () => {
    return gulp.src(["src/site/*.pug"])
        .pipe(data(() => ({})))
        .pipe(pug())
        .pipe(gulp.dest("htdocs"));
});

gulp.task("htdata", ["site"]);

gulp.task("htdocs", (cb) => {
    const webpackConfig = require("./webpack.config");

    webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
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

    webpack(webpackConfig, cb);
});

gulp.task("htdocs:watch", () => {
    const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

    const webpackConfig = require("./webpack.config");
    webpackConfig.devtool = "source-map";
    webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new BundleAnalyzerPlugin()
    ]);

    const bundler = webpack(webpackConfig);
    bundler.plugin("done", () => browserSync.reload());

    const webpackDevMiddleware = require("webpack-dev-middleware");

    const browserSync = require("browser-sync").create();
    browserSync.init({
        host: "localhost",
        port: 3000,
        server: {
            baseDir: "htdocs",
            middleware: [
                webpackDevMiddleware(bundler, { stats: { colors: true } })
            ]
        }
    });
});

gulp.task("default", ["htdocs", "htdata"]);

gulp.task("dev", ["htdocs:watch", "htdata"]);

gulp.task("rsync", ["default"], () => {
    return gulp.src("htdocs")
        .pipe(rsync({
            root: "htdocs/",
            hostname: "parzival.pagina-dh.de",
            username: "root",
            destination: "/var/www/",
            compress: true,
            clean: true,
            recursive: true
        }));
});

gulp.task("deploy", ["rsync"]);

gulp.task("test", () => {
    return gulp.src("test/**/*.js", { read: false })
        .pipe(mocha());
});

gulp.task("lint", () => {
    return gulp.src(["src/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
