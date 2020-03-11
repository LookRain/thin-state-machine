import { Interpreter } from './state-machine';
import { useEffect, useRef, useState } from 'react';
export function useMachine(machine) {
    const interpreter = useRef(Interpreter(machine));
    const [node, setNode] = useState(interpreter.current.initialState);
    useEffect(() => {
        interpreter.current.listen(newState => {
            setNode(newState);
        });
    }, []);
    return [node, interpreter.current.send];
}
//# sourceMappingURL=useMachine.js.map