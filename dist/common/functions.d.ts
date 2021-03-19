declare const _default: {
    saltRounds: number;
    compareHash(password: string, hash: string): Promise<boolean>;
    getHash(password: string): Promise<string>;
    getAlphaNumeric(str: any, withSpace?: boolean): string;
    getInitialsOfWords(str: any): string;
    toSlug(text: string, id: number): string | number;
    getEmailHtml(text: any): string;
};
export default _default;
