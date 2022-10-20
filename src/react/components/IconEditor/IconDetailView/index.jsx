import React, { useEffect, useRef } from "react";
import "./style.css";

function _arrayBufferToBase64( buffer ) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}


function KeyValueView({keyName, value}){
  return (
    <div className="key-value-view">
      <div className="key-text">{keyName}</div>
      <div className="value-text">{value}</div>
    </div>
  )
}

function IconImageView({icon, dcconPath}){
  const imgRef = useRef(null);

  useEffect(() => {
    async function loadImage(){

      let buffer;
      let ext = "webp";
      if(icon.uri !== undefined && icon.uri.startsWith("http"))
      {
        buffer = await window.api.getBufferFromUrl(icon.uri);
        ext = icon.uri.split('.').pop();
      }
      else if(icon.url !== undefined && icon.url.startsWith("http"))
      {
        buffer = await window.api.getBufferFromUrl(icon.url);
        ext = icon.url.split('.').pop();
      }
      else 
      {
        buffer = await window.fs.readFileSync(`${dcconPath}/${icon.name}`);
        ext = icon.name.split('.').pop();
      }
      imgRef.current.src = `data:image/${ext};base64,${_arrayBufferToBase64(buffer)}`;
    }

    loadImage();
  }, []);

  return (
    <div className="icon-image-view">
      <img src="" alt="" ref={imgRef}/>
    </div>
  )
}


function IconDetailView({icon, dcconPath}){

  return (
    <div className="icon-detail-view">
      <IconImageView icon={icon} dcconPath={dcconPath} />
      {
        Object.keys(icon).map((key, idx) => <KeyValueView key={idx} keyName={key} value={icon[key]} />)
      }
    </div>
  )
}

export default IconDetailView;