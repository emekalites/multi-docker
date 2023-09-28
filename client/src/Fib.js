import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const Fib = () => {
	const [fetching, setFetching] = useState(true);
	const [seenIndexes, setSeenIndexes] = useState([]);
	const [values, setValues] = useState({});
	const [index, setIndex] = useState('');

	const fetchValues = useCallback(async () => {
		try {
			const values = await axios.get('/api/values/current');
			setValues(values.data);
		} catch (error) {}
	}, []);

	const fetchIndexes = useCallback(async () => {
		try {
			const values = await axios.get('/api/values/all');
			setSeenIndexes(values.data);
		} catch (error) {}
	}, []);

	useEffect(() => {
		if (fetching) {
			fetchValues();
			fetchIndexes();
			setFetching(false);
		}
	}, [fetchIndexes, fetchValues, fetching]);

	const renderSeenIndexes = () => {
		return seenIndexes.map(({ number }) => number).join(', ');
	};

	const renderValues = () => {
		let entries = [];

		let i = 0;
		for (const key in values) {
			i++;
			entries = [
				...entries,
				<div key={i}>
					For index {key} I calculated {values[key]}
				</div>,
			];
		}

		return entries;
	};

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();

			const rs = await axios.post('/api/values', { index });
			console.log(rs.data);

			setIndex('');
		} catch (error) {}
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<label>Enter your index:</label>
				<input value={index} onChange={(e) => setIndex(e.target.value)} />
				<button>Submit</button>
			</form>
			<h3>Indexes I have seen:</h3>
			{renderSeenIndexes()}
			<h3>Calculated Values:</h3>
			{renderValues()}
		</div>
	);
};

export default Fib;
