import { useState, useEffect } from "react";

const usePermissions = ({
  name,
  setLoading,
  setError
}: {
  name: "geolocation",
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<Error | GeolocationPositionError | undefined>>
}) => {
  const [permissions, setPermissions] = useState<"granted" | "prompt" | "denied">();

  useEffect(() => {
    if (!permissions) {
      setLoading(true);
      navigator.permissions.query({ name }).then((result) => {
        setPermissions(result.state);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.addEventListener("change", (result: any) => {
          setPermissions(result.state);
        });
      }).catch((error) => {
        setError(error);
      }).finally(() => {
        setLoading(false);
      });
    }
  });

  return permissions
};

export default usePermissions;