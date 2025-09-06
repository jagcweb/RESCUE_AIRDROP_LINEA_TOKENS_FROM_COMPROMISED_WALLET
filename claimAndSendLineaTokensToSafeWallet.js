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

// === Dirección destino para barrido de tokens Linea ===
const DESTINO = "YOUR_DESTINATION_ADDRESS"; // reemplaza

// === Contrato de Claim de Linea Mainnet ===
const AIRDROP_CONTRACT = "0x87bAa1694381aE3eCaE2660d97fe60404080Eb64";

// === ABI mínimo del claim ===
const AIRDROP_ABI = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const airdrop = new ethers.Contract(AIRDROP_CONTRACT, AIRDROP_ABI, wallet);

// === ERC20 ABI estándar mínimo para barrido de tokens ===
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

async function mainCycle() {
  try {
    const balance = await provider.getBalance(wallet.address);
    const feeData = await provider.getFeeData();

    let gasLimit;
    try {
      const est = await airdrop.estimateGas.claim();
      gasLimit = (est * 120n) / 100n; // +20% buffer
    } catch {
      gasLimit = 200000n;
    }

    let overrides = { gasLimit };
    let worstGasCost;

    const has1559 = feeData.maxFeePerGas != null && feeData.maxPriorityFeePerGas != null;

    if (has1559) {
      // --- Cálculo seguro de maxFee y priorityFee ---
      let maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? 2000000000n;
      let maxFeePerGas = feeData.maxFeePerGas ?? (maxPriorityFeePerGas + 1000000000n);

      // Duplicar fees para agresividad
      maxPriorityFeePerGas *= 2n;
      maxFeePerGas *= 2n;

      if (maxFeePerGas < maxPriorityFeePerGas) {
        maxFeePerGas = maxPriorityFeePerGas + 1000000000n;
      }

      worstGasCost = gasLimit * maxFeePerGas;
      overrides = { ...overrides, maxFeePerGas, maxPriorityFeePerGas };
    } else {
      const baseGasPrice = feeData.gasPrice ?? 1000000000n;
      const gasPrice = baseGasPrice * 2n;
      worstGasCost = gasLimit * gasPrice;
      overrides = { ...overrides, gasPrice };
    }

    if (balance > worstGasCost) {
      console.log("Ejecutando claim con gas alto...");
      const tx = await airdrop.claim(overrides);
      console.log("Tx claim enviada:", tx.hash);
      await tx.wait();
      console.log("Claim confirmado ✅");

      // --- 2. Barrer tokens solo después del claim ---
      await sweepTokenAggressive("0x1789e0043623282D5DCc7F213d703C6D8BAfBB04");
    } else {
      console.log("⚠️ No hay ETH suficiente para el claim");
    }

  } catch (e) {
    console.error("❌ Error en ciclo principal:", e);
  }

  
}

// --- Sweep token con gas agresivo---
async function sweepTokenAggressive(tokenAddress) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const balance = await token.balanceOf(wallet.address);

  if (balance > 0n) {
    let feeData = await provider.getFeeData();
    let overrides = {};
    const gasLimit = 60000n

    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      overrides = {
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas * 2n,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 2n
      };
    } else {
      const gasPrice = (feeData.gasPrice ?? 1000000000n) * 2n;
      overrides = { gasLimit, gasPrice };
    }

    const tx = await token.transfer(DESTINO, balance, overrides);
    console.log(`Token barrido (${tokenAddress}) en tx:`, tx.hash);
    await tx.wait();
    console.log("Sweep token confirmado ✅");
  } else {
    console.log("No hay tokens para barrer.");
  }
}

setInterval(mainCycle, 1000);
