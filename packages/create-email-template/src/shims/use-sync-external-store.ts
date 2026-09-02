// @base-ui/react depende del paquete CJS "use-sync-external-store", que
// internamente hace require("react") y rompe el bundle ESM de la librería en
// dev (Vite). Este stub lo reemplaza usando primitivas nativas de React 18+:
// misma superficie de API, sin CJS ni dependencia extra.
import { useMemo, useSyncExternalStore } from "react";

export { useSyncExternalStore } from "react";

type Subscribe = (onStoreChange: () => void) => () => void;

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: Subscribe,
  getSnapshot: () => Snapshot,
  getServerSnapshot: (() => Snapshot) | null,
  selector: (snapshot: Snapshot) => Selection,
  isEqual: (a: Selection, b: Selection) => boolean = Object.is,
): Selection {
  // Memoiza la selección: solo cambia si el snapshot cambia o la selección
  // nueva no es igual a la anterior (misma semántica que el shim oficial).
  const getSelection = useMemo(() => {
    let hasMemo = false;
    let memoizedSnapshot: Snapshot;
    let memoizedSelection: Selection;
    return (nextSnapshot: Snapshot): Selection => {
      if (hasMemo) {
        if (Object.is(memoizedSnapshot, nextSnapshot)) {
          return memoizedSelection;
        }
        const nextSelection = selector(nextSnapshot);
        if (isEqual(memoizedSelection, nextSelection)) {
          memoizedSnapshot = nextSnapshot;
          return memoizedSelection;
        }
        memoizedSnapshot = nextSnapshot;
        memoizedSelection = nextSelection;
        return nextSelection;
      }
      hasMemo = true;
      memoizedSnapshot = nextSnapshot;
      memoizedSelection = selector(nextSnapshot);
      return memoizedSelection;
    };
  }, [selector, isEqual]);

  return useSyncExternalStore(
    subscribe,
    () => getSelection(getSnapshot()),
    getServerSnapshot === null
      ? undefined
      : () => getSelection(getServerSnapshot()),
  );
}
