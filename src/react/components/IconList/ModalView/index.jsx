import React from "react";

import { Button, Modal } from 'react-bootstrap';
import IconEditor from "../../common/IconEditor";

function ModalView(props){
  const {
    icon, 
    setModifiedIcon,
    showModal, 
    handleModalClose, 
    handleModalCloseWithoutSave,
    iconDeleteHandler,
  } = props;

  const onKeyDown = (event) => {
    // enter key
    if(event.keyCode === 13)
    {
      return handleModalClose();
    }
  }

  return (
    <>
      {
        icon === undefined
        ?
        null 
        :
        <Modal 
          show={showModal} 
          onHide={handleModalClose}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          autoFocus
        >
          <Modal.Header closeButton>
            <Modal.Title> {icon.name === undefined ? "--이름없음--" : icon.name} </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <IconEditor 
              initialIcon={icon} 
              setModifiedIcon={setModifiedIcon}
              onKeyDown={onKeyDown}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="danger" onClick={()=>{iconDeleteHandler(icon)}}>삭제</Button>
            <Button variant="secondary" onClick={handleModalCloseWithoutSave}>취소</Button>
            <Button variant="secondary" onClick={handleModalClose}>닫기(저장)</Button>
          </Modal.Footer>
        </Modal>
      }
    </>
  )
}

export default ModalView;