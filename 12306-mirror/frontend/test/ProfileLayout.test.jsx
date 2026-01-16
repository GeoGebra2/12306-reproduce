import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileLayout from '../src/components/Profile/ProfileLayout';

describe('ProfileLayout', () => {
  it('renders sidebar with navigation links', () => {
    render(
      <MemoryRouter>
        <ProfileLayout>
          <div>Child Content</div>
        </ProfileLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('个人中心')).toBeInTheDocument();
    expect(screen.getByText('查看个人信息')).toBeInTheDocument();
    expect(screen.getByText('常用联系人')).toBeInTheDocument(); // Passengers
    expect(screen.getByText('订单中心')).toBeInTheDocument();
  });

  it('renders child content in the main area', () => {
    render(
      <MemoryRouter>
        <ProfileLayout>
          <div data-testid="child-content">Child Content</div>
        </ProfileLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
