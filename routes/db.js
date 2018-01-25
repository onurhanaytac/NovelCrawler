var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WuxiaworldSchema = Schema({
	name: String,
	link: String,
	chapters: [
		{
			name: String,
			link: String,
			articleBody: String
		}
	]
});

var _db = {
	Wuxiaworld: mongoose.model('Wuxiaworld', WuxiaworldSchema)
};

module.exports = _db;
