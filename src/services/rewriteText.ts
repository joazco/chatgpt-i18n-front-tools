import { IMessage, IUserSetting } from "../interface";
import { createChatCompletion, matchJSON } from "../utils";

interface IReqBody {
    content: any[];
    baseLang: string;
    model: string;
    uniqKeyNameToTranslate: string;
    keyNameToTranslate: string;
    extraPrompt?: string;
    config: IUserSetting;
}

export default function rewriteTextService(req: IReqBody) {
    const { config, content, baseLang, model, extraPrompt, uniqKeyNameToTranslate, keyNameToTranslate } = req;
    const messages: IMessage[] = [
        {
            role: "system",
            content: `You are a helpful assistant to rephrase to make the text flow better a json i18n locale array content. Only rephrase to make the text flow better a i18n locale json content from ${baseLang}.`,
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
