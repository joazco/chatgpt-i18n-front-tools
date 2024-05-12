import { useCallback, useContext } from "react";

import { FormContext } from "../../store/form";
import { IMessage } from "../../interface";
import { createChatCompletion, matchJSON } from "../../utils";
import { useGlobalStore } from "../../store";
import { compress } from "../../pages/textServicePage/utils";
import { ChatCompletionMessageParam } from "openai/resources";

let timesouts: any[] = [];

const useTextServices = () => {
    const { commonStore } = useGlobalStore();
    const { state } = useContext(FormContext);
    const { originalContent, langFrom, langTo, model, isClassicI18nValue, uniqKeyName, transKeyName, fileType, extraPrompt, split } = state;

    const splitJSON = (json: string, parts: number): { [key: string]: string }[] => {
        const jsonObj = JSON.parse(json);
        const result: any[] = [];

        for (let i = 0; i < parts; i++) {
            result.push({});
        }

        const keys = Object.keys(jsonObj);
        const groupSize = Math.ceil(keys.length / parts);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = jsonObj[key];
            const groupIndex = Math.floor(i / groupSize);

            result[groupIndex][key] = value;
        }

        return result.filter((obj: any) => Object.keys(obj).length > 0);
    };

    const formatData = useCallback(
        (content: string) => {
            const finalContent = compress(content, fileType);
            return !isClassicI18nValue && fileType == "json"
                ? JSON.stringify(finalContent.map((o: any) => ({ [o[uniqKeyName]]: o[transKeyName] })))
                : JSON.stringify(finalContent);
        },
        [state]
    );

    const translate = useCallback(() => {
        const content = formatData(originalContent);
        timesouts = [];
        return Promise.all(
            splitJSON(content, fileType !== "json" ? 1 : split).map(
                (finalContent, id) =>
                    new Promise<{ id: number; result: any }>((resolve, reject) => {
                        const messages: ChatCompletionMessageParam[] = [
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
                            content: JSON.stringify(finalContent),
                        });
                        const nb = setTimeout(() => {
                            createChatCompletion(
                                {
                                    model,
                                    messages,
                                },
                                commonStore.config,
                                0
                            )
                                .then((completion) => {
                                    if (completion.choices[0].finish_reason !== "stop") {
                                        throw new Error(`Error:: finish reason '${completion.choices[0].finish_reason}'`);
                                    }
                                    return completion;
                                })
                                .then((completion) => {
                                    return JSON.parse(completion.choices[0].message?.content || "[]");
                                })
                                .then((completionJSON) => {
                                    if (isClassicI18nValue || fileType !== "json") return completionJSON;
                                    return matchJSON(JSON.parse(originalContent), completionJSON, uniqKeyName, transKeyName);
                                })
                                .then((completion) => {
                                    resolve({ id, result: JSON.stringify(completion) });
                                })
                                .catch((err) => {
                                    reject(err.message);
                                });
                        }, 1200 * id);
                        timesouts.push(nb);
                    })
            )
        )
            .then((results) => {
                return Promise.resolve(
                    JSON.stringify(
                        results.reduce((acc, obj) => {
                            acc = { ...acc, ...JSON.parse(obj.result) };
                            return acc;
                        }, {})
                    )
                );
            })
            .catch((err) => {
                timesouts.forEach((t) => clearTimeout(t));
                return Promise.reject(err);
            });
    }, [state, split, commonStore]);

    const spellingCorrection = useCallback(() => {
        const messages: ChatCompletionMessageParam[] = [
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
            content: formatData(originalContent),
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
                    if (completion.choices[0].finish_reason !== "stop") {
                        throw new Error(`Error:: finish reason '${completion.choices[0].finish_reason}'`);
                    }
                    return completion;
                })
                .then((completion) => {
                    return JSON.parse(completion.choices[0].message?.content || "[]");
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
        const messages: ChatCompletionMessageParam[] = [
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
            content: formatData(originalContent),
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
                    if (completion.choices[0].finish_reason !== "stop") {
                        throw new Error(`Error:: finish reason '${completion.choices[0].finish_reason}'`);
                    }
                    return completion;
                })
                .then((completion) => {
                    return JSON.parse(completion.choices[0].message?.content || "[]");
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
