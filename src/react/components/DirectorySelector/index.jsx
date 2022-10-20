import React, { useState } from "react";
import "./style.css";

const NORMAL_MESSAGE = `
BridgeBBCC 폴더를 선택해주세요!
아니면 드래그 해도 괜찮아요.
`;

const ERROR_MESSAGE = `
BridgeBBCC 폴더가 아닌 것 같아요... 
다시 한번 해주실래요?
`

function DirectorySelector({setPath}){
  const [message, setMessage] = useState(NORMAL_MESSAGE);

  const validateAndSetPath = async (path) => {
    if(await window.api.isValidDirectory(path))
    {
      setPath(path);
    }
    else 
    {
      setMessage(ERROR_MESSAGE);
    }
  }

  const openDialog = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const path = await window.api.openDialog();
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