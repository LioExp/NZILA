import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'nzila_user_id';

export function useUserId() {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve user ID on mount
    const storedId = localStorage.getItem(USER_ID_KEY);
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = uuidv4();
      localStorage.setItem(USER_ID_KEY, newId);
      setUserId(newId);
    }
  }, []);

  return userId;
}
