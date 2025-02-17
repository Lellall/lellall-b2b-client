import Breadcrumb from "@/components/ui/breadcrumb";
import styled from "styled-components";
import banner from '@/assets/banner.svg';
import circle from '@/assets/circle.svg';
import TabsLayout from "./tabs-layout";

export const Banner = styled.div`
    background-image: url(${banner});
    background-size: cover;
    background-position: center;
    border-radius: 15px;
    width: 100%;
    height: 120px;
`;

const ViewShop = () => {

    return (
        <div>
            <Breadcrumb items={[
                { label: 'Shops', href: '/shops' },
                { label: 'The Green Fork' }
            ]} />
            <div>
                <Banner>
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                                <div className="flex flex-col">
                                    <div className="text-2xl font-bold text-white" style={{ marginTop: '15px' }}>
                                        The Green Fork
                                    </div>
                                    <div className="text-xs ml-1 mb-2 mt-1 flex font-light text-white">
                                        Wuse Zone 4 <img src={circle} className="mx-2" /> Active <img src={circle} className="mx-2" /> Restaurant
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </Banner>
                <TabsLayout />
            </div >
        </div >
    )
}

export default ViewShop