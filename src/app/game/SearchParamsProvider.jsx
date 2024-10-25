'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SearchParamsProvider = ({ onParamsReady }) => {
  const searchParams = useSearchParams();
  const [params, setParams] = useState({ teamName: null, playerName: null });

  useEffect(() => {
    const teamName = searchParams.get('teamName');
    const playerName = searchParams.get('playerName');
    setParams({ teamName, playerName });
    onParamsReady({ teamName, playerName });
  }, [searchParams, onParamsReady]);

  return null; // This component does not render anything
};

export default SearchParamsProvider;