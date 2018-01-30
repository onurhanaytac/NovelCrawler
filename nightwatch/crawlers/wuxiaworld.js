var config = require("../nightwatch.conf.BASIC.js");
var _ = require("lodash");
var async = require("async");
var fs = require("fs");
var path = require("path");

module.exports = { // adapted from: https://git.io/vodU0
  "Wuxiaworld": function(browser) {
		console.log("***************************************** Getting Wuxiaworld Novels *****************************************");
		browser.url("http://www.wuxiaworld.com/").elements("css selector", "li.menu-item > ul.sub-menu > li.menu-item > a", function(result) {
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
						next(null, novel);
				  });
			  });

			}, function done(err, results) {
				//results = results.slice(0, 1); // **************************************************************************************************
				async.eachSeries(results, (_novel, next) => {
					browser.url(_novel.link).elements("css selector", "div[itemprop='articleBody'] a", function (result) {
						let chapterItems = result.value;
						if (!chapterItems || !chapterItems.length) {
							return next();
						}
						//chapterItems = chapterItems.slice(0, 1) // **************************************************************************************************
						async.map(chapterItems, (cItem, next) => {
							let chapter = {};
						  this.elementIdAttribute(cItem.ELEMENT, "text", function(result) {
								chapter["name"] = result.value;
								this.elementIdAttribute(cItem.ELEMENT, "href", function(result) {
									chapter["link"] = result.value;
									next(null, chapter)
							  }); // this.elementIdAttribute
						  }); // this.elementIdAttribute
						}, function (err, cResults) {
							_novel["chapters"] = cResults;
							next(null);
						}); // async.map(chapterItems
					}); // browser.url
				}, function (err) {
					getChaptersArticle(results, (err, data) => {
						fs.writeFileSync(__dirname + "/../../reports/data.json", JSON.stringify(data, null, 2), "utf8");
						console.log("DONE!");
					}); // getChaptersArticle
				}); // async.eachSeries
			});
		}) // elements
	  .end();


	  function getChaptersArticle(novels, callback) {
	  	async.eachSeries(novels, (novel, next) => {
	  		async.eachSeries(novel.chapters, (chapter, next) => {
	  			browser.url(chapter.link).elements("css selector", "div[itemprop='articleBody']", function (result) {
	  				if (!result || !result.value || !result.value[0] || !result.value[0].ELEMENT) {
	  					return next();
	  				}
	  				this.elementIdAttribute(result.value[0].ELEMENT, "innerText", function(result) {
							chapter["articleBody"] = result.value;
	  					next();
					  }); // this.elementIdAttribute
	  			}); // browser.url
	  		}, function done() {
	  			next();
		  	});
	  	}, function done() {
	  		callback(null, novels);
	  	});

	  } // getChaptersArticle
  } // "Wuxiaworld"
}; // module.exports
