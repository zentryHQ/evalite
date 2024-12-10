import { formatDistance } from "date-fns";
import { useEffect, useState } from "react";

export const LiveDate = (props: { date: string }) => {
  const [, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <span>{formatDistance(props.date, new Date(), { addSuffix: true })}</span>
  );
};
