import React from "react";
import dva from "dva";
import createLoading from "dva-loading";

import App from "./App";
import globalModel from "./model";
import origanizationModel from "./panes/organization/model";
import personnelModel from "./panes/personnel/model";

import "antd/dist/antd.css";
import "./index.css";

const models = [globalModel, origanizationModel, personnelModel];

const app = new dva();
app.use(createLoading());
models.forEach(app.model);
app.router(() => <App />);
app.start("#root");
