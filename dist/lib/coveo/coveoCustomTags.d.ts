import { Reflection } from "../..";
export interface ICoveoCustomTag {
    name: CoveoCustomTagNames;
    type: CoveoCustomTagTypes;
    func: ICoveoCustomTagFunction;
}
export interface ICoveoCustomTagFunction {
    (value: any, result?: Reflection): string;
}
export declare enum CoveoCustomTagNames {
    AvailableSince = "availableSince",
    Default = "default",
    DependsOn = "dependsOn",
    DeprecatedSince = "deprecatedSince",
    ExternalDocs = "externalDocs",
    IsResultTemplateComponent = "isResultTemplateComponent",
    Maximum = "maximum",
    Minimum = "minimum",
    Required = "required",
}
export declare enum CoveoCustomTagTypes {
    Boolean = "boolean",
    List = "list",
    Scalar = "scalar",
}
export declare const coveoTags: ICoveoCustomTag[];
