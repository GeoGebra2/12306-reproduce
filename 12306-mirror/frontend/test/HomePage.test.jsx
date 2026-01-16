import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';

describe('HomePage Integration Test', () => {
  it('renders all main sections', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Verify main container
    expect(screen.getByTestId('home-page')).toBeInTheDocument();

    // Verify sub-components
    expect(screen.getByTestId('header-brand-search')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    expect(screen.getByTestId('booking-form')).toBeInTheDocument();
    expect(screen.getByTestId('hero-services')).toBeInTheDocument();
    expect(screen.getByTestId('promo-grid')).toBeInTheDocument();
    expect(screen.getByTestId('notice-tab')).toBeInTheDocument();

    // Verify some specific content
    expect(screen.getByText('中国铁路12306')).toBeInTheDocument();
    
    // Navbar specific check
    const navbar = screen.getByTestId('navbar');
    expect(within(navbar).getByText('首页')).toBeInTheDocument();
    
    // Check for '车票' which appears multiple times (Navbar and BookingForm)
    const ticketElements = screen.getAllByText('车票');
    expect(ticketElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByPlaceholderText('出发地')).toBeInTheDocument();
    expect(screen.getByText('重点旅客预约')).toBeInTheDocument();
  });
});
