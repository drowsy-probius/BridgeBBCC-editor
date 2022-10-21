import React from "react";
import "./style.css";
import { IconImageView } from "../../components";


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

  return (
    <div className="icon-detail-view" onClick={openModal}>
      <IconImageView icon={icon} />
      {
        Object.keys(icon).map((key, idx) => <KeyValueView key={idx} keyName={key} value={icon[key]} />)
      }
    </div>
  )
}

export default IconDetailView;