import { FileType } from "./types";
import yaml from "js-yaml";

export function compress(content: string, fileType: FileType): any {
    switch (fileType) {
        case "json":
            return JSON.parse(content);
        case "yaml":
            return yaml.load(content) as any;
        case "plaintext":
            return { key: content };
    }
}

export function prettierJson(content: string, fileType: FileType): string {
    if (typeof content !== "string") return JSON.stringify(content);
    switch (fileType) {
        case "json":
            return content;
        case "yaml":
            return yaml.dump(yaml.load(content)) as string;
        case "plaintext":
            return JSON.parse(content).key;
    }
}

// copy content to clipboard
export function copy2Clipboard(content: string) {
    navigator.clipboard.writeText(content);
}
