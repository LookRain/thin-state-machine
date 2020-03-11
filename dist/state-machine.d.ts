export declare enum INTERNAL_ACTION {
    ASSIGN = "INTERNAL_ACTION.ASSIGN"
}
export declare type Action = (eventName: string, payload: any) => void | {
    type: string;
    payload: any;
};
export declare type Event = {
    type: string;
    payload?: any;
};
export declare type StateChart = {
    initialContext: any;
    initial: string;
    states: {
        [name: string]: ChartStateNode;
    };
    actions: {
        [fnName: string]: Action;
    };
};
export declare type ChartStateNode = {
    on: {
        [event: string]: string | {
            target: string;
            actions?: Array<string | Action>;
        };
    };
    entry?: Array<string | Action>;
    exit?: Array<string | Action>;
};
export declare type MachineStateNode = ChartStateNode & {
    value: string;
    context?: any;
    entryActions?: Array<{
        name: string;
        event: Event;
    }>;
};
export declare type Listener = (prop: MachineStateNode) => void;
export declare function Machine(c: StateChart): {
    initialContext: any;
    initialState: {
        on: {
            [event: string]: string | {
                target: string;
                actions?: (string | Action)[] | undefined;
            };
        };
        entry?: (string | Action)[] | undefined;
        exit?: (string | Action)[] | undefined;
        value: string;
    };
    actions: {
        [fnName: string]: Action;
    };
    transition: (currentState: ChartStateNode, event: string) => MachineStateNode;
};
export declare type MachineType = ReturnType<typeof Machine>;
export declare function Interpreter(machine: MachineType): {
    initialState: {
        on: {
            [event: string]: string | {
                target: string;
                actions?: (string | Action)[] | undefined;
            };
        };
        entry?: (string | Action)[] | undefined;
        exit?: (string | Action)[] | undefined;
        value: string;
    };
    listen: (listener: Listener) => void;
    unlisten: (listener: Listener) => void;
    send: (event: Event) => void;
};
