import { useParams } from 'react-router-dom';
import ChannelPage from './ChannelPage';
import NotFound from './NotFound';

export default function HandleChannelPage() {
	const { handle } = useParams<{ handle: string }>();

	if (handle?.startsWith('@') && handle.length > 1) {
		return <ChannelPage />;
	}

	return <NotFound />;
}
