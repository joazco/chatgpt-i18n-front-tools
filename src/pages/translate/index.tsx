import React, { useCallback, useState } from "react";
import MonacoEditor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import Header from "../../components/header";
import Background from "../../components/background";
import DropdownSelect from "../../components/dropdownSelect";
import DropdownModel from "../../components/dropdownModel";
import { compress, copy2Clipboard, prettierJson } from "./utils";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { fileTypes, intlLanguages } from "./config";
import Spinner from "../../components/spinner";
import { useNotification } from "../../notify";
import TextField from "../../components/textField";
import { FileType } from "./types";
import { translateService } from "../../services/translate";
import { useGlobalStore } from "../../store";
import { toJS } from "mobx";
import { Link } from "react-router-dom";

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

const Translate: React.FC = (props) => {
    const [originalContent, setOriginalContent] = useState("");
    const [langFrom, setLangFrom] = useState<string>(intlLanguages[0].value);
    const [lang, setLang] = useState<string>(intlLanguages[2].value);
    const [model, setModel] = useState<string>("gpt-3.5-turbo");
    const [transContent, setTransContent] = useState("");
    const [uniqKeyName, setUniqKeyName] = useState("");
    const [keyName, setKeyName] = useState("");
    const [extraPrompt, setExtraPrompt] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const [fileType, setFileType] = useState<FileType>("json");
    const { notify } = useNotification();
    const { commonStore } = useGlobalStore();

    const requestTranslation = useCallback(async () => {
        setTransContent("");
        setLoading(true);
        try {
            const compressedContent = compress(originalContent, fileType);
            // const data = await translate(compressedContent, lang, fileType, extraPrompt);
            const data = await translateService({
                content: compressedContent,
                baseLang: langFrom,
                targetLang: lang,
                model,
                uniqKeyNameToTranslate: uniqKeyName,
                keyNameToTranslate: keyName,
                // fileType,
                extraPrompt,
                config: toJS(commonStore.config),
            });
            setTransContent(prettierJson(data, fileType));
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
    }, [originalContent, lang, fileType, extraPrompt, langFrom, keyName, uniqKeyName, model]);

    return (
        <div className="text-white">
            <Header />
            <Background />
            <div className="container mx-auto p-4">
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
                        onSelect={(val) => setLangFrom(val)}
                    />
                    &nbsp;&nbsp;To&nbsp;&nbsp;
                    <DropdownSelect
                        className="inline-block w-36"
                        buttonClassName="w-full"
                        options={intlLanguages}
                        selectedKey={lang}
                        onSelect={(val) => setLang(val)}
                    />
                    <DropdownSelect
                        className="inline-block w-28 pl-2"
                        buttonClassName="w-full"
                        options={fileTypes}
                        selectedKey={fileType}
                        onSelect={(val) => setFileType(val as FileType)}
                    />
                    <button
                        type="button"
                        className="ml-2 px-6 inline-flex rounded bg-indigo-500 shadow-indigo-500/50 py-1.5 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        onClick={requestTranslation}
                    >
                        {loading && <Spinner />}
                        Translate
                    </button>
                </div>
                <p className="my-2">Model</p>
                <div className="dark flex items-center">
                    <DropdownModel
                        className="inline-block"
                        buttonClassName="w-full"
                        selectedKey={model}
                        onSelect={(val) => setModel(val)}
                    />
                </div>
                <div className="mt-2 flex items-center">
                    <TextField
                        label="Uniq Key to translate (Optional)"
                        placeholder="Key name of uniq key"
                        value={uniqKeyName}
                        onChange={(val) => {
                            setUniqKeyName(val);
                        }}
                    />
                    &nbsp;&nbsp;
                    <TextField
                        label="Key name to translate (Optional)"
                        placeholder="Name of key in your json to be translate"
                        value={keyName}
                        onChange={(val) => {
                            setKeyName(val);
                        }}
                    />
                </div>
                <div className="mt-2">
                    <TextField
                        label="Customized Prompt (Optional)"
                        placeholder="Add more prompt (like background knowledge) to help the translation if needed."
                        value={extraPrompt}
                        onChange={(val) => {
                            setExtraPrompt(val);
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 mt-6">
                    <div className="shadow-lg border border-gray-700 rounded m-2">
                        <div className="p-2">Original locale</div>
                        <MonacoEditor
                            value={originalContent}
                            onChange={(val) => {
                                setOriginalContent(val ?? "");
                            }}
                            height="600px"
                            language={fileType}
                            theme="vs-dark"
                        />
                    </div>
                    <div className="shadow-lg border border-gray-700 rounded m-2">
                        <div className="p-2">
                            Translated locale
                            <DocumentDuplicateIcon
                                onClick={() => {
                                    copy2Clipboard(transContent);
                                    notify(
                                        {
                                            type: "success",
                                            title: "copied!",
                                            message: "copy to clipboard",
                                        },
                                        1000
                                    );
                                }}
                                className="float-right w-5 text-white cursor-pointer hover:scale-110"
                            />
                        </div>
                        <MonacoEditor
                            // onMount={(editor, m) => {
                            //     resultEditorRef.current = editor;
                            // }}
                            value={transContent}
                            height="600px"
                            language={fileType}
                            theme="vs-dark"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Translate;
