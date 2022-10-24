import React, { useState } from "react";

import { IMAGE_EXTENSIONS } from "../../../../../constants";
import { ImageView } from "../../../components";

import "./style.css";

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
  const [imageSource, setImageSource] = useState("");

  const changeImage = (path) => {
    try 
    {
      if(!IMAGE_EXTENSIONS.includes(path.split('.').pop()))
      {
        throw new Error(`
        올바른 이미지가 아닌 것 같아요
        ${path}
        `);
      }

      /**
       * skip image localtion checker.
       * It will copy image to correct directory.
       */
      setImageSource(path);
    }
    catch(err)
    {
      window.api.alert(JSON.stringify(err, null, 2));
    }
    const newIcon = { ...icon };
    newIcon.name = path.split(/\/|\\/).pop();
    newIcon.$localPath = path;
    setIcon(newIcon);

  }
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
  const onChangeHandler = (event, keyName) => {
    const target = event.target;
    const dataType = target.getAttribute("data-type");
    const value = dataType === "boolean" ? target.checked : 
                  dataType === "array" ? target.value.trim().split(/,\s*/u) : target.value.trim() ;

    const newIcon = {
      ...icon,
      [keyName]: value,
    };
    /**
     * 정규식 귀찮아...
     */
    if(keyName === "url" && value.startsWith("http"))
    {
      changeImage(value);
      newIcon.name = value.split(/\/|\\/).pop();
    }
    
    return setIcon(newIcon);
  }

  return (
    <div className="icon-editor" onDrop={onDropHandler} onDragOver={ignoreEvent}>
      <div className="icon-editor-image" onClick={openDialog}>
        {
          imageSource === ""
          ?
          <div className="icon-placeholder">
            <div className="icon-placeholder-text">
              {
                `여기를 눌러서 이미지를 선택해주세요!
                아니면 드래그 해도 괜찮아요.
                url 항목에 외부 주소를 입력할 수도 있어요!`
              }
            </div>
          </div>
          :
          <ImageView imageSource={imageSource} />
        }
      </div>
      <div className="icon-editor-items">
        {
          Object.keys(icon).filter(key => !key.startsWith("$")).map((key, idx) => <ValueEditor key={idx} keyName={key} value={icon[key]} onChangeHandler={(e) => onChangeHandler(e, key)} />)
        }
      </div>
    </div>
  )
}

export default IconEditor;