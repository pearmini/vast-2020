import React from "react";
import dva from "dva";
import App from "./App";
import globalModel from "./models/global";
import createLoading from "dva-loading";
import "antd/dist/antd.css";
import "./index.css";

const app = new dva();

app.use(createLoading());
app.model(globalModel);
app.router(() => <App />);
app.start("#root");
