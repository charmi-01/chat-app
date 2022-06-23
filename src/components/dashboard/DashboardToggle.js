import React, { useCallback } from 'react';
import { Alert, Button, Drawer, Icon } from 'rsuite';
import Dashboard from '.';
import { useModalState, useMediaQuery } from '../../misc/custom-hooks';
import { auth } from '../../misc/firebase';

function DashboardToggle() {
  const { isOpen, open, close } = useModalState();

  const isMobile = useMediaQuery('(max-width: 992px)');

  const onSignOut = useCallback(() => {
    auth.signOut();

    Alert.info('Signed out', 4000);

    close();
  }, [close]);

  return (
    <>
      <Button block color="blue" onClick={open}>
        <Icon icon="dashboard" /> Dashboard
      </Button>
      <Drawer
        full={isMobile}
        size="sm"
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
