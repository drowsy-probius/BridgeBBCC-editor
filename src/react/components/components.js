import React, { useState, useEffect, } from "react";
import { imageBase64FromUri } from "./functions";
import { LazyLoadImage } from "react-lazy-load-image-component";
import loading from "../loading.gif";
import { Modal, Button } from "react-bootstrap";

import "./components.css";

export function ImageView(props){
  const { imageSource } = props;
  const [imgComponent, setImgComponent] = useState(<img src={loading} alt="이미지 불러오는 중..."></img>);

  useEffect(() => {
    async function loadImage(){
      if(imageSource === undefined)
      {
        return;
      }
      if(typeof(imageSource) === "string" && imageSource.length === 0)
      {
        return;
      }

      setImgComponent(
        <LazyLoadImage 
          placeholderSrc={loading}
          height={100}
          width={100}
          src={await imageBase64FromUri(imageSource)}
        />
      );
    }

    loadImage();
  }, [imageSource]);

  return (
    <div className="icon-image-view" style={{textAlign: "center", margin: "5px",}}>
      {imgComponent}
    </div>
  )
}

export function ModalConfirmDialog(props){
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
