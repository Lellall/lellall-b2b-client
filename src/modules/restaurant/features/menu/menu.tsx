import Orders from './order';
import AccountingMenu from './accounting-menu';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';

const Menu = () => {
    const { user } = useSelector(selectAuth);
    const isAccountant = user?.role === 'ACCOUNTANT' || user?.role === 'AUDITOR';

    if (isAccountant) {
        return <AccountingMenu />;
    }

    return (
        <div>
            <Orders />
        </div>
    )
}

export default Menu;