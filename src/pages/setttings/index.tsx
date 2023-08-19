import React from "react";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "../../store";
import { useNotification } from "../../notify";
import { DropdownSelect, Header, TextField } from "../../components";

const Settings: React.FC = (props) => {
    // const {  } = props;
    const { commonStore } = useGlobalStore();
    const { notify } = useNotification();
    const { config } = commonStore;

    return (
        <div>
            <Header />
            <div className="text-white container mx-auto p-4">
                <TextField
                    value={!!config.apiKey && config.apiKey !== "your-key" ? config.apiKey : undefined}
                    label="API Key"
                    placeholder={`${config.apiKey}`}
                    onChange={(v) => {
                        commonStore.updateConfig("apiKey", v);
                    }}
                />

                <div className="mt-2">
                    <button
                        type="button"
                        className="mr-2 px-6 inline-flex rounded bg-indigo-500 shadow-indigo-500/50 py-1.5 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={() => {
                            commonStore.saveConfig();
                            notify(
                                {
                                    title: "Saved",
                                    type: "success",
                                    message: "Config is saved in localstorage.",
                                },
                                1000
                            );
                        }}
                    >
                        Save Config
                    </button>
                </div>
            </div>
        </div>
    );
};

export default observer(Settings);
