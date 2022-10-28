import React from "react";
import { Modal, Button } from "react-bootstrap";

import "./style.css";

function ModalConfirmDialog(props){
  const {
    show, 
    message, 
    onCancel, 
    onConfirm,
    confirmMessage,
    cancelMessage,
  } = props;


  return (
    <Modal 
      show={show}
      onHide={onCancel}
      className="modal-confirm-dialog"
      backdropClassName="modal-confirm-dialog-backdrop"
      contentClassName="modal-confirm-dialog-content"
      centered
    >
      <Modal.Header></Modal.Header>

      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>{cancelMessage ?? "아니요!"}</Button>
        <Button variant="primary" onClick={onConfirm}>{confirmMessage ?? "네!!"}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalConfirmDialog;