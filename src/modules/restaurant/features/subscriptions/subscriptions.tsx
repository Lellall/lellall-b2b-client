import styled from "styled-components";
import subs from '@/assets/subs.svg';
import { useState } from "react";
import LellallSwitch from "@/components/ui/switch.component";
import PricingCard from "./components/pricing-card";
import { theme } from "@/theme/theme";

export const Cover = styled.div`
    background-image: url(${subs});
    background-size: cover;
    background-position: center;
    border-radius: 15px;
    width: 100%;
    height: 100vh;
    overflow-x: hidden;
    flex;
    justify-content: center;
    margin: o auto;
`;

const Subscriptions = () => {
    const [isChecked, setChecked] = useState(false);
    return (
        <Cover>
            <div className="mt-20 my-auto text-2xl text-center ml-1 font-semibold text-green-900" >
                Streamline Your Restaurant Operations
            </div>
            <div className="mt-1 my-auto text-sm text-center ml-1 font-light text-green-900" >
                Comprehensive Management Solutions for Modern Dining Experiences
            </div>
            <div className="mx-auto mt-5 flex justify-center text-center">
                <LellallSwitch labelLeft="Bill Monthly"
                    labelRight="Bill Annually"
                    checked={isChecked} onChange={(e) => setChecked(e.target.checked)} />
            </div>
            <div className=" mt-10 flex justify-evenly text-center bg-white min-h-[416px]  rounded-xl">
                <div className="bg-white">
                    <PricingCard
                        title="Starter Pack"
                        features={["Inventory Management", "Menu Management"]}
                        price="10,000"
                        billingCycle="Monthly"
                    />

                </div>
                <div className="bg-white">
                    <PricingCard
                        title="Basic Pack"
                        features={["Inventory Management", "Menu Management", "Reports"]}
                        price="18,000"
                        billingCycle="Monthly"
                        background={'#ECECEC'}
                        color="#002663"
                    />

                </div>
                <div className="bg-white mt-[-20px]">
                    <PricingCard
                        title="Business Pack"
                        features={["Inventory Management", "Menu Management", "Reports", "Reservations"]}
                        price="25,000"
                        billingCycle="Monthly"
                        background={'#002663'}
                        color="#fff"
                    />
                </div>
                <div className="bg-white">
                    <PricingCard
                        title="Premium Pack"
                        features={["Inventory Management", "Menu Management", "Reports", "Reservations", "Staff Management", "In App Chat", "Multi Branch Management"]}
                        price="35,000"
                        billingCycle="Monthly"
                        background="linear-gradient(to right, #996515, #000000);"
                        color="#fff"
                    />

                </div>
            </div>
        </Cover>
    )
}

export default Subscriptions