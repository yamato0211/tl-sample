import { getAuth, signOut, onAuthStateChanged, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from './libs/client';
import { useNavigate } from "react-router-dom";

const provider = new GithubAuthProvider();

const Auth = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(user)
    } else {
      console.log('no user')
    }
  });

  const login = () => {
    signInWithPopup(auth, provider).then(res => {
      const credential = GithubAuthProvider.credentialFromResult(res);
      const token = credential?.accessToken;

      const user = res.user;

      console.log(user);
      console.log(token);
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GithubAuthProvider.credentialFromError(error);
      console.error(errorCode, errorMessage, email, credential);
    });
  }
  const logout = () => {
    signOut(auth);
  }

  return (
    <div>
      <button onClick={login}>login</button>
      <button onClick={logout}>logout</button>
      <div>
        <button onClick={() => {navigate("/")}}>Go to Events</button>
      </div>
    </div>
  )
}

export default Auth