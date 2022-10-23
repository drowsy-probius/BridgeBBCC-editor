import React, { useMemo } from "react";
import "./style.css";
import { ImageView } from "../../components";

import { useSelector } from "react-redux";
import { selectAppPath } from "../../../redux/appPath";

function KeyValueView(props){
  const {keyName, value} = props;

  return (
    <div className="key-value-view">
      <div className="key-text">{keyName}</div>
      <div className="value-text">{`${value}`}</div>
    </div>
  )
}

function IconDetailView(props){
  const {icon, openModal} = props;
  const appPath = useSelector(selectAppPath);
  const imageSource = useMemo(() => {
    if(typeof(icon.url) === "string" && icon.url.startsWith("http"))
    {
      return icon.url;
    }

    if(typeof(icon.uri) === "string" && icon.uri.startsWith("http"))
    {
      return icon.uri;
    }

    if(typeof(icon.path) === "string" && icon.path.startsWith("http"))
    {
      return icon.path;
    }

    return `${appPath.iconDirectory}\\${icon.name}`;
  }, [icon]);

  return (
    <div className="icon-detail-view" onClick={openModal}>
      <ImageView imageSource={imageSource} />
      {
        Object.entries(icon).filter(([key, value]) => !key.startsWith("$") && value.length > 0)
        .map(([key, value], idx) => <KeyValueView key={idx} keyName={key} value={icon[key]} />)
      }
    </div>
  )
}

export default IconDetailView;