import React, { useEffect, useState } from "react";
import IconDetailView from "./IconDetailView";
import ModalView from "./ModalView";
import "./style.css";

import { 
  findErrorsInIcon, 
  isUniqueIcon, 
  saveIconListToFile,
  isUrl,
  isImage,
  moveImage,
  copyImage,
} from "../functions";
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
}


function IconList() {
  const dispatch = useDispatch();

  const appPath = useSelector(selectAppPath);
  const iconList = useSelector(selectIconList);

  const [searchKey, setSearchKey] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedIconIdx, setSelectedIconIdx] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState();
  const [modifiedIcon, setModifiedIcon] = useState();


  useEffect(() => {
    async function readIconList() {
      const data = await window.fs.readFileSync(appPath.iconList, {encoding: "utf8", flag: "r"});
      const jsonDataRaw = JSON5.parse(iconListPreProcessor(data));
      const jsonData = jsonDataRaw.map(icon => {
        if(icon.tags === undefined || icon.tags.length === 0)
        {
          return {
            ...icon,
            tags: ["미지정"] /** 리스트 불러올 때 태그 없으면 미지정으로 설정 */
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
          window.api.alert(JSON5.stringify(res, null, 2));
        }
      });
    }

    try 
    {
      readIconList();
    }
    catch(err)
    {
      window.api.alert(`목록을 불러오는 중에 오류가 발생했어요. \n\n${JSON5.stringify(err)}`)
    }
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


  const handleModalClose = async () => {
    /**
     * 수정한 icon이 올바른 값인 지 확인함.
     */
    const iconErrors = findErrorsInIcon(modifiedIcon);
    if(iconErrors.length > 0)
    {
      window.api.alert(`수정한 값이 잘못된 것 같아요. \n\n ${JSON5.stringify(iconErrors, null, 2)}`);
      return;
    }

    /**
     * 중복되는 값 확인
     */
    const uniqueCheckerResult = isUniqueIcon(modifiedIcon, selectedIconIdx, iconList);
    if(uniqueCheckerResult !== true)
    {
      window.api.alert(`중복된 항목이 있어요. \n\n ${JSON5.stringify(uniqueCheckerResult, null, 2)}`);
      return;
    }

    /**
     * 실제 변경 로직
     * 하나라도 실패하면 창 닫지 않음.
     */
    
    if(modifiedIcon.$isLocalImageChanged)
    {
      const res = await copyImage(modifiedIcon.$localPath, `${appPath.iconDirectory}/${modifiedIcon.name}`);
      if(res !== true)
      {
        window.api.alert(res.message);
        return
      }
    }
    else {
      if(!isUrl(modifiedIcon.url) && !isUrl(modifiedIcon.uri) && modifiedIcon.name !== selectedIcon.name)
      {
        const res = await moveImage(`${appPath.iconDirectory}/${selectedIcon.name}`, `${appPath.iconDirectory}/${modifiedIcon.name}`);
        if(res !== true)
        {
          window.api.alert(res.error);
          return;
        }
      }
    }

    /**
     * 새로운 iconList 계산
     */
    const newIconList = iconList.map((icon, idx) => {
      if(idx === selectedIconIdx) return modifiedIcon;
      return icon;
    });

    /**
     * 변경한 iconList를 로컬에 저장
     */
    const saveRes = await saveIconListToFile(newIconList, appPath);
    if(saveRes.status === false)
    {
      window.api.alert(JSON5.stringify(saveRes, null, 2));
      return;
    }

    /**
     * iconList를 로컬에 저장 성공하면 갱신함.
     */
    dispatch(setIconListValue(newIconList));

    /**
     * selectedIcon도 갱신해야
     * 뷰어에서 수정된 값이 반영됨.
     */
    setSelectedIcon(modifiedIcon); 
    
    /**
     * 이제 모달을 닫아도 좋습니다.
     */
    setShowModal(false);
  };

  const handleModalCloseWithoutSave = async () => {
    setModifiedIcon(selectedIcon);
    setShowModal(false);
  }


  const openModal = (icon) => {
    iconList.forEach((i, idx) => {
      if(JSON5.stringify(icon) === JSON5.stringify(i))
      {
        setSelectedIconIdx(idx);
      }
    });
    setSelectedIcon(icon);
    setModifiedIcon(icon);
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
        window.api.alert(JSON5.stringify(deleteRes.error, null, 2));
      }
    }
    
    
    dispatch(setIconListValue(newIconList));
    saveIconListToFile(newIconList, appPath)
    .then(res => {
      if(res.status === false)
      {
        window.api.alert(JSON5.stringify(res, null, 2));
      }
    });
    setShowModal(false);
  }

  return (
    <div className="icon-list">
      <ModalView 
        icon={selectedIcon}
        setModifiedIcon={setModifiedIcon}
        showModal={showModal}
        handleModalClose={handleModalClose}
        handleModalCloseWithoutSave={handleModalCloseWithoutSave}
        iconDeleteHandler={iconDeleteHandler}
      />

      <Header onSearchKeywordChangeHandler={onSearchKeywordChangeHandler} />

      <div className="icon-container">
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