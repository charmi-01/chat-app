import React, { useCallback } from 'react';
import { Alert, Button, Drawer, Icon } from 'rsuite';
import Dashboard from '.';
import { isOfflineForDatabase } from '../../context/profile.context';
import { useModalState, useMediaQuery } from '../../misc/custom-hooks';
import { auth, database } from '../../misc/firebase';

function DashboardToggle() {
  const { isOpen, open, close } = useModalState();

  const isMobile = useMediaQuery('(max-width: 992px)');

  const onSignOut = useCallback(() => {

    database.ref(`/status/${auth.currentUser.uid}`).set(isOfflineForDatabase).then(
      ()=>{

        auth.signOut();
    
        Alert.info('Signed out', 4000);
    
        close();
      }
    ).catch(err=>{
      Alert.error(err.message,4000);
    })

  }, [close]);

  return (
    <>
      <Button block color="blue" onClick={open}>
        <Icon icon="dashboard" /> Dashboard
      </Button>
      <Drawer
        full={isMobile}
        size="xs"
        show={isOpen}
        onHide={close}
        placement="left"
      >
        <Dashboard onSignOut={onSignOut} />
      </Drawer>
    </>
  );
}

export default DashboardToggle;
