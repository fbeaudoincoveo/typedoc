import { Reflection } from "../..";

export interface ICoveoCustomTag {
  name: CoveoCustomTagNames,
  type: CoveoCustomTagTypes,
  func: ICoveoCustomTagFunction
}

export interface ICoveoCustomTagFunction {
  (value: any, result?: Reflection): string
}

export enum CoveoCustomTagNames {
  AvailableSince = "availableSince",
  Default = "default",
  DependsOn = "dependsOn",
  DeprecatedSince = "deprecatedSince",
  // Examples = "examples",
  ExternalDocs = "externalDocs",
  IsResultTemplateComponent = "isResultTemplateComponent",
  Maximum = "maximum",
  Minimum = "minimum",
  // NotSupportedIn = "notSupportedIn",
  Required = "required"
}

export enum CoveoCustomTagTypes {
  Boolean = "boolean",
  List = "list",
  Scalar = "scalar"
}

export const coveoTags: ICoveoCustomTag[] = [
  {
      name: CoveoCustomTagNames.AvailableSince,
      type: CoveoCustomTagTypes.Scalar,
      func: (releaseNotesLink: string) => {
          if (!releaseNotesLink) {
              return "";
          }
          return `**Available since:** ${releaseNotesLink}`;
      }
  },
  {
      name: CoveoCustomTagNames.Default,
      type: CoveoCustomTagTypes.Scalar,
      func: (defaultComponentOptionValue: boolean|number|string) => {
          if (!defaultComponentOptionValue) {
              return "";
          }
          return `**Default:** \`${defaultComponentOptionValue.toString()}\``;
      }
  },
  {
      name: CoveoCustomTagNames.DependsOn,
      type: CoveoCustomTagTypes.List,
      func: (componentOptions: string[], result: Reflection) => {
          if (!componentOptions) {
              return "";
          }
          let dependsOnString = "This option is only effective when the";
          if (componentOptions.length === 1) {
              // e.g., @dependsOn field => "See also [`field`]{@link Facet.options.field}.""
              return `${dependsOnString} [\`${componentOptions[0]}\`]{@link ${result.parent.parent.name}.options.${componentOptions[0]}} option is set to \`true\`.`
          }

          dependsOnString = "This option is only effective when the following options are set to `true`:"
          componentOptions.forEach((componentOption, index) => {
              // e.g., @dependsOn field, id => See also:\n-[`field`]{@link Facet.options.field}\n-[`id`]{@link Facet.options.id}
              dependsOnString += `\n- [\`${componentOption}\`]{@link ${result.parent.parent.name}.options.${componentOption}}`;
          })
          return dependsOnString;
      }
  },
  {
      name: CoveoCustomTagNames.DeprecatedSince,
      type: CoveoCustomTagTypes.Scalar,
      func: (releaseNotesLink: string) => {
          if (!releaseNotesLink) {
              return ""
          }
          return `**Deprecated since:** ${releaseNotesLink}`;
      }
  },
  // {
  //     name: CoveoCustomTagNames.Examples,
  //     type: CoveoCustomTagTypes.List,
  //     func: (componentOptionExamples: string[]) => {
  //         if (!componentOptionExamples) {
  //             return "";
  //         }
  //         return ``;
  //     }
  // },
  {
      name: CoveoCustomTagNames.ExternalDocs,
      type: CoveoCustomTagTypes.List,
      func: (externalDocsLinks: string[]) => {
          if (!externalDocsLinks) {
              return "";
          }
          if (externalDocsLinks.length === 1) {
              return `See ${externalDocsLinks[0]}.`
          }
          let externalDocsString = "See:";
          externalDocsLinks.forEach((externalDocsLink) => {
              externalDocsString += `\n- ${externalDocsLink}`;
          })
          return externalDocsString;
      }
  },
  {
      name: CoveoCustomTagNames.IsResultTemplateComponent,
      type: CoveoCustomTagTypes.Boolean,
      func: (isResultTemplateComponent: boolean) => {
          if (!isResultTemplateComponent) {
              return "";
          }
          return "This is a [result template](https://docs.coveo.com/en/413/) component.";
      }
  },
  {
      name: CoveoCustomTagNames.Maximum,
      type: CoveoCustomTagTypes.Scalar,
      func: (maximumComponentOptionValue: number) => {
          if (!maximumComponentOptionValue) {
              return "";
          }
          return `**Maximum:** \`${maximumComponentOptionValue}\``;
      }
  },
  {
      name: CoveoCustomTagNames.Minimum,
      type: CoveoCustomTagTypes.Scalar,
      func: (minimumComponentOptionValue: number) => {
          if (!minimumComponentOptionValue) {
              return "";
          }
          return `**Minimum:** \`${minimumComponentOptionValue}\``;
      }
  },
  // {
  //     name: CoveoCustomTagNames.NotSupportedIn,
  //     type: CoveoCustomTagTypes.List,
  //     func: (notSupportedIn: string[]) => {
  //         if (!notSupportedIn) {
  //             return "";
  //         }
  //         return ``
  //     }
  // },
  {
      name: CoveoCustomTagNames.Required,
      type: CoveoCustomTagTypes.Boolean,
      func: (isComponentOptionRequired: boolean, result: Reflection) => {
          if (!isComponentOptionRequired) {
              return "";
          }
          const baseRequiredOptionString = "Required option"
          if (result.parent.parent.coveorequired && result.parent.parent.coveorequired.match(`(${baseRequiredOptionString}: ).*`)) {
              const firstRequiredOptionLink = result.parent.parent.coveorequired.replace(baseRequiredOptionString + ': ', "");
              result.parent.parent.coveorequired = `${baseRequiredOptionString}s:\n- ${firstRequiredOptionLink}\n- [\`${result.name}\`]{@link ${result.parent.parent.name}.options.${result.name}}`
          } else if (result.parent.parent.coveorequired && result.parent.parent.coveorequired.match(`(${baseRequiredOptionString}s).*`)) {
              result.parent.parent.coveorequired += `\n- [\`${result.name}\`]{@link ${result.parent.parent.name}.options.${result.name}}`
          } else {
              result.parent.parent.coveorequired = `${baseRequiredOptionString}: [\`${result.name}\`]{@link ${result.parent.parent.name}.options.${result.name}}`
          }
          return "**Required**";
      }
  }
]