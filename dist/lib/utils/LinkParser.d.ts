import { ProjectReflection } from '../models/reflections/index';
export declare class LinkParser {
    private project;
    private inlineTag;
    private urlPrefix;
    private linkPrefix;
    constructor(project: ProjectReflection, linkPrefix?: string);
    private replaceInlineTags;
    private buildLink;
    parseMarkdown(text: string): string;
    private splitLinkText;
}
