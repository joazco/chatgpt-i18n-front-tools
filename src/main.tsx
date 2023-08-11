import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import NotificationWrapper from "./notify";
import { StoreWrapper } from "./store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <StoreWrapper>
            <NotificationWrapper>
                <App />
            </NotificationWrapper>
        </StoreWrapper>
    </React.StrictMode>
);
