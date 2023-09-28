const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const keys = require('./keys');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const pgClient = new Pool({
	port: keys.pgPort,
	host: keys.pgHost,
	user: keys.pgUser,
	password: keys.pgPassword,
	database: keys.pgDatabase,
});

pgClient.on('error', () => console.log('Lost PG connection'));

pgClient.on('connect', (client) => {
	client
		.query('CREATE TABLE IF NOT EXISTS values (number INT)')
		.catch((err) => console.error(err));
});

const client = redis.createClient({
	socket: {
		host: keys.redisHost,
		port: keys.redisPort,
		reconnect_strategy: () => 1000,
	},
});

let pub;

app.get('/', async (req, res) => {
	res.send('Hi');
});

app.get('/values/all', async (req, res) => {
	const values = await pgClient.query('SELECT * FROM values');

	res.json(values.rows);
});

app.get('/values/current', async (req, res) => {
	const values = await client.hGetAll('values');

	res.json(values);
});

app.post('/values', async (req, res) => {
	const index = req.body.index;

	if (index === undefined) {
		return res.status(422).send('index not found');
	}

	if (Number(index) > 40) {
		return res.status(422).send('index too high');
	}

	await client.hSet('values', index, 'Nothing yet!');

	pub.publish('insert', index);

	await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

	res.json({ working: true });
});

const port = keys.port || 5000;

app.listen(port, async () => {
	await client.connect();

	pub = client.duplicate();

	await pub.connect();
	
	console.log(`listening to port ${port}`);
});
