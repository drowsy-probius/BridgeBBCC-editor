import React, { useState, useEffect, } from "react";
import { imageBase64FromUri } from "../../functions";
import { LazyLoadImage } from "react-lazy-load-image-component";
import loading from "../../../loading.gif";

import "./style.css";

function ImageView(props){
  const { imageSource } = props;
  const [imgComponent, setImgComponent] = useState(<img src={loading} alt="이미지 불러오는 중..."></img>);

  useEffect(() => {
    async function loadImage(){
      if(imageSource === undefined)
      {
        return;
      }
      if(typeof(imageSource) === "string" && imageSource.length === 0)
      {
        return;
      }

      const bufferOrError = await imageBase64FromUri(imageSource);
      if(typeof(bufferOrError) !== "string")
      {
        window.api.alert(bufferOrError.message);
        return;
      }

      setImgComponent(
        <LazyLoadImage 
          placeholderSrc={loading}
          height={100}
          width={100}
          src={bufferOrError}
        />
      );
    }

    loadImage();
  }, [imageSource]);

  return (
    <div className="icon-image-view" style={{textAlign: "center", margin: "5px",}}>
      {imgComponent}
    </div>
  )
}

export default ImageView;
