import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect } from 'react';

import Amplify, { Auth } from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

import { Signer } from "@aws-amplify/core";
import Location from "aws-sdk/clients/location";

import Pin from './Pin'

import ReactMapGL, {Marker,
  NavigationControl
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";


import awsconfig from './aws-exports';

const mapName = "FooBarMap"; // HERE IT GOES THE NAME OF YOUR MAP
const indexName = "MyPlaceIndex" // HERE GOES THE NAME OF YOUR PLACE INDEX

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

function Search(props){

  const [place, setPlace] = useState('Helsinki');
 
  const handleChange = (event) => {
    setPlace(event.target.value);
  }

  const handleClick = (event) => {
    event.preventDefault();
    props.searchPlace(place)
  }
  
  return (
    <div className="container">
      <div className="input-group">
        <input type="text" className="form-control form-control-lg" placeholder="Search for Places" aria-label="Place" aria-describedby="basic-addon2" value={ place } onChange={handleChange}/>
        <div className="input-group-append">
          <button onClick={ handleClick } className="btn btn-primary" type="submit">Search</button>
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
 
  const [marker, setMarker] = useState({
    longitude: -123.1187,
    latitude: 49.2819,
  });

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

  const searchPlace = (place) => {

    const params = {
      IndexName: indexName,
      Text: place,
    };

    client.searchPlaceIndexForText(params, (err, data) => {
      if (err) console.error(err);
      if (data) {
 
        const coordinates = data.Results[0].Place.Geometry.Point;
        setViewport({
          longitude: coordinates[0],
          latitude: coordinates[1], 
          zoom: 10});

        setMarker({
          longitude: coordinates[0],
          latitude: coordinates[1],                 
        })
        return coordinates;
      }
    });
  }

  return (
    <AmplifyAuthenticator>
    <div className="App">
      <Header/>
      <div>
        <Search searchPlace = {searchPlace} /> 
      </div>
      <br/>
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
            <Marker
              longitude={marker.longitude}
              latitude={marker.latitude}
              offsetTop={-20}
              offsetLeft={-10}
            > 
            <Pin size={20}/>
            </Marker>

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
