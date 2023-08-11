import { IMessage, IUserSetting } from "../interface";
import { Configuration, OpenAIApi } from "openai";

// console.log(await openai.listModels());
/**
 * group pairs into two category, pairs need to be translated or not
 * @param pairs
 */
export function groupPairs(pairs: [string, any][]): {
    requireTranslation: [string, string][];
    noTranslation: [string, any][];
} {
    const requireTranslation: [string, string][] = [];
    const noTranslation: [string, string][] = [];
    for (let pair of pairs) {
        if (typeof pair[1] === "string") {
            requireTranslation.push(pair);
        } else {
            noTranslation.push(pair);
        }
    }
    return {
        requireTranslation,
        noTranslation,
    };
}

export interface ICreateChatCompletionProps {
    model: string;
    messages: IMessage[];
}
export interface ICreateChatCompletionResponse {
    id: string;
    object: string;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: { message: { role: string; content: string } }[];
}

export async function createChatCompletion(props: ICreateChatCompletionProps, config: IUserSetting) {
    const configuration = new Configuration({
        apiKey: config.apiKey as string,
    });
    const openai = new OpenAIApi(configuration);
    return openai.createChatCompletion({
        temperature: 0,
        model: props.model,
        messages: props.messages,
    });
}

export function matchJSON(from: any[], to: any[], uniqKeyNameToTranslate: string, keyNameToTranslate: string) {
    // Convert tableau2 to a dictionary for easier lookup
    const updateDictionary = to.reduce((acc, item) => {
        const key = Object.keys(item)[0];
        acc[key] = item[key];
        return acc;
    }, {});

    // Update tableau1 based on the dictionary
    from.forEach((item) => {
        if (updateDictionary[item[uniqKeyNameToTranslate]]) {
            item[keyNameToTranslate] = updateDictionary[item[uniqKeyNameToTranslate]];
        }
    });

    return from;
}
