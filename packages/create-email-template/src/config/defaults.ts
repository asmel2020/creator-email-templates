import {
  DEFAULT_BLOCK_LIBRARY,
  DEFAULT_PALETTE,
  DEFAULT_SETTINGS,
} from "../core/default-blocks";
import {
  DEFAULT_VARIABLES,
  SAMPLE_CONTEXT,
  type EmailVariableSection,
} from "../core/variables";
import {
  buildBlockMap,
  type BlockDefinition,
  type EmailBlockProps,
} from "../core/types";
import { DEFAULT_LABELS } from "./types";
import type {
  BlockDefaultsMap,
  EmailBuilderConfig,
  ResolvedEmailBuilderConfig,
} from "./types";

const applyBlockDefaults = (
  library: BlockDefinition[],
  defaults?: BlockDefaultsMap,
): BlockDefinition[] =>
  library.map((def) => {
    const patch = defaults?.[def.type];
    if (!patch) return def;
    return {
      ...def,
      defaultProps: { ...def.defaultProps, ...patch } as EmailBlockProps,
    };
  });

export const resolveEmailBuilderConfig = (
  config?: EmailBuilderConfig,
): ResolvedEmailBuilderConfig => {
  const baseLibrary = config?.blockLibrary ?? DEFAULT_BLOCK_LIBRARY;
  const blockLibrary = applyBlockDefaults(baseLibrary, config?.blockDefaults);

  let variableSections: EmailVariableSection[];
  let variables: typeof DEFAULT_VARIABLES;

  if (config?.variableSections && config.variableSections.length > 0) {
    variableSections = config.variableSections;
    variables = variableSections.flatMap((s) => s.variables);
  } else if (config?.variables) {
    variableSections = [
      {
        id: "default",
        title: config.labels?.variablesGroup ?? DEFAULT_LABELS.variablesGroup,
        variables: config.variables,
      },
    ];
    variables = config.variables;
  } else {
    variableSections = [
      {
        id: "default",
        title: DEFAULT_LABELS.variablesGroup,
        variables: DEFAULT_VARIABLES,
      },
    ];
    variables = DEFAULT_VARIABLES;
  }

  return {
    variables,
    variableSections,
    blockLibrary,
    blockMap: buildBlockMap(blockLibrary),
    palette: { ...DEFAULT_PALETTE, ...config?.palette },
    defaultSettings: { ...DEFAULT_SETTINGS, ...config?.defaultSettings },
    sampleContext: config?.sampleContext ?? SAMPLE_CONTEXT,
    labels: { ...DEFAULT_LABELS, ...config?.labels },
    historyLimit: config?.historyLimit ?? 50,
  };
};