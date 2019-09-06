"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CoveoCustomTagNames;
(function (CoveoCustomTagNames) {
    CoveoCustomTagNames["AvailableSince"] = "availableSince";
    CoveoCustomTagNames["Default"] = "default";
    CoveoCustomTagNames["DependsOn"] = "dependsOn";
    CoveoCustomTagNames["DeprecatedSince"] = "deprecatedSince";
    CoveoCustomTagNames["ExternalDocs"] = "externalDocs";
    CoveoCustomTagNames["IsResultTemplateComponent"] = "isResultTemplateComponent";
    CoveoCustomTagNames["Maximum"] = "maximum";
    CoveoCustomTagNames["Minimum"] = "minimum";
    CoveoCustomTagNames["Required"] = "required";
})(CoveoCustomTagNames = exports.CoveoCustomTagNames || (exports.CoveoCustomTagNames = {}));
var CoveoCustomTagTypes;
(function (CoveoCustomTagTypes) {
    CoveoCustomTagTypes["Boolean"] = "boolean";
    CoveoCustomTagTypes["List"] = "list";
    CoveoCustomTagTypes["Scalar"] = "scalar";
})(CoveoCustomTagTypes = exports.CoveoCustomTagTypes || (exports.CoveoCustomTagTypes = {}));
exports.coveoTags = [
    {
        name: CoveoCustomTagNames.AvailableSince,
        type: CoveoCustomTagTypes.Scalar,
        func: function (releaseNotesLink) {
            if (!releaseNotesLink) {
                return "";
            }
            return "**Available since:** " + releaseNotesLink;
        }
    },
    {
        name: CoveoCustomTagNames.Default,
        type: CoveoCustomTagTypes.Scalar,
        func: function (defaultComponentOptionValue) {
            if (!defaultComponentOptionValue) {
                return "";
            }
            return "**Default:** `" + defaultComponentOptionValue.toString() + "`";
        }
    },
    {
        name: CoveoCustomTagNames.DependsOn,
        type: CoveoCustomTagTypes.List,
        func: function (componentOptions, result) {
            if (!componentOptions) {
                return "";
            }
            var dependsOnString = "This option is only effective when the";
            if (componentOptions.length === 1) {
                return dependsOnString + " [`" + componentOptions[0] + "`]{@link " + result.parent.parent.name + ".options." + componentOptions[0] + "} option is set to `true`.";
            }
            dependsOnString = "This option is only effective when the following options are set to `true`:";
            componentOptions.forEach(function (componentOption, index) {
                dependsOnString += "\n- [`" + componentOption + "`]{@link " + result.parent.parent.name + ".options." + componentOption + "}";
            });
            return dependsOnString;
        }
    },
    {
        name: CoveoCustomTagNames.DeprecatedSince,
        type: CoveoCustomTagTypes.Scalar,
        func: function (releaseNotesLink) {
            if (!releaseNotesLink) {
                return "";
            }
            return "**Deprecated since:** " + releaseNotesLink;
        }
    },
    {
        name: CoveoCustomTagNames.ExternalDocs,
        type: CoveoCustomTagTypes.List,
        func: function (externalDocsLinks) {
            if (!externalDocsLinks) {
                return "";
            }
            if (externalDocsLinks.length === 1) {
                return "See " + externalDocsLinks[0] + ".";
            }
            var externalDocsString = "See:";
            externalDocsLinks.forEach(function (externalDocsLink) {
                externalDocsString += "\n- " + externalDocsLink;
            });
            return externalDocsString;
        }
    },
    {
        name: CoveoCustomTagNames.IsResultTemplateComponent,
        type: CoveoCustomTagTypes.Boolean,
        func: function (isResultTemplateComponent) {
            if (!isResultTemplateComponent) {
                return "";
            }
            return "This is a [result template](https://docs.coveo.com/en/413/) component.";
        }
    },
    {
        name: CoveoCustomTagNames.Maximum,
        type: CoveoCustomTagTypes.Scalar,
        func: function (maximumComponentOptionValue) {
            if (!maximumComponentOptionValue) {
                return "";
            }
            return "**Maximum:** `" + maximumComponentOptionValue + "`";
        }
    },
    {
        name: CoveoCustomTagNames.Minimum,
        type: CoveoCustomTagTypes.Scalar,
        func: function (minimumComponentOptionValue) {
            if (!minimumComponentOptionValue) {
                return "";
            }
            return "**Minimum:** `" + minimumComponentOptionValue + "`";
        }
    },
    {
        name: CoveoCustomTagNames.Required,
        type: CoveoCustomTagTypes.Boolean,
        func: function (isComponentOptionRequired, result) {
            if (!isComponentOptionRequired) {
                return "";
            }
            var baseRequiredOptionString = "Required option";
            if (result.parent.parent.coveorequired && result.parent.parent.coveorequired.match("(" + baseRequiredOptionString + ": ).*")) {
                var firstRequiredOptionLink = result.parent.parent.coveorequired.replace(baseRequiredOptionString + ': ', "");
                result.parent.parent.coveorequired = baseRequiredOptionString + "s:\n- " + firstRequiredOptionLink + "\n- [`" + result.name + "`]{@link " + result.parent.parent.name + ".options." + result.name + "}";
            }
            else if (result.parent.parent.coveorequired && result.parent.parent.coveorequired.match("(" + baseRequiredOptionString + "s).*")) {
                result.parent.parent.coveorequired += "\n- [`" + result.name + "`]{@link " + result.parent.parent.name + ".options." + result.name + "}";
            }
            else {
                result.parent.parent.coveorequired = baseRequiredOptionString + ": [`" + result.name + "`]{@link " + result.parent.parent.name + ".options." + result.name + "}";
            }
            return "**Required**";
        }
    }
];
//# sourceMappingURL=coveoCustomTags.js.map