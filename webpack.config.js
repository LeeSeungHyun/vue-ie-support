// webpack.config.js
const path = require('path');
const pkg = require('./package.json');
const dotenv = require('dotenv');
const webpack = require('webpack');
const fs = require('fs');
const os = require('os');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

var get_build_version = function () {
  try {
    return Number(fs.readFileSync('./build_version', 'utf8').split(':')[1]);
  } catch (err) {
    console.warn(
      'There is no build_version file. create new build_version file.'
    );
    return 0;
  }
};

var build_version = get_build_version();

var build_version_up = function () {
  build_version++;
  fs.writeFileSync(
    './build_version',
    pkg.version + ':' + String(build_version),
    'utf8'
  );
  return build_version;
};

const getBanner = () => {
  return [
    'Copyright (c) ' +
      new Date().getFullYear() +
      ', Catenoid Incorporated. All rights reserved.',
    '',
    '@version ' + pkg.version + ' (' + build_version + ')',
    '@auther ' + pkg.author,
    '@license ' + pkg.license,
  ].join('\n');
};

/**
 * Production 빌드시에만 실행되는 모듈 정의
 */
const production_modules = [
  new MiniCssExtractPlugin({
    filename: 'css/[name].' + pkg.version + '.css',
  })
];

module.exports = (env, arvg) => {
  dotenv.config({ path: './.env' });

  //jenkins에서 빌드시에는 build_version을 올리지 않는다.
  if (env.build_from == 'jenkins') {
    console.info('Build from Jenkins. Will not version update.');
  } else {
    console.info('Build version up to ' + build_version_up());
  }

  return {
    entry: {
      TENCENT_CHATTING: ["core-js/stable", "regenerator-runtime/runtime", './src/main.ts'],
    },
    output: {
      filename: `js/[name].${pkg.version}.js`,
      path: path.resolve(__dirname, 'dist'),
      assetModuleFilename: 'img/[name][ext]',
      library: '[name]',
      libraryTarget: 'umd',
      clean: true,
      environment: {
        arrowFunction: false,
        bigIntLiteral: false,
        const: false,
        destructuring: false,
        dynamicImport: false,
        forOf: false,
        module: false
      }
    },
    target: ['web', 'es5'],
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              whitespace: 'condense',
            },
            esModule: true,
            buble: {
              // object spread 연산자 사용
              // 참고: Object.assign 에 관한 폴리필을 직접 해야합니다!
              objectAssign: 'Object.assign',
          
              // `with` 제거를 끕니다.
              transforms: {
                stripWith: false
              }
            }
          }
        },
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                appendTsSuffixTo: [/\.vue$/],
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.s?css$/i,
          use: [
            arvg.mode === 'development'
              ? 'vue-style-loader'
              : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            // {
            //   loader: 'sass-loader',
            //   options: {
            //     sourceMap: true,
            //     additionalData: `
						// 		  	@import "@/assets/scss/global.scss";
            //         @import "@/assets/scss/variables.scss";
						// 	  	`,
            //   },
            // },
          ],
        },
        {
          test: /\.js$/,
          // include: path.resolve(__dirname, 'src'),
          // exclude: /node_modules/,
          use: {
            loader:'babel-loader',
            // options: {
            //   presets: [
            //     "@babel/preset-typescript",
            //     [
            //       "@babel/preset-env",
            //       {
            //         "useBuiltIns": "usage",
            //         "corejs": "3.31",
            //         "debug": true,
            //         "modules": false
            //       }
            //     ]
            //   ],
            //   plugins: [
            //     [
            //       '@babel/plugin-transform-runtime',
            //       {
            //         // https://babeljs.io/docs/en/babel-plugin-transform-runtime#corejs
            //         corejs: 3,
            //         proposals: true
            //       },
            //     ],
            //   ],
            // }
          }
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.vue'],
      alias: {
        components: path.resolve(__dirname, 'src', 'components'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimization: {
      minimize: arvg.mode === 'production',
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          parallel: os.cpus().length - 1,
          extractComments: false,
          terserOptions: {
            sourceMap: true,
          },
        }),
        new CssMinimizerPlugin({
          test: /\.css(\?.*)?$/i,
          parallel: os.cpus().length - 1,
        }),
      ],
    },
    devServer: {
      static: './tencentChatting',
      port: 9005,
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.LoaderOptionsPlugin({ debug: true }),
      new webpack.BannerPlugin(getBanner()),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        templateParameters: {
          version: pkg.version,
          build_version: build_version,
          build_date: new Date(),
        },
        inject: 'head',
        //excludeChunks: ['TENCENT_CHATTING'],
        template: './public/index.html',
        filename: 'index.html',
        title: 'Kollus Tencent Chatting Sample',
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),
    ].concat(
      arvg.mode === 'development'
        ? [new webpack.HotModuleReplacementPlugin()]
        : production_modules
    ),
  };
};