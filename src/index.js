import React from "react";
import "./index.css";
import App from "./App";
import dva from "dva";
import createLoading from "dva-loading";
import globalModel from "./models/global";
const app = new dva();

app.use(createLoading());
app.model(globalModel);
app.router(() => <App />);
app.start("#root", );

