import React, { useState } from "react";
import "./style.css";

import ModalView from "./ModalView";

function Header(props) {
  const {onSearchKeywordChangeHandler} = props;

  const [showModal, setShowModal] = useState(false);


  const handleModalClose = () => {
    setShowModal(false);
  };
  const openModal = () => {
    setShowModal(true);
  }
  const handleModalSave = () => {
    setShowModal(false);
  }

  return (
    <div className="header">
      <div className="searchbar">
        <input type="text"  className="searchbar-input" onChange={onSearchKeywordChangeHandler}/>
      </div>

      <div>
        <div className="btn-group" role="group" aria-label="Basic example">
          <button type="button" className="btn btn-light" >포맷 검증</button>
          <button type="button" className="btn btn-light" onClick={openModal} >아이콘 추가</button>
        </div>
      </div>

      <ModalView 
        showModal={showModal}
        handleModalClose={handleModalClose}
        handleModalSave={handleModalSave}
      />
    </div>
  )
}

export default Header;
