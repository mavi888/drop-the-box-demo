import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect } from 'react';

import Amplify, { Auth } from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

import { Signer } from "@aws-amplify/core";
import Location from "aws-sdk/clients/location";

import ReactMapGL, {
  NavigationControl
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";


import awsconfig from './aws-exports';

const mapName = "FooBarMap"; // HERE IT GOES THE NAME OF YOUR MAP

Amplify.configure(awsconfig);

/**
 * Sign requests made by Mapbox GL using AWS SigV4.
 */
 const transformRequest = (credentials) => (url, resourceType) => {
  // Resolve to an AWS URL
  if (resourceType === "Style" && !url?.includes("://")) {
    url = `https://maps.geo.${awsconfig.aws_project_region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
  }

  // Only sign AWS requests (with the signature as part of the query string)
  if (url?.includes("amazonaws.com")) {
    return {
      url: Signer.signUrl(url, {
        access_key: credentials.accessKeyId,
        secret_key: credentials.secretAccessKey,
        session_token: credentials.sessionToken,
      })
    };
  }

  // Don't sign
  return { url: url || "" };
};

function Header(props) {
  return (
    <div className="container">
      <div className="row">
        <div className="col-10">
          <h1>FooBar Maps</h1>
        </div>
        <div className="col-2">
          <AmplifySignOut />
        </div>
      </div>
    </div>
  )
};

const App = () => {

  const [credentials, setCredentials] = useState(null);

  const [viewport, setViewport] = useState({
    longitude: -123.1187,
    latitude: 49.2819,
    zoom: 10,
  });

  const [client, setClient] = useState(null);
 
  useEffect(() => {
    const fetchCredentials = async () => {
      setCredentials(await Auth.currentUserCredentials());
    };

    fetchCredentials();

    const createClient = async () => {
      const credentials = await Auth.currentCredentials();
      const client = new Location({
          credentials,
          region: awsconfig.aws_project_region,
     });
     setClient(client);
    }

    createClient();  
  }, []);

  return (
    <AmplifyAuthenticator>
    <div className="App">
      <Header/>
      
      <div>
      {credentials ? (
          <ReactMapGL
            {...viewport}
            width="100%"
            height="100vh"
            transformRequest={transformRequest(credentials)}
            mapStyle={mapName}
            onViewportChange={setViewport}w
          >
            <div style={{ position: "absolute", left: 20, top: 20 }}>
              <NavigationControl showCompass={false} />
            </div>
            
          </ReactMapGL>
      ) : (
        <h1>Loading...</h1>
      )}
      </div>
    </div>
    </AmplifyAuthenticator>
  );
}

export default App;
