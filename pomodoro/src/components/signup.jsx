import { useState, useEffect, useRef } from 'react';
import { UserAuth } from './context/AuthContext';

const Signup = ({accountMode}) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {session, signUpNewUser} = UserAuth();

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const result = await signUpNewUser(email, password)
      if(result.success){
        console.log("User Signed Up: ", email, password);
      }
    } catch (err) {
    setError('an error occured')
    } finally {
      setLoading(false);
    }
  }

  return (
  <div>
      <form onSubmit={handleSignUp}>
        <h2>Sign up</h2>
        <div>
          <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-3" type="email"/>
          <input onChange={(e) => setPassword(e.target.value)}placeholder="Password" className="p-3" type="password"/>
          <button type="submit" disabled={loading}> Sign up </button>
          <button>{accountMode === 'signup' ? 'Already have an account? Log in!' : 'Don\'t have an account? Sign up!' }</button>
          {error && <p>{error}</p>}        </div>
      </form>
  </div>
  );
}

export default Signup;