import React from 'react';
import './TrainList.css';

const SearchFilter = ({ from, to, date }) => {
    return (
        <div className="search-filter">
            <span><strong>{from || '未指定'}</strong> --&gt; <strong>{to || '未指定'}</strong></span>
            <span style={{marginLeft: '20px'}}>{date}</span>
        </div>
    );
};

export default SearchFilter;