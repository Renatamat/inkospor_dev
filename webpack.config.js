const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

/**
 * Jeśli ta tablica jest PUSTA, nic dla WordPressa nie jest generowane.
 * Jeśli uzupełnisz ją danymi, włączą się dodatkowe outputy:
 *  - wp-content/themes/healion/style.css z tym nagłówkiem
 *  - wp-content/themes/healion/js/bundle.js oraz js/gsap.bundle.js
 */
const wpThemeHeader = [
  "Theme Name: InkosporNova",
  "Theme URI: http://underscores.me/",
  "Author: Artnova",
  "Author URI: https://artnova.com.pl",
  "Description: Description",
  "Version: 1.0.0",
  "Tested up to: 5.4",
  "Requires PHP: 5.6",
  "License: GNU General Public License v2 or later",
  "License URI: LICENSE",
  "Text Domain: healion",
  "Tags: custom-background, custom-logo, custom-menu, featured-images, threaded-comments, translation-ready",
  "",
  "This theme, like WordPress, is licensed under the GPL.",
  "Use it to make something cool, have fun, and share what you've learned.",
  "",
  "HealionNova is based on Underscores https://underscores.me/, (C) 2012-2020 Automattic, Inc.",
  "Underscores is distributed under the terms of the GNU GPL v2 or later.",
  "",
  "Normalizing styles have been helped along thanks to the fine work of",
  "Nicolas Gallagher and Jonathan Neal https://necolas.github.io/normalize.css/"
];

// Czy mamy generować pod WordPressa?
const hasWpThemeHeader = Array.isArray(wpThemeHeader) && wpThemeHeader.length > 0;
const wpThemeHeaderComment = hasWpThemeHeader
  ? "/*\n" + wpThemeHeader.map((l) => (l ? " * " + l : " *")).join("\n") + "\n */\n\n"
  : "";

/* ===================== JS - Main Bundle (DEV) ===================== */
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

/* ===================== JS - GSAP Bundle (DEV) ===================== */
const gsapConfig = {
  entry: "./src/ts/gsap-bundle.ts",
  output: {
    filename: "gsap.bundle.js",
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

/* ===================== SCSS (DEV) ===================== */
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

/* ===================== DODATKOWY OUTPUT POD WORDPRESSA ===================== */
/**
 * JS -> wp-content/themes/inkospornova/js
 */
const jsWpConfig = {
  entry: "./src/ts/index.ts",
  output: {
    filename: "bundle.js",
    // dev/webpack -> motyw jest katalog wyżej: ../
    path: path.resolve(__dirname, "../js"),
    clean: false,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: jsConfig.module,
  devtool: "source-map",
  mode: "production",
};

const gsapWpConfig = {
  entry: "./src/ts/gsap-bundle.ts",
  output: {
    filename: "gsap.bundle.js",
    path: path.resolve(__dirname, "../js"),
    clean: false,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: gsapConfig.module,
  devtool: "source-map",
  mode: "production",
};

/**
 * SCSS -> wp-content/themes/inkospornova/style.css
 * + nagłówek motywu na początku pliku
 */
const scssWpConfig = {
  entry: { style: "./source/css/style.scss" },
  output: {
    filename: "style.wp.js",
    path: path.resolve(__dirname, "../"), // katalog motywu
    clean: false,
  },
  module: scssConfig.module,
  plugins: [
    new MiniCssExtractPlugin({ filename: "style.css" }),
    ...(hasWpThemeHeader
      ? [
          new webpack.BannerPlugin({
            banner: wpThemeHeaderComment,
            raw: true,
            entryOnly: true,
          }),
        ]
      : []),
  ],
  mode: "production",
  devtool: false,
};

/* ===================== EXPORT ===================== */
module.exports = (env = {}) => {
  // Bazowy zestaw – to co masz teraz (dev)
  const configs = [jsConfig, gsapConfig, scssConfig];

  // Jeśli nagłówek jest uzupełniony -> dokładamy konfiguracje pod WordPressa
  if (hasWpThemeHeader) {
    configs.push(jsWpConfig, gsapWpConfig, scssWpConfig);
  }

  // Możesz nadal filtrwać po env.target jeśli chcesz (np. webpack --env.target=js)
  if (env.target === "js") return hasWpThemeHeader ? [jsConfig, jsWpConfig] : [jsConfig];
  if (env.target === "gsap")
    return hasWpThemeHeader ? [gsapConfig, gsapWpConfig] : [gsapConfig];
  if (env.target === "styles")
    return hasWpThemeHeader ? [scssConfig, scssWpConfig] : [scssConfig];

  // Domyślnie uruchamiamy wszystko (dev + ewentualny WordPress)
  return configs;
};