import {Interpreter, MachineType, MachineStateNode} from './state-machine';
import {useEffect, useRef, useState} from 'react';

export function useMachine(machine: MachineType) {
  const interpreter = useRef(Interpreter(machine));
  const [node, setNode] = useState<MachineStateNode>(
    interpreter.current.initialState,
  );
  useEffect(() => {
    interpreter.current.listen(newState => {
      setNode(newState);
    });
  }, []);

  return [node, interpreter.current.send] as [
    typeof node,
    typeof interpreter.current.send,
  ];
}
