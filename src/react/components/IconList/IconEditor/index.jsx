import React, { useEffect, useState, useRef } from "react";

import { IconImageView } from "../../components";

import "./style.css";

import { useSelector, useDispatch } from "react-redux";
import { selectAppPath } from "../../../redux/appPath";
import { selectIconList, setIconListValue } from "../../../redux/iconList";

import { IMAGE_EXTENSIONS } from "../../../../constants";
import { iconValidationChecker, saveIconListToFile } from "../../functions";

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

/**
 * 
 * @param {{icon: any}} props 
 * @returns 
 */
function IconEditor(props){
  const appPath = useSelector(selectAppPath);
  const iconList = useSelector(selectIconList);
  const dispatch = useDispatch();

  const [icon, setIcon] = useState(props.icon);
  const [iconIdx, setIconIdx] = useState(-1);

  const timeoutRef = useRef(-1);

  useEffect(() => {
    for(let i=0; i<iconList.length; i++)
    {
      const isSame = JSON.stringify(icon) === JSON.stringify(iconList[i]);
      if(!isSame) continue;
      
      setIconIdx(i);
      break;
    }
  }, []);

  const onChangeHandler = (keyName, event) => {
    if(iconIdx === -1){
      return;
    }

    const target = event.target;
    const dataType = target.getAttribute("data-type");
    const value = dataType === "boolean" ? target.checked : 
                  dataType === "array" ? target.value.split(/,\s*/u) : target.value ;
    const newIcon = {
      ...icon,
      [keyName]: value
    }
    setIcon(newIcon);

    if(timeoutRef.current !== -1)
    {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      const validationResult = iconValidationChecker(newIcon, iconIdx, iconList);
      if(validationResult.status === false)
      {
        console.error(validationResult);
        return;
      }

      const newIconList = iconList.map((icon, idx) => {
        if(idx === iconIdx) return {
          ...newIcon,
          [keyName]: Array.isArray(value) ? value.filter(i => i.length > 0) : value
        };
        return icon;
      })
      dispatch(setIconListValue(
        newIconList
      ));

      const saveResult = await saveIconListToFile(appPath.iconList, newIconList);
      if(saveResult.status === false)
      {
        console.error(saveResult);
      }

      clearTimeout(timeoutRef.current); 
      timeoutRef.current = -1;
    }, 500);
  }

  const changeImage = (path) => {
    // TODO!
    if(!IMAGE_EXTENSIONS.includes(path.split('.').pop()))
    {
      /**
       * TODO:
       * show error message
       */
       console.error(path);
       return;
    }

    if(!path.startsWith(appPath.iconDirectory))
    {
      /**
       * TODO:
       * show error message
       */
      console.error(path);
      return;
    }
    console.log(path);
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