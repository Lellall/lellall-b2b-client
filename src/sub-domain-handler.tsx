import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useGetRestaurantBySubdomainQuery } from "./redux/api/restaurant/restaurant.api";

const SubdomainHandler = () => {
    const getSubdomain = () => {
        const host = window.location.href; // e.g., yax.localhost
        const parts = host.split(".");
        return parts.length > 2 ? parts[0] : null; // Extract "yax"
      };
    const subdomain = getSubdomain();
    const { data: restaurant, isLoading, isError } = useGetRestaurantBySubdomainQuery(subdomain, {
        skip: !subdomain, // Skip API call if no subdomain
    });

    console.log(restaurant);

    if (isLoading) {
        return <div className="text-center text-lg">Checking restaurant...</div>;
    }

    if (isError) {
        return (
            <div className="text-center text-red-500 text-lg">
                <h1>Restaurant Not Found</h1>
                <p>The restaurant you are looking for does not exist.</p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={() => navigate("/")}>
                    Go to Home
                </button>
            </div>
        );
    }

    return <Outlet />;
};

export default SubdomainHandler;
