// Store vanilla minimalista: reemplaza a zustand/vanilla manteniendo la misma
// superficie de API (setState/getState/subscribe/getInitialState) para que el
// resto del paquete y sus consumidores no cambien.
export type VanillaStore<TState> = {
  setState: (
    partial: Partial<TState> | ((state: TState) => Partial<TState>),
  ) => void
  getState: () => TState
  getInitialState: () => TState
  subscribe: (
    listener: (state: TState, previousState: TState) => void,
  ) => () => void
}

export const createStore = <TState>(
  initializer: (
    set: VanillaStore<TState>["setState"],
    get: VanillaStore<TState>["getState"],
  ) => TState,
): VanillaStore<TState> => {
  let state: TState
  const listeners = new Set<(state: TState, previousState: TState) => void>()

  const setState: VanillaStore<TState>["setState"] = (partial) => {
    const nextState = typeof partial === "function" ? partial(state) : partial
    if (!Object.is(nextState, state)) {
      const previousState = state
      state =
        nextState !== null && typeof nextState === "object"
          ? Object.assign({}, state, nextState)
          : (nextState as TState)
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

  const getState = () => state

  const subscribe: VanillaStore<TState>["subscribe"] = (listener) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  const initialState = initializer(setState, getState)
  state = initialState

  return {
    setState,
    getState,
    getInitialState: () => initialState,
    subscribe,
  }
}
