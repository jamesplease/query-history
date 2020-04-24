import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const env = process.env.NODE_ENV;

export default [
  {
    input: 'src/index.js',
    external: [],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: [
      resolve({
        jsnext: true,
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
    ],
  },
];
