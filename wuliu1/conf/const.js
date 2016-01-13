var moment = require('moment');
var fs = require('fs');
var yaml = require('js-yaml');
var _config = yaml.safeLoad(fs.readFileSync('./_config.yml', 'utf8'));
// console.log(_config);
module.exports = {
	CONTEST_SUBMIT_LIMIT: _config.CONTEST.SUBMIT_LIMIT,
	CONTEST_MODE: _config.CONTEST.MODE,
	CONTEST_IP: _config.CONTEST.VALID_IP,
	JUDGE_res:  _config.JUDGE.result_message,
	JUDGE_lng: _config.JUDGE.lang,
	JUDGE_PATH: _config.JUDGE.path,
	COMIPLER_ARGU: _config.JUDGE.compiler_arg,
	DATABASE: {
		name: _config.DATABASE.dbname,
		host: _config.DATABASE.host,
		user: _config.DATABASE.user,
		password: _config.DATABASE.password,
		port: _config.DATABASE.port
	},
	HOST: _config.HOST,
	DISQUS: _config.Disqus,

	

	unitConvert: function(kind, bytes) {
		if (kind == 'mem') {
			var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   			if (bytes == 0) return '0 B';
   			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		} else if (kind == 'cpu') {
			var sizes = ['ms', 's', 'ks', 'ms', 'ts'];
   			if (bytes == 0) return '0 ms';
   			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		} else if (kind == 'date') {
			// var utc = bytes.getTime() + bytes.getTimezoneOffset() * 60000;
			var utc8 = bytes;
			return moment(utc8).format('YYYY-MM-DD');
			return utc8.toLocaleString().replace(/T/, ' ').replace(/\..+/, '');
		}
		return 'unit undefined'
	},

    format: function(date) {

        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        var hour = date.getHours();
        var minute = (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes();
        //var minute = date.getMinutes();
        var second = (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds();
        //var second = date.getSeconds();

        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    }
};
