import { useState, useEffect } from 'react';
import { UserAuth } from './context/AuthContext';
import { supabase } from '../supabase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip} from 'chart.js';
import { Bar } from 'react-chartjs-2';


const Profile = ({getFormattedTime}) => {

const [sessionHistory, setSessionHistory] = useState(null);
const [chartFormat, setChartFormat] = useState('Day');
const {session} = UserAuth();
const [chartData, setChartData] = useState({
    labels: [],
    data: [],
});    

useEffect(() => {
    if(sessionHistory === null) return;
    dataSort(chartFormat);
}, [chartFormat, sessionHistory]);

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
);

const options = {
    responsive: true,
    plugins: {
        title: {
            display: true,
            text: 'Hours Worked'
        },
    },
};

const data = {
    labels: chartData.labels,
    datasets: [
    {
      label: 'Total Time Studying ',
      data: chartData.data,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }
    ]
};


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

        sessionHistory.forEach(sessions => {
            const date = new Date(sessions.completedAt);

            if (date < startDate || date > endDate) {
                return;
            }

            const key = date.toISOString().split('T')[0];

            dayFormat.set(
                key,
                dayFormat.get(key) + sessions.totalWorkTime
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

        sessionHistory.forEach(sessions => {
            const date = new Date(sessions.completedAt);

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
                weekFormat.get(key) + sessions.totalWorkTime
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

        sessionHistory.forEach(sessions => {
            const date = new Date(sessions.completedAt);

            if (date < startDate || date > endDate) {
                return;
            }

            const key = [
                date.getFullYear(),
                String(date.getMonth() + 1).padStart(2, '0')
            ].join('-');

            monthFormat.set(
                key,
                monthFormat.get(key) + sessions.totalWorkTime
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
            <div>
                <Bar options={options} data={data}/>
            </div>
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