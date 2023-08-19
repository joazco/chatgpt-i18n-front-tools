import { useCallback, useContext } from "react";

import { FormContext } from "../../store/form";
import { IMessage } from "../../interface";
import { createChatCompletion, matchJSON } from "../../utils";
import { useGlobalStore } from "../../store";
import { compress } from "../../pages/textServicePage/utils";

const useTextServices = () => {
    const { commonStore } = useGlobalStore();
    const { state } = useContext(FormContext);
    const { originalContent, langFrom, langTo, model, isClassicI18nValue, uniqKeyName, transKeyName, fileType, extraPrompt } = state;

    const formatData = useCallback(() => {
        const finalContent = compress(originalContent, fileType);
        return !isClassicI18nValue && fileType == "json"
            ? JSON.stringify(finalContent.map((o: any) => ({ [o[uniqKeyName]]: o[transKeyName] })))
            : JSON.stringify(finalContent);
    }, [state]);

    const translate = useCallback(() => {
        const messages: IMessage[] = [
            {
                role: "system",
                content: `You are a helpful assistant that translates a i18n locale array content. Only translate a i18n locale json content from ${langFrom} to ${langTo}..\n
            It's a key:value structure, don't modify the key.\n`,
            },
        ];
        if (typeof extraPrompt === "string" && extraPrompt.length > 0) {
            messages.push({
                role: "user",
                content: `Other tips for translation: ${extraPrompt}\n`,
            });
        }
        messages.push({
            role: "user",
            content: formatData(),
        });
        return new Promise<string>((resolve, reject) => {
            createChatCompletion(
                {
                    model,
                    messages,
                },
                commonStore.config,
                0
            )
                .then((completion) => {
                    if (completion.data.choices[0].finish_reason !== "stop") {
                        throw new Error(`Error:: finish reason '${completion.data.choices[0].finish_reason}'`);
                    }
                    return completion;
                })
                .then((completion) => {
                    return JSON.parse(completion.data.choices[0].message?.content || "[]");
                })
                .then((completionJSON) => {
                    if (isClassicI18nValue || fileType !== "json") return completionJSON;
                    console.log("i'm here!!!", matchJSON(JSON.parse(originalContent), completionJSON, uniqKeyName, transKeyName));
                    return matchJSON(JSON.parse(originalContent), completionJSON, uniqKeyName, transKeyName);
                })
                .then((completion) => {
                    resolve(JSON.stringify(completion));
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }, [state, commonStore]);

    const spellingCorrection = useCallback(() => {
        const messages: IMessage[] = [
            {
                role: "system",
                content: `You are a helpful assistant that correct spelling a i18n locale array content. Only correct spelling a i18n locale json content in ${langFrom}.\n
                It's a key:value structure, don't modify the key.\n`,
            },
        ];
        if (typeof extraPrompt === "string" && extraPrompt.length > 0) {
            messages.push({
                role: "user",
                content: `Other tips for correct spelling: ${extraPrompt}\n`,
            });
        }

        messages.push({
            role: "user",
            content: formatData(),
        });

        return new Promise<string>((resolve, reject) => {
            createChatCompletion(
                {
                    model,
                    messages,
                },
                commonStore.config,
                0
            )
                .then((completion) => {
                    if (completion.data.choices[0].finish_reason !== "stop") {
                        throw new Error(`Error:: finish reason '${completion.data.choices[0].finish_reason}'`);
                    }
                    return completion;
                })
                .then((completion) => {
                    return JSON.parse(completion.data.choices[0].message?.content || "[]");
                })
                .then((completionJSON) => {
                    if (isClassicI18nValue || fileType !== "json") return completionJSON;
                    return matchJSON(JSON.parse(originalContent), completionJSON, uniqKeyName, transKeyName);
                })
                .then((completion) => {
                    resolve(JSON.stringify(completion));
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }, [state, commonStore]);

    const rewriteText = useCallback(() => {
        const messages: IMessage[] = [
            {
                role: "system",
                content: `You are a helpful assistant to rephrase to make the text flow better a json i18n locale array content. Only rephrase to make the text flow better a i18n locale json content in ${langFrom}.`,
            },
        ];
        if (typeof extraPrompt === "string" && extraPrompt.length > 0) {
            messages.push({
                role: "user",
                content: `Other tips to make the text flow better: ${extraPrompt}\n`,
            });
        }

        messages.push({
            role: "user",
            content: formatData(),
        });

        return new Promise<string>((resolve, reject) => {
            createChatCompletion(
                {
                    model,
                    messages,
                },
                commonStore.config,
                1
            )
                .then((completion) => {
                    if (completion.data.choices[0].finish_reason !== "stop") {
                        throw new Error(`Error:: finish reason '${completion.data.choices[0].finish_reason}'`);
                    }
                    return completion;
                })
                .then((completion) => {
                    return JSON.parse(completion.data.choices[0].message?.content || "[]");
                })
                .then((completionJSON) => {
                    if (isClassicI18nValue || fileType !== "json") return completionJSON;
                    return matchJSON(JSON.parse(originalContent), completionJSON, uniqKeyName, transKeyName);
                })
                .then((completion) => {
                    resolve(JSON.stringify(completion));
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }, [state, commonStore]);

    return {
        translate,
        spellingCorrection,
        rewriteText,
    };
};

export default useTextServices;
