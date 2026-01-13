import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import QuickSearchPanel from '../src/pages/components/QuickSearchPanel';

// Import backend app to start real server
// Note: We need to use relative path to backend src
import app from '../../backend/src/index'; 

let server;
let lastApiResponse = null;

describe('Full-Stack Integration: Station Search in QuickSearchPanel', () => {

  beforeAll(async () => {
    // Start backend server on random port
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    
    // Configure Axios
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    // Intercept response to capture data
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data;
      return response;
    });
  });

  afterAll((done) => server?.close(done));

  beforeEach(() => {
    lastApiResponse = null;
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
  });

  it('searches and displays station suggestions', async () => {
    render(
      <BrowserRouter>
        <QuickSearchPanel />
      </BrowserRouter>
    );

    const fromInput = screen.getByPlaceholderText(/出发地/);
    
    // Simulate user typing 'Beijing'
    fireEvent.change(fromInput, { target: { value: 'bei' } });

    // Wait for API call and UI update
    await waitFor(() => {
      // 1. Verify backend response captured
      expect(lastApiResponse).not.toBeNull();
      // Expect array of stations
      expect(Array.isArray(lastApiResponse)).toBe(true);
      // Should find '北京南' which matches 'bei' (pinyin)
      const hasBeijing = lastApiResponse.some(s => s.name.includes('北京'));
      expect(hasBeijing).toBe(true);
    });

    // 2. Verify UI shows suggestions
    // The component renders "name (code)"
    expect(screen.getByText(/北京南/)).toBeInTheDocument();
  });
});
