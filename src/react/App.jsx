import React, { useState } from "react";

import DirectorySelector from "./components/DirectorySelector";
import IconEditor from "./components/IconEditor";

function App(){
  const [path, setPath] = useState("C:/Users/k123s/Desktop/workspace/BridgeBBCC");

  return (
    <div className="app">
      {
        path.length === 0
        ?
        <DirectorySelector setPath={setPath}/>
        :
        <IconEditor path={path} />
      }
    </div>
  )
}

export default App;