
declare module "@google/genai" {
    export class GoogleGenAI {
        constructor(config: { apiKey: string });
        models: {
            generateContent(params: {
                model: string;
                contents: any;
                config?: any;
            }): Promise<GenerateContentResponse>;
            generateContentStream(params: {
                model: string;
                contents: any;
                config?: any;
            }): Promise<AsyncGenerator<GenerateContentResponse>>;
        }
    }

    export interface GenerateContentResponse {
        text: string;
        candidates?: any[];
    }

    export enum Type {
        STRING = 'STRING',
        NUMBER = 'NUMBER',
        INTEGER = 'INTEGER',
        BOOLEAN = 'BOOLEAN',
        ARRAY = 'ARRAY',
        OBJECT = 'OBJECT'
    }

    export enum Modality {
        TEXT = 'TEXT',
        IMAGE = 'IMAGE',
        AUDIO = 'AUDIO',
        VIDEO = 'VIDEO'
    }
}
