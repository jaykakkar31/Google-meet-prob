import React, { useEffect } from "react";

import Header from "./Homepage/header";
import Content from "./Homepage/bodyContent";
import NoMatch from "./Nomatch";
import VideoPage from "./vedioPage";

import {
	BrowserRouter as Router,
	Switch,
	Redirect,
	Route,
	useHistory,
} from "react-router-dom";
function App() {
	
	return (
		<Router>
			<Switch>
				<Route exact path="/">
					<div className="homepage">
						<Header />
						<Content />
					</div>
				</Route>
				<Route exact path="/:id">
					<VideoPage />
				</Route>
				<Route path="*">
					<div className="homepage">
						<NoMatch />
					</div>
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
