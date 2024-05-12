import { makeAutoObservable, toJS } from "mobx";
import { IUserSetting } from "../interface";

export class CommonStore {
    config: IUserSetting = {
        apiKey: "",
        serviceProvider: "openai",
    };
    constructor() {
        makeAutoObservable(this);
    }
    public updateConfig(configKey: keyof IUserSetting, value: any) {
        this.config[configKey] = value;
    }
    public saveConfig() {
        const configJson = JSON.stringify(toJS(this.config));
        localStorage.setItem("config", configJson);
    }
    public loadConfig() {
        const configJSON = localStorage.getItem("config");
        if (configJSON && configJSON.length > 0) {
            try {
                this.config = JSON.parse(configJSON);
            } catch (error) {}
        } else {
            console.log("Not found default settings");
        }
    }
}
