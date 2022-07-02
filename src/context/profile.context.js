/* eslint-disable react/function-component-definition */
import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from 'firebase/app';
import { auth, database } from '../misc/firebase';

export const isOfflineForDatabase = {
  state: 'offline',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: 'online',
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfiles] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userRef;
    let userStatusRef;
    const authUnsub = auth.onAuthStateChanged(authObj => {
      if (authObj) {
        userRef = database.ref(`/profiles/${authObj.uid}`);
        userStatusRef = database.ref(`/status/${authObj.uid}`);

        userRef.on('value', snap => {
          const { name, createdAt, avatar } = snap.val();
          const data = {
            name,
            createdAt,
            avatar,
            uid: authObj.uid,
            emial: authObj.emial,
          };
          setProfiles(data);
          setIsLoading(false);
        });


        database.ref('.info/connected').on('value', (snapshot)=> {
          // If we're not currently connected, don't do anything.
          if (!!snapshot.val() === false) {
              return;
          };
      
          userStatusRef.onDisconnect().set(isOfflineForDatabase).then(()=> {
              userStatusRef.set(isOnlineForDatabase);
          });
        });
      
      } 
      else {
        if (userRef) {
          userRef.off();
        }

        if(userStatusRef){
          userStatusRef.off();
        }

        database.ref('.info/connected').off();
        
        setProfiles(null);
        setIsLoading(false);
      }
    });
    return () => {
      if (userRef) {
        userRef.off();
      }
      
      if(userStatusRef){
        userStatusRef.off();
      }
      
      database.ref('.info/connected').off();
      
      authUnsub();
    };
  }, []);
  return (
    <ProfileContext.Provider value={{ profile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
