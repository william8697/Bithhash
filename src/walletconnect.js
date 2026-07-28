import { EthereumProvider } from "@walletconnect/ethereum-provider";
import SignClient from "@walletconnect/sign-client";

// Legacy export (keep existing pages working)
window.WalletConnectProvider = {
    EthereumProvider
};

// New global for pages expecting SignClient
window.WalletConnectSignClient = SignClient;

// Unified namespace for future pages
window.WalletConnect = {
    EthereumProvider,
    SignClient
};

console.log("✅ WalletConnect SDK loaded successfully");
console.log({
    WalletConnectProvider: window.WalletConnectProvider,
    WalletConnectSignClient: window.WalletConnectSignClient,
    WalletConnect: window.WalletConnect
});
