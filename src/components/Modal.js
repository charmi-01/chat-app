import React from 'react'
import { createPortal } from 'react-dom'

const modalRoot= document.getElementById("modal-root")

function Modal({children}) {
  return (
    createPortal(children,modalRoot)
  )
}

export default Modal