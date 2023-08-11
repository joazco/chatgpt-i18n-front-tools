import { IMessage, IUserSetting } from "../interface";
import { createChatCompletion, matchJSON } from "../utils";

interface IReqBody {
    content: any[];
    baseLang: string;
    targetLang: string;
    model: string;
    uniqKeyNameToTranslate: string;
    keyNameToTranslate: string;
    extraPrompt?: string;
    config: IUserSetting;
}

export function translateService(req: IReqBody) {
    const { config, content, baseLang, targetLang, model, extraPrompt, uniqKeyNameToTranslate, keyNameToTranslate } = req;
    const messages: IMessage[] = [
        {
            role: "system",
            content: `You are a helpful assistant that translates a i18n locale array content. Only translate a i18n locale json content from ${baseLang} to ${targetLang}.`,
        },
    ];
    if (typeof extraPrompt === "string" && extraPrompt.length > 0) {
        messages.push({
            role: "user",
            content: `Other tips for translation: ${extraPrompt}`,
        });
    }

    messages.push({
        role: "user",
        content: JSON.stringify(content.map((o) => ({ [o[uniqKeyNameToTranslate]]: o[keyNameToTranslate] }))),
    });

    return new Promise<string>((resolve, reject) => {
        createChatCompletion(
            {
                model,
                messages,
            },
            config
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
                return matchJSON(content, completionJSON, uniqKeyNameToTranslate, keyNameToTranslate);
            })
            .then((completion) => {
                resolve(JSON.stringify(completion));
            })
            .catch((err) => {
                reject(err.message);
            });
    });
}
