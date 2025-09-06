import { ethers } from "ethers";

// === Configuración RPC ===
const provider = new ethers.JsonRpcProvider(
  "YOUR_INFURA_PROJECT_ID", // reemplaza con tu Project ID Infura
  {
    name: "linea",
    chainId: 59144,
  }
);

// === Clave privada del wallet que va a claimear ===
const privateKey = "YOUR_PRIVATE_KEY"; // reemplaza
const wallet = new ethers.Wallet(privateKey, provider);

// === Dirección destino para barrido de tokens/ETH ===
const DESTINO = "YOUR_DESTINATION_ADDRESS"; // reemplaza

// === ERC20 ABI estándar mínimo para barrido de tokens ===
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// --- Barrer token si hay ETH suficiente ---
async function sweepTokenIfPossible(tokenAddress) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const tokenBalance = await token.balanceOf(wallet.address);

  if (tokenBalance === 0n) {
    console.log("No hay tokens para barrer.");
    return;
  }

  const gasLimit = 60000n;
  const feeData = await provider.getFeeData();
  let estimatedGasCost;

  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 2n;
    let maxFeePerGas = feeData.maxFeePerGas * 2n;

    if (maxFeePerGas < maxPriorityFeePerGas) {
      maxFeePerGas = maxPriorityFeePerGas + 1000000000n;
    }

    estimatedGasCost = gasLimit * maxFeePerGas;
  } else {
    const gasPrice = (feeData.gasPrice ?? 1000000000n) * 2n;
    estimatedGasCost = gasLimit * gasPrice;
  }

  const ethBalance = await provider.getBalance(wallet.address);

  if (ethBalance > estimatedGasCost) {
    console.log("✅ Hay suficiente ETH, ejecutando sweep de tokens...");

    let overrides;
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      overrides = {
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas * 2n,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 2n
      };
      if (overrides.maxFeePerGas < overrides.maxPriorityFeePerGas) {
        overrides.maxFeePerGas = overrides.maxPriorityFeePerGas + 1000000000n;
      }
    } else {
      overrides = {
        gasLimit,
        gasPrice: (feeData.gasPrice ?? 1000000000n) * 2n
      };
    }

    const tx = await token.transfer(DESTINO, tokenBalance, overrides);
    console.log("Token barrido en tx:", tx.hash);
    await tx.wait();
    console.log("✅ Sweep token confirmado");
  } else {
    console.log("⚠️ No hay ETH suficiente para barrer tokens.");
  }
}

setInterval(() => sweepTokenIfPossible("0x1789e0043623282D5DCc7F213d703C6D8BAfBB04"), 1000);
