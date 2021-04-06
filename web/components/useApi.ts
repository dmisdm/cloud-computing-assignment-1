import React from "react";

export const useApi = <Result>(makeRequest: () => Promise<Result>) => {
  const [result, setResult] = React.useState<Result>();
  const [loading, setLoading] = React.useState(true);
  const fetch = React.useCallback(() => {
    setLoading(true);
    makeRequest()
      .then((result) => {
        setResult(result);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [makeRequest]);
  React.useEffect(() => {
    fetch();
  }, []);
  return {
    result,
    loading,
    fetch,
  };
};
