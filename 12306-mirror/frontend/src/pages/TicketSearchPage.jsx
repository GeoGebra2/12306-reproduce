import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchQueryBar from './components/SearchQueryBar';
import FilterPanel from './components/FilterPanel';
import TrainList from './components/TrainList';
import './TicketSearchPage.css';

const TicketSearchPage = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ trainTypes: [], seatTypes: [] });

  const fromStation = searchParams.get('from');
  const toStation = searchParams.get('to');
  const date = searchParams.get('date');

  return (
    <div className="ticket-search-page">
      <header className="search-header">
        <div className="header-content">
            <div className="logo-small">12306</div>
            <SearchQueryBar />
        </div>
      </header>
      
      <div className="search-filter-container">
          <FilterPanel onChange={setFilters} />
      </div>

      <main className="search-results">
        <TrainList 
            fromStation={fromStation}
            toStation={toStation}
            date={date}
            filters={filters}
        />
      </main>
    </div>
  );
};

export default TicketSearchPage;
