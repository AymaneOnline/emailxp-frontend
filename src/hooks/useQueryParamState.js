import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Sync a piece of state with a query parameter.
export default function useQueryParamState(key, defaultValue) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initial = params.get(key) || defaultValue;
  const [value, setValue] = useState(initial);

  // Update state when location changes externally
  useEffect(() => {
    const current = params.get(key);
    if ((current || defaultValue) !== value) {
      setValue(current || defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const update = useCallback(
    (next) => {
      const nextValue = typeof next === 'function' ? next(value) : next;
      const newParams = new URLSearchParams(location.search);
      if (nextValue === undefined || nextValue === null || nextValue === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, nextValue);
      }
      navigate({ pathname: location.pathname, search: newParams.toString() }, { replace: true });
      setValue(nextValue);
    },
    [key, location.pathname, location.search, navigate, value]
  );

  return [value, update];
}
