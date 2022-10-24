import React, { useEffect, useState, useRef, useMemo } from "react";
import * as JSON5 from "json5";

import { ImageView } from "../../components";

import "./style.css";

import { useSelector, useDispatch } from "react-redux";
import { selectAppPath } from "../../../redux/appPath";
import { selectIconList, setIconListValue } from "../../../redux/iconList";

import { isValidIcon, isUniqueIcon, saveIconListToFile } from "../../functions";

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
    if(typeof(icon.uri) === "string" && icon.uri.startsWith("http"))
    {
      return icon.uri
    }
    if(typeof(icon.path) === "string" && icon.path.startsWith("http"))
    {
      return icon.path
    }
    return icon.$localPath;
  }, [icon]);

  const filename = useRef(icon.name);
  let filenameChanged = false;
  const timeoutRef = useRef(-1);

  useEffect(() => {
    const extendedIcon = {
      name: typeof(icon.name) !== "string" ? "이름을_적어주세요" : icon.name,
      keywords: Array.isArray(icon.keywords) === false ? [] : icon.keywords,
      tags: Array.isArray(icon.tags) === false ? ['미지정'] : icon.tags,
      url: typeof(icon.url) !== "string" ? "" : icon.url,
      $localPath: typeof(icon.$localPath) !== "string" ? `${appPath.iconDirectory}\\${icon.name}` : icon.$localPath,
    }
    setIcon(extendedIcon);

    for(let i=0; i<iconList.length; i++)
    {
      const isSame = JSON5.stringify(icon) === JSON5.stringify(iconList[i]);
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

    if(
      (typeof(newIcon.$localPath) !== "string" || newIcon.$localPath === '') && 
      (typeof(newIcon.url) !== "string" || !newIcon.url.startsWith('http')) && 
      (typeof(newIcon.uri) !== "string" || !newIcon.uri.startsWith('http'))
    )
    {
      window.api.alert(`${JSON5.stringify(newIcon, null, 2)}에 이미지를 까먹은 것 같은데요?`);
      return;
    }

    if(!isValidIcon(newIcon))
    {
      window.api.alert(`${JSON5.stringify(newIcon, null, 2)} 뭔가 형식이 이상해요`);
      return;
    }
    const uniqueCheckerResult = isUniqueIcon(newIcon, iconIdx, iconList);
    if(uniqueCheckerResult.status === false)
    {
      window.api.alert(`중복된 항목이 있어요. \n\n ${JSON5.stringify(uniqueCheckerResult, null, 2)} `);
      return;
    }

    if(
      !(
        (typeof(icon.url) === "string" && icon.url.startsWith("http")) ||
        (typeof(icon.uri) === "string" && icon.uri.startsWith("http")) ||
        (typeof(icon.path) === "string" && icon.path.startsWith("http"))
      )
    )
    {
      if(filename.current !== newIcon.name)
      {
        filenameChanged = true;
      }
    }
    setIcon(newIcon);

    if(timeoutRef.current !== -1)
    {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {

      /**
       * name 항목이 변경되면
       * 로컬 이미지의 이름도 변경되어야 함.
       */
      if(filenameChanged)
      {
        const res = await window.fs.renameSync(`${appPath.iconDirectory}/${filename.current}`, `${appPath.iconDirectory}/${newIcon.name}`);
        if(res.status === false)
        {
          window.api.alert(res.error);
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
        window.api.alert(saveResult);
      }

      clearTimeout(timeoutRef.current); 
      timeoutRef.current = -1;
    }, 10);

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