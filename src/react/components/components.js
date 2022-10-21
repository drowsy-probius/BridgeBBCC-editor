import React, { useState, useEffect, } from "react";
import { imageBase64FromIcon } from "./functions";
import { LazyLoadImage } from "react-lazy-load-image-component";
import loading from "../loading.gif";

import { useSelector } from "react-redux";
import { selectAppPath } from "../redux/appPath";

export function IconImageView(props){
  const { icon } = props;
  const appPath = useSelector(selectAppPath);
  const [imgComponent, setImgComponent] = useState(<img src={loading} alt="이미지 불러오는 중..."></img>);

  useEffect(() => {
    async function loadImage(){
      setImgComponent(
        <LazyLoadImage 
          placeholderSrc={loading}
          height={100}
          width={100}
          src={await imageBase64FromIcon(icon, appPath.iconDirectory)}
        />
      );
    }

    loadImage();
  }, []);

  return (
    <div className="icon-image-view" style={{textAlign: "center"}}>
      {imgComponent}
    </div>
  )
}