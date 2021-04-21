# Drop The Box Demo

This is a demo for the service Amazon Location Service.

This demo is part of a talk - watch the talk to understand each part of the demo.

## Notes

When you download this files it containes the completed project. You just need it initalize your own Amplify project and create the Amazon Location services in your account.

## Steps for creating this demo

If you want to create this demo from scratch these are the steps you need to follow.

### Initializing the demo

1. Create the react app

```
npx create-react-app drop-the-box-demo
```

2. Make sure that you have Amplify configured in your computer. If not follow the instructions in the documentation.

https://docs.amplify.aws/start/getting-started/installation/q/integration/react

3. Install bootstrap in your project

```
npm install bootstrap
npm install @aws-amplify/ui-react
```

4. Initialize the react app.

```
amplify init
```

5. Add authentication and push the changes to the cloud

```
amplify add auth
amplify push
```

6. Change the main app page to one using authentication

```
cp base/App-01.js src/App.js
```

7. Start the application, create an account and see that everything is working

```
npm start
```

_Expected result_
![screenshot of how it should look](/images/image01.png)

### Adding maps

1. Now you need to go into your AWS account and create a new map in the Amazon Location service.

2. Install the dependencies

```
npm install aws-sdk
npm install @aws-amplify/core
```

For the map drawing libraries we need to install an older version

```
npm install mapbox-gl@1.0.0
npm install react-map-gl@5.2.11
```

3. Give permissions to your Amplify application to access maps

```
amplify console auth
```

And select Identity Pool, check the name of the auth role and add this inline policy to the role. Replace the information with your account information.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "geo:GetMap*",
            "Resource": "arn:aws:geo:<REGION>:<ACCOUNTNUMBER>:map/<NAMEOFMAP>"
        }
    ]
}
```

4. Create the client code. Make sure that you change the MapName to yours.

```
cp base/App-02.js src/App.js
cp base/App-02.css src/App.css
cp base/index-02.html public/index.html
```

### Adding search capabilities

1. Create in the Amazon Location Service a place index.

2. Modify the auth role for the amplify application by adding this permission.

```
{
    "Sid": "VisualEditor1",
    "Effect": "Allow",
    "Action": "geo:SearchPlaceIndexForText",
    "Resource": "arn:aws:geo:<REGION>:<ACCOUNTNUMBER>:place-index/<INDEXNAME>"
}
```

3. Add the client code. Make sure that you change the MapName and IndexName to yours.

```
cp base/App-03.js src/App.js
cp base/Pin-03.js src/Pin.js
```

### Adding a tracker

1. Create a new tracker in the Amazon Location Service.

2. Modify the auth role for the Amplify application by adding this permission.

```
 {
    "Sid": "VisualEditor3",
    "Effect": "Allow",
    "Action": "geo:GetDevicePositionHistory",
    "Resource": "arn:aws:geo:<REGION>:<ACCOUNTNUMBER>:tracker/<TRACKERNAME>"
}
```

3. Modify the client code to show the device real time in the map. Make sure that you change the MapName, IndexName, TrackerName and DeviceId to yours.

```
cp base/App-04.js src/App.js
cp base/useInterval.js src/useInterval.js
```

4. Now you need to send some dummy data so you can see the tracker in action. Run the script:

```
./send-new-locations.sh <TRACKERNAME> <DEVICENAME>
```

This script will send locations every 30 seconds to the location service, simulating your device.

5. Now you can visualize this by pressing the button track in the web app. And you will see new red dots appearing in the screen every 30 seconds.

Expected results:

_Expected result_
![screenshot of how it should look](/images/image02.png)

### Geofencing and notifications

1. Go to the Amazon Location Service and add a new geofence.

Upload the script /script/geofence.json.

There you will find a geofence that is in the line where the tracker will be moving.

2. Connect the tracker to the geofence in the Amazon Location Service. So now everytime the tracker enters or exit the geofence a message will be send to EventBridge.

3. Create a SNS topic, that will send you an email. Confirm the subscription to the topic.

4. Go to EventBridge and create a new rule with a custom pattern.

```
{
  "source": ["aws.geo"],
  "detail-type": ["Location Geofence Event"],
  "detail": {
    "EventType": ["ENTER"],
    "GeofenceId": ["<YOUR GEOFENCE NAME"]
  }
}
```

And put as a target that SNS topic.

5. Restart the script that sends tracker locations so it will go over the geofence (that is around Cairo)

6. Wait for a while and after the tracker has gone over Cairo you will recieve an email.
