import React from "react";

import ImageView from "../ImageView";
import {
  isValidOptionalUrl,
  isValidString,
  isValidStringArray,
  PLACEHOLDERS,
  getImageSource,
  isImage,
  isValidImageSource,
  isUrl,
  sanitizeIcon,
} from "../../functions";
import { connect } from "react-redux";
import "./style.css";


function ValueEditor(props) {
  const {
    keyName, 
    value, 
    onChangeHandler,
    onKeyDown,
  } = props;

  return (
    <>
      <label htmlFor={keyName}>{keyName}</label>
      {
        typeof(value) === "boolean"
        ?
        <input 
          type="checkbox" 
          name={keyName} 
          id={keyName} 
          checked={value} 
          data-type={"boolean"} 
          onChange={onChangeHandler}
          onKeyDown={onKeyDown}
        /> 
        :
        Array.isArray(value)
        ?
        <input 
          type="text" 
          name={keyName} 
          id={keyName} 
          placeholder={PLACEHOLDERS[keyName.toUpperCase()]} 
          value={value.join(",")} 
          data-type={"array"} 
          onChange={onChangeHandler}
          onKeyDown={onKeyDown}
        />
        :
        <input 
          type="text" 
          name={keyName} 
          id={keyName} 
          placeholder={PLACEHOLDERS[keyName.toUpperCase()]} 
          value={value} 
          data-type={"string"} 
          onChange={onChangeHandler}
          onKeyDown={onKeyDown}
        />
      }
    </>
  )
}


/**
 * props: {
 *  initialIcon,
 *  setModifiedIcon,
 * }
 */
class IconEditor extends React.Component {

  constructor(props) {
    super(props);
    
    const extendedIcon = {
      ...this.props.initialIcon,
      url: isValidString(this.props.initialIcon.url) ? this.props.initialIcon.url : "",
      $localPath: `${this.props.appPath.iconDirectory}/${this.props.initialIcon.name}`,
      $isLocalImageChanged: false,
    }

    this.state = {
      icon: extendedIcon,
      imageSource: getImageSource(extendedIcon),
    }

  }

  onChangeHandler = (event, keyName) => {
    const target = event.target;
    const dataType = target.getAttribute("data-type");
    const value = dataType === "boolean" ? target.checked : 
                  dataType === "array" ? target.value.trim().split(/,\s*/u) : target.value.trim() ;
       
    const newIcon = {
      ...this.state.icon,
      [keyName]: value
    }

    if(keyName === "url" && isUrl(value))
    {
      this.changeImage(value, true);
      newIcon.name = value.split(/\/|\\/).pop();
    }
    
    this.setState({
      icon: newIcon,
      imageSource: getImageSource(newIcon)
    })
    this.props.setModifiedIcon(sanitizeIcon(newIcon));
  }

  changeImage = (path, isRemote=false) => {
    if(!isRemote && !isImage(path))
    {
      window.api.alert(`"${path}"는 이미지가 아닌 것 같아요.`);
    }

    const newIcon = { 
      ...this.state.icon,
      name: path.split(/\/|\\/).pop(),
      $localPath: path,
      $isLocalImageChanged: !isRemote
    }

    this.setState({
      icon: newIcon,
      imageSource: getImageSource(newIcon),
    });
    this.props.setModifiedIcon(sanitizeIcon(newIcon));
  }

  onImageDropHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const path = event.dataTransfer.files[0].path;

    this.changeImage(path);
  }

  ignoreEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  }

  openDialog = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const path = await window.api.openDialogFile();

    this.changeImage(path);
  }

  render() {

    return (
      <div className="icon-editor" onDrop={this.onImageDropHandler} onDragOver={this.ignoreEvent}>
        <div className="icon-editor-image" onClick={this.openDialog}>
          {
            isValidImageSource(this.state.imageSource)
            ?
            <ImageView imageSource={this.state.imageSource} />
            :
            <div className="icon-placeholder">
              <div className="icon-placeholder-text">
                {
                  `여기를 눌러서 이미지를 선택해주세요!
                  아니면 드래그 해도 괜찮아요.
                  url 항목에 외부 주소를 입력할 수도 있어요!`
                }
              </div>
            </div>
          }
        </div>
        <div className="icon-editor-items">
          {
            Object.keys(this.state.icon).filter(key => !key.startsWith("$"))
            .map((key, idx) => 
            <ValueEditor 
              key={idx} 
              keyName={key} 
              value={this.state.icon[key]} 
              onChangeHandler={(e) => this.onChangeHandler(e, key)} 
              onKeyDown={this.props.onKeyDown}
            />)
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps =  (state) => ({
  appPath: state.appPath.value,
});
export default connect(mapStateToProps)(IconEditor);