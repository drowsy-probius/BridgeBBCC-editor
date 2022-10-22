import React, { useState } from "react";
import "./style.css";

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
      console.log('No errors!');
      return;
    }
    console.error(errors);
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
