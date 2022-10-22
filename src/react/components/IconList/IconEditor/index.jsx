import React, { useEffect, useState, useRef, useMemo } from "react";

import { ImageView } from "../../components";

import "./style.css";

import { useSelector, useDispatch } from "react-redux";
import { selectAppPath } from "../../../redux/appPath";
import { selectIconList, setIconListValue } from "../../../redux/iconList";

import { isUniqueIcon, saveIconListToFile } from "../../functions";

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
  const imageSource = useMemo(() => {
    if(typeof(icon.url) === "string" && icon.url.startsWith("http"))
    {
      return icon.url
    }
    return icon.$localPath;
  }, [icon]);

  const filename = useRef(icon.name);
  let filenameChanged = false;
  const timeoutRef = useRef(-1);

  useEffect(() => {
    const extendedIcon = {...icon}
    if(extendedIcon.$localPath === undefined)
    {
      extendedIcon.$localPath = `${appPath.iconDirectory}\\${icon.name}`
    }
    if(extendedIcon.url === undefined)
    {
      extendedIcon.url = ""
    }
    setIcon(extendedIcon);

    for(let i=0; i<iconList.length; i++)
    {
      const isSame = JSON.stringify(icon) === JSON.stringify(iconList[i]);
      if(!isSame) continue;
      
      setIconIdx(i);
      break;
    }
  }, []);

  const onChangeHandler = async (event, keyName) => {
    if(iconIdx === -1){
      return;
    }

    const target = event.target;
    const dataType = target.getAttribute("data-type");
    const value = dataType === "boolean" ? target.checked : 
                  dataType === "array" ? target.value.trim().split(/,\s*/u) : target.value.trim() ;
       
    const newIcon = {
      ...icon,
      [keyName]: value
    }
    if(filename.current !== newIcon.name)
    {
      filenameChanged = true;
    }
    setIcon(newIcon);

    if(timeoutRef.current !== -1)
    {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      const validationResult = isUniqueIcon(newIcon, iconIdx, iconList);
      if(validationResult.status === false)
      {
        console.error(validationResult);
        return;
      }

      /**
       * name 항목이 변경되면
       * 로컬 이미지의 이름도 변경되어야 함.
       */
      if(filenameChanged)
      {
        const res = await window.fs.renameSync(`${appPath.iconDirectory}/${filename.current}`, `${appPath.iconDirectory}/${newIcon.name}`);
        if(res.status === false)
        {
          console.error(res.error);
          throw new Error(res.error);
        }
        filename.current = newIcon.name;
        filenameChanged = false;
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

      const saveResult = await saveIconListToFile(newIconList, appPath);
      if(saveResult.status === false)
      {
        console.error(saveResult);
      }

      clearTimeout(timeoutRef.current); 
      timeoutRef.current = -1;
    }, 70);

  }

  const changeImage = (path) => {
    /**
     * skip image localtion checker.
     * It will copy image to correct directory.
     */
    const newIcon = { ...icon }
    newIcon.name = path.split(/\/|\\/).pop();
    newIcon.$localPath = path;
    setIcon(newIcon);
  }
  const onDropHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log(event.dataTransfer);

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
        <ImageView imageSource={imageSource} />
      </div>
      <div className="icon-editor-items">
        {
          Object.entries(icon).filter(([key, value]) => !key.startsWith("$"))
          .map(([key, value], idx) => <ValueEditor key={idx} keyName={key} value={icon[key]} onChangeHandler={(e) => onChangeHandler(e, key)} />)
        }
      </div>
    </div>
  )
}

export default IconEditor;