import React, { createContext, useEffect, useMemo, useReducer } from "react";
import { FileType } from "../pages/translate/types";

export type FormReducerState = {
    originalContent: string;
    targetContent: string;
    langFrom: string;
    langTo: string;
    model: string;
    uniqKeyName: string;
    transKeyName: string;
    fileType: FileType;
    extraPrompt: string;
};

export type FormReducerAction = {
    type:
        | "setOriginalContent"
        | "setTargetContent"
        | "setLangFrom"
        | "setLangTo"
        | "setModel"
        | "setUniqKeyName"
        | "setTransKeyName"
        | "setFileType"
        | "setTransContent"
        | "setExtraPrompt"
        | "clearTargetContent";

    value?: any;
};

export const formReducerState: FormReducerState = {
    originalContent: "",
    targetContent: "",
    langFrom: "English",
    langTo: "French",
    model: "gpt-3.5-turbo",
    uniqKeyName: "",
    transKeyName: "",
    fileType: "json",
    extraPrompt: "",
};

const formReducer = (state: FormReducerState, action: FormReducerAction): FormReducerState => {
    switch (action.type) {
        case "setOriginalContent":
            return { ...state, originalContent: action.value };
        case "setTargetContent":
            return { ...state, targetContent: action.value };
        case "setLangFrom":
            return { ...state, langFrom: action.value };
        case "setLangTo":
            return { ...state, langTo: action.value };
        case "setModel":
            return { ...state, model: action.value };
        case "setUniqKeyName":
            return { ...state, uniqKeyName: action.value };
        case "setTransKeyName":
            return { ...state, transKeyName: action.value };
        case "setFileType":
            return { ...state, fileType: action.value };
        case "setExtraPrompt":
            return { ...state, extraPrompt: action.value };
        case "setTransContent":
            return { ...state, targetContent: action.value };
        case "clearTargetContent":
            return { ...state, targetContent: "" };
        default:
            return state;
    }
};

interface FormContextInterface {
    state: FormReducerState;
    dispatch: React.Dispatch<FormReducerAction>;
}

export const FormContext = createContext<FormContextInterface>({
    state: formReducerState,
    dispatch: () => {},
});

const FormProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const defaultState = useMemo(() => {
        const dataStoraged = localStorage.getItem("formState");
        if (dataStoraged === null) {
            return formReducerState;
        }
        return JSON.parse(dataStoraged);
    }, []);
    const [state, dispatch] = useReducer(formReducer, defaultState);

    useEffect(() => {
        localStorage.setItem("formState", JSON.stringify(state));
    }, [state]);

    return <FormContext.Provider value={{ state, dispatch }}>{children}</FormContext.Provider>;
};

export default FormProvider;
