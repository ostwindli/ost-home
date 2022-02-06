import path from "path";
import fs from "fs";
import * as minify from "minify";
import chalk from "chalk";
import OstTools from "../ost-scripts/scripts/tools.js";

// https://nodejs.org/api/esm.html#no-__filename-or-__dirname
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceHtml = path.join(__dirname, "index.html");
const targetHtml = path.join(__dirname, "dist/index.html");
const targetCss = path.join(__dirname, "dist/index.css");

build().then(upload);

async function build() {
  log(chalk.red(`压缩html start`));
  // 压缩下html
  let html = await minify.minify(sourceHtml);
  // 更新为cdn上的css
  html = html.replace(
    "./dist/index.css",
    "https://mpqq.gtimg.cn/ost/homepage/index.css"
  );
  fs.writeFileSync(targetHtml, html);
  log(chalk.red(`压缩html end \n`));

  // 压缩下css
  log(chalk.yellow(`压缩css start`));
  const css = await minify.minify(targetCss);
  fs.writeFileSync(targetCss, css);
  log(chalk.yellow(`压缩css end\n`));
}

async function upload() {
  await OstTools.uploadCos(
    "cos_gtimg",
    path.join(__dirname, "dist"),
    "ost/homepage"
  );

  await OstTools.uploadCVM(
    "homepage_path",
    path.join(__dirname, "dist/index.html")
  );
}

function log(...args) {
  console.log(`====> `, ...args);
}
