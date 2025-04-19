// src/components/VacationCard.tsx
import React from 'react';

interface VacationCardProps {
  id: number;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageUrl: string;
  isFollowed: boolean;
  onFollowToggle: (id: number) => void;
}

const VacationCard: React.FC<VacationCardProps> = ({
  id,
  destination,
  description,
  startDate,
  endDate,
  price,
  imageUrl,
  isFollowed,
  onFollowToggle,
}) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg m-4 border">
      <img className="w-full" src={imageUrl} alt={destination} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{destination}</div>
        <p className="text-gray-700 text-base">{description}</p>
        <p className="text-gray-600 text-sm">
          {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
        </p>
        <p className="text-gray-800 font-semibold">${price}</p>
      </div>
      <div className="px-6 pb-4">
        <button
          onClick={() => onFollowToggle(id)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {isFollowed ? 'Unfollow' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default VacationCard;
