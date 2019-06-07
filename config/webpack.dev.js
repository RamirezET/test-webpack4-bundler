const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const packageConfig = require("../package.json");
const internalIp = require("internal-ip"); // 借助这个实现可用局域网IP访问

const devWebpackConfig = {
  mode: "development",
  devtool: "#source-map",
  devServer: {
    port: 9527, // 指定端口号; 默认 8080
    hot: true, // 热更新
    host: internalIp.v4.sync(), // 可通过局域网IP访问，也可以通过 localhost 访问
    open: true, // 启动本地服务后，自动打开页面
    overlay: true, // 编译器错误或警告时, 在浏览器中显示全屏覆盖; 默认false
    progress: true, // 是否将运行进度输出到控制台; 默认 false
    // contentBase: path.resolve(__dirname, "dist"), // 告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
    publicPath: "/",
    // 精简终端输出
    stats: {
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }
  },
  entry: ["@babel/polyfill", "./src/index.js"],
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
          "style-loader",
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
    new HtmlWebpackPlugin({
      template: "index.html", // 指定模板html文件
      title: packageConfig.name, // html的title的值，这里我从package.json里取了
      inject: true // 自动引入JS脚本的位置，默认值为 true
    })
  ],
  resolve: {
    extensions: [".js", ".json"],
    alias: {
      "@": path.resolve("src"),
    }
  }
};

module.exports = devWebpackConfig;
