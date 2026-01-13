import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import QuickSearchPanel from '../src/pages/components/QuickSearchPanel';
import app from '../../backend/src/index'; 
import db from '../../backend/src/database/init_db';

let server;
let lastApiResponse = null;

describe('Full-Stack Integration: Station Search in QuickSearchPanel', () => {

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

  beforeEach(async () => {
    lastApiResponse = null;
    vi.stubGlobal('location', { href: 'http://localhost/', assign: vi.fn() });
    
    // Seed data
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM stations');
        const stmt = db.prepare('INSERT INTO stations (name, code, pinyin, hot) VALUES (?, ?, ?, ?)');
        stmt.run('北京南', 'VNP', 'beijingnan', 1);
        stmt.finalize(resolve);
      });
    });
  });

  it('searches and displays station suggestions', async () => {
    render(
      <BrowserRouter>
        <QuickSearchPanel />
      </BrowserRouter>
    );

    const fromInput = screen.getByPlaceholderText(/出发地/);
    fireEvent.change(fromInput, { target: { value: 'bei' } });

    await waitFor(() => {
      expect(lastApiResponse).not.toBeNull();
      expect(Array.isArray(lastApiResponse)).toBe(true);
      const hasBeijing = lastApiResponse.some(s => s.name.includes('北京'));
      expect(hasBeijing).toBe(true);
    });

    expect(screen.getByText(/北京南/)).toBeInTheDocument();
  });
});
