import React,{memo} from 'react';
import {ButtonToolbar, Icon,Divider} from 'rsuite';
import { Link } from 'react-router-dom';
import { useCurrentRoom } from '../../../context/current-room.context';
import { useMediaQuery } from '../../../misc/custom-hooks';
import RoomInfoBtnModal from './RoomInfoBtnModal';
import EditRoomInfoBtnDrawer from './EditRoomInfoBtnDrawer';

function ChatTop() {

    const name= useCurrentRoom(v=>v.name);
    const isAdmin=useCurrentRoom(v=>v.isAdmin);
    const isMobile= useMediaQuery('(max-width:992px)');
  return (
    <div>
      <div className='d-flex justify-content-between align-items-center'>
        <Icon componentClass={Link} to="/" icon="arrow-circle-left" size='2x'  
          className={isMobile? 'd-inline-block p-0 mr-2 text-blue link-unstyled':'d-none'}/>
        <h4  className='align-items-center'>
          <span className='text-disappear'>{name}</span>
        </h4>
        <div className='d-flex'>

        <ButtonToolbar className='ws-nowrap mr-0'>
          {isAdmin &&
          <EditRoomInfoBtnDrawer/>
        }
        </ButtonToolbar>
        </div>
      </div>
      <div className='d-flex justify-content-between align-items-center'>
          <span>todo</span>
          <RoomInfoBtnModal/>
      </div>
      
    </div>
  )
}

export default memo(ChatTop);