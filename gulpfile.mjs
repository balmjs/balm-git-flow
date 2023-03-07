import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';

const { task, src, dest, series } = gulp;
const BALM_GIT_FLOW = {
  src: 'src/**/*.js',
  dest: 'lib'
};

function clean() {
  return del(BALM_GIT_FLOW.dest);
}

function build() {
  return src(BALM_GIT_FLOW.src).pipe(babel()).pipe(dest(BALM_GIT_FLOW.dest));
}

task('clean', clean);
task('build', build);

task('prepublish', series(clean, build));
