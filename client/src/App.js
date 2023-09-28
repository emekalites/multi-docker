import { Link, Route, Routes } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';
import Fib from './Fib';
import OtherPage from './OtherPag';

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<h1 className="App-title">Welcome to React</h1>
				<Link className="App-link" to="/">
					Home
				</Link>
				<Link className="App-link" to="/otherpage">
					Other Page
				</Link>
			</header>
			<Routes>
				<Route exact path="/" element={<Fib />} />
				<Route path="/otherpage" element={<OtherPage />} />
			</Routes>
		</div>
	);
}

export default App;
