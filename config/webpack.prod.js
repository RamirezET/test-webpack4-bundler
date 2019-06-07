const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const packageConfig = require("../package.json");

// For NamedChunksPlugin
const seen = new Set();
const nameLength = 4;

const prodWebpackConfig = {
  mode: "production",
  devtool: false,
  entry: ["@babel/polyfill", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: path.posix.join("static", "js/[name].[chunkhash].js"),
    chunkFilename: path.posix.join("static", "js/[id].[chunkhash].js")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass")
              // 默认使用的node-sass，这样配置就会使用dart-sass
            }
          }
          // webpack的规定，多个loader要倒着写，比如scss文件先给sass-loader解析成css再给css-loader，以此类推
        ]
      },
      {
        test: /\.(htm|html)$/,
        loader: "html-withimg-loader"
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: path.posix.join("static", "img/[name].[hash:7].[ext]")
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: path.posix.join("static", "fonts/[name].[hash:7].[ext]")
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: path.posix.join("static", "css/[name].[contenthash:8].css"),
      chunkFilename: path.posix.join("static", "css/[name].[contenthash:8].css")
    }),
    new HtmlWebpackPlugin({
      template: "index.html", // 指定模板html文件
      title: packageConfig.name, // html的title的值，这里我从package.json里取了
      inject: true, // 自动引入JS脚本的位置，默认值为 true
      minify: {
        minifycss: true, // 压缩css
        minifyJS: true, // 压缩JS
        removeComments: true, // 去掉注释
        collapseWhitespace: true, // 去掉空行
        removeRedundantAttributes: true, // 去掉多余的属性
        removeAttributeQuotes: true, // 删除不需要引号的属性值
        removeEmptyAttributes: true // 去掉空属性
      }
    }),
    new ScriptExtHtmlWebpackPlugin({
      //`runtime` must same as runtimeChunk name. default is `runtime`
      inline: /runtime\..*\.js$/
    }),
    // keep chunk.id stable when chunk has no name
    new webpack.NamedChunksPlugin(chunk => {
      if (chunk.name) {
        return chunk.name;
      }
      const modules = Array.from(chunk.modulesIterable);
      if (modules.length > 1) {
        const hash = require("hash-sum");
        const joinedHash = hash(modules.map(m => m.id).join("_"));
        let len = nameLength;
        while (seen.has(joinedHash.substr(0, len))) len++;
        seen.add(joinedHash.substr(0, len));
        return `chunk-${joinedHash.substr(0, len)}`;
      } else {
        return modules[0].id;
      }
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../static"),
        to: "static",
        ignore: [".*"]
      }
    ]),
    new CleanWebpackPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: "initial" // 只打包初始时依赖的第三方
        },
        swiper: {
          name: 'chunk-swiper', // 单独将 swiper 拆包
          priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
          test: /[\\/]node_modules[\\/]swiper[\\/]/
        },
      }
    },
    runtimeChunk: "single",
    minimizer: [
      new TerserPlugin({
        sourceMap: false,
        cache: true,
        parallel: true,
        terserOptions: {
          safari10: true,
          drop_console: true,
          drop_debugger: true
        }
      }),
      // Compress extracted CSS. We are using this plugin so that possible
      // duplicated CSS from different components can be deduped.
      new OptimizeCSSAssetsPlugin()
    ]
  },
  resolve: {
    extensions: [".js", ".json"],
    alias: {
      "@": path.resolve("src")
    }
  }
};

module.exports = prodWebpackConfig;
