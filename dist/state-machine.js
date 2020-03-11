export var INTERNAL_ACTION;
(function (INTERNAL_ACTION) {
    INTERNAL_ACTION["ASSIGN"] = "INTERNAL_ACTION.ASSIGN";
})(INTERNAL_ACTION || (INTERNAL_ACTION = {}));
export function Machine(c) {
    function transition(currentState, event) {
        var _a, _b, _c;
        const nextState = (_a = currentState.on) === null || _a === void 0 ? void 0 : _a[event];
        if (typeof nextState === 'object') {
            const nextStateNode = (_b = c.states) === null || _b === void 0 ? void 0 : _b[nextState.target];
            const nextStateName = nextState.target;
            return Object.assign({ value: nextStateName }, nextStateNode);
        }
        const nextStateNode = (_c = c.states) === null || _c === void 0 ? void 0 : _c[nextState];
        if (nextStateNode) {
            return Object.assign({ value: nextState }, nextStateNode);
        }
        throw Error('Invalid transition');
    }
    return {
        initialContext: c.initialContext,
        initialState: Object.assign({ value: c.initial }, c.states[c.initial]),
        actions: c.actions,
        transition,
    };
}
export function Interpreter(machine) {
    let currentState = machine.initialState;
    let context = machine.initialContext;
    const listeners = new Set();
    function send(event) {
        function handleAction(action) {
            var _a;
            if (typeof action === 'string') {
                const actionFunctionAvailable = (_a = machine.actions) === null || _a === void 0 ? void 0 : _a[action];
                if (actionFunctionAvailable) {
                    const actionReturn = actionFunctionAvailable(event.type, event.payload);
                    if (actionReturn && actionReturn.type === INTERNAL_ACTION.ASSIGN) {
                        context = Object.assign(Object.assign({}, context), actionReturn.payload);
                    }
                }
            }
            else if (typeof action === 'function') {
                const actionReturn = action(event.type, event.payload);
                if (actionReturn && actionReturn.type === INTERNAL_ACTION.ASSIGN) {
                    context = Object.assign(Object.assign({}, context), actionReturn.payload);
                }
            }
        }
        const transitionDetail = currentState.on[event.type];
        if (!!transitionDetail && typeof transitionDetail !== 'string') {
            const { actions } = transitionDetail;
            if (actions && actions.length > 0) {
                actions.forEach(handleAction);
            }
        }
        try {
            const { exit } = currentState;
            if (exit) {
                exit.forEach(handleAction);
            }
        }
        catch (err) {
            console.error(err);
        }
        try {
            const nextState = machine.transition(currentState, event.type);
            const { entry } = nextState;
            entry &&
                entry.forEach(entryAction => {
                    if (typeof entryAction === 'string') {
                        if (nextState.entryActions) {
                            nextState.entryActions.push({
                                name: entryAction,
                                event,
                            });
                        }
                        else {
                            nextState.entryActions = [{
                                    name: entryAction,
                                    event,
                                }];
                        }
                    }
                    else {
                        entryAction(event.type, event.payload);
                    }
                });
            currentState = nextState;
            listeners.forEach(listener => listener(Object.assign(Object.assign({}, currentState), { context: context })));
        }
        catch (err) {
            console.error(err);
        }
    }
    function listen(listener) {
        listener(Object.assign(Object.assign({}, currentState), { context: context }));
        listeners.add(listener);
    }
    function unlisten(listener) {
        listeners.delete(listener);
    }
    return {
        initialState: machine.initialState,
        listen,
        unlisten,
        send,
    };
}
//# sourceMappingURL=state-machine.js.map