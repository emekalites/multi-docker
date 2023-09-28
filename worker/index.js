const { createClient } = require('redis');

const keys = require('./keys');

function fib(index) {
	if (index < 2) {
		return 1;
	} else {
		return fib(index - 1) + fib(index - 2);
	}
}

async function saveMessage(number, client) {
	console.log(number);
	await client.hSet('values', number, fib(Number(number)));
}

const init = async () => {
	try {
		const client = await createClient({
			socket: {
				host: keys.redisHost,
				port: keys.redisPort,
				reconnect_strategy: () => 1000,
			},
		})
			.on('error', (err) => console.log('Redis Client Error', err))
			.on('connect', () => {
				console.log('redis connected');
			})
			.connect();

		const sub = client.duplicate();

		sub.on('connect', async function () {
			console.log('sub connected');
		});

		sub.connect();

		sub.on('message', async function (message) {
			console.log('sub message', message);
		});

		sub.subscribe('insert', async (message, channel) => {
			console.log(`channel: ${channel}`);
			console.log(`message sent: ${message}`);
			saveMessage(message, client);
		});
	} catch (e) {
		console.log(e);
	}
};

init();

// sub.subscribe('insert', async (message, channel) => {
// 	console.log(`channel: ${channel}`);
// 	console.log(`message sent: ${message}`);
// });

// sub.on('end', function () {
// 	console.log('sub connection ended');
// });

// sub.on('ready', function () {
// 	console.log('sub connection ready');
// });

// sub.on('message', async function (channel, message) {
// 	console.log(`Message: ${message} on channel: ${channel} has arrive!`);
// 	// await client.hSet('values', message, fib(Number(message)));
// });
