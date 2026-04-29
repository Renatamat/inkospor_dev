const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/* ===================== JS - Main Bundle ===================== */
const jsConfig = {
  entry: "./src/ts/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "source/js/bundle"),
    clean: false,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devtool: "source-map",
  mode: "production",
};

/* ===================== JS - GSAP Bundle ===================== */
const gsapConfig = {
  entry: "./src/ts/gsap-bundle.ts",
  output: {
    filename: "gsap.bundle.js",
    path: path.resolve(__dirname, "source/js/bundle"),
    clean: false, // Ważne! Nie czyść, bo main bundle już to zrobił
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  devtool: "source-map",
  mode: "production",
};

/* ===================== SCSS ===================== */
const scssConfig = {
  entry: { style: "./source/css/style.scss" },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "source/css"),
    clean: false,
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { sourceMap: true, url: false } },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              implementation: require("sass"),
            },
          },
        ],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "[name].css" })],
  mode: "development",
  devtool: "source-map",
};

/* ===================== EXPORT ===================== */
module.exports = (env = {}) => {
  if (env.target === "js") return jsConfig;
  if (env.target === "gsap") return gsapConfig;
  if (env.target === "styles") return scssConfig;
  return [jsConfig, gsapConfig, scssConfig]; // Wszystkie bundlesy
};