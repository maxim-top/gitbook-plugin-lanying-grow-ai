var url = require('url');
var sm = require('sitemap');
var sitemap_urls = [];
module.exports = {
  hooks: {
    "init": function() {
      this.log.info.ln("grow_ai:hook:init: ");
    },
    "page:before": function(page) {
      this.log.info.ln("grow_ai:hook:page:before: ", page.path, page.content.length);
      return page;
    },
    "page": function(page) {
      this.log.info.ln("grow_ai:hook:page: ", page.path, page.content.length);
      return page;
    },
    "finish": function() {
      this.log.info.ln("grow_ai:hook:finish: ");
    },
    "finish:before": function(x){
      this.log.info.ln("grow_ai:hook:finish:before: ");
    }
 }
};
