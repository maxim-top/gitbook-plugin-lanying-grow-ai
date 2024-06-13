module.exports = {
  hooks: {
    "page:before": function(page) {
      const footer_note = this.config.get('pluginsConfig.lanying-grow-ai.footer_note', '')
      const footer_note_path_list = this.config.get('pluginsConfig.lanying-grow-ai.footer_note_path_list', []);
      const pathMatches = footer_note_path_list.some(prefix => page.path.startsWith(prefix));
      if (footer_note && (footer_note_path_list.length === 0 || pathMatches)) {
        const footerRegex = /(<footer\b[^>]*>.*<\/footer>)/is;
        const note_text = "\n\n*```" + footer_note + "```*\n\n"
        var new_content = page.content.replace(footerRegex,  note_text + '$1');
        if (new_content == page.content){
          new_content += note_text;
        }
        page.content = new_content
      }
      const lanying_link = this.config.get('pluginsConfig.lanying-grow-ai.lanying_link', '')
      if (lanying_link && lanying_link.startsWith("https://lanying.link/")){
        const new_lanying_link = lanying_link.replace("https://lanying.link/", "https://lanying.link/support/")
        page.content += "\n<script src=\""+new_lanying_link+"\" charset=\"utf-8\" async defer></script>\n"
      }
      return page;
    },
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
          "origin": "Published with GitBook",
          "replacement": "Published with Lanying GrowAI"
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
          //logger.info.ln("filePath:", filePath)
          var content = fs.readFileSync(filePath, 'utf8');
          //logger.info.ln("before:", content)
          replacements.forEach(rule => {
            const origin = rule.regex ? new RegExp(rule.origin, 'g') : rule.origin;
            new_content = content.replace(origin, rule.replacement);
            content = new_content
          });
          //logger.info.ln("after:", content)
          fs.writeFileSync(filePath, content, 'utf8');
        }
      }

      // 遍历输出目录并执行替换
      walkDir(outputDir, replaceContent);
  }
 }
};
