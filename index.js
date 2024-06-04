const fs = require('fs');
const path = require('path');

function replaceContent(content, replacements, logger) {
  replacements.forEach(rule => {
    const origin = rule.regex ? new RegExp(rule.origin, 'g') : rule.origin;
    new_content = content.replace(origin, rule.replacement);
    if (new_content != content){
      logger.info.ln("KKK:", "origin:", rule.origin, "replacement:", rule.replacement);
      logger.info.ln("before:", content);
      logger.info.ln("after :", new_content);
    }
    new_content = content
  });
  return content;
}

module.exports = {
  hooks: {
    "finish:before": function(x){
      const fs = require('fs');
      const path = require('path');
      var logger = this.log

      // 获取 GitBook 的输出目录
      const outputDir = this.output.root();

      const replacements = [
        {
          "origin": "本书使用 GitBook 发布",
          "replacement": "本文档由 蓝莺GrowAI 发布"
        },
        {
          "origin": "https://www.gitbook.com",
          "replacement": "https://www.lanyingim.com"
        },
        {
          "origin": "all right reserved&#xFF0C;powered by Gitbook",
          "replacement": ""
        },
        {
          "origin": "\"gitbook\":\\{\"version\":\"3.2.3\",\"time\":\"[^\"]*\"\\}",
          "replacement": "\"gitbook\":{\"version\":\"3.2.3\",\"time\":\"0000-00-00T00:00:00.000Z\"}",
          "regex": true
        },
        {
          "origin": "(<img src=[^>]*?)@([0-9]+)p",
          "replacement": "$1\" style=\"width:$2%",
          "regex": true
        }
      ]

      replacements.push(...this.config.get('pluginsConfig.lanying-grow-ai.replacements', []))

      // 递归遍历目录中的所有文件
      function walkDir(dir, callback) {
          fs.readdirSync(dir).forEach(file => {
              const filePath = path.join(dir, file);
              if (fs.statSync(filePath).isDirectory()) {
                  walkDir(filePath, callback);
              } else {
                  callback(filePath);
              }
          });
      }

      // 替换文件中的内容
      function replaceContent(filePath) {
        if (path.extname(filePath) === '.html') {
          logger.info.ln("filePath:", filePath)
          var content = fs.readFileSync(filePath, 'utf8');
          logger.info.ln("before:", content)
          replacements.forEach(rule => {
            const origin = rule.regex ? new RegExp(rule.origin, 'g') : rule.origin;
            new_content = content.replace(origin, rule.replacement);
            content = new_content
          });
          logger.info.ln("after:", content)
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }

      // 遍历输出目录并执行替换
      walkDir(outputDir, replaceContent);
  }
 }
};
