import React, { useState } from "react";
import { Button, Modal } from 'react-bootstrap';
import IconEditor from "./IconEditor";

import { ModalConfirmDialog } from "../../components";
import { isValidIcon, isUniqueIcon, saveIconListToFile } from "../../functions";

import { useDispatch, useSelector } from "react-redux";
import { selectAppPath } from "../../../redux/appPath";
import { setIconListValue, selectIconList } from "../../../redux/iconList";

/**
 * $이 keyName의 처음에 있으면 무시함.
 */
const defaultIconFormat = {
  name: "이름.png",
  keywords: ['태그'],
  tags: ['미지정'],
  url: '',
  $localPath: '',
}

/**
 * 문제점:
 * 
 * Modal 닫은 뒤에도 전에 있던 값이 남아있음
 * 
 */


function ModalView(props) {
  const {showModal, handleModalClose} = props;

  const dispatch = useDispatch();
  const appPath = useSelector(selectAppPath);
  const iconList = useSelector(selectIconList);

  const [icon, setIcon] = useState({ ...defaultIconFormat });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openConfirmModal = () => { setShowConfirmModal(true); }
  const closeConfirmModal = () => { setShowConfirmModal(false); }

  const closeWithoutSave = (event) => {
    closeConfirmModal();
    handleModalClose();
  }
  const saveIconAndClose = (event) => {

    if(icon.$localPath === '' && icon.url === '')
    {
      console.error(`${JSON.stringify(icon, null, 2)}에 이미지를 까먹은 것 같은데요?`);
      return;
    }

    if(!isValidIcon(icon))
    {
      console.error(`${JSON.stringify(icon, null, 2)} 뭔가 형식이 이상해요`);
      return;
    }
    const uniqueCheckerResult = isUniqueIcon(icon, -1, iconList);
    if(uniqueCheckerResult.status === false)
    {
      console.error(`${JSON.stringify(icon, null, 2)} ${JSON.stringify(uniqueCheckerResult, null, 2)} 중복된 항목이 있어요`);
      return;
    }
    const newIconList = [
      icon,
      ...iconList,
    ];
    dispatch(setIconListValue(newIconList));
    saveIconListToFile(newIconList, appPath)
    .then(res => {
      if(res.status === false)
      {
        console.error(res);
      }
    });
    setIcon({ ...defaultIconFormat });

    handleModalClose();
  }

  return (
    <Modal
      show={showModal}
      onHide={openConfirmModal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      autoFocus
    >
      <Modal.Header>
        <Modal.Title> 아이콘 추가 </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <IconEditor 
          icon={icon}
          setIcon={setIcon}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeWithoutSave}>취소</Button>
        <Button variant="primary" onClick={saveIconAndClose}>저장</Button>
      </Modal.Footer>

      <ModalConfirmDialog 
        show={showConfirmModal}
        message={`저장 안했는데 나갈 거에요?`}
        onCancel={closeConfirmModal}
        onConfirm={closeWithoutSave}
      />
    </Modal>
  )
}

export default ModalView;