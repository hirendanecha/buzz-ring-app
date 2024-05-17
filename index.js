import {AppRegistry, Linking} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import RNNotificationCall from 'react-native-full-screen-notification-incoming-call';
import io from 'socket.io-client';
import {store} from './src/redux/store';
import {env} from './src/config';

function returnNotificationData(remoteMessage) {
  const data = JSON.parse(remoteMessage?.data?.body);
  const {
    ProfilePicName,
    Username,
    actionType,
    link,
    notificationByProfileId,
    notificationDesc,
    notificationToProfileId,
    domain,
  } = data;

  return data;
}

function addRNCallEventListener() {
  try {
    let isCalled = false;
    RNNotificationCall.addEventListener('answer', async data => {
      if (isCalled) {
        return;
      }
      isCalled = true;

      const {callUUID, payload} = data;
      const callData = JSON.parse(payload);
      console.log('press answer', callUUID, callData);

      const state = store.getState();

      const user = state?.scanner?.data.find(item => {
        return item?.Id === callData?.data?.notificationToProfileId;
      });

      const customHeaders = {
        Authorization: `Bearer ${user?.token}`,
      };

      const newSocket = await io.connect(env.SOCKET_URL, {
        reconnectionDelayMax: 300,
        // reconnection: true,
        randomizationFactor: 0.2,
        // timeout: 120000,
        reconnectionAttempts: 50000,
        transports: ['websocket'],
        auth: customHeaders,
      });

      await newSocket.on('connect', async () => {
        try {
          console.log('<--- Socket connected --->', newSocket);

          newSocket.emit(
            'pick-up-call',
            {
              notificationToProfileId: callData?.data?.notificationByProfileId,
              roomId: callData?.data?.roomId,
              groupId: callData?.data?.groupId,
              notificationByProfileId: callData?.data?.notificationToProfileId,
              link: callData?.data?.link,
            },
            data => {
              console.log(data, 'pick-up-call');
              newSocket.emit(
                'decline-call',
                {
                  notificationToProfileId:
                    callData?.data?.notificationByProfileId,
                  roomId: callData?.data?.roomId,
                  groupId: callData?.data?.groupId,
                  notificationByProfileId:
                    callData?.data?.notificationToProfileId,
                },
                data => {
                  console.log(data, 'decline-call');
                  newSocket.disconnect();
                },
              );
              Linking.openURL(callData?.data?.link);
              RNNotificationCall.hideNotification();
            },
          );
        } catch (error) {
          console.log('socket error-->', error);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }

  RNNotificationCall.addEventListener('endCall', async data => {
    try {
      const {callUUID, endAction, payload} = data;
      console.log('press endCall', callUUID, endAction, payload);
      RNNotificationCall.hideNotification();
      const callData = JSON.parse(payload);

      const state = store.getState();

      const user = state?.scanner?.data?.find(item => {
        return item.Id === callData?.data?.notificationToProfileId;
      });

      const customHeaders = {
        Authorization: `Bearer ${user?.token}`,
      };

      const newSocket = await io.connect(env.SOCKET_URL, {
        reconnectionDelayMax: 300,
        // reconnection: true,
        randomizationFactor: 0.2,
        // timeout: 120000,
        reconnectionAttempts: 50000,
        transports: ['websocket'],
        auth: customHeaders,
      });

      await newSocket.on('connect', async () => {
        try {
          console.log('<--- Socket connected --->', callData.data);

          newSocket.emit(
            'decline-call',
            {
              notificationToProfileId: callData?.data?.notificationByProfileId,
              roomId: callData?.data?.roomId,
              groupId: callData?.data?.groupId,
              notificationByProfileId: callData?.data?.notificationToProfileId,
            },
            data => {
              console.log(data, 'decline-call');
              RNNotificationCall.hideNotification();
              newSocket.disconnect();
            },
          );
        } catch (error) {
          console.log('socket error-->', error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
}

const displayIncomingCall = data => {
  try {
    RNNotificationCall.displayNotification(
      `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
      data?.ProfilePicName,
      15000,
      {
        channelId: `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
        channelName: 'Incoming call',
        notificationIcon: 'ic_launcher', //mipmap
        notificationTitle: data?.Username,
        notificationBody: 'Incoming call • ' + data?.domain,
        answerText: 'Answer',
        declineText: 'Decline',
        payload: {data: data},
        notificationColor: 'colorAccent',
        notificationSound: 'famous_ringtone', //raw
      },
    );
  } catch (error) {
    console.log(error);
  }
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    const data = returnNotificationData(remoteMessage);
    console.log('Message handled in the background!', data);

    addRNCallEventListener();

    if (data?.actionType == 'VC') {
      displayIncomingCall(data);
    } else {
      RNNotificationCall.declineCall(
        `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
      );
    }
  } catch (error) {
    console.log(error);
  }
});

messaging().onMessage(async remoteMessage => {
  try {
    const data = returnNotificationData(remoteMessage);
    console.log('Message handled in the foreground!', data);

    addRNCallEventListener();

    if (data?.actionType == 'VC') {
      displayIncomingCall(data);
    } else {
      RNNotificationCall.declineCall(
        `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
      );
    }
  } catch (error) {
    console.log(error);
  }
});

AppRegistry.registerComponent(appName, () => App);
