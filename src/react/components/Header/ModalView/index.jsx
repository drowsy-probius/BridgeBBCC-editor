import React, { useState } from "react";
import { Button, Modal } from 'react-bootstrap';
import IconEditor from "./IconEditor";

const defaultIconFormat = {
  name: "이름.png",
  keywords: ['키워드1', '키워드2'],
  tags: ['태그1', '태그2'],
  url: '',
}

function ModalView(props) {
  const {showModal, handleModalClose, handleModalSave} = props;

  const [icon, setIcon] = useState(defaultIconFormat);

  return (
    <Modal
      show={showModal}
      onHide={handleModalClose}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      autoFocus
    >
      <Modal.Header closeButton>
        <Modal.Title> 아이콘 추가 </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <IconEditor 
          icon={icon}
          setIcon={setIcon}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>취소</Button>
        <Button variant="primary" onClick={handleModalSave}>저장</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalView;