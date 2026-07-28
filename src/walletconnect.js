import { EthereumProvider } from "@walletconnect/ethereum-provider";
import SignClient from "@walletconnect/sign-client";

// Expose WalletConnect globally

window.WalletConnectProvider = {
    EthereumProvider
};

window.WalletConnectSignClient = SignClient;

window.WalletConnect = {
    EthereumProvider,
    SignClient
};

console.log("✅ WalletConnect SDK loaded successfully");
console.log(window.WalletConnectProvider);
console.log(window.WalletConnectSignClient);
console.log(window.WalletConnect);
