const fs = require('fs');
const path = require('path');

function replaceContent(content, replacements) {
  replacements.forEach(rule => {
    const origin = rule.regex ? new RegExp(rule.origin, 'g') : rule.origin;
    content = content.replace(origin, rule.replacement);
  });
  return content;
}

module.exports = {
  hooks: {
    "page:before": function(page) {
      var logger = this.log
      logger.info.ln("grow-ai:", this.output.name)
      // 仅处理网站生成模式
      if (this.output.name !== 'website') {
        return page;
      }

      const outputPath = this.output.resolve('');
      const filePath = path.join(outputPath, page.path);

      logger.info.ln("grow-ai:", "path:", path, "filePath:", filePath)
      if (path.extname(filePath) === '.html') {
        const content = fs.readFileSync(filePath, 'utf8');
        const replacements = this.config.get('pluginsConfig.lanying-grow-ai.replacements', []);
        const newContent = replaceContent(content, replacements);

        if (content !== newContent) {
          fs.writeFileSync(filePath, newContent, 'utf8');
        }
      }

      return page;
    }
  }
};

