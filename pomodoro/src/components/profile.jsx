import { useState, useEffect } from 'react';
import { UserAuth } from './context/AuthContext';
import { supabase } from '../supabase';


const Profile = ({getFormattedTime}) => {

const [sessionHistory, setSessionHistory] = useState(null);

const {session} = UserAuth();

const getProData = async () => {
    if (!session?.user) {
        return;
    }

    const { data, error } = await supabase
        .from('public.sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('completedAt', {ascending: true})

    if (error){
        console.log("there was an error retrieving data: ", error);
    }

    return data;
};

useEffect(() => {
    if (!session?.user) {
        setSessionHistory([]);
        return;
    }

    const loadSession = async () => {
        const proSessions = await getProData();
        setSessionHistory(proSessions);
    };

    loadSession();
}, [session]);


if (sessionHistory === null) {
    return <p>Loading session history...</p>;
}

return (
    <div>
       {sessionHistory.map((history) => ( 
            <div key={history.id}>
                <p>Session Total: {getFormattedTime(history.totalTime)}</p>
                <p>Time Working: {getFormattedTime(history.totalWorkTime)}</p>
                <p>Time on Break: {getFormattedTime(history.totalBreakTime)}</p>
                <p>Time Paused: {getFormattedTime(history.totalPauseTime)}</p>
                <p>Items Completed: {history.tasksCompleted}</p>  
            </div>
        ))}
    </div>
)

};
export default Profile;