import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameCard from './GameCard';

const mockGameProps = {
  id: 1,
  title: 'Test Game',
  price: 29.99,
  rating: 4.5,
  coverImage: 'https://example.com/game.jpg',
  developer: 'Test Developer'
};

describe('GameCard Component', () => {
  it('should render game card with correct information', () => {
    render(<GameCard {...mockGameProps} />);

    expect(screen.getByText('Test Game')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Test Developer')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByAltText('Test Game')).toBeInTheDocument();
  });

  it('should render "View Details" button', () => {
    render(<GameCard {...mockGameProps} />);

    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('should have correct link to game details', () => {
    render(<GameCard {...mockGameProps} />);

    const link = screen.getByText('View Details').closest('a');
    expect(link).toHaveAttribute('href', '/games/1');
  });
});
