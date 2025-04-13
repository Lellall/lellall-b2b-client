import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setSubdomain } from "./redux/api/auth/auth.slice";

const useSubdomain = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [validSubdomain, setValidSubdomain] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const subdomain = hostname.split(".")[0]; // Extract subdomain (e.g., "green-fork" from "green-fork.lellall.com")

    if (!subdomain || subdomain === "www" || hostname === "lellall.com") {
      setLoading(false);
      return;
    }

    const fetchSubdomain = async () => {
      try {
        const { data } = await axios.get(
          `https://api-b2b-dev.lellall.com/restaurants/subdomain/${subdomain}`
        );

        if (data?.id) {
          dispatch(setSubdomain(subdomain)); // Save to Redux
          axios.defaults.headers.common["X-Subdomain"] = subdomain; // Set globally
          setValidSubdomain(true);
        }
      } catch (error) {
        console.warn("Invalid subdomain:", subdomain);
      } finally {
        setLoading(false);
      }
    };

    fetchSubdomain();
  }, [dispatch]);

  return { loading, validSubdomain };
};

export default useSubdomain;
