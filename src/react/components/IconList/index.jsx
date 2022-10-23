import React, { useEffect, useState } from "react";
import IconDetailView from "./IconDetailView";
import ModalView from "./ModalView";
import "./style.css";

import { saveIconListToFile } from "../functions";
import { useSelector, useDispatch } from "react-redux";
import { selectAppPath } from "../../redux/appPath";
import { selectIconList, setIconListValue } from "../../redux/iconList";
import Header from "../Header";

import { LazyLoadComponent } from "react-lazy-load-image-component";


function iconListPreProcessor(text) {
  return text.trim()
          .replace("dcConsData = ", "")
          .replace(/;$/, "")
          .replaceAll(/,\s*([a-zA-Z]+):/g, ",\"$1\":")
          .replaceAll(/{\s*([a-zA-Z]+):/g, "{\"$1\":");
}


function IconList() {
  const dispatch = useDispatch();

  const appPath = useSelector(selectAppPath);
  const iconList = useSelector(selectIconList);

  const [searchKey, setSearchKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(0);


  useEffect(() => {
    async function readIconList() {
      const data = await window.fs.readFileSync(appPath.iconList, {encoding: "utf8", flag: "r"});
      const jsonData = JSON.parse(iconListPreProcessor(data));
      for(const icon of jsonData)
      {
        if(icon.tags === undefined || icon.tags.length === 0)
        {
          icon.tags = ["미지정", ]
        }
      }
      dispatch(setIconListValue(jsonData));
      /**
       * tags가 빈 곳에 미지정을 추가했으니 다시 저장함
       */
      saveIconListToFile(jsonData, appPath)
      .then(res => {
        if(res.status === false)
        {
          window.api.alert(res);
        }
      });
    }

    readIconList();
  }, []);

  const onSearchKeywordChangeHandler = (event) => {
    setSearchKey(event.target.value);
  }
  const filterBySearchKeyword = (icon) => {
    if(searchKey === "") return true;

    if(icon.name && icon.name.toLowerCase().includes(searchKey.toLowerCase())) return true;
    for(const tag of icon.tags)
    {
      if(tag.toLowerCase().includes(searchKey.toLowerCase())) return true;
    }
    for(const keyword of icon.keywords)
    {
      if(keyword.toLowerCase().includes(searchKey.toLowerCase())) return true;
    }
    return false;
  }

  const handleModalClose = () => {
    setShowModal(false);
  };
  const openModal = (icon) => {
    setSelectedIcon(icon);
    setShowModal(true);
  }
  const iconDeleteHandler = async (icon) => {
    const newIconList = iconList.filter(oldIcon => JSON.stringify(oldIcon) !== JSON.stringify(icon));

    const deleteRes = await window.fs.rmSync(`${appPath.iconDirectory}/${icon.name}`);
    if(deleteRes.status === false)
    {
      window.api.alert(deleteRes.error);
    }
    
    dispatch(setIconListValue(newIconList));
    saveIconListToFile(newIconList, appPath)
    .then(res => {
      if(res.status === false)
      {
        window.api.alert(res);
      }
    });
    setShowModal(false);
  }

  return (
    <div className="icon-edit">
      <ModalView 
        icon={selectedIcon}
        showModal={showModal}
        handleModalClose={handleModalClose}
        iconDeleteHandler={iconDeleteHandler}
      />

      <Header onSearchKeywordChangeHandler={onSearchKeywordChangeHandler} />

      <div className="icon-list">
        {
          iconList.filter(filterBySearchKeyword).map((icon, idx) => 
          <LazyLoadComponent key={`${icon.name}${icon.keywords[0]}`} >
            <IconDetailView 
              icon={icon} 
              openModal={() => {openModal(icon)}}
            />
          </LazyLoadComponent>
          )
        }
      </div>

    </div>
  )
}

export default IconList;