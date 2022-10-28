import React, { useState } from "react";
import { Button, Modal } from 'react-bootstrap';
import IconEditor from "../../common/IconEditor";

import * as JSON5 from "json5";

import ModalConfirmDialog from "../../common/ModalConfirmDialog";
import { copyImage, findErrorsInIcon, isImage, isUniqueIcon, isUrl, saveIconListToFile } from "../../functions";

import { useDispatch, useSelector } from "react-redux";
import { selectAppPath } from "../../../redux/appPath";
import { setIconListValue, selectIconList } from "../../../redux/iconList";

/**
 * $이 keyName의 처음에 있으면 무시함.
 */
const defaultIconFormat = {
  name: '',
  keywords: [],
  tags: [],
  url: '',
  $localPath: '',
}


function ModalView(props) {
  const {showModal, handleModalClose} = props;

  const dispatch = useDispatch();
  const appPath = useSelector(selectAppPath);
  const iconList = useSelector(selectIconList);

  const [modifiedIcon, setModifiedIcon] = useState(defaultIconFormat);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const openConfirmModal = () => { setShowConfirmModal(true); }
  const closeConfirmModal = () => { setShowConfirmModal(false); }

  const closeWithoutSave = () => {
    closeConfirmModal();
    setModifiedIcon(defaultIconFormat);
    handleModalClose();
  }


  const saveIconAndClose = async (_icon) => {
    const iconErrors = findErrorsInIcon(_icon);
    if(iconErrors.length > 0)
    {
      window.api.alert(`양식이 잘못되었어요! \n\n ${JSON5.stringify(iconErrors, null, 2)}`);
      return;
    }

    const uniqueCheckerResult = isUniqueIcon(_icon, -1, iconList);
    if(uniqueCheckerResult !== true)
    {
      window.api.alert(`중복된 항목이 있어요! \n\n ${JSON5.stringify(uniqueCheckerResult, null, 2)}`);
      return;
    }
    
    if(!isImage(_icon.$localPath) && !isUrl(_icon.url) && !isUrl(_icon.uri))
    {
      window.api.alert(`이미지가 없는 것 같아요! \n\n ${JSON5.stringify(_icon, null, 2)}`);
      return;
    }

    if(isImage(_icon.$localPath))
    {
      const res = await copyImage(_icon.$localPath, `${appPath.iconDirectory}/${_icon.name}`);
      if(res !== true)
      {
        window.api.alert(res.message);
        return;
      }      
    }

    const newIconList = [
      _icon,
      ...iconList,
    ];
    dispatch(setIconListValue(newIconList));
    saveIconListToFile(newIconList, appPath)
    .then(res => {
      if(res.status === false)
      {
        window.api.alert(JSON5.stringify(res, null, 2));
      }
    });

    setModifiedIcon(defaultIconFormat);
    handleModalClose();
  }

  const onKeyDown = (event) => {
    // enter key
    if(event.keyCode === 13)
    {
      return saveIconAndClose(modifiedIcon);
    }
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
          initialIcon={defaultIconFormat}
          setModifiedIcon={setModifiedIcon}
          onKeyDown={onKeyDown}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeWithoutSave}>취소</Button>
        <Button variant="primary" onClick={() => saveIconAndClose(modifiedIcon)}>저장</Button>
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