import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CateringPage from '../src/pages/CateringPage';

// Mock components to simplify test
vi.mock('../src/components/HeaderBrandSearch', () => ({
  default: () => <div data-testid="brand-search">BrandSearch</div>
}));
vi.mock('../src/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>
}));

describe('CateringPage', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <CateringPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('brand-search')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    
    // Check for Hero text (based on REQ-5-1)
    expect(screen.getByText(/餐饮•特产/i)).toBeInTheDocument(); 
    
    // Check for 12306 Logo presence (alt text)
    const logo = screen.getByAltText('12306 Logo');
    expect(logo).toBeInTheDocument();
  });

  it('has a link/button to booking page', () => {
    render(
      <BrowserRouter>
        <CateringPage />
      </BrowserRouter>
    );
    
    // Assuming there is a CTA button
    const cta = screen.getByText(/开始订餐/i);
    expect(cta).toBeInTheDocument();
    expect(cta.closest('a')).toHaveAttribute('href', '/catering/book');
  });
});
