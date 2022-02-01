import path from "path";
import fs from "fs";
import Cos from "@licq/cos";
import scp2 from "scp2";
import * as minify from "minify";
import chalk from "chalk";
import Config from "./config.json";

// https://nodejs.org/api/esm.html#no-__filename-or-__dirname
import { fileURLToPath } from 'url';
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
  const cos = new Cos(Config.cos);

  log(chalk.blue(`上传cos start \n`));
  await cos.uploadFiles(path.join(__dirname, "dist"), "ost/homepage");
  log(chalk.blue(`上传cos end \n`));

  log(chalk.green(`上传云服务器 start`));
  scp2.scp(path.join(__dirname, "dist/index.html"), Config.cvm, function (err) {
    if (err) log(`异常：${err}`);
    log(chalk.green(`上传云服务器 end \n`));
  });
}

function log(...args) {
  console.log(`====> `, ...args);
}
