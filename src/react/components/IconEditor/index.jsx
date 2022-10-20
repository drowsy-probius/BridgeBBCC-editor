import React, { useEffect, useState } from "react";
import IconDetailView from "./IconDetailView";
import "./style.css";

function dcconListPreProcessor(text) {
  return text.trim()
          .replace("dcConsData = ", "")
          .replace(/;$/, "")
          .replaceAll(/,\s*([a-zA-Z]+):/g, ",\"$1\":")
          .replaceAll(/{\s*([a-zA-Z]+):/g, "{\"$1\":");
}


function IconEditor({path}) {
  const [configPath, setConfigPath] = useState("");
  const [dccon_listPath, setDccon_listPath] = useState("");
  const [dcconPath, setDcconPath] = useState("");

  const [dcconData, setDcconData] = useState([]);


  useEffect(() => {
    async function setCorePaths() {
      const data = await window.api.getCorePaths(path);
      setConfigPath(data.config);
      setDccon_listPath(data.dccon_list);
      setDcconPath(data.dccon);
    }

    setCorePaths();
  }, []);

  useEffect(() => {
    if(dccon_listPath.length === 0) return;

    async function readDcconList() {
      const data = await window.fs.readFileSync(dccon_listPath, {encoding: "utf8", flag: "r"});
      const jsonData = JSON.parse(dcconListPreProcessor(data));
      setDcconData(jsonData.slice(0, 50));
    }

    readDcconList();
  }, [dccon_listPath]);

  return (
    <div className="icon-edit">
      <div className="search-bar">
        <input type="text" />
      </div>

      <div className="icon-list">
        {
          dcconData.map((icon, idx) => <IconDetailView key={idx} icon={icon} dcconPath={dcconPath}/>)
        }
      </div>

      <div className="icon-add">
        Add New Icon
      </div>
    
    </div>
  )
}

export default IconEditor;