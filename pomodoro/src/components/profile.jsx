import { useState, useEffect } from 'react';
import { UserAuth } from './context/AuthContext';
import { supabase } from '../supabase';


const Profile = ({getFormattedTime}) => {

const [sessionHistory, setSessionHistory] = useState(null);
const [chartFormat, setChartFormat] = useState('Day');
const {session} = UserAuth();
const [chartData, setChartData] = useState({
    labels: [],
    data: [],
});    

useEffect(() => {
    dataSort(chartFormat);
}, [chartFormat, sessionHistory]);

const dataSort = (chartFormat) => {
    if (chartFormat === 'Day') {
        const dayFormat = new Map();

        const endDate = new Date();
        const startDate = new Date();

        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const key = currentDate.toISOString().split('T')[0];

            dayFormat.set(key, 0);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        sessionHistory.forEach(session => {
            const date = new Date(session.completedAt);

            if (date < startDate || date > endDate) {
                return;
            }

            const key = date.toISOString().split('T')[0];

            dayFormat.set(
                key,
                dayFormat.get(key) + session.totalWorkTime
            );
        });

        setChartData({
            labels: Array.from(dayFormat.keys()),
            data: Array.from(dayFormat.values()),
        });
    }

    else if (chartFormat === 'Week') {
        const weekFormat = new Map();

        const endDate = new Date();
        const startDate = new Date();

        startDate.setDate(endDate.getDate() - 27);
        startDate.setHours(0, 0, 0, 0);

        const currentWeekStart = new Date(startDate);

        while (currentWeekStart <= endDate) {
            const key = currentWeekStart.toISOString().split('T')[0];

            weekFormat.set(key, 0);

            currentWeekStart.setDate(
                currentWeekStart.getDate() + 7
            );
        }

        sessionHistory.forEach(session => {
            const date = new Date(session.completedAt);

            if (date < startDate || date > endDate) {
                return;
            }

            const daysSinceStart = Math.floor(
                (date - startDate) / (24 * 60 * 60 * 1000)
            );

            const weekNumber = Math.floor(daysSinceStart / 7);

            const weekStart = new Date(startDate);

            weekStart.setDate(
                startDate.getDate() + weekNumber * 7
            );

            const key = weekStart.toISOString().split('T')[0];

            weekFormat.set(
                key,
                weekFormat.get(key) + session.totalWorkTime
            );
        });

        setChartData({
            labels: Array.from(weekFormat.keys()),
            data: Array.from(weekFormat.values()),
        });
    }

    else if (chartFormat === 'Month') {
        const monthFormat = new Map();

        const endDate = new Date();
        const startDate = new Date();

        startDate.setMonth(endDate.getMonth() - 2);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const currentMonth = new Date(startDate);

        while (currentMonth <= endDate) {
            const key = [
                currentMonth.getFullYear(),
                String(currentMonth.getMonth() + 1).padStart(2, '0')
            ].join('-');

            monthFormat.set(key, 0);

            currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        sessionHistory.forEach(session => {
            const date = new Date(session.completedAt);

            if (date < startDate || date > endDate) {
                return;
            }

            const key = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0')
            ].join('-');

            monthFormat.set(
                key,
                monthFormat.get(key) + session.totalWorkTime
            );
        });

        setChartData({
            labels: Array.from(monthFormat.keys()),
            data: Array.from(monthFormat.values()),
        });
    }
};

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
        <div>
            <select value={chartFormat} onChange={(e) => setChartFormat(e.target.value)}>
                <option value="Day"> Day </option>
                <option value="Week"> Week </option>
                <option value="Month"> Month </option>
            </select>
        </div> 
    </div>
)

};
export default Profile;