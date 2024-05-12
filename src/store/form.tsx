import React, { createContext, useEffect, useMemo, useReducer } from "react";
import { FileType } from "../pages/textServicePage/types";

export type FormReducerState = {
    originalContent: string;
    targetContent: string;
    langFrom: string;
    langTo: string;
    model: string;
    isClassicI18nValue: boolean;
    uniqKeyName: string;
    transKeyName: string;
    fileType: FileType;
    extraPrompt: string;
    split: number;
};

export type FormReducerAction = {
    type:
        | "setOriginalContent"
        | "setTargetContent"
        | "setLangFrom"
        | "setLangTo"
        | "setModel"
        | "setIsClassicI18nValue"
        | "setUniqKeyName"
        | "setTransKeyName"
        | "setFileType"
        | "setTransContent"
        | "setExtraPrompt"
        | "setSplit"
        | "clearTargetContent";

    value?: any;
};

export const formReducerState: FormReducerState = {
    originalContent: "",
    targetContent: "",
    langFrom: "English",
    langTo: "French",
    model: "gpt-3.5-turbo",
    isClassicI18nValue: true,
    uniqKeyName: "",
    transKeyName: "",
    fileType: "json",
    extraPrompt: "",
    split: 1,
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
        case "setIsClassicI18nValue":
            return { ...state, isClassicI18nValue: action.value };
        case "setUniqKeyName":
            return { ...state, uniqKeyName: action.value };
        case "setTransKeyName":
            return { ...state, transKeyName: action.value };
        case "setFileType":
            return { ...state, fileType: action.value };
        case "setExtraPrompt":
            return { ...state, extraPrompt: action.value };
        case "setSplit":
            return { ...state, split: action.value };
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
