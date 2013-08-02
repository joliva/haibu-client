#!/usr/bin/env node

var fs = require('fs');
var rest = require('restler');
var http = require('http');
var program = require('commander');
var pretty = require('prettyjson');
var pack = require('tar-pack').pack;

var host, port, config_file;

function set_globals() {
	host = program.host || '127.0.0.1';
	port = program.port || 9002;
	config_file = program.config || './config.json';

	if (program.verbose === true) {
		console.log('options:')
		console.log('  host:' + host);
		console.log('  port:' + port);
		console.log('  config_file:' + config_file);
	}
}

function netget(path, callback) {
	set_globals();

	var uri = 'http://' + host + ':' + port.toString() + path;
	
	rest.get(uri).on('complete', function(result, response) {
		if (result instanceof Error) {
			console.error('problem with request: ' + response.message);
			return;
		} else {
			callback(result);
		}
	});
}

function netpost(path, payload, callback) {
	set_globals();

	var uri = 'http://' + host + ':' + port.toString() + path;

	var options = {};
	options.data = JSON.stringify(payload);
	options.headers = {
		'Content-Type': 'application/json'
	};
	
	rest.post(uri, options).on('complete', function(result, response) {
		if (result instanceof Error) {
			console.error('problem with request: ' + response.message);
			return;
		} else {
			callback(result);
		}
	});
}

function do_version() {
	netget('/version', function(result) {
		console.log('service version: \n' + pretty.render(result));
	});
}

function do_apps() {
	netget('/drones', function(result) {
		console.log('detailed info on apps: \n' + pretty.render(result));
	});
}

function do_app(name) {
	netget('/drones/' + name, function(result) {
		console.log('detailed info on app:' + name + '\n' + pretty.render(result));
	});
}

function do_running() {
	netget('/drones/running', function(result) {
		console.log('running apps: \n' + pretty.render(result));
	});
}

function do_start() {
	set_globals();

	var config;

	try {
		config = JSON.parse(fs.readFileSync(config_file).toString());
	}
	catch(e) {
		console.error('problem parsing: ' + config_file + '\n' + e);
		return;
	}

	netpost('/drones/' + config.name + '/start', {'start': config}, function(result) {
		console.log('started app: ' + config.name + '\n' + pretty.render(result));
	});
}

function do_stop(name) {
	config = {
		'name': name,
	}

	netpost('/drones/' + config.name + '/stop', {'stop': config}, function(result) {
		console.log('stopped app(s): ' + config.name + '\n' + pretty.render(result));
	});
}

function do_restart(name) {
	config = {
		'name': name,
	}

	netpost('/drones/' + config.name + '/restart', {'restart': config}, function(result) {
		console.log('restarted app(s): ' + config.name + '\n' + pretty.render(result));
	});
}

function do_remove() {
	set_globals();

	var config;

	try {
		config = JSON.parse(fs.readFileSync(config_file).toString());
	}
	catch(e) {
		console.error('problem parsing: ' + config_file + '\n' + e);
		return;
	}

	netpost('/drones/' + config.name + '/clean', config, function(result) {
		console.log('removed app: ' + config.name + '\n' + pretty.render(result));
	});
}

function do_update() {
	set_globals();

	var config;

	try {
		config = JSON.parse(fs.readFileSync(config_file).toString());
	}
	catch(e) {
		console.error('problem parsing: ' + config_file + '\n' + e);
		return;
	}

	netpost('/drones/' + config.name + '/update', config, function(result) {
		console.log('updated app: ' + config.name + '\n' + pretty.render(result));
	});
}

program
	.usage('[options] command')
	.option('-h, --host [host]', 'Host')
	.option('-p, --port [port]', 'Port', parseInt)
	.option('-c, --config [config_file]', 'Config file (defaults to config.json)')
	.option('-v, --verbose', 'Verbose output');

program
	.command('version')
	.description('show service version')
	.action(function() {
  		do_version();
	});

program
	.command('running')
	.description('show running apps')
	.action(function() {
  		do_running();
	});

program
	.command('apps')
	.description('detailed info on apps')
	.action(function() {
  		do_apps();
	});

program
	.command('app <app_name>')
	.description('detailed info on app')
	.action(function(app_name) {
  		do_app(app_name);
	});

program
	.command('start [config_file]')
	.description('start app')
	.action(function() {
  		do_start();
	});

program
	.command('stop <app_name>')
	.description('stop all instances of app')
	.action(function(app_name) {
  		do_stop(app_name);
	});

program
	.command('restart <app_name>')
	.description('restart all instances of app')
	.action(function(app_name) {
  		do_restart(app_name);
	});

program
	.command('remove [config_file]')
	.description('stop app, remove source and dependencies (single user)')
	.action(function() {
  		do_remove();
	});

program
	.command('update [config_file]')
	.description('stop app, clean old source/dependencies, deploy, restart app')
	.action(function() {
  		do_update();
	});

program
	.command('*')
	.action(function() {
		program.help();
	});

program.parse(process.argv);

