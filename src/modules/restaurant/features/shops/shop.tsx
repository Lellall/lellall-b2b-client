import Card from './components/shop-card';
import img from '../.././../../../assets/placeholder.svg';
import { StyledButton } from '@/components/button/button-lellall';
import { Add } from 'iconsax-react';
import SearchBar from '@/components/search-bar/search-bar';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
    const navigate = useNavigate()
    return (
        <div>
            <div className="flex mb-5 justify-between">
                <div>
                <SearchBar
                        placeholder="Search shops"
                        width="300px"
                        height="42px"
                        border="1px solid #fff"
                        borderRadius="10px"
                        backgroundColor="#ffffff"
                        shadow={false}
                        fontSize="11px"
                        color="#444"
                        inputPadding="10px"
                        placeholderColor="#bbb"
                        iconColor="#ccc"
                        iconSize={15}
                    />
                </div>
                <StyledButton style={{ padding: '19px 15px', fontWeight: 300 }} background={'#fff'} color="#000" width='130px' variant="outline">
                    <Add size="32" color="#000" /> Add Menu
                </StyledButton>
            </div>
            <div className='flex flex-wrap justify-left gap-4 '>
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <Card
                        key={index}
                        imageSrc={img}
                        title="Sample shop name"
                        actionDotColor="bg-red-500"
                        onClick={() => navigate(`/shops/${index}`)}
                    />
                ))}
            </div>
        </div>
    );
}

export default Shop;