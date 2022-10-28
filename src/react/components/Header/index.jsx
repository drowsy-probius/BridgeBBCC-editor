import React, { useState } from "react";
import "./style.css";
import * as JSON5 from "json5";

import { useSelector } from "react-redux";
import { selectIconList } from "../../redux/iconList";

import ModalView from "./ModalView";
import { findErrorsInIconList } from "../functions";

function Header(props) {
  const {onSearchKeywordChangeHandler} = props;

  const iconList = useSelector(selectIconList);
  const [showModal, setShowModal] = useState(false);


  const handleModalClose = () => {
    setShowModal(false);
  };
  const openModal = () => {
    setShowModal(true);
  }
  const validateIconList = () => {
    const errors = findErrorsInIconList(iconList);
    if(errors.length === 0)
    {
      window.api.alert(`에러가 없어요!`);
      return;
    }

    window.api.alert(`저런! 에러가 있어요!! \n
심각한 에러: 
${JSON5.stringify(errors.filter(i => i.level === 0), null, 2)}

문제가 될 수 있는 에러:
${JSON5.stringify(errors.filter(i => i.level === 1), null, 2)}

권고사항:
${JSON5.stringify(errors.filter(i => i.level > 1), null, 2)}
`)
  } 

  return (
    <div className="header">
      <div className="searchbar">
        <input type="text"  className="searchbar-input" onChange={onSearchKeywordChangeHandler}/>
      </div>

      <div>
        <div className="btn-group" role="group" aria-label="Basic example">
          <button type="button" className="btn btn-light" onClick={validateIconList}>포맷 검증</button>
          <button type="button" className="btn btn-light" onClick={openModal} >아이콘 추가</button>
        </div>
      </div>

      <ModalView 
        showModal={showModal}
        handleModalClose={handleModalClose}
      />
    </div>
  )
}

export default Header;
