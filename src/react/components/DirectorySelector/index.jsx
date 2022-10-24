import React, { useState } from "react";
import "./style.css";

import { useDispatch } from "react-redux";
import { setAppPathValue } from "../../redux/appPath";

const NORMAL_MESSAGE = `
여기를 눌러서 BridgeBBCC 폴더를 선택해주세요!
아니면 드래그 해도 괜찮아요.
`;

const ERROR_MESSAGE = `
BridgeBBCC 폴더가 아닌 것 같아요... 
다시 한번 확인 해주실래요?
`

function DirectorySelector(){
  const [message, setMessage] = useState(NORMAL_MESSAGE);

  const dispatch = useDispatch();

  const validateAndSetPath = async (path) => {
    if(await window.api.isValidDirectory(path))
    {
      const data = await window.api.getCorePaths(path);
      dispatch(setAppPathValue({
        root: path,
        config: data.config,
        iconList: data.iconList,
        iconDirectory: data.iconDirectory
      }));
    }
    else 
    {
      setMessage(`${path}는 ${ERROR_MESSAGE}`);
    }
  }

  const openDialog = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const path = await window.api.openDialogDirectory();
    validateAndSetPath(path);
  }

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const path = e.dataTransfer.files[0].path;
    validateAndSetPath(path);
  }
  const ignoreEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div 
      className="directory-selector" 
      onClick={openDialog} 
      onDragOver={ignoreEvent} 
      onDrop={onDrop}
    >
      {message}
    </div>
  )
}

export default DirectorySelector;