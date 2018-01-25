var config = require("../nightwatch.conf.BASIC.js");
var _ = require("lodash");
var async = require("async");

module.exports = { // adapted from: https://git.io/vodU0
  "Wuxiaworld": function(browser) {

    browser.url("http://www.wuxiaworld.com/").waitForElementPresent("body")

      .elements("css selector", "li.menu-item > ul.sub-menu > li.menu-item > a", function(result) {
        console.log("********************************************** Getting Wuxiaworld Novel Names and Links **********************************************");
        if (result.status == -1) {
        	return console.log("Error: " + result.value.message);
        }

        let items = result.value;

				async.map(items, (item, next) => {
        	let novel = {};
          this.elementIdAttribute(item.ELEMENT, "text", function(result) {
            novel["name"] = result.value;
	        	this.elementIdAttribute(item.ELEMENT, "href", function(result) {
	            novel["link"] = result.value;
	            next(null, novel)
	          });
          });

        }, function done(err, results) {
        	async.eachSeries(results, (result, next) => {


    				browser.url(result.link).waitForElementPresent("body", 1000, function () {
    					browser.elements("css selector", "div[itemprop='articleBody'] a", function (result) {
    						let chapterItems = result.value;
    						if (!chapterItems.length) {
    							return next();
    						}

    						async.map(chapterItems, (cItem, next) => {
    							let chapter = {};
    		          this.elementIdAttribute(cItem.ELEMENT, "text", function(result) {
    		            chapter["name"] = result.value;
    			        	this.elementIdAttribute(cItem.ELEMENT, "href", function(result) {
    			            chapter["link"] = result.value;
    			            console.log(chapter["link"]);
    			            next(null, chapter)
    			          });
    		          });
    						}, function (err, cResults) {
    							result["chapters"] = cResults;
    							next(null);
    						});
    					});
    				});


        	}, function (err) {
        		console.log(results)
        	});
        });

      });

  }
};

