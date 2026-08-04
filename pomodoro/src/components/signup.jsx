import { useState, useEffect, useRef } from 'react';
import { UserAuth } from './context/AuthContext';

const Signup = ({accountMode, setAccountMode, setIsOpen}) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const {session, signUpNewUser, signInUser, signOut} = UserAuth();

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(" ");
    try{
      const result = await signUpNewUser(email, password)
      if(result.success){
        console.log("User Signed Up: ", email, password);
        console.log(result.data);
        setAccountMode('signout');
        setIsOpen(false);
      } else {
        setMessage(result.error);
      }
    } catch (err) {
    setMessage('an error occured');
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(" ");
    try{
      const result = await signInUser(email, password)
      if(result.success){
        console.log("User Signed In: ", email, password);
        setAccountMode('signout');
        setIsOpen(false);
      } else { 
        setMessage(result.error);

      }
    } catch (err) {
    setMessage('an error occured on sign in')
    } finally {
      setLoading(false); 
    }
  }

  const handleSignOut = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(" ");
    try{
      const result = await signOut()
      if(result.success){
        console.log("User Signed out.");
        setAccountMode('signup');
        setIsOpen(false);
      }
    } catch (err) {
      setMessage('an error occured on sign out: ')
    } finally {
      setLoading(false);
    }
  }

  const modalText = {
    signup: 'Sign Up',
    login: 'Log In',
    signout: 'Sign Out',
  };

  return (
  <div>
      <form onSubmit={accountMode === 'signup' ? handleSignUp : accountMode === 'login' ? handleSignIn: handleSignOut}>
        {accountMode !== 'signout' && <h2>{modalText[accountMode]}</h2>}
        <div>
          {accountMode !== 'signout' && <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-3" type="email"/>}
          {accountMode !== 'signout' && <input onChange={(e) => setPassword(e.target.value)}placeholder="Password" className="p-3" type="password"/>}
          <button type="submit" disabled={loading}> 
            {modalText[accountMode]} 
          </button>
          {accountMode !== 'signout' && <button type="button" onClick={() => {accountMode === 'signup' ? setAccountMode('login'): setAccountMode('signup')}}> {accountMode === 'signup' ? 'Already have an account? Log in!' : 'Don\'t have an account? Sign up!' }</button>}
          {message && <p>{message}</p>}        
        </div>
      </form>
  </div>
  );
}

export default Signup;