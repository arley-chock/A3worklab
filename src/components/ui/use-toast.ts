"use client"

import * as React from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000 // Aumentado para depuração

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
  duration?: number;
}

type State = {
  toasts: ToastProps[];
}

type Action = 
  | { type: "ADD_TOAST"; toast: ToastProps }
  | { type: "UPDATE_TOAST"; toast: Partial<ToastProps> }
  | { type: "DISMISS_TOAST"; toastId?: ToastProps["id"] }
  | { type: "REMOVE_TOAST"; toastId?: ToastProps["id"] }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
    case "UPDATE_TOAST":
      return { ...state, toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)) }
    case "DISMISS_TOAST":
      const { toastId } = action
      if (toastId) {
        return { ...state, toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)) }
      } else {
        return { ...state, toasts: [] }
      }
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) }
    default:
      return state
  }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

const dispatch = (action: Action) => {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Omit<ToastProps, "id">

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast: React.useCallback((props: Toast) => {
      const id = genId()
      const update = (props: Partial<ToastProps>) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
      const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

      dispatch({ type: "ADD_TOAST", toast: { ...props, id } })

      if (props.duration !== undefined) {
        setTimeout(() => dismiss(), props.duration)
      } else {
        // Default duration for toasts that don't specify
        setTimeout(() => dismiss(), TOAST_REMOVE_DELAY)
      }

      return { id, dismiss, update }
    }, []),
  }
}

export { useToast } 