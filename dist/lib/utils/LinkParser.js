"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require("util");
class LinkParser {
    constructor(project, linkPrefix) {
        this.inlineTag = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;
        this.urlPrefix = /^(http|ftp)s?:\/\//;
        this.project = project;
        this.linkPrefix = linkPrefix != null ? linkPrefix : '';
    }
    replaceInlineTags(text) {
        let that = this;
        return text.replace(this.inlineTag, (match, leading, tagName, content) => {
            var split = that.splitLinkText(content);
            var target = split.target;
            var caption = leading || split.caption;
            var monospace = tagName == 'linkcode';
            return this.buildLink(match, target, caption, monospace);
        });
    }
    buildLink(original, target, caption, monospace) {
        let attributes = '';
        if (this.urlPrefix.test(target)) {
            attributes = ' class="external"';
        }
        else {
            let reflection;
            reflection = this.project.findReflectionByName(target);
            if (reflection && reflection.url) {
                target = reflection.url;
            }
            else {
                return caption;
            }
        }
        if (monospace) {
            caption = '<code>' + caption + '</code>';
        }
        return Util.format('<a href="%s%s"%s>%s</a>', this.linkPrefix, target, attributes, caption);
    }
    parseMarkdown(text) {
        return this.replaceInlineTags(text);
    }
    splitLinkText(text) {
        var splitIndex = text.indexOf('|');
        if (splitIndex === -1) {
            splitIndex = text.search(/\s/);
        }
        if (splitIndex !== -1) {
            return {
                caption: text.substr(splitIndex + 1).replace(/\n+/, ' '),
                target: text.substr(0, splitIndex)
            };
        }
        else {
            return {
                caption: text,
                target: text
            };
        }
    }
}
exports.LinkParser = LinkParser;
//# sourceMappingURL=LinkParser.js.map