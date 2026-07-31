import { useState, useEffect } from 'react';
import { UserAuth } from './context/AuthContext';
import { supabase } from '../supabase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip} from 'chart.js';
import { Bar } from 'react-chartjs-2';


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
);

const Profile = ({getFormattedTime}) => {

const [sessionHistory, setSessionHistory] = useState(null);
const [chartFormat, setChartFormat] = useState('Day');
const {session} = UserAuth();
const [chartData, setChartData] = useState({
    labels: [],
    breakTime: [],
    workTime: [],
    pauseTime: [],
    tasksCompleted: [],
    sessionsCompleted: [],
});
const [metric, setMetric] = useState("workTime");

const coolPalette = [
    '#6dd3ff',
    '#4ea8de',
    '#3f88c5',
    '#5e60ce',
    '#48bfe3',
    '#64dfdf',
    '#80ffdb',
];

const getBarColor = (index) => coolPalette[index % coolPalette.length];

const formatLabelForRange = (date, chartFormat) => {
    if (chartFormat === 'Day') {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    if (chartFormat === 'Week') {
        return `Week of (${date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })})`;
    }

    return `Month of (${date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })})`;
};

const formatCountTick = (value) => Number.isInteger(value) ? value : Math.round(value);
const isDarkTheme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
const axisColor = isDarkTheme ? '#ffffff' : '#243447';
const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.14)' : 'rgba(94, 96, 206, 0.12)';

useEffect(() => {
    if(sessionHistory === null) return;
    dataSort(chartFormat);
}, [chartFormat, sessionHistory]);


const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            top: 8,
            right: 12,
            bottom: 0,
            left: 4,
        },
    },
    plugins: {
        title: {
            display: true,
            text: 'Hours Worked'
            ,
            color: axisColor,
            font: {
                family: 'var(--heading)',
                size: 15,
                weight: 600,
            },
        },
    },
    scales: {
        x: {
            border: {
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(55, 65, 81, 0.75)',
                width: 1.5,
            },
            grid: {
                display: false,
            },
            ticks: {
                color: axisColor,
                font: {
                    size: 12,
                    weight: 600,
                    family: 'var(--sans)',
                },
            },
        },
        y: {
            beginAtZero: true,
            border: {
                color: isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(55, 65, 81, 0.75)',
                width: 1.5,
            },
            grid: {
                color: gridColor,
            },
            ticks: {
                color: axisColor,
                precision: 0,
                font: {
                    size: 12,
                    weight: 600,
                    family: 'var(--sans)',
                },
                callback: (value) => formatCountTick(value).toLocaleString(),
            },
        },
    },
};

const metricLabel = {
    workTime: "Hours worked",
    pauseTime: "Time Paused",
    breakTime: "Time on Break",
    sessionsCompleted: "Sessions Completed",
    tasksCompleted: "Tasks Completed"
}

let datasets;

    if(metric === "all") { 
    datasets = [
    {
      label: 'Total Time Studying ',
      data: chartData.workTime.map(time => time / 360000),
      backgroundColor: getBarColor(0),
      borderColor: getBarColor(0),
    },
    {
      label: 'Total Time Paused ',
      data: chartData.pauseTime.map(time => time / 360000),
      backgroundColor: getBarColor(1),
      borderColor: getBarColor(1),
    },
    {
      label: 'Total Time On Break ',
      data: chartData.breakTime.map(time => time / 360000),
      backgroundColor: getBarColor(2),
      borderColor: getBarColor(2),
    },
    ];
    } else {
    datasets = [
        {
        label: metricLabel[metric],
        data: 
            metric === 'sessionsCompleted'
            ? chartData.sessionsCompleted
            : metric === 'tasksCompleted'
            ? chartData.tasksCompleted
            : chartData[metric].map(time => time / 360000)
        ,
        backgroundColor: chartData.labels.map((_, index) => getBarColor(index)),
        borderColor: chartData.labels.map((_, index) => getBarColor(index)),
        }
    ];
    }

const data = {
    labels: chartData.labels,
    datasets: datasets,
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

            dayFormat.set(key, {
                breakTime: 0,
                workTime: 0,
                pauseTime: 0,
                tasksCompleted: 0,
                sessionsCompleted: 0,
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        sessionHistory.forEach(sessions => {
            const date = new Date(sessions.completedAt);

            if (date < startDate || date > endDate) {
                return;
            }

            const key = date.toISOString().split('T')[0];

            dayFormat.set(key, {
                breakTime: dayFormat.get(key).breakTime + sessions.totalBreakTime,
                workTime: dayFormat.get(key).workTime + sessions.totalWorkTime,
                pauseTime: dayFormat.get(key).pauseTime + sessions.totalPauseTime,
                tasksCompleted: dayFormat.get(key).tasksCompleted + sessions.tasksCompleted,
                sessionsCompleted: dayFormat.get(key).sessionsCompleted + 1,
            });
        });
        const values = Array.from(dayFormat.values());
        const keys = Array.from(dayFormat.keys());

        setChartData({
            labels: keys.map((key) => formatLabelForRange(new Date(key), 'Day')),
            breakTime: values.map(item => item.breakTime),
            workTime: values.map(item => item.workTime),
            pauseTime: values.map(item => item.pauseTime),
            tasksCompleted: values.map(item => item.tasksCompleted),
            sessionsCompleted: values.map(item => item.sessionsCompleted),
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

            weekFormat.set(key, {
                breakTime: 0,
                workTime: 0,
                pauseTime: 0,
                tasksCompleted: 0,
                sessionsCompleted: 0,
            });

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

            weekFormat.set(key, {
                breakTime: weekFormat.get(key).breakTime + sessions.totalBreakTime,
                workTime: weekFormat.get(key).workTime + sessions.totalWorkTime,
                pauseTime: weekFormat.get(key).pauseTime + sessions.totalPauseTime,
                tasksCompleted: weekFormat.get(key).tasksCompleted + sessions.tasksCompleted,
                sessionsCompleted: weekFormat.get(key).sessionsCompleted + 1,
            });
        });

        const values = Array.from(weekFormat.values());
        const keys = Array.from(weekFormat.keys());

        setChartData({
            labels: keys.map((key) => formatLabelForRange(new Date(key), 'Week')),
            breakTime: values.map(item => item.breakTime),
            workTime: values.map(item => item.workTime),
            pauseTime: values.map(item => item.pauseTime),
            tasksCompleted: values.map(item => item.tasksCompleted),
            sessionsCompleted: values.map(item => item.sessionsCompleted),
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

            monthFormat.set(key, {
                breakTime: 0,
                workTime: 0,
                pauseTime: 0,
                tasksCompleted: 0,
                sessionsCompleted: 0,
            });

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

            monthFormat.set(key, {
                breakTime: monthFormat.get(key).breakTime + sessions.totalBreakTime,
                workTime: monthFormat.get(key).workTime + sessions.totalWorkTime,
                pauseTime: monthFormat.get(key).pauseTime + sessions.totalPauseTime,
                tasksCompleted: monthFormat.get(key).tasksCompleted + sessions.tasksCompleted,
                sessionsCompleted: monthFormat.get(key).sessionsCompleted + 1,
            });
        });

        const values = Array.from(monthFormat.values());
        const keys = Array.from(monthFormat.keys());

        setChartData({
            labels: keys.map((key) => formatLabelForRange(new Date(`${key}-01`), 'Month')),
            breakTime: values.map(item => item.breakTime),
            workTime: values.map(item => item.workTime),
            pauseTime: values.map(item => item.pauseTime),
            tasksCompleted: values.map(item => item.tasksCompleted),
            sessionsCompleted: values.map(item => item.sessionsCompleted),
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
            <div className="profile-chart-wrap">
                <Bar options={options} data={data}/>
            </div>
        <div className="profile-controls">
            <select value={chartFormat} onChange={(e) => setChartFormat(e.target.value)}>
                <option value="Day"> Day </option>
                <option value="Week"> Week </option>
                <option value="Month"> Month </option>
            </select>
            <select value={metric} onChange={(e) => setMetric(e.target.value)}>
                <option value="workTime"> Time Worked </option>
                <option value="pauseTime"> Time Paused </option>
                <option value="breakTime"> Time on Break </option>
                <option value="sessionsCompleted"> Sessions Completed </option>
                <option value="tasksCompleted"> Tasks Completed </option>
                <option value="all"> Total Time </option>
            </select>
        </div> 
    </div>
)

};
export default Profile;
