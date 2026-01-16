import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HeaderBrandSearch from '../src/components/HeaderBrandSearch';

describe('HeaderBrandSearch', () => {
  it('contains link to profile page', () => {
    render(
      <BrowserRouter>
        <HeaderBrandSearch />
      </BrowserRouter>
    );

    const profileLink = screen.getByText('我的12306');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
  });
});
