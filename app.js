#!/usr/bin/env node

var rest = require('restler');
var http = require('http');
var program = require('commander');
var pretty = require('prettyjson');

var host, port, config;

function set_globals() {
	host = program.host || '127.0.0.1';
	port = program.port || 9002;
	config = program.config ? JSON.parse(program.config) : {};

	if (program.verbose === true) {
		console.log('options:')
		console.log('  host:' + host);
		console.log('  port:' + port);
		console.log('  config:' + JSON.stringify(config));
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

program
	.usage('[options] command')
	.option('-h, --host [host]', 'Host')
	.option('-p, --port [port]', 'Port', parseInt)
	.option('-c, --config [config]', 'Config file')
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

program.parse(process.argv);

