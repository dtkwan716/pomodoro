import { createContext, useEffect, useState, useContext } from 'react';
import { supabase } from '../../supabase';

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState(undefined)



    //SignUp
    const signUpNewUser = async (email, password) => {
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });


        if(error) {
            console.error("There was an error signing up:", error);
            return { success: false, error: error.message };
        }
        return { success: true, data };
    };

    //Signin
    const signInUser = async (email, password) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) {
                console.error('sign in error occured: ', error);
                return {success: false, error: error.message};
            }
            console.log("sign-in success: ", data);
            return {success: true, data};
        } catch (error) {
            console.error('an error occured: ', error);
        }
    }
    useEffect (() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

    supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
    });
    }, []);

    //SignOut
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("there was an error signing out:", error);
            return {success: false, error: error.message};
        }
        return {success: true};
    }

    return (
        <AuthContext.Provider value={{session, signUpNewUser, signInUser, signOut}}>
            {children}
        </AuthContext.Provider>
    );
}

export const UserAuth = () => {
    return useContext(AuthContext);
}