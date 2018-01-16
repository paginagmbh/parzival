const gulp = require("gulp");

const stats = require("gulp-stats");
const del = require("del");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");
const rsync = require("gulp-rsync");

stats(gulp);

gulp.task("clean", () => del("htdocs"));

gulp.task("default", ["test"]);

gulp.task("deploy", () => {
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
