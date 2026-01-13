import React from 'react';
import SearchQueryBar from './components/SearchQueryBar';
import './TicketSearchPage.css';

const TicketSearchPage = () => {
  return (
    <div className="ticket-search-page">
      <header className="search-header">
        <div className="header-content">
            <div className="logo-small">12306</div>
            <SearchQueryBar />
        </div>
      </header>
      <main className="search-results">
        {/* REQ-2-2-3 车次列表将在这里 */}
        <div className="placeholder">车次列表区域</div>
      </main>
    </div>
  );
};

export default TicketSearchPage;
