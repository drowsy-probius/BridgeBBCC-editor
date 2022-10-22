import React from "react";

import { Button, Modal } from 'react-bootstrap';
import IconEditor from "../IconEditor";

function ModalView(props){
  const {icon, showModal, handleModalClose, iconDeleteHandler} = props;

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
            <IconEditor icon={icon} />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="danger" onClick={()=>{iconDeleteHandler(icon)}}>삭제</Button>
            <Button variant="secondary" onClick={handleModalClose}>닫기</Button>
          </Modal.Footer>
        </Modal>
      }
    </>
  )
}

export default ModalView;