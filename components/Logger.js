import { useAtom } from 'jotai';
import { logAtom } from '../data/atoms';

// To use:
// Import the component at the top of your file: import Logger from '../components/Logger';
// Then initialize it with the name of your component: const { Log } = Logger('MyComponent');
// You can then use the Log function to log messages and data: Log('This is a log message', { some: 'data' });

export default function Logger(componentName) {
  const [logs, setLogs] = useAtom(logAtom);

  const Log = (title, data) => {
    console.log(title, data);
    setLogs([...logs, {
      time: Date.now(),
      component: componentName,
      title: title,
      body: JSON.stringify(data, null, 2)
    }]);
  };
  
  return { Log };
}

