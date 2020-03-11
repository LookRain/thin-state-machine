export enum INTERNAL_ACTION {
  ASSIGN = 'INTERNAL_ACTION.ASSIGN',
}
export type Action = (
  eventName: string,
  payload: any,
) => void | {type: string; payload: any};

export type Event = {type: string; payload?: any};
export type StateChart = {
  initialContext: any;
  initial: string;
  states: {
    [name: string]: ChartStateNode;
  };
  actions: {
    [fnName: string]: Action;
  };
};

export type ChartStateNode = {
  on: {
    [event: string]:
      | string
      | {target: string; actions?: Array<string | Action>};
  };
  entry?: Array<string | Action>;
  exit?: Array<string | Action>;
};

export type MachineStateNode = ChartStateNode & {
  value: string;
  context?: any;
  entryActions?: Array<{
    name: string;
    event: Event;
  }>;
};
export type Listener = (prop: MachineStateNode) => void;

export function Machine<GenericContext>(c: StateChart) {
  function transition(
    currentState: ChartStateNode,
    event: string,
  ): MachineStateNode {
    const nextState = currentState.on?.[event];

    if (typeof nextState === 'object') {
      const nextStateNode = c.states?.[nextState.target];
      const nextStateName = nextState.target;
      return {value: nextStateName, ...nextStateNode};
    }

    const nextStateNode = c.states?.[nextState];
    if (nextStateNode) {
      return {value: nextState, ...nextStateNode};
    }
    throw Error('Invalid transition');
  }
  return {
    initialContext: c.initialContext as GenericContext,
    initialState: {value: c.initial, ...c.states[c.initial]},
    actions: c.actions,
    transition,
  };
}

export type MachineType = ReturnType<typeof Machine>;

export function Interpreter<GenericContext>(machine: MachineType) {
  let currentState: MachineStateNode = machine.initialState;
  let context = machine.initialContext as GenericContext;

  const listeners = new Set<Listener>();
  function send(event: Event) {
    function handleAction(action: string | Action) {
      if (typeof action === 'string') {
        const actionFunctionAvailable = machine.actions?.[action];
        if (actionFunctionAvailable) {
          const actionReturn = actionFunctionAvailable(
            event.type,
            event.payload,
          );
          if (actionReturn && actionReturn.type === INTERNAL_ACTION.ASSIGN) {
            context = {
              ...context,
              ...actionReturn.payload
            };
          }
        }
      } else if (typeof action === 'function') {
        const actionReturn = action(event.type, event.payload);
        if (actionReturn && actionReturn.type === INTERNAL_ACTION.ASSIGN) {
          context = {
            ...context,
            ...actionReturn.payload
          };
        }
      }
    }

    // Remember: machine.transition() is a pure function
    const transitionDetail = currentState.on[event.type];
    if (!!transitionDetail && typeof transitionDetail !== 'string') {
      const {actions} = transitionDetail;

      if (actions && actions.length > 0) {
        actions.forEach(handleAction);
      }
    }

    try {
      const {exit} = currentState;
      if (exit) {
        exit.forEach(handleAction);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const nextState = machine.transition(currentState, event.type);
      const {entry} = nextState;
      // store event params here for user defined entry actions
      entry &&
        entry.forEach(entryAction => {
          if (typeof entryAction === 'string') {
            if (nextState.entryActions) {
              nextState.entryActions.push({
                name: entryAction,
                event,
              });
            } else {
              nextState.entryActions = [{
                name: entryAction,
                event,
              }];
            }
          } else {
            // entryAction();
            entryAction(event.type, event.payload);
          }
          // If the action is executable, execute it
          // entryAction.exec && entryAction.exec();
        });
      currentState = nextState;

      // Notify the listeners
      listeners.forEach(listener =>
        listener({
          ...currentState,
          // override state chart initial context with state machine context
          context: context,
        }),
      );
    } catch (err) {
      console.error(err);
    }
  }

  function listen(listener: Listener) {
    listener({
      ...currentState,
      // override state chart initial context with state machine context
      context: context,
    });
    listeners.add(listener);
  }

  function unlisten(listener: Listener) {
    listeners.delete(listener);
  }

  return {
    initialState: machine.initialState,
    listen,
    unlisten,
    send,
  };
}
