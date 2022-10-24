import React, { useEffect, useState } from "react";
import IconDetailView from "./IconDetailView";
import ModalView from "./ModalView";
import "./style.css";

import { saveIconListToFile } from "../functions";
import { useSelector, useDispatch } from "react-redux";
import { selectAppPath } from "../../redux/appPath";
import { selectIconList, setIconListValue } from "../../redux/iconList";
import Header from "../Header";
import * as JSON5 from "json5";

import { LazyLoadComponent } from "react-lazy-load-image-component";


function iconListPreProcessor(text) {
  /**
   * dcConsData로 할당된 배열만 가져옴
   */
  const jsonData = [...text.matchAll(/dcConsData\s+=\s+(\[[\S\s]*\])/gu)][0][1];
  return jsonData;

  // return text.trim()
  //         .replace("dcConsData = ", "") // 할당문 제거
  //         .replace(/;$/, "")  // 마지막 ; 제거
  //         .replaceAll(/,\s*([a-zA-Z]+):/g, ",\"$1\":") // ""으로 묶이지 않은 key 묶기
  //         .replaceAll(/{\s*([a-zA-Z]+):/g, "{\"$1\":"); // ""으로 묶이지 않은 key 묶기
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
      const jsonDataRaw = JSON5.parse(iconListPreProcessor(data));
      const jsonData = jsonDataRaw.map(icon => {
        if(icon.tags === undefined || icon.tags.length === 0)
        {
          return {
            ...icon,
            tags: ["미지정"]
          };
        }
        return icon;
      })
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
    const newIconList = iconList.filter(oldIcon => JSON5.stringify(oldIcon) !== JSON5.stringify(icon));

    if(
      !(
        (typeof(icon.url) === "string" && icon.url.startsWith('http')) ||
        (typeof(icon.uri) === "string" && icon.uri.startsWith('http'))
      )
      /**
       * url, uri 항목이 있는 상태의 아이콘은
       * 로컬에 이미지가 있지 않기 때문에 
       * 이미지 삭제 로직을 거치지 않음.
       */
    )
    {
      const deleteRes = await window.fs.rmSync(`${appPath.iconDirectory}/${icon.name}`);
      if(deleteRes.status === false)
      {
        window.api.alert(deleteRes.error);
      }
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
          <LazyLoadComponent key={`${icon.name}${icon.keywords}`} >
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