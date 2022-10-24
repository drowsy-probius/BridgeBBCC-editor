import React from "react";

import { useSelector } from "react-redux";
import { selectAppPath } from "./redux/appPath";

import DirectorySelector from "./components/DirectorySelector";
import IconList from "./components/IconList";

function App(){
  const appPath = useSelector(selectAppPath);

  return (
    <div className="app">
      {
        typeof(appPath.root) === "string" && appPath.root.length === 0
        ?
        <DirectorySelector />
        :
        <IconList />
      }
    </div>
  )
}

export default App;