import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SearchFilter from '../components/TrainList/SearchFilter';
import TrainFilterBar from '../components/TrainList/TrainFilterBar';
import TrainItem from '../components/TrainList/TrainItem';
import '../components/TrainList/TrainList.css';

const TrainListPage = () => {
    const [searchParams] = useSearchParams();
    const [trains, setTrains] = useState([]);
    const [filteredTrains, setFilteredTrains] = useState([]);
    const [loading, setLoading] = useState(true);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchTrains = async () => {
            // 如果没有指定出发地或目的地，不进行查询 (REQ-2-2:SCE-3)
            if (!from || !to) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get('/api/tickets', {
                    params: { from, to, date }
                });
                setTrains(res.data);
                setFilteredTrains(res.data); // Initial set
            } catch (error) {
                console.error("Failed to fetch trains", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrains();
    }, [from, to, date]);

    const handleFilterChange = (filtered) => {
        setFilteredTrains(filtered);
    };

    return (
        <div className="train-list-page">
            <SearchFilter from={from} to={to} date={date} />
            
            {/* Show FilterBar only if we have results or if we want to show it always (but usually requires data for dynamic filters) */}
            {trains.length > 0 && (
                <TrainFilterBar trains={trains} onFilterChange={handleFilterChange} />
            )}

            <div className="train-list-header">
                <div className="train-col">车次</div>
                <div className="train-col">出发/到达车站</div>
                <div className="train-col">出发/到达时间</div>
                <div className="train-col">历时</div>
                <div className="train-col">参考票价</div>
                <div className="train-col">操作</div>
            </div>

            <div className="train-list-body">
                {loading ? (
                    <div>Loading...</div>
                ) : filteredTrains.length > 0 ? (
                    filteredTrains.map(train => <TrainItem key={train.id} train={train} date={date} />)
                ) : (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                        {(!from || !to) ? '请选择出发地和目的地' : '没有找到符合条件的车次'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainListPage;