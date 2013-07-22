#!/usr/bin/env node

var http = require('http');
var program = require('commander');
var pretty = require('prettyjson');
var rest = require('restler');

program
	.usage('[options] command')
	.option('-h, --host [host]', 'Host')
	.option('-p, --port [port]', 'Port', parseInt)
	.option('-c, --config [config]', 'Config file')
	.option('-v, --verbose', 'Verbose output');

/*
program
	.command('version')
	.description('show service version')
	.action(function() {
  		
		set_globals(program.verbose);

		var options = {
			method: 'GET',
			host: host,
			port: port,
			path: '/version'
		}

		var req = http.request(options, function(resp) {
			var data ='';

			resp.on('data', function(chunk) {
				data += chunk;
			});

			resp.on('end', function() {
				console.log('service version: \n' + pretty.render(JSON.parse(data)));
			});
		});

		req.end();

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
  });
*/

program
	.command('running')
	.description('show running drones')
	.action(function() {
		set_globals(program.verbose);

		var options = {
			method: 'GET',
			host: host,
			port: port,
			path: '/drones/running'
		}

		var req = http.request(options, function(resp) {
			var data ='';

			resp.on('data', function(chunk) {
				data += chunk;
			});

			resp.on('end', function() {
				console.log('running drones: \n' + pretty.render(JSON.parse(data)));
			});
		});

		req.end();

		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
		});
  });

program.parse(process.argv);

function set_globals(verbose) {
	host = program.host || '127.0.0.1';
	port = program.port || 9002;
	config = program.config ? JSON.parse(program.config) : {};

	if (verbose === true) {
		console.log('options:')
		console.log('  host:' + host);
		console.log('  port:' + port);
		console.log('  config:' + JSON.stringify(config));
	}
}

var host, port, config;

