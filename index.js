var url = require('url');
var sm = require('sitemap');
var sitemap_urls = [];
const path = require('path');
module.exports = {
  hooks: {
    "page:before": function(page) {
      const footer_note = this.config.get('pluginsConfig.lanying-grow-ai.footer_note', '')
      const footer_path_list = this.config.get('pluginsConfig.lanying-grow-ai.footer_note_path_list', []);
      const pathMatches = footer_path_list.some(prefix => page.path.startsWith(prefix));
      const friendship_links = this.config.get('pluginsConfig.lanying-grow-ai.friendship_links', '');
      const friendship_links_prefix = this.config.get('pluginsConfig.lanying-grow-ai.friendship_links_prefix', '**友情链接：**');
      const friendship_links_position = this.config.get('pluginsConfig.lanying-grow-ai.friendship_links_position', 'homepage');
      const hook_sentence_slogan = this.config.get('pluginsConfig.lanying-grow-ai.hook_sentence_slogan', '')
      const hook_sentence_image = this.config.get('pluginsConfig.lanying-grow-ai.hook_sentence_image', '')
      const lineCount = page.content.split(/\r?\n/).length;
      if (footer_note && (footer_path_list.length === 0 || pathMatches)) {
        const footerRegex = /(<footer\b[^>]*>.*<\/footer>)/is;
        const note_text = "\n\n*```" + footer_note + "```*\n\n"
        var new_content = page.content.replace(footerRegex,  note_text + '$1');
        if (new_content == page.content){
          new_content += note_text;
        }
        page.content = new_content
      }
      if (hook_sentence_slogan && (footer_path_list.length === 0 || pathMatches) && lineCount > 5){
        const footerRegex = /(<footer\b[^>]*>.*<\/footer>)/is;
        hook_text = '\n\n' + hook_sentence_slogan
        if (hook_sentence_image){
          const bookRoot = this.options.root;
          const absPagePath = path.resolve(bookRoot, page.path);
          const pageDir = path.dirname(absPagePath);

          const imagePath = hook_sentence_image;
          const absImagePath = path.resolve(bookRoot, imagePath);

          const relativePath = path.relative(pageDir, absImagePath).replace(/\\/g, '/');
          hook_text += '\n\n' + '![](' + relativePath +')'
        }
        hook_text += '\n\n'
        var new_content = page.content.replace(footerRegex, (match, footerContent) => {
            return hook_text + footerContent;
        });
        if (new_content == page.content){
          new_content += hook_text;
        }
        page.content = new_content
      }
      if (friendship_links){
        if (friendship_links_position != 'homepage' || (friendship_links_position == 'homepage' && this.output.toURL(page.path) == './')){
          const footerRegex = /(<footer\b[^>]*>.*<\/footer>)/is;
          const friendship_links_text = "\n\n" + friendship_links_prefix + friendship_links + "\n\n"
          var new_content = page.content.replace(footerRegex,  friendship_links_text + '$1');
          if (new_content == page.content){
            new_content += friendship_links_text;
          }
          page.content = new_content
        }
      }
      const lanying_link = this.config.get('pluginsConfig.lanying-grow-ai.lanying_link', '')
      if (lanying_link && lanying_link.startsWith("https://lanying.link/")){
        const new_lanying_link = lanying_link.replace("https://lanying.link/", "https://lanyinglink.com/support/")
        page.content += "\n<script src=\""+new_lanying_link+"\" charset=\"utf-8\" async defer></script>\n"
      }
      if (lanying_link && lanying_link.startsWith("https://lanyinglink.com/")){
        const new_lanying_link = lanying_link.replace("https://lanyinglink.com/", "https://lanyinglink.com/support/")
        page.content += "\n<script src=\""+new_lanying_link+"\" charset=\"utf-8\" async defer></script>\n"
      }
      if (lanying_link && lanying_link.startsWith("https://link.lanyingim.com/")){
        const new_lanying_link = lanying_link.replace("https://link.lanyingim.com/", "https://link.lanyingim.com/support/")
        page.content += "\n<script src=\""+new_lanying_link+"\" charset=\"utf-8\" async defer></script>\n"
      }
      const baidu_link_submit = this.config.get('pluginsConfig.lanying-grow-ai.baidu_link_submit', true)
      if (baidu_link_submit){
        page.content += "<script>\n(function(){\n    var bp = document.createElement('script');\n    var curProtocol = window.location.protocol.split(':')[0];\n    if (curProtocol === 'https') {\n        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';        \n    }\n    else {\n        bp.src = 'http://push.zhanzhang.baidu.com/push.js';\n    }\n    var s = document.getElementsByTagName('script')[0];\n    s.parentNode.insertBefore(bp, s);\n})();\n</script>\n"
      }
      return page;
    },
    "page": function(page) {
      if (this.output.name != 'website') return page;

      var lang = this.isLanguageBook()? this.config.values.language : '';
      const sitemap_default_language = this.config.get('pluginsConfig.lanying-grow-ai.sitemap_default_language', '')
      if (sitemap_default_language && lang == sitemap_default_language){
        lang = ''
      }
      if (lang) lang = lang + '/';

      //this.log.info.ln("url: ", lang + page.path, "->", this.output.toURL(lang + page.path));
      var site_url = this.output.toURL(lang + page.path)
      if (site_url == './'){
        site_url = '/'
      }
      sitemap_urls.push({
          url: site_url
      });

      return page;
    },
    "finish": function() {
      const sitemap_hostname = this.config.get('pluginsConfig.lanying-grow-ai.sitemap_hostname', '')
      if (sitemap_hostname){
        var sitemap = sm.createSitemap({
          cacheTime: 600000,
          hostname: sitemap_hostname,
          urls: sitemap_urls
        });

        var xml = sitemap.toString();

        return this.output.writeFile('sitemap.xml', xml);
      }
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
