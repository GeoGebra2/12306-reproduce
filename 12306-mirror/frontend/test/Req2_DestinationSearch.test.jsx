
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import app from '../../backend/src/index'; 
import db from '../../backend/src/database/init_db'; 
import QuickSearchPanel from '../src/pages/components/QuickSearchPanel';

// [GLOBALS]
let server;
let lastApiResponse = null; 

describe('Full-Stack Integration: Destination Search & Hot Stations', () => {

  // ================= 1. Lifecycle: Server & Network Spy =================
  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
    const port = server.address().port;
    
    axios.defaults.baseURL = `http://localhost:${port}`;
    
    axios.interceptors.response.use((response) => {
      lastApiResponse = response.data;
      return response;
    });
  });

  afterAll((done) => server?.close(done));

  // ================= 2. Lifecycle: Data Seeding =================
  beforeEach(async () => {
    lastApiResponse = null;
    vi.clearAllMocks();
    
    // Seed data
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM stations');
        const stmt = db.prepare('INSERT INTO stations (name, code, pinyin, hot) VALUES (?, ?, ?, ?)');
        stmt.run('北京', 'BJP', 'beijing', 1);
        stmt.run('上海', 'SHH', 'shanghai', 1);
        stmt.run('武汉', 'WHN', 'wuhan', 0);
        stmt.finalize(resolve);
      });
    });
  });

  // ================= 3. Test Cases =================
  
  it('renders destination input', () => {
    render(<BrowserRouter><QuickSearchPanel /></BrowserRouter>);
    expect(screen.getByPlaceholderText('目的地')).toBeInTheDocument();
  });

  it('shows hot stations when destination input is focused and empty', async () => {
    render(<BrowserRouter><QuickSearchPanel /></BrowserRouter>);
    
    const destInput = screen.getByPlaceholderText('目的地');
    fireEvent.focus(destInput);

    await waitFor(() => {
      // Check API call
      expect(lastApiResponse).not.toBeNull();
      // Expecting at least Beijing and Shanghai (hot=1)
      const names = lastApiResponse.map(s => s.name);
      expect(names).toContain('北京');
      expect(names).toContain('上海');
      // Wuhan is not hot
      // Note: This depends on backend implementation of /api/stations/hot
    });

    // Check UI
    expect(screen.getByText('北京 (BJP)')).toBeInTheDocument();
    expect(screen.getByText('上海 (SHH)')).toBeInTheDocument();
  });

  it('searches stations when typing in destination input', async () => {
    render(<BrowserRouter><QuickSearchPanel /></BrowserRouter>);
    
    const destInput = screen.getByPlaceholderText('目的地');
    fireEvent.change(destInput, { target: { value: 'wu' } });

    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      expect(lastApiResponse[0].name).toBe('武汉');
    });

    expect(screen.getByText('武汉 (WHN)')).toBeInTheDocument();
  });

  it('selects a station from dropdown', async () => {
    render(<BrowserRouter><QuickSearchPanel /></BrowserRouter>);
    
    const destInput = screen.getByPlaceholderText('目的地');
    fireEvent.change(destInput, { target: { value: 'wu' } });

    await waitFor(() => {
        expect(screen.getByText('武汉 (WHN)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('武汉 (WHN)'));

    expect(destInput.value).toBe('武汉');
    // Dropdown should disappear
    expect(screen.queryByText('武汉 (WHN)')).not.toBeInTheDocument();
  });
});
