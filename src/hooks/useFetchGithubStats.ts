import { useEffect, useState } from "react";

export const useFetchGithubStats = () => {
  const [stats, setStats] = useState({
    lastActiveTime: new Date().toISOString(),
  });

  useEffect(() => {
    fetch(
      "https://api.github.com/repos/AbelTomato/AbelTomato.github.io/commits/main",
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.commit?.committer?.date) {
          setStats({
            lastActiveTime: data.commit.committer.date,
          });
        }
      })
      .catch((err) => console.error("Fetching error from Github", err));
  }, []);

  return stats;
};
