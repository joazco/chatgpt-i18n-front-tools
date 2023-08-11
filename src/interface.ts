import { ChatCompletionRequestMessage } from "openai";

export interface IUserSetting {
    apiKey: string | null;
    serviceProvider: string;
}

export interface IMessage extends ChatCompletionRequestMessage {}
