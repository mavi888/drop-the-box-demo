import './App.css';

import Amplify from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

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

  return (
    <AmplifyAuthenticator>
    <div className="App">
      <Header/>
      HELLO MAPS
    </div>
    </AmplifyAuthenticator>
  );
}

export default App;
