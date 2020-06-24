import React from "react";
import dva from "dva";
import App from "./App";
import globalModel from "./models/global";
import "./index.css";

const app = new dva();
app.model(globalModel);
app.router(() => <App />);
app.start("#root");
