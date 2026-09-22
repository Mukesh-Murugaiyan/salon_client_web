import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import Login from '../pages/Login';
import theme from '../theme';
import AuthContext from '../context/AuthContext';

const renderLogin = (authContextValue) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={authContextValue}>
          <Login />
        </AuthContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Login Component Tests', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultContext = {
    login: mockLogin,
    isAuthenticated: false,
    user: null,
    isLoading: false,
  };

  it('renders application title, email input, password input, and submit button', () => {
    renderLogin(defaultContext);

    expect(screen.getByText(/Salon ERP Portal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email Address$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
  });

  it('disables submit button when email and password are empty', () => {
    renderLogin(defaultContext);

    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });
    expect(submitBtn).toBeDisabled();
  });

  it('enables submit button once email and password have text', () => {
    renderLogin(defaultContext);

    const emailInput = screen.getByLabelText(/^Email Address$/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'owner@saloncrm.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Owner@123' } });

    expect(submitBtn).not.toBeDisabled();
  });

  it('shows error message when login fails with invalid credentials', async () => {
    const rejectedLogin = vi.fn().mockRejectedValue({
      response: {
        status: 401,
        data: {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      },
    });

    renderLogin({
      ...defaultContext,
      login: rejectedLogin,
    });

    const emailInput = screen.getByLabelText(/^Email Address$/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'owner@saloncrm.com' } });
    fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('shows error message when account is disabled', async () => {
    const disabledLogin = vi.fn().mockRejectedValue({
      response: {
        status: 403,
        data: {
          error: 'ACCOUNT_DISABLED',
          message: 'Your account is disabled. Please contact the administrator.',
        },
      },
    });

    renderLogin({
      ...defaultContext,
      login: disabledLogin,
    });

    const emailInput = screen.getByLabelText(/^Email Address$/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });

    fireEvent.change(emailInput, { target: { value: 'disabled@saloncrm.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password@123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Your account is disabled. Please contact the administrator/i)
      ).toBeInTheDocument();
    });
  });
});
