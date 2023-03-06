import gulp from 'gulp';
import { deleteAsync } from 'del';
import babel from 'gulp-babel';

const { task, src, dest, series } = gulp;
const BALM_GIT_FLOW = {
  src: 'src/**/*.js',
  dest: 'lib'
};

async function clean() {
  return await deleteAsync(BALM_GIT_FLOW.dest);
}

function build() {
  return src(BALM_GIT_FLOW.src).pipe(babel()).pipe(dest(BALM_GIT_FLOW.dest));
}

task('clean', clean);
task('build', build);

task('prepublish', series(clean, build));
