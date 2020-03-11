import { MachineType, MachineStateNode } from './state-machine';
export declare function useMachine(machine: MachineType): [MachineStateNode, (event: import("./state-machine").Event) => void];
