import { Reflection, ReflectionKind, ContainerReflection, DeclarationReflection } from '../../models/reflections/index';
import { ReflectionGroup } from '../../models/ReflectionGroup';
import { SourceDirectory } from '../../models/sources/directory';
import { Component, ConverterComponent } from '../components';
import { Converter } from '../converter';
import { Context } from '../context';

const camelCaseToHyphenRegex = /([A-Z])|\W+(\w)/g;

/**
 * A handler that sorts and groups the found reflections in the resolving phase.
 *
 * The handler sets the ´groups´ property of all reflections.
 */
@Component({ name: 'group' })
export class GroupPlugin extends ConverterComponent {
    /**
     * Define the sort order of reflections.
     */
    static WEIGHTS = [
        ReflectionKind.Global,
        ReflectionKind.ExternalModule,
        ReflectionKind.Module,
        ReflectionKind.Enum,
        ReflectionKind.EnumMember,
        ReflectionKind.Class,
        ReflectionKind.Interface,
        ReflectionKind.TypeAlias,
        ReflectionKind.Method,

        ReflectionKind.Event,
        ReflectionKind.Property,
        ReflectionKind.Variable,
        ReflectionKind.Function,
        ReflectionKind.Accessor,
        ReflectionKind.ObjectLiteral,
        ReflectionKind.Constructor,

        ReflectionKind.Parameter,
        ReflectionKind.TypeParameter,
        ReflectionKind.TypeLiteral,
        ReflectionKind.CallSignature,
        ReflectionKind.ConstructorSignature,
        ReflectionKind.IndexSignature,
        ReflectionKind.GetSignature,
        ReflectionKind.SetSignature
    ];

    /**
     * Define the singular name of individual reflection kinds.
     */
    static SINGULARS = (function () {
        const singulars = {};
        singulars[ReflectionKind.Enum] = 'Enumeration';
        singulars[ReflectionKind.EnumMember] = 'Enumeration member';
        return singulars;
    })();

    /**
     * Define the plural name of individual reflection kinds.
     */
    static PLURALS = (function () {
        const plurals = {};
        plurals[ReflectionKind.Class] = 'Classes';
        plurals[ReflectionKind.Property] = 'Properties';
        plurals[ReflectionKind.Enum] = 'Enumerations';
        plurals[ReflectionKind.EnumMember] = 'Enumeration members';
        plurals[ReflectionKind.TypeAlias] = 'Type aliases';
        return plurals;
    })();

    /**
     * Create a new GroupPlugin instance.
     */
    initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_RESOLVE]: this.onResolve,
            [Converter.EVENT_RESOLVE_END]: this.onEndResolve
        });
    }

    /**
     * Triggered when the converter resolves a reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param reflection  The reflection that is currently resolved.
     */
    private onResolve(context: Context, reflection: Reflection) {
        reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);

        if (reflection instanceof ContainerReflection) {
            const container = <ContainerReflection>reflection;
            if (container.children && container.children.length > 0) {
                container.children.sort(GroupPlugin.sortCallback);
                container.groups = GroupPlugin.getReflectionGroups(container.children);
            }
        }
    }

    /**
     * Triggered when the converter has finished resolving a project.
     *
     * @param context  The context object describing the current state the converter is in.
     */
    private onEndResolve(context: Context) {
        function walkDirectory(directory: SourceDirectory) {
            directory.groups = GroupPlugin.getReflectionGroups(directory.getAllReflections());

            for (let key in directory.directories) {
                if (!directory.directories.hasOwnProperty(key)) {
                    continue;
                }
                walkDirectory(directory.directories[key]);
            }
        }

        const project = context.project;
        if (project.children && project.children.length > 0) {
            project.children.sort(GroupPlugin.sortCallback);
            project.groups = GroupPlugin.getReflectionGroups(project.children);
        }

        walkDirectory(project.directory);
        project.files.forEach((file) => {
            file.groups = GroupPlugin.getReflectionGroups(file.reflections);
        });
    }

    /**
     * Create a grouped representation of the given list of reflections.
     *
     * Reflections are grouped by kind and sorted by weight and name.
     *
     * @param reflections  The reflections that should be grouped.
     * @returns An array containing all children of the given reflection grouped by their kind.
     */
    static getReflectionGroups(reflections: Reflection[]): ReflectionGroup[] {
        const groups: ReflectionGroup[] = [];
        reflections.forEach((child) => {
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                if (group.kind !== child.kind) {
                    continue;
                }

                group.children.push(child);
                return;
            }

            const group = new ReflectionGroup(GroupPlugin.getKindPlural(child.kind), child.kind);
            if (child.flags.isCoveoComponentOptions) {
                group.title = 'Component Options';
            }
            group.children.push(child);
            if (group.title == 'Component Options') {
                if (group.children[0]['children']) {
                    group.children = group.children[0]['children'];
                    group.children.forEach((child) => {
                        if (child.name) {
                            if (child['type']) {
                                const valuesExamples = child.examples ? child.examples : GroupPlugin.getMarkupValueExampleFromType(child['type'].name, child);
                                child.markupExample = valuesExamples.map((example) => {
                                    return `data-${child.name.replace(camelCaseToHyphenRegex, '-$1$2').toLowerCase()}='${example}'`;
                                }).join('\n');
                                if (child.markupExample == '') {
                                    child.markupExample = null;
                                }
                            }
                        }
                        if (child.comment.hasTag('notsupportedin')) {
                            var tag = child.comment.getTag('notsupportedin');
                            tag.tagName = 'Not supported in';
                        }
                    })
                }
            }
            groups.push(group);
        });

        groups.forEach((group) => {
            let someExported = false, allInherited = true, allPrivate = true, allProtected = true, allExternal = true;
            group.children.forEach((child) => {
                someExported = child.flags.isExported || someExported;
                allPrivate = child.flags.isPrivate && allPrivate;
                allProtected = (child.flags.isPrivate || child.flags.isProtected) && allProtected;
                allExternal = child.flags.isExternal && allExternal;

                if (child instanceof DeclarationReflection) {
                    allInherited = child.inheritedFrom && allInherited;
                } else {
                    allInherited = false;
                }
            });

            group.someChildrenAreExported = someExported;
            group.allChildrenAreInherited = allInherited;
            group.allChildrenArePrivate = allPrivate;
            group.allChildrenAreProtectedOrPrivate = allProtected;
            group.allChildrenAreExternal = allExternal;
        });

        return groups;
    }

    private static getMarkupValueExampleFromType(name: string, ref: Reflection): string[] {
        let ret = [];
        if (ref && ref['type'] && ref['type'].constructor.name.toLowerCase() == 'uniontype') {
            ret = GroupPlugin.getMarkupValueExampleForUnionType(ref);
        } else if (name) {
            switch (name.toLowerCase()) {
                case 'boolean':
                    ret = ['true', 'false'];
                    break;
                case 'string':
                    ret = ['foo'];
                    break;
                case 'ifieldoption':
                    ret = ['@foo'];
                    break;
                case 'number':
                    ret = ['10'];
                    break;
                case 'array':
                    if (ref['type'] && ref['type'].typeArguments && ref['type'].typeArguments[0]) {
                        ret = GroupPlugin.getMarkupValueExampleFromType(ref['type'].typeArguments[0].name, ref);
                        ret = ret.map((example) => {
                            return `${example},${example}2`;
                        })
                    }
                    break;
            }
        }
        return ret;
    }

    private static getMarkupValueExampleForUnionType = function (ref) {
        var ret = [];
        if (ref && ref.type && ref.type.types[0] && ref.type.types[0].typeArguments && ref.type.types[0].typeArguments[0]) {
            if (ref.type.types[0].typeArguments[0].constructor.name.toLowerCase() == 'uniontype') {
                ret = ref.type.types[0].typeArguments[0].types.map(function (type) {
                    return type.value;
                });
                if (ref.type.types[0].name && ref.type.types[0].name.toLowerCase() == 'array') {
                    var copy = [];
                    for (var i = 0; i < ret.length; i++) {
                        copy[i] = ret.slice(0, i + 1).join(',');
                    }
                    ret = copy;
                }
                ret = ret.slice(0, 4);
            } else {
                ret = GroupPlugin.getMarkupValueExampleFromType(ref.type.types[0].typeArguments[0].name, undefined);
            }
        }
        return ret;

    }

    /**
     * Transform the internal typescript kind identifier into a human readable version.
     *
     * @param kind  The original typescript kind identifier.
     * @returns A human readable version of the given typescript kind identifier.
     */
    private static getKindString(kind: ReflectionKind): string {
        let str = ReflectionKind[kind];
        str = str.replace(/(.)([A-Z])/g, (m, a, b) => a + ' ' + b.toLowerCase());
        return str;
    }

    /**
     * Return the singular name of a internal typescript kind identifier.
     *
     * @param kind The original internal typescript kind identifier.
     * @returns The singular name of the given internal typescript kind identifier
     */
    static getKindSingular(kind: ReflectionKind): string {
        if (GroupPlugin.SINGULARS[kind]) {
            return GroupPlugin.SINGULARS[kind];
        } else {
            return GroupPlugin.getKindString(kind);
        }
    }

    /**
     * Return the plural name of a internal typescript kind identifier.
     *
     * @param kind The original internal typescript kind identifier.
     * @returns The plural name of the given internal typescript kind identifier
     */
    static getKindPlural(kind: ReflectionKind): string {
        if (GroupPlugin.PLURALS[kind]) {
            return GroupPlugin.PLURALS[kind];
        } else {
            return this.getKindString(kind) + 's';
        }
    }

    /**
     * Callback used to sort reflections by weight defined by ´GroupPlugin.WEIGHTS´ and name.
     *
     * @param a The left reflection to sort.
     * @param b The right reflection to sort.
     * @returns The sorting weight.
     */
    static sortCallback(a: Reflection, b: Reflection): number {
        const aWeight = GroupPlugin.WEIGHTS.indexOf(a.kind);
        const bWeight = GroupPlugin.WEIGHTS.indexOf(b.kind);
        if (aWeight === bWeight) {
            if (a.flags.isStatic && !b.flags.isStatic) {
                return 1;
            }
            if (!a.flags.isStatic && b.flags.isStatic) {
                return -1;
            }
            if (a.name === b.name) {
                return 0;
            }
            return a.name > b.name ? 1 : -1;
        } else {
            return aWeight - bWeight;
        }
    }
}
