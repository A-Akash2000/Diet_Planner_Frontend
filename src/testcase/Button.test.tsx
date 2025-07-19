// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../button';

describe('Button Component', () => {
  it('should render the correct label', () => {
    render(<Button label="Click Me" onClick={() => {}} />);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button label="Click Me" onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
