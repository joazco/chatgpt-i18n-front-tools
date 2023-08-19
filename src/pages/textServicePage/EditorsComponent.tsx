import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import MonacoEditor from "@monaco-editor/react";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { copy2Clipboard } from "./utils";
import { useNotification } from "../../notify";
import { useContext, useEffect, useRef, useState } from "react";
import { FormContext } from "../../store/form";

type EditorsComponentProps = {
    loading: boolean;
};

const EditorsComponent: React.FC<EditorsComponentProps> = ({ loading }) => {
    const { notify } = useNotification();
    const { state, dispatch } = useContext(FormContext);
    const { originalContent, targetContent, fileType } = state;
    const refEditor = useRef<any>(null);
    const refTargetEditor = useRef<any>(null);
    const [editorLoaded, setEditorLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (refEditor.current) {
            const current: monaco.editor.IStandaloneCodeEditor = refEditor.current;
            current.onDidScrollChange((e) => {
                refTargetEditor.current.setScrollPosition({ scrollTop: e.scrollTop, scrollLeft: e.scrollLeft });
            });
            current.onDidPaste(() => {
                dispatch({ type: "setTargetContent", value: "" });
                refEditor.current.getAction("editor.action.formatDocument").run();
                setTimeout(() => refEditor.current.setScrollPosition({ scrollTop: 0, scrollLeft: 0 }), 100);
            });
            current.onDidBlurEditorText(() => {
                refEditor.current.getAction("editor.action.formatDocument").run();
                setTimeout(() => refEditor.current.setScrollPosition({ scrollTop: 0, scrollLeft: 0 }), 100);
            });
        }
    }, [refEditor, refTargetEditor, editorLoaded]);

    useEffect(() => {
        if (refEditor.current) {
            const current: monaco.editor.IStandaloneCodeEditor = refEditor.current;
            current.onDidPaste((e) => {
                refEditor.current.getAction("editor.action.formatDocument").run();
                setTimeout(() => refEditor.current.setScrollPosition({ scrollTop: 0, scrollLeft: 0 }), 100);
            });
        }
    }, [refEditor, refTargetEditor, editorLoaded]);

    useEffect(() => {
        if (refTargetEditor.current) {
            refTargetEditor.current.getAction("editor.action.formatDocument").run();
            setTimeout(() => refTargetEditor.current.setScrollPosition({ scrollTop: 0, scrollLeft: 0 }), 100);
        }
    }, [refTargetEditor, targetContent]);

    return (
        <div className="grid grid-cols-2 mt-6">
            <div className="shadow-lg border border-gray-700 rounded m-2">
                <div className="p-2">Original locale</div>
                <MonacoEditor
                    onMount={(editor) => {
                        refEditor.current = editor;
                        setEditorLoaded(true);
                    }}
                    value={originalContent}
                    onChange={(value) => {
                        dispatch({ type: "setOriginalContent", value });
                    }}
                    height="600px"
                    language={fileType}
                    theme="vs-dark"
                    loading={loading}
                />
            </div>
            <div className="shadow-lg border border-gray-700 rounded m-2">
                <div className="p-2">
                    Target locale
                    <DocumentDuplicateIcon
                        onClick={() => {
                            copy2Clipboard(targetContent);
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
                    onMount={(editor, m) => {
                        refTargetEditor.current = editor;
                    }}
                    value={targetContent}
                    height="600px"
                    language={fileType}
                    theme="vs-dark"
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default EditorsComponent;
