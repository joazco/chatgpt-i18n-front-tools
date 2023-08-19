import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { prettierJson } from "./utils";

import { fileTypes, intlLanguages } from "./config";
import { useNotification } from "../../notify";
import { useGlobalStore } from "../../store";
import { FormContext } from "../../store/form";
import { Background, DropdownModel, DropdownSelect, Header, Spinner, TextField } from "../../components";
import EditorsComponent from "./EditorsComponent";
import useTextServices from "./useTextServices";
import CheckboxField from "../../components/checkboxField";

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === "json") {
            return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
            return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
            return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

loader.config({ monaco });
loader.init();

const TextServicePage: React.FC<{ service: "translation" | "spelling-correction" | "rewrite-text" }> = ({ service }) => {
    const { notify } = useNotification();
    const { commonStore } = useGlobalStore();
    const { state, dispatch } = useContext(FormContext);
    const [loading, setLoading] = useState<boolean>(false);

    const { originalContent, langFrom, langTo, model, isClassicI18nValue, uniqKeyName, transKeyName, fileType, extraPrompt } = state;
    const { translate, spellingCorrection, rewriteText } = useTextServices();

    const finalService = useMemo(() => {
        switch (service) {
            case "translation":
                return translate;
            case "spelling-correction":
                return spellingCorrection;
            case "rewrite-text":
                return rewriteText;
        }
    }, [service, state]);

    const finalBtnText = useMemo(() => {
        switch (service) {
            case "translation":
                return "Translate";
            case "spelling-correction":
                return "Spelling Correction";
            case "rewrite-text":
                return "Rewrite Text";
        }
    }, [service]);

    const requestTranslation = useCallback(async () => {
        dispatch({ type: "clearTargetContent" });
        setLoading(true);
        try {
            const data = await finalService();
            dispatch({ type: "setTransContent", value: prettierJson(data, fileType) });
        } catch (error) {
            notify(
                {
                    title: "translate service error",
                    message: `${error}`,
                    type: "error",
                },
                3000
            );
        } finally {
            setLoading(false);
        }
    }, [originalContent, langTo, fileType, extraPrompt, langFrom, transKeyName, uniqKeyName, model, finalService]);

    useEffect(() => {
        dispatch({ type: "clearTargetContent" });
    }, [service]);

    return (
        <div className="text-white">
            <Header />
            <Background />
            <div className="w-4/5 mx-auto p-4">
                <div className="container p-4">
                    {commonStore.config.apiKey === "your-key" && (
                        <p className="my-2">
                            GPT keys is not provided by default now, set your own keys at{" "}
                            <Link className="underline" to={"/settings"}>
                                Settings
                            </Link>
                        </p>
                    )}
                    <div className="dark flex items-center">
                        <DropdownSelect
                            className="inline-block w-36"
                            buttonClassName="w-full"
                            options={intlLanguages}
                            selectedKey={langFrom}
                            onSelect={(value) => dispatch({ type: "setLangFrom", value })}
                        />

                        {service === "translation" && (
                            <>
                                &nbsp;&nbsp;To&nbsp;&nbsp;
                                <DropdownSelect
                                    className="inline-block w-36"
                                    buttonClassName="w-full"
                                    options={intlLanguages}
                                    selectedKey={langTo}
                                    onSelect={(value) => dispatch({ type: "setLangTo", value })}
                                />
                            </>
                        )}
                        <DropdownSelect
                            className="inline-block w-28 pl-2"
                            buttonClassName="w-full"
                            options={fileTypes}
                            selectedKey={fileType}
                            onSelect={(value) => dispatch({ type: "setFileType", value })}
                        />
                        <button
                            type="button"
                            className="ml-2 px-6 inline-flex rounded bg-indigo-500 shadow-indigo-500/50 py-1.5 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            onClick={requestTranslation}
                        >
                            {loading && <Spinner />}
                            {finalBtnText}
                        </button>
                    </div>
                    {fileType === "json" && (
                        <div className="mt-2 flex items-center">
                            <CheckboxField
                                label="It's not a traditionnal i18n json file"
                                onChange={(value) => {
                                    dispatch({ type: "setIsClassicI18nValue", value: !value });
                                }}
                                value={!isClassicI18nValue}
                            />
                        </div>
                    )}
                    {fileType === "json" && !isClassicI18nValue && (
                        <div className="mt-2 flex items-center">
                            <TextField
                                label="Uniq Key to translate"
                                placeholder="Key name of uniq key"
                                value={uniqKeyName}
                                onChange={(value) => dispatch({ type: "setUniqKeyName", value })}
                            />
                            &nbsp;&nbsp;
                            <TextField
                                label="Key name to translate"
                                placeholder="Name of key in your json to be translate"
                                value={transKeyName}
                                onChange={(value) => dispatch({ type: "setTransKeyName", value })}
                            />
                        </div>
                    )}
                    <p className="my-2 text-gray-400">Model</p>
                    <div className="dark flex items-center">
                        <DropdownModel
                            className="inline-block"
                            buttonClassName="w-full"
                            selectedKey={model}
                            onSelect={(value) => dispatch({ type: "setModel", value })}
                        />
                    </div>
                    <div className="mt-2">
                        <TextField
                            label="Customized Prompt (Optional)"
                            placeholder="Add more prompt (like background knowledge) to help the translation if needed."
                            value={extraPrompt}
                            onChange={(value) => dispatch({ type: "setExtraPrompt", value })}
                        />
                    </div>
                </div>
                <EditorsComponent loading={loading} />
            </div>
        </div>
    );
};

export default TextServicePage;
