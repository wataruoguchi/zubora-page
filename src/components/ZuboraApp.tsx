import React, { useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { ZuboraStoreContext } from '../store/ZuboraStore';

import AceEditor from 'react-ace';
require('ace-builds/src-noconflict/mode-json');
require('ace-builds/src-noconflict/mode-typescript');
require('ace-builds/src-noconflict/snippets/json');
require('ace-builds/src-noconflict/snippets/typescript');
require('ace-builds/src-noconflict/theme-tomorrow');
import ZuboraWorker from 'worker-loader?name=static/[hash].worker.js!../workers/zubora.worker';

const initialCode = `export function greeter(person: string) {
  return "Hello, " + person;
}

class iAmClass {
  constructor() {}
  async myAsync() { return await 'It takes some time' }
  myMethod(str: string) { return str }
}

function iWillBeRenamed() {
  return true;
}

async function iAmDefaultAndAsync() {}

export { iAmClass, iWillBeRenamed as iAmRenamed, iAmDefaultAndAsync as default }
`;

let worker;
const ZuboraApp: React.FC = observer(
  (): React.ReactElement => {
    const zuboraStore = useContext(ZuboraStoreContext);

    /** Zubora worker */
    useEffect(() => {
      if (!worker) {
        worker = new ZuboraWorker();
      }
      return () => worker.terminate();
    }, []);
    function onMessage({ data }): void {
      zuboraStore.result = data;
    }
    function invokeWorker(value: string) {
      if (!worker) {
        worker = new ZuboraWorker();
      }
      worker.onmessage = onMessage;
      zuboraStore.code = value;
      worker.postMessage(value);
    }
    function aceOnChange(value: string) {
      invokeWorker(value);
    }
    function aceOnLoad() {
      zuboraStore.code = initialCode;
      invokeWorker(initialCode);
    }

    const aceEditorCommonProps = {
      height: 'calc(100vh - 100px)',
      width: '100%',
      theme: 'tomorrow',
      fontSize: 16,
      showPrintMargin: true,
      showGutter: true,
      highlightActiveLine: true,
      setOptions: {
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
        fontFamily: "'Ubuntu Mono', monospace",
      },
    };

    return (
      <div className="grid grid-rows-2 md:grid-rows-1 lg:grid-rows-1 xl:grid-rows-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 md-1">
        <div>
          <h2>&#x1f9a5; Input your JS/TS module code:</h2>
          <AceEditor
            height={aceEditorCommonProps.height}
            width={aceEditorCommonProps.width}
            theme={aceEditorCommonProps.theme}
            fontSize={aceEditorCommonProps.fontSize}
            showPrintMargin={aceEditorCommonProps.showPrintMargin}
            showGutter={aceEditorCommonProps.showPrintMargin}
            highlightActiveLine={aceEditorCommonProps.highlightActiveLine}
            setOptions={aceEditorCommonProps.setOptions}
            placeholder="Input your JS / TS module code here."
            mode="typescript"
            value={zuboraStore.code}
            onLoad={aceOnLoad}
            onChange={aceOnChange}
          />
        </div>
        <div>
          <h2>&#x1f913; Test template generated by Zubora:</h2>
          <AceEditor
            height={aceEditorCommonProps.height}
            width={aceEditorCommonProps.width}
            theme={aceEditorCommonProps.theme}
            fontSize={aceEditorCommonProps.fontSize}
            showPrintMargin={aceEditorCommonProps.showPrintMargin}
            showGutter={aceEditorCommonProps.showPrintMargin}
            highlightActiveLine={aceEditorCommonProps.highlightActiveLine}
            setOptions={aceEditorCommonProps.setOptions}
            placeholder="Zubora Result will appear here."
            mode={
              typeof zuboraStore.result === 'string' ? 'typescript' : 'json'
            }
            value={
              typeof zuboraStore.result === 'string'
                ? zuboraStore.result
                : JSON.stringify(zuboraStore.result)
            }
            readOnly={true}
          />
        </div>
        <style jsx>{`
          h2 {
            @apply pt-2 pb-3 pl-2 text-lg font-bold text-gray-700;
          }
        `}</style>
      </div>
    );
  }
);
export { ZuboraApp };
