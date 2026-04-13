import { WalletProvider } from './contexts/WalletContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import Layout from './components/Layout';

export default function App() {
  return (
    <WalletProvider>
      <PortfolioProvider>
        <Layout />
      </PortfolioProvider>
    </WalletProvider>
  );
}
