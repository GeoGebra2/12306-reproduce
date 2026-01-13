import React, { useState } from 'react';
import SearchQueryBar from './components/SearchQueryBar';
import FilterPanel from './components/FilterPanel';
import './TicketSearchPage.css';

const TicketSearchPage = () => {
  const [filters, setFilters] = useState({ trainTypes: [], seatTypes: [] });

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
        {/* REQ-2-2-3 车次列表将在这里 */}
        <div className="placeholder">
            车次列表区域
            <div style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
                Debug: Filtered by {JSON.stringify(filters)}
            </div>
        </div>
      </main>
    </div>
  );
};

export default TicketSearchPage;
