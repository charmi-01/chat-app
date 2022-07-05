/* eslint-disable consistent-return */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router';
import {Alert,Button} from 'rsuite';
import {auth, database, storage} from '../../../misc/firebase';
import { groupBy, transformToArrayWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const PAGE_SIZE=15;

const messagesRef= database.ref('/messages');

function shouldScrollToBottom(node,threshold=30){

  const percentage=(100*node.scrollTop) /(node.scrollHeight -node.clientHeight) || 0;

  return percentage>threshold;

};


function Messages() {
  const {chatId}=useParams();
  const [messages,setMessages] = useState(null);
  const [limit,setLimit]= useState(PAGE_SIZE);
  const selfRef=useRef();

  const isChatEmpty= messages && messages.length === 0 ;
  const canShowMessages = messages && messages.length>0;

  const loadMessages=useCallback((limitToLast)=>{

      messagesRef.off();
      const node= selfRef.current;

      messagesRef.orderByChild('roomId').equalTo(chatId)
      .limitToLast(limitToLast || PAGE_SIZE)
      .on('value',(snap)=>{

      const data= transformToArrayWithId(snap.val());
      
      setMessages(data);

      if(shouldScrollToBottom(node)){
        node.scrollTop= node.scrollHeight;
      }

    });

    setLimit(p=>p+PAGE_SIZE);

  },[chatId]);

  const onLoadMore= useCallback(()=>{

    const node= selfRef.current;
    const oldHeight= node.scrollHeight;

    loadMessages(limit);

    setTimeout(()=>{

      const newHeight= node.scrollHeight;

      node.scrollTop = newHeight-oldHeight;

    },400);

  },[limit,loadMessages])


  useEffect(()=>{
    const node= selfRef.current;

    loadMessages();
    
    setTimeout(()=>{
      node.scrollTop = node.scrollHeight;
    },400);

    return ()=>{
      messagesRef.off('value');
    };
  },[loadMessages]);

  const handleDelete=useCallback(async (msgId,file)=>{

    // eslint-disable-next-line no-alert
    if(!window.confirm('Delete this message?')){
      return ;
    }

    const isLast= messages[messages.length-1].id === msgId;

    const updates={};

    updates[`/messages/${msgId}`]= null;

    if(isLast && messages.length>1){
      updates[`/rooms/${chatId}/lastMessage`]= {
        ...messages[messages.length-2],
        msgId: messages[messages.length-2].id
      }
    }

    if(isLast && messages.length===1){
      updates[`/rooms/${chatId}/lastMessage`]=null;
    }

    try {

      await database.ref().update(updates);
      
      Alert.info('Message has been deleted',3000);

    } catch (err) {
      return Alert.error(err.message,3000);
    }
    if(file){

      try {
        
        const fileRef= storage.refFromURL(file.url);
        await fileRef.delete();
      } catch (error) {
        Alert.error(error.message);
      }
    }



  },[messages,chatId]);

  const handleLike=useCallback(async (msgId)=>{

    const {uid}= auth.currentUser;
    const messageRef= database.ref(`/messages/${msgId}`);

    let alertMsg;

    await messageRef.transaction(msg=>{
      if(msg){
        if(msg.likes && msg.likes[uid]){
          msg.likeCount-=1;
          msg.likes[uid]= null;
          alertMsg='Like removed';
        }else{
          msg.likeCount+=1;

          if(!msg.likes){
            msg.likes={};
          }

          msg.likes[uid]=true;
          alertMsg='Like added';
        }
      }

      return msg;

    });

    Alert.info(alertMsg,4000);

  },[])

  const handleAdmin = useCallback(async (uid)=>{

    const adminRef= database.ref(`/rooms/${chatId}/admins`);

    let alertMsg;

    await adminRef.transaction(admins=>{
      if(admins){
        if(admins[uid]){
          admins[uid]=null;
          alertMsg='Admin permission removed';
        }else{
          admins[uid]=true;
          alertMsg='Admin permission granted';
        }
      }

      return admins;

    });

    Alert.info(alertMsg,4000);

  },[chatId]);

  const renderMessages=()=>{
    const groups= groupBy(messages,(item)=> new Date(item.createdAt).toDateString());

    const items=[];

    Object.keys(groups).forEach((date)=>{
      items.push(<li key={date} className="text-center md-1 padded" >{date}</li>);

      const msgs= groups[date].map(msg=>(
       <MessageItem key={msg.id} message={msg} 
          handleLike={handleLike}
          handleAdmin={handleAdmin}
          handleDelete={handleDelete}
          />
      ));

        items.push(...msgs);
    });

    return items;
  
  };

  return (
    <ul ref={selfRef} className='msg-list custom-scroll'>
      {messages && messages.length >= PAGE_SIZE && 
      <li className='text-center mt-2 md-2'>
        <Button onClick={onLoadMore} color='green'>Load More</Button></li>}
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages && renderMessages()}

    </ul>
  )
};

export default Messages;