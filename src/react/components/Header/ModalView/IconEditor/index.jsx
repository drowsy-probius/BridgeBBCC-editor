import React from "react";

import { IMAGE_EXTENSIONS } from "../../../../../constants";
import { IconImageView } from "../../../components";

function ValueEditor(props) {
  const {keyName, value, onChangeHandler} = props;

  return (
    <>
      <label htmlFor={keyName}>{keyName}</label>
      {
        typeof(value) === "boolean"
        ?
        <input type="checkbox" name={keyName} id={keyName} checked={value} data-type={"boolean"} onChange={onChangeHandler}/> 
        :
        Array.isArray(value)
        ?
        <input type="text" name={keyName} id={keyName} value={value.join(",")} data-type={"array"} onChange={onChangeHandler}/>
        :
        <input type="text" name={keyName} id={keyName} value={value} data-type={"string"} onChange={onChangeHandler}/>
      }
    </>
  )
}


function IconEditor(props){
  const {icon, setIcon} = props;


  const onDropHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const path = event.dataTransfer.files[0].path;
    changeImage(path);
  }
  const ignoreEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }
  const openDialog = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const path = await window.api.openDialogFile();
    changeImage(path);
  }


  return (
    <div className="icon-editor" onDrop={onDropHandler} onDragOver={ignoreEvent}>
      <div className="icon-editor-image" onClick={openDialog}>
        <IconImageView icon={icon} />
      </div>
      <div className="icon-editor-items">
        {
          Object.keys(icon).map((key, idx) => <ValueEditor key={idx} keyName={key} value={icon[key]} onChangeHandler={(e) => onChangeHandler(key, e)} />)
        }
      </div>
    </div>
  )
}

export default IconEditor;