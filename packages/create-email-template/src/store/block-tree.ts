// Operaciones puras sobre el árbol de bloques (profundidad máxima 1).
// Un bloque anidado vive en `container.props.blocks` o en
// `columns.props.columns[].blocks`. `BlockLocation` identifica la lista que lo
// contiene: vacío = raíz, `{ parentId }` = contenedor, `{ parentId, columnId }`
// = columna.
import {
  isContainerType,
  type ColumnsProps,
  type ContainerProps,
  type EmailBlock,
  type EmailBlockProps,
  type EmailBlockType,
} from "../core/types";

export interface BlockLocation {
  parentId?: string;
  columnId?: string;
}

type NestedProps = {
  blocks?: EmailBlock[];
  columns?: { id: string; blocks: EmailBlock[] }[];
};

export const locationKey = (loc?: BlockLocation): string =>
  loc?.parentId ? `${loc.parentId}/${loc.columnId ?? ""}` : "root";

/** ¿Se puede insertar `type` en `location` sin exceder la profundidad máxima? */
export const canNestType = (
  type: EmailBlockType,
  location?: BlockLocation,
): boolean => !location?.parentId || !isContainerType(type);

export const getBlockList = (
  blocks: EmailBlock[],
  location?: BlockLocation,
): EmailBlock[] => {
  if (!location?.parentId) return blocks;
  const parent = blocks.find((b) => b.id === location.parentId);
  if (!parent) return [];
  const props = parent.props as NestedProps;
  if (location.columnId) {
    return props.columns?.find((c) => c.id === location.columnId)?.blocks ?? [];
  }
  return props.blocks ?? [];
};

export const setBlockList = (
  blocks: EmailBlock[],
  location: BlockLocation | undefined,
  next: EmailBlock[],
): EmailBlock[] => {
  if (!location?.parentId) return next;
  return blocks.map((b) => {
    if (b.id !== location.parentId) return b;
    if (location.columnId) {
      const props = b.props as ColumnsProps;
      return {
        ...b,
        props: {
          ...props,
          columns: (props.columns ?? []).map((c) =>
            c.id === location.columnId ? { ...c, blocks: next } : c,
          ),
        } as EmailBlockProps,
      };
    }
    return {
      ...b,
      props: { ...(b.props as ContainerProps), blocks: next } as EmailBlockProps,
    };
  });
};

const childBlocks = (block: EmailBlock): EmailBlock[] => {
  if (!isContainerType(block.type)) return [];
  const props = block.props as NestedProps;
  if (props.columns) return props.columns.flatMap((c) => c.blocks);
  return props.blocks ?? [];
};

export const findBlockDeep = (
  blocks: EmailBlock[],
  id: string,
): EmailBlock | null => {
  for (const b of blocks) {
    if (b.id === id) return b;
    for (const child of childBlocks(b)) {
      if (child.id === id) return child;
    }
  }
  return null;
};

export const findBlockLocation = (
  blocks: EmailBlock[],
  id: string,
): { location: BlockLocation; index: number } | null => {
  const rootIndex = blocks.findIndex((b) => b.id === id);
  if (rootIndex !== -1) return { location: {}, index: rootIndex };

  for (const b of blocks) {
    if (!isContainerType(b.type)) continue;
    const props = b.props as NestedProps;
    if (props.blocks) {
      const i = props.blocks.findIndex((c) => c.id === id);
      if (i !== -1) return { location: { parentId: b.id }, index: i };
    }
    for (const col of props.columns ?? []) {
      const i = col.blocks.findIndex((c) => c.id === id);
      if (i !== -1) {
        return { location: { parentId: b.id, columnId: col.id }, index: i };
      }
    }
  }
  return null;
};

export const updateBlockDeep = (
  blocks: EmailBlock[],
  id: string,
  props: EmailBlockProps,
): EmailBlock[] => {
  const found = findBlockLocation(blocks, id);
  if (!found) return blocks;
  const list = getBlockList(blocks, found.location);
  return setBlockList(
    blocks,
    found.location,
    list.map((b) => (b.id === id ? { ...b, props } : b)),
  );
};

export const removeBlockDeep = (
  blocks: EmailBlock[],
  id: string,
): EmailBlock[] => {
  const found = findBlockLocation(blocks, id);
  if (!found) return blocks;
  const list = getBlockList(blocks, found.location);
  return setBlockList(
    blocks,
    found.location,
    list.filter((b) => b.id !== id),
  );
};
